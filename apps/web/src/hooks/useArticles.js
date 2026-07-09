import { useFirestoreSWR } from './useFirestoreSWR'
import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType } from './_supabase-content'
import { db } from '../firebase'
import { DEFAULT_ARTICLES } from '../data/articles'
import { articleSlugFields } from '../utils/slug'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, limit, serverTimestamp
} from 'firebase/firestore'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function useArticles() {
  // --- Supabase path ---
  const supaResult = useSupabaseSWR(
    'cached_articles',
    () => fetchContentByType('article', { orderCol: 'content_date', ascending: false, limit: 200 }),
    DEFAULT_ARTICLES
  )

  // --- Firestore path (unchanged) ---
  const firestoreResult = useFirestoreSWR(
    'cached_articles',
    (onData, onError) => {
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'), limit(200))
      return onSnapshot(q, (snap) => {
        const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        onData(articles.length === 0 ? DEFAULT_ARTICLES : articles)
      }, onError)
    },
    DEFAULT_ARTICLES
  )

  const { data: firestoreArticles, loading, fresh } = USE_SUPABASE ? supaResult : firestoreResult

  // Writes stay on Firestore for this phase (reads-first migration)
  const addArticle = async (article) => {
    await addDoc(collection(db, 'articles'), { ...article, ...articleSlugFields(article), createdAt: serverTimestamp() })
  }
  const updateArticle = async (id, data) => {
    await updateDoc(doc(db, 'articles', id), { ...data, ...articleSlugFields(data) })
  }
  const deleteArticle = async (id) => { await deleteDoc(doc(db, 'articles', id)) }

  return { firestoreArticles, loading, fresh, addArticle, updateArticle, deleteArticle }
}
