/**
 * Supabase public.content fetch/write + flat↔nested adapters.
 *
 * All public.content rows use flat bilingual columns (vi_title, en_title, …).
 * Components expect the nested shape:
 *   { id, vi: { title, summary, body, question }, en: {...}, date, tag, status, … }
 * Stories use a flat variant (titleVi, contentVi, lessonVi, thread, highlights…).
 *
 * This module owns both directions so each hook stays thin.
 */
import { supabase } from '../supabase'
import { toSlug } from '../utils/slug'

/**
 * Map a flat public.content row → nested shape expected by components.
 * @param {object} row
 * @returns {object}
 */
export function adaptContentRow(row) {
  const extra = row.extra || {} // jsonb 0013: tag/topic/source, story thread/highlights…
  const base = {
    id: row.id,
    type: row.type,
    status: row.status,
    order: row.order_index ?? null,
    date: row.content_date ?? null,
    tag: extra.tag ?? null,
    topic: extra.topic ?? null,
    source: extra.source ?? null,
    sourceRef: row.source_ref ?? null,
    image: row.thumbnail_url ?? null,       // ArticleCard dùng article.image
    thumbnail: row.thumbnail_url ?? null,
    viSlug: row.vi_slug ?? null,
    enSlug: row.en_slug ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    vi: {
      title: row.vi_title ?? '',
      summary: row.vi_summary ?? '',
      body: row.vi_body ?? '',
      question: row.vi_question ?? '',
    },
    en: {
      title: row.en_title ?? '',
      summary: row.en_summary ?? '',
      body: row.en_body ?? '',
      question: row.en_question ?? '',
    },
  }

  // Stories: components dùng shape PHẲNG (titleVi, contentVi, lessonVi, thread, highlights…)
  if (row.type === 'story') {
    return {
      ...base,
      titleVi: row.vi_title ?? '', titleEn: row.en_title ?? '',
      contentVi: row.vi_body ?? '', contentEn: row.en_body ?? '',
      lessonVi: row.vi_summary ?? '', lessonEn: row.en_summary ?? '',
      threadVi: extra.threadVi ?? '', threadEn: extra.threadEn ?? '',
      highlightsVi: extra.highlightsVi ?? [], highlightsEn: extra.highlightsEn ?? [],
    }
  }
  return base
}

/**
 * Reverse adapter: component doc → flat public.content columns.
 * Known bilingual fields map to vi_/en_ columns; everything per-type goes to `extra`.
 * `status` is only set when provided (defaults handled at insert time).
 *
 * @param {'article'|'story'|'khaitri'|'teaching'|'practice'} type
 * @param {object} doc  nested (vi/en) OR flat-story shape from admin tabs
 * @returns {object} column map for insert/update
 */
export function contentRowFromDoc(type, doc) {
  const row = { type }

  if (type === 'story') {
    row.vi_title = doc.titleVi ?? ''
    row.en_title = doc.titleEn ?? ''
    row.vi_body = doc.contentVi ?? ''
    row.en_body = doc.contentEn ?? ''
    row.vi_summary = doc.lessonVi ?? ''
    row.en_summary = doc.lessonEn ?? ''
    row.order_index = doc.order != null ? Number(doc.order) : null
    row.extra = {
      tag: doc.tag ?? null,
      threadVi: doc.threadVi ?? '', threadEn: doc.threadEn ?? '',
      highlightsVi: doc.highlightsVi ?? [], highlightsEn: doc.highlightsEn ?? [],
    }
    row.vi_slug = toSlug(doc.titleVi)
    row.en_slug = toSlug(doc.titleEn)
    return row
  }

  // teaching/practice use flat titleVi/bodyVi(descVi); article/khaitri use nested vi/en.
  const vi = doc.vi || { title: doc.titleVi, body: doc.bodyVi ?? doc.descVi }
  const en = doc.en || { title: doc.titleEn, body: doc.bodyEn ?? doc.descEn }

  row.vi_title = vi.title ?? ''
  row.en_title = en.title ?? ''
  row.vi_summary = vi.summary ?? ''
  row.en_summary = en.summary ?? ''
  row.vi_body = vi.body ?? ''
  row.en_body = en.body ?? ''
  row.vi_question = vi.question ?? ''
  row.en_question = en.question ?? ''
  row.vi_slug = toSlug(vi.title)
  row.en_slug = toSlug(en.title)
  if (doc.order != null) row.order_index = Number(doc.order)
  if (doc.date) row.content_date = doc.date
  if (doc.image !== undefined) row.thumbnail_url = doc.image || null
  row.extra = {
    tag: doc.tag ?? null,
    topic: doc.topic ?? null,
    source: doc.source ?? null,
  }
  return row
}

/**
 * Fetch published content rows by type from Supabase.
 * RLS: anon can only SELECT status='published'.
 *
 * @param {'article'|'story'|'khaitri'|'teaching'|'practice'} type
 * @param {{ orderCol?: string, ascending?: boolean, limit?: number }} opts
 * @returns {Promise<object[]>} array of nested-shape docs
 */
export async function fetchContentByType(type, opts = {}) {
  if (!supabase) throw new Error('Supabase client not initialised')

  const { orderCol = 'created_at', ascending = false, limit = 500 } = opts

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('type', type)
    .eq('status', 'published')
    .order(orderCol, { ascending })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(adaptContentRow)
}

/** Insert a new content row (admin only via RLS). Status defaults to 'published'. */
export async function createContent(type, doc) {
  if (!supabase) return
  const row = contentRowFromDoc(type, doc)
  row.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${type}-${Date.now()}`
  row.status = doc.status || 'published'
  const { error } = await supabase.from('content').insert(row)
  if (error) throw error
}

/** Update an existing content row by id (admin only via RLS). */
export async function updateContent(id, type, doc) {
  if (!supabase) return
  const row = contentRowFromDoc(type, doc)
  delete row.type // type is immutable
  if (doc.status) row.status = doc.status
  const { error } = await supabase.from('content').update(row).eq('id', id)
  if (error) throw error
}

/** Delete a content row by id (admin only via RLS). */
export async function deleteContent(id) {
  if (!supabase) return
  const { error } = await supabase.from('content').delete().eq('id', id)
  if (error) throw error
}
