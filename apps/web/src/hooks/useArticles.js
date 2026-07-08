import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import { DEFAULT_ARTICLES } from '../data/articles'
import { articleSlugFields } from '../utils/slug'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, limit, serverTimestamp
} from 'firebase/firestore'

export function useArticles() {
  const { data: firestoreArticles, loading, fresh } = useFirestoreSWR(
    'cached_articles',
    (onData, onError) => {
      // Cap initial load at 200 articles. Older content stays in Firestore but isn't
      // pulled until pagination is added (TODO: useArticlesPaginated for /articles list view).
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'), limit(200))
      return onSnapshot(q, (snap) => {
        const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Seed fallback only when Firestore is genuinely empty (first install / dev).
        // Avoids re-running merge on every snapshot which churned downstream renders
        // and risked duplicates if a seed was migrated under a new id.
        if (articles.length === 0) {
          onData(DEFAULT_ARTICLES)
        } else {
          onData(articles)
        }
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

  return { firestoreArticles, loading, fresh, addArticle, updateArticle, deleteArticle }
}
