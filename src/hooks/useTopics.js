import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query
} from 'firebase/firestore'

export function useTopics() {
  const { data: topics, loading } = useFirestoreSWR(
    'cached_topics',
    (onData, onError) => {
      const q = query(collection(db, 'topics'), orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const addTopic = async (topic) => { await addDoc(collection(db, 'topics'), topic) }
  const updateTopic = async (id, data) => { await updateDoc(doc(db, 'topics', id), data) }
  const deleteTopic = async (id) => { await deleteDoc(doc(db, 'topics', id)) }

  return { topics, loading, addTopic, updateTopic, deleteTopic }
}
