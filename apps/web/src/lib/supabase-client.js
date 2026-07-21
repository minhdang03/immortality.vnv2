/**
 * Canonical Supabase JS client — anon key only.
 * service_role NEVER goes in client bundles; it lives in the Worker secret.
 *
 * Shared by all hooks (auth, content, analytics). Import `supabase` from here
 * (src/supabase.js re-exports this same instance for the historical import path).
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (typeof window !== 'undefined' && (!url || !key)) {
  // Non-fatal, but the app cannot read/write data without these.
  console.warn('[supabase-client] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set')
}

/**
 * Supabase client or null when env vars are absent.
 * Always guard: `if (!supabase) return`
 */
export const supabase = (url && key)
  ? createClient(url, key, {
      auth: {
        persistSession: true,        // JWT stored in localStorage; restored on reload
        autoRefreshToken: true,
        detectSessionInUrl: false,   // no OAuth redirects — email/password only
      },
    })
  : null
