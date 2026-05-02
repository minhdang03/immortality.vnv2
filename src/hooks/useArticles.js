import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import { DEFAULT_ARTICLES } from '../data/articles'
import { articleSlugFields } from '../utils/slug'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

export function useArticles() {
  const { data: firestoreArticles, loading } = useFirestoreSWR(
    'cached_articles',
    (onData, onError) => {
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'))
      return onSnapshot(q, (snap) => {
        const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Merge seed articles that aren't yet in Firestore
        const existingIds = new Set(articles.map(a => a.id))
        const seeds = DEFAULT_ARTICLES.filter(a => !existingIds.has(a.id))
        onData([...articles, ...seeds])
      }, onError)
    },
    DEFAULT_ARTICLES
  )

  const addArticle = async (article) => {
    await addDoc(collection(db, 'articles'), { ...article, ...articleSlugFields(article), createdAt: serverTimestamp() })
  }
  const updateArticle = async (id, data) => {
    await updateDoc(doc(db, 'articles', id), { ...data, ...articleSlugFields(data) })
  }
  const deleteArticle = async (id) => { await deleteDoc(doc(db, 'articles', id)) }

  return { firestoreArticles, loading, addArticle, updateArticle, deleteArticle }
}
