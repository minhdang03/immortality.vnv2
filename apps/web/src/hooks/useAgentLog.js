/**
 * useAgentLog — admin read of public.agent_audit_log (admin SELECT policy).
 * Agents write via the Worker service_role; this is read-only.
 *
 * Adapts the audit row → the shape AgentLogTab renders
 * ({ action, status, actor, timestamp, params, error }).
 */
import { useSupabaseSWR } from './useSupabaseSWR'
import { supabase } from '../lib/supabase-client'

/** detail is free text; try to surface it as parsed params, else raw. */
function parseDetail(detail) {
  if (!detail) return { params: undefined, raw: null }
  try {
    const obj = JSON.parse(detail)
    if (obj && typeof obj === 'object') return { params: obj, raw: null }
  } catch {}
  return { params: undefined, raw: detail }
}

function adaptAudit(row) {
  const isError = row.status_code != null && row.status_code >= 400
  const { params, raw } = parseDetail(row.detail)
  return {
    id: row.id,
    action: row.action,
    status: isError ? 'error' : 'success',
    actor: row.agent_name ?? null,
    timestamp: row.ts ?? null,   // ISO string
    params,
    error: isError ? (raw || row.detail) : undefined,
  }
}

export function useAgentLog(max = 100) {
  const { data: entries, loading } = useSupabaseSWR(
    `cached_agent_log_${max}`,
    async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('agent_audit_log')
        .select('*')
        .order('ts', { ascending: false })
        .limit(max)
      if (error) throw error
      return (data ?? []).map(adaptAudit)
    },
    []
  )
  return { entries, loading }
}
