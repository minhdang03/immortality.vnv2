/**
 * useUserRole — reactive role for the currently signed-in user.
 * Reads public.profiles.role via the Supabase Auth uid.
 *
 * Returns: { role: 'admin'|'mod'|'user'|null, loading }
 *   null = signed out OR no profile row (regular visitor).
 *
 * @param {object|null} user  Supabase user (has `.id`).
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase-client'

export function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user?.id || !supabase) { setRole(null); setLoading(false); return }

    setLoading(true)
    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setRole((!error && data?.role) ? data.role : null)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.id])

  return { role, loading }
}
