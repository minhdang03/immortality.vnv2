/**
 * useUserRole — reactive role for the currently signed-in user.
 *
 * VITE_DATA_BACKEND === 'supabase' → reads public.profiles.role via Supabase Auth uid.
 * Otherwise → reads /admins/{uid} from Firestore (original behaviour, unchanged).
 *
 * Returns: { role: 'admin'|'mod'|'user'|null, loading }
 *   null  = signed out OR no profile row (regular visitor).
 */
import { useState, useEffect } from 'react'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

// ── Supabase path ─────────────────────────────────────────────────────────────
function useUserRoleSupabase(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user?.id) { setRole(null); setLoading(false); return }

    setLoading(true)
    // Dynamic import keeps Supabase client out of the initial bundle on the Firebase path.
    import('../lib/supabase-client').then(({ supabase }) => {
      if (!supabase) { setRole(null); setLoading(false); return }

      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          setRole((!error && data?.role) ? data.role : null)
          setLoading(false)
        })
        .catch(() => { setRole(null); setLoading(false) })
    })
  }, [user?.id])

  return { role, loading }
}

// ── Firebase path (original, unchanged) ───────────────────────────────────────
function useUserRoleFirebase(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user?.uid) { setRole(null); setLoading(false); return }
    setLoading(true)

    let unsub
    // Dynamic imports keep firebase deps tree-shakeable when on Supabase path.
    Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]).then(([{ db }, { doc, onSnapshot }]) => {
      unsub = onSnapshot(
        doc(db, 'admins', user.uid),
        (snap) => {
          if (!snap.exists()) { setRole(null); setLoading(false); return }
          const data = snap.data() || {}
          setRole(data.role || null)
          setLoading(false)
        },
        () => { setRole(null); setLoading(false) }
      )
    }).catch(() => { setRole(null); setLoading(false) })

    return () => { if (unsub) unsub() }
  }, [user?.uid])

  return { role, loading }
}

// ── Public export — flag-gated ────────────────────────────────────────────────
/**
 * @param {object|null} user  Firebase user (uid) OR Supabase user (id), depending on flag.
 */
export function useUserRole(user) {
  // Rules of Hooks: both branches must always call the same hook unconditionally.
  // We pick at module-evaluation time (constant), so only one branch ever runs.
  if (USE_SUPABASE) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserRoleSupabase(user)
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useUserRoleFirebase(user)
}
