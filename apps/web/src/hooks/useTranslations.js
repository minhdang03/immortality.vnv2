import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { DEFAULT_T } from '../data/translations'
import { readCache, writeCache } from './useFirestoreSWR'
import { supabase } from '../supabase'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

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
  const [firestoreVi, setFirestoreVi] = useState(() => readCache('cached_translations_vi')?.data || null)
  const [firestoreEn, setFirestoreEn] = useState(() => readCache('cached_translations_en')?.data || null)
  const cached = readCache('cached_translations_vi')
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (USE_SUPABASE) {
      // Supabase path: fetch both langs in parallel
      let cancelled = false
      Promise.all([fetchSupabaseTranslations('vi'), fetchSupabaseTranslations('en')])
        .then(([vi, en]) => {
          if (cancelled) return
          if (vi) { setFirestoreVi(vi); writeCache('cached_translations_vi', vi) }
          if (en) { setFirestoreEn(en); writeCache('cached_translations_en', en) }
        })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false) })
      return () => { cancelled = true }
    }

    // Firestore path (unchanged)
    let loaded = 0
    const checkDone = () => { if (++loaded >= 2) setLoading(false) }
    try {
      const unsubVi = onSnapshot(doc(db, 'translations', 'vi'), (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setFirestoreVi(data)
          writeCache('cached_translations_vi', data)
        }
        checkDone()
      }, () => checkDone())

      const unsubEn = onSnapshot(doc(db, 'translations', 'en'), (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setFirestoreEn(data)
          writeCache('cached_translations_en', data)
        }
        checkDone()
      }, () => checkDone())

      return () => { unsubVi(); unsubEn() }
    } catch { setLoading(false) }
  }, [])

  const getT = (lang) => ({
    ...DEFAULT_T[lang],
    ...(lang === 'vi' ? firestoreVi : firestoreEn),
  })

  const updateTranslations = async (lang, data) => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'translations', lang), data, { merge: true })
  }

  return { getT, firestoreVi, firestoreEn, loading, updateTranslations }
}
