import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // Non-fatal: Supabase client will be null; hooks fall back to Firestore path
  // when VITE_DATA_BACKEND != 'supabase'
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set')
}

export const supabase = (url && key) ? createClient(url, key) : null
