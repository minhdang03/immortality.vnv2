// Single Supabase client instance for the whole web app.
// Canonical config lives in ./lib/supabase-client.js (persistSession etc.).
// Re-export here so both historical import paths ('../supabase' and
// '../lib/supabase-client') resolve to ONE GoTrue instance — avoids the
// "Multiple GoTrueClient instances" runtime warning + auth-state races.
export { supabase } from './lib/supabase-client'
