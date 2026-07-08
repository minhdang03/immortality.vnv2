import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

export function useStories() {
  const { data: stories, loading, fresh } = useFirestoreSWR(
    'cached_stories',
    (onData, onError) => {
      const q = query(collection(db, 'stories'), orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const addStory = async (story) => { await addDoc(collection(db, 'stories'), { ...story, createdAt: serverTimestamp() }) }
  const updateStory = async (id, data) => { await updateDoc(doc(db, 'stories', id), data) }
  const deleteStory = async (id) => { await deleteDoc(doc(db, 'stories', id)) }

  return { stories, loading, fresh, addStory, updateStory, deleteStory }
}
