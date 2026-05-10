import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

// Reactive role of currently signed-in user.
// Returns: { role: 'admin' | 'mod-articles' | 'mod-khaitri' | 'agent' | 'moderator' | null, loading }
// - null role = signed out OR signed in but no /admins/{uid} doc (regular visitor)
// - No legacy fallback: doc without `role` field is now treated as null. Migrate by
//   running scripts/migrate-admin-roles.js (sets role='admin' on legacy docs).
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
        setRole(data.role || null) // missing role → no permissions, must explicitly grant
        setLoading(false)
      },
      () => { setRole(null); setLoading(false) }
    )
    return unsub
  }, [user?.uid])

  return { role, loading }
}
