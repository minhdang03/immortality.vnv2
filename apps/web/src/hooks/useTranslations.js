import { useState, useEffect } from 'react'
import { DEFAULT_T } from '../data/translations'
import { readCache, writeCache } from '../lib/swr-cache'
import { supabase } from '../supabase'

async function fetchSupabaseTranslations(lang) {
  const { data, error } = await supabase
    .from('translations')
    .select('key, value')
    .eq('lang', lang)
  if (error || !data) return null
  // Collapse rows [{lang, key, value}] into a flat object {key: value}
  return Object.fromEntries(data.map(r => [r.key, r.value]))
}

export function useTranslations() {
  // SWR: read cached translations instantly
  const [viStrings, setViStrings] = useState(() => readCache('cached_translations_vi')?.data || null)
  const [enStrings, setEnStrings] = useState(() => readCache('cached_translations_en')?.data || null)
  const cached = readCache('cached_translations_vi')
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchSupabaseTranslations('vi'), fetchSupabaseTranslations('en')])
      .then(([vi, en]) => {
        if (cancelled) return
        if (vi) { setViStrings(vi); writeCache('cached_translations_vi', vi) }
        if (en) { setEnStrings(en); writeCache('cached_translations_en', en) }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const getT = (lang) => ({
    ...DEFAULT_T[lang],
    ...(lang === 'vi' ? viStrings : enStrings),
  })

  // Upsert every key for a language as (lang, key, value) rows (admin only via RLS).
  const updateTranslations = async (lang, data) => {
    if (!supabase) return
    const rows = Object.entries(data).map(([key, value]) => ({ lang, key, value }))
    const { error } = await supabase.from('translations').upsert(rows)
    if (error) throw error
  }

  return { getT, viStrings, enStrings, loading, updateTranslations }
}
