import { useFirestoreSWR } from './useFirestoreSWR'
import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType } from './_supabase-content'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function useStories() {
  const supaResult = useSupabaseSWR(
    'cached_stories',
    () => fetchContentByType('story', { orderCol: 'order_index', ascending: true }),
    []
  )

  const firestoreResult = useFirestoreSWR(
    'cached_stories',
    (onData, onError) => {
      const q = query(collection(db, 'stories'), orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const { data: stories, loading, fresh } = USE_SUPABASE ? supaResult : firestoreResult

  // Writes stay on Firestore for this phase
  const addStory = async (story) => { await addDoc(collection(db, 'stories'), { ...story, createdAt: serverTimestamp() }) }
  const updateStory = async (id, data) => { await updateDoc(doc(db, 'stories', id), data) }
  const deleteStory = async (id) => { await deleteDoc(doc(db, 'stories', id)) }

  return { stories, loading, fresh, addStory, updateStory, deleteStory }
}
