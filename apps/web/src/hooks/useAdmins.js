/**
 * useAdmins — admin/mod user list + grant/revoke.
 *
 * VITE_DATA_BACKEND === 'supabase' → reads public.profiles where role IN ('admin','mod').
 *   grantAdmin/revokeAdmin update the profiles table (admin-only via RLS).
 * Otherwise → reads /admins collection from Firestore (original behaviour, unchanged).
 *
 * Shape returned: [{ id, email, role, ... }]
 */
import { useFirestoreSWR } from './useFirestoreSWR'
import { useSupabaseSWR } from './useSupabaseSWR'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

// ── Supabase path ─────────────────────────────────────────────────────────────
function useAdminsSupabase() {
  const { data: admins, loading } = useSupabaseSWR(
    'cached_admins',
    async () => {
      const { supabase } = await import('../lib/supabase-client')
      if (!supabase) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, display_name')
        .in('role', ['admin', 'mod'])
        .order('role')
      if (error) throw error
      return (data ?? []).map(r => ({ id: r.id, role: r.role, email: r.display_name ?? null }))
    },
    []
  )

  const VALID_ROLES = new Set(['admin', 'mod', 'user'])

  const grantAdmin = async (uid, _email, _grantedBy, role = 'admin') => {
    if (!uid) throw new Error('UID required')
    if (!VALID_ROLES.has(role)) throw new Error('Invalid role')
    const { supabase } = await import('../lib/supabase-client')
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', uid)
    if (error) throw error
  }

  const revokeAdmin = async (uid) => {
    if (!uid) throw new Error('UID required')
    const { supabase } = await import('../lib/supabase-client')
    if (!supabase) throw new Error('Supabase not configured')
    // Revoke = demote to 'user', not delete (profile row must stay for auth to work).
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', uid)
    if (error) throw error
  }

  return { admins: admins ?? [], loading, grantAdmin, revokeAdmin }
}

// ── Firebase path (original, unchanged) ───────────────────────────────────────
function useAdminsFirebase() {
  // Inline dynamic imports to keep firebase deps out of the Supabase bundle.
  // We need the static import for useFirestoreSWR which is always present.
  const { data: admins, loading } = useFirestoreSWR(
    'cached_admins',
    (onData, onError) => {
      let unsub = () => {}
      Promise.all([
        import('../firebase'),
        import('firebase/firestore'),
      ]).then(([{ db }, { collection, onSnapshot }]) => {
        unsub = onSnapshot(
          collection(db, 'admins'),
          (snap) => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
          onError
        )
      }).catch(onError)
      return () => unsub()
    },
    []
  )

  const VALID_ROLES = new Set(['admin', 'agent', 'mod-articles', 'mod-khaitri', 'moderator'])

  const grantAdmin = async (uid, email, grantedBy, role = 'admin') => {
    if (!uid) throw new Error('UID required')
    if (!VALID_ROLES.has(role)) throw new Error('Invalid role')
    const [{ db }, { doc, setDoc, serverTimestamp }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ])
    await setDoc(doc(db, 'admins', uid.trim()), {
      role,
      email: email?.trim() || null,
      grantedAt: serverTimestamp(),
      grantedBy: grantedBy || null,
    })
  }

  const revokeAdmin = async (uid) => {
    if (!uid) throw new Error('UID required')
    const [{ db }, { doc, deleteDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ])
    await deleteDoc(doc(db, 'admins', uid))
  }

  return { admins: admins ?? [], loading, grantAdmin, revokeAdmin }
}

// ── Public export — flag-gated ────────────────────────────────────────────────
export function useAdmins() {
  if (USE_SUPABASE) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAdminsSupabase()
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAdminsFirebase()
}
