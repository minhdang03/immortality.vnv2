import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

// Manage /admins/{uid} allowlist. Add/remove a UID grants/revokes admin.
// Self-protection enforced in Firestore rules: cannot delete request.auth.uid doc.
export function useAdmins() {
  const { data: admins, loading } = useFirestoreSWR(
    'cached_admins',
    (onData, onError) => onSnapshot(
      collection(db, 'admins'),
      (snap) => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      onError
    ),
    []
  )

  // role: 'admin' | 'moderator'. grantedBy = current user uid for audit.
  const grantAdmin = async (uid, email, grantedBy, role = 'admin') => {
    if (!uid) throw new Error('UID required')
    if (role !== 'admin' && role !== 'moderator') throw new Error('Invalid role')
    await setDoc(doc(db, 'admins', uid.trim()), {
      role,
      email: email?.trim() || null,
      grantedAt: serverTimestamp(),
      grantedBy: grantedBy || null,
    })
  }

  const revokeAdmin = async (uid) => {
    if (!uid) throw new Error('UID required')
    await deleteDoc(doc(db, 'admins', uid))
  }

  return { admins, loading, grantAdmin, revokeAdmin }
}
