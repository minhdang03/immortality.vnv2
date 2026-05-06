import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

// Reactive role of currently signed-in user.
// Returns: { role: 'admin' | 'moderator' | null, loading }
// - null role = signed out OR signed in but no /admins/{uid} doc (regular visitor)
// - Backward-compat: doc without `role` field → treat as 'admin' (legacy grants)
export function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user?.uid) { setRole(null); setLoading(false); return }
    setLoading(true)
    const unsub = onSnapshot(
      doc(db, 'admins', user.uid),
      (snap) => {
        if (!snap.exists()) { setRole(null); setLoading(false); return }
        const data = snap.data() || {}
        setRole(data.role || 'admin') // missing role → legacy admin
        setLoading(false)
      },
      () => { setRole(null); setLoading(false) }
    )
    return unsub
  }, [user?.uid])

  return { role, loading }
}
