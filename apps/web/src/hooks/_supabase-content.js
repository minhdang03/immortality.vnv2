/**
 * Shared Supabase content fetch + flat→nested adapter.
 *
 * All public.content rows use flat bilingual columns (vi_title, en_title, …).
 * Components expect the nested shape the Firestore hooks returned:
 *   { id, vi: { title, summary, body, question }, en: {...}, date, tag, status, … }
 *
 * This module owns the mapping so each hook stays thin.
 */
import { supabase } from '../supabase'

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
