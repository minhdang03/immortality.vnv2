import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
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
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const addArticle = async (article) => {
    await addDoc(collection(db, 'articles'), { ...article, createdAt: serverTimestamp() })
  }
  const updateArticle = async (id, data) => { await updateDoc(doc(db, 'articles', id), data) }
  const deleteArticle = async (id) => { await deleteDoc(doc(db, 'articles', id)) }

  return { firestoreArticles, loading, addArticle, updateArticle, deleteArticle }
}
