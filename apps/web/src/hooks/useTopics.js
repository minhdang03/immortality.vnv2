/**
 * useTopics — Firestore path for flat topics collection.
 *
 * On the Supabase path (VITE_DATA_BACKEND === 'supabase'), the `topics`
 * Firestore collection is superseded by `public.categories` (phase-07).
 * We return an empty list so existing components (ArticlesPage, TopicPage,
 * AdminPanel) keep working without changes — they just see no Firestore topics.
 * The AdminPanel CategoriesTab handles category management on Supabase.
 */
import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query
} from 'firebase/firestore'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function useTopics() {
  const { data: topics, loading } = useFirestoreSWR(
    'cached_topics',
    (onData, onError) => {
      // On Supabase path: skip Firestore subscription; onData([]) keeps shape valid.
      if (USE_SUPABASE) { onData([]); return () => {} }
      const q = query(collection(db, 'topics'), orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const addTopic = async (topic) => {
    if (USE_SUPABASE) return // managed via useCategories on Supabase path
    await addDoc(collection(db, 'topics'), topic)
  }
  const updateTopic = async (id, data) => {
    if (USE_SUPABASE) return
    await updateDoc(doc(db, 'topics', id), data)
  }
  const deleteTopic = async (id) => {
    if (USE_SUPABASE) return
    await deleteDoc(doc(db, 'topics', id))
  }

  return { topics, loading, addTopic, updateTopic, deleteTopic }
}
