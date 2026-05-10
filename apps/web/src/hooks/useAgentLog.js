import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import { collection, query, orderBy, limit as fsLimit, onSnapshot } from 'firebase/firestore'

// Read-only — agents write via functions/scripts/log-agent-op.js (admin SDK).
export function useAgentLog(max = 100) {
  const { data: entries, loading } = useFirestoreSWR(
    `cached_agent_log_${max}`,
    (onData, onError) => onSnapshot(
      query(collection(db, 'agent_log'), orderBy('timestamp', 'desc'), fsLimit(max)),
      (snap) => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      onError
    ),
    []
  )
  return { entries, loading }
}
