/**
 * useAdmins — admin/mod user list + grant/revoke via Supabase.
 *
 * List: public.profiles where role IN ('admin','mod') (RLS lets admins read all).
 * Grant/revoke: supabase.rpc('set_user_role', { target_id, new_role }) — admin-only.
 *   Self-demotion is blocked server-side (UI also guards).
 *
 * Shape returned: [{ id, email, role }]  (email = display_name for identification)
 */
import { useSupabaseSWR } from './useSupabaseSWR'
import { supabase } from '../lib/supabase-client'

const VALID_ROLES = new Set(['admin', 'mod', 'user'])

export function useAdmins() {
  const { data: admins, loading } = useSupabaseSWR(
    'cached_admins',
    async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .in('role', ['admin', 'mod'])
        .order('role')
      if (error) throw error
      return (data ?? []).map(r => ({ id: r.id, role: r.role, email: r.display_name ?? null }))
    },
    []
  )

  const setRole = async (uid, role) => {
    if (!uid) throw new Error('UID required')
    if (!VALID_ROLES.has(role)) throw new Error('Invalid role')
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.rpc('set_user_role', { target_id: uid, new_role: role })
    if (error) throw error
  }

  // grantAdmin(uid, _email, _grantedBy, role): email/grantedBy kept for call-site
  // compatibility; role is stored directly on the profile.
  const grantAdmin = (uid, _email, _grantedBy, role = 'admin') => setRole(uid, role)
  const revokeAdmin = (uid) => setRole(uid, 'user')

  return { admins: admins ?? [], loading, grantAdmin, revokeAdmin }
}
