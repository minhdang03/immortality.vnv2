/**
 * useAuth — Supabase Auth session + role hook.
 *
 * Exposes: { user, role, loading, signIn, signOut }
 *
 * role is sourced from public.profiles.role (gated by RLS + is_admin()).
 * On SIGNED_OUT → clearAllCaches() so cached admin-visible data cannot leak.
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase-client'
import { clearAllCaches } from '../lib/swr-cache'

/**
 * Fetch the role for a given user id from public.profiles.
 * Returns null if no row or on error (profiles RLS: self-read allowed).
 * @param {string} uid
 * @returns {Promise<string|null>}
 */
async function fetchRole(uid) {
  if (!supabase || !uid) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single()
    if (error) return null
    return data?.role ?? null
  } catch {
    return null
  }
}

/**
 * @returns {{
 *   user: import('@supabase/supabase-js').User|null,
 *   role: 'admin'|'mod'|'user'|null,
 *   loading: boolean,
 *   signIn: (email: string, password: string) => Promise<{error: Error|null}>,
 *   signOut: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    // Bootstrap: restore existing session on mount (supabase-js persists to localStorage).
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setRole(await fetchRole(u?.id))
      setLoading(false)
    }).catch(() => setLoading(false))

    // Subscribe to future auth state changes (sign-in / sign-out / token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (event === 'SIGNED_OUT') {
          setRole(null)
          clearAllCaches()  // prevent stale admin data leaking on shared device
        } else {
          setRole(await fetchRole(u?.id))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign in with email + password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{error: Error|null}>}
   */
  const signIn = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }

  /**
   * Sign out. clearAllCaches() is called via onAuthStateChange(SIGNED_OUT).
   */
  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return { user, role, loading, signIn, signOut }
}
