import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

export default function useCRUD(collectionName, orderField = 'order') {
  const { data: items, loading } = useFirestoreSWR(
    `cached_${collectionName}`,
    (onData, onError) => {
      const q = query(collection(db, collectionName), orderBy(orderField, 'asc'))
      return onSnapshot(q, (snap) => {
        onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, onError)
    },
    []
  )

  const add = async (item) => { await addDoc(collection(db, collectionName), { ...item, createdAt: serverTimestamp() }) }
  const update = async (id, data) => { await updateDoc(doc(db, collectionName, id), data) }
  const remove = async (id) => { await deleteDoc(doc(db, collectionName, id)) }

  return { items, loading, add, update, remove }
}
