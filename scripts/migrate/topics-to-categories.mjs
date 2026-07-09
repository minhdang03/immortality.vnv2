/**
 * topics-to-categories.mjs
 *
 * Migrates Firestore `topics` collection → Supabase `public.categories`.
 * Also backfills `content.category_id` where content.topic matches a topic id,
 * and writes `slug_redirects` so old /topic/:id URLs keep resolving.
 *
 * NOTE: topics collection is currently EMPTY (0 docs).
 * This script is a no-op on empty input; run it again when topics are added.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate/topics-to-categories.mjs
 *
 * Requires: @supabase/supabase-js (already in pnpm workspace)
 * Uses service_role key (bypasses RLS). NEVER put this key in client bundles.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/** Slugify a Vietnamese topic name. */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Shape of a Firestore topic doc:
 *   { id, vi, en, descVi, descEn, icon, order }
 *
 * Map to categories row:
 *   { id: slugify(vi), parent_id: null, vi_name, en_name, slug, order_index }
 *
 * Old topic id → new category slug stored in slug_redirects for /topic/:id URLs.
 */
async function migrateTopics(topics) {
  if (topics.length === 0) {
    console.log('topics collection is empty — nothing to migrate.')
    return []
  }

  const rows = topics.map(t => ({
    id: slugify(t.vi || t.id),
    parent_id: null,
    vi_name: t.vi || t.id,
    en_name: t.en || t.vi || t.id,
    slug: slugify(t.vi || t.id),
    order_index: t.order ?? 0,
  }))

  console.log(`Inserting ${rows.length} categories…`)
  const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'id' })
  if (error) throw error
  console.log('categories inserted.')
  return rows
}

async function backfillContentCategoryId(topicToSlug) {
  // Fetch all content rows that have a topic field matching old topic ids
  const oldTopicIds = Object.keys(topicToSlug)
  if (oldTopicIds.length === 0) return

  // We use the content table's topic column (text) to find matching rows.
  // Note: content.topic is a Firestore-era field; category_id is the new FK.
  // Update in batches to avoid query size limits.
  for (const [oldId, newSlug] of Object.entries(topicToSlug)) {
    const { error, count } = await supabase
      .from('content')
      .update({ category_id: newSlug })
      .eq('topic', oldId)
      .is('category_id', null)  // only where not already set
    if (error) {
      console.warn(`  backfill failed for topic ${oldId}:`, error.message)
    } else {
      console.log(`  content.category_id set for topic "${oldId}" → "${newSlug}" (${count ?? '?'} rows)`)
    }
  }
}

async function writeSlugRedirects(topicToSlug) {
  const rows = Object.entries(topicToSlug).map(([oldId, newSlug]) => ({
    from_slug: `topic/${oldId}`,
    to_slug: `category/${newSlug}`,
    type: '301',
  }))
  if (rows.length === 0) return
  const { error } = await supabase.from('slug_redirects').upsert(rows, { onConflict: 'from_slug' })
  if (error) throw error
  console.log(`slug_redirects written: ${rows.length} entries`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Read staged topics from the Firestore export (produced by export-firestore.cjs).
 * Expected file: scripts/migrate/staged/topics.json
 * Format: [ { id, vi, en, descVi, descEn, icon, order }, … ]
 *
 * If the file does not exist, we proceed with an empty list (no-op for empty collection).
 */
async function loadStagedTopics() {
  try {
    const { readFile } = await import('fs/promises')
    const { fileURLToPath } = await import('url')
    const { dirname, join } = await import('path')
    const __dir = dirname(fileURLToPath(import.meta.url))
    const raw = await readFile(join(__dir, 'staged/topics.json'), 'utf8')
    return JSON.parse(raw)
  } catch {
    console.log('No staged/topics.json found — treating topics as empty.')
    return []
  }
}

const stagedTopics = await loadStagedTopics()
console.log(`Loaded ${stagedTopics.length} staged topics.`)

const insertedRows = await migrateTopics(stagedTopics)

if (insertedRows.length > 0) {
  // Build old-id → new-slug mapping
  const topicToSlug = Object.fromEntries(
    stagedTopics.map((t, i) => [t.id, insertedRows[i].slug])
  )
  await backfillContentCategoryId(topicToSlug)
  await writeSlugRedirects(topicToSlug)
}

console.log('Migration complete.')
