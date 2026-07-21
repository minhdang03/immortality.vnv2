/**
 * Public donations: read approved rows for the donor wall + submit new donation.
 * Sensitive contact info lives in `donation_contacts` (admin-only read).
 */
import { useSupabaseSWR } from './useSupabaseSWR'
import { supabase } from '../lib/supabase-client'

/** Map a donations row → shape the wall/admin UI expects. */
export function adaptDonation(row) {
  return {
    id: row.id,
    amount: typeof row.amount === 'string' ? Number(row.amount) : row.amount,
    channel: row.channel ?? null,
    displayName: row.donor_name || '',       // empty → wall renders anonymous label
    isAnonymous: !row.donor_name,
    message: row.message ?? null,
    status: row.status,
    createdAt: row.created_at ?? null,
    approvedAt: row.status === 'approved' ? (row.created_at ?? null) : null,
  }
}

export function useDonations(maxItems = 50) {
  const { data: donations, loading } = useSupabaseSWR(
    `cached_donations_approved_${maxItems}`,
    async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(maxItems)
      if (error) throw error
      return (data ?? []).map(adaptDonation)
    },
    [],
  )

  return { donations: donations || [], loading }
}

/**
 * Submit a donation: public (non-PII) row + private contact row, linked by a
 * client-generated id. Both are plain inserts (rows are not anon-readable).
 */
export async function submitDonation({ name, isAnonymous, message, amount, email, phone }) {
  const trimmedName = (name || '').trim()
  if (!trimmedName) throw new Error('Name is required')
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')
  if (!supabase) throw new Error('Supabase not configured')

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `don-${Date.now()}`

  const { error: dErr } = await supabase.from('donations').insert({
    id,
    amount: Number(amount),
    channel: null,
    donor_name: isAnonymous ? '' : trimmedName,
    message: (message || '').trim() || null,
  })
  if (dErr) throw dErr

  const { error: cErr } = await supabase.from('donation_contacts').insert({
    donation_id: id,
    real_name: trimmedName,
    email: (email || '').trim() || null,
    phone: (phone || '').trim() || null,
  })
  if (cErr) throw cErr

  return id
}
