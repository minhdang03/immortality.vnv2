/**
 * Admin donations: read all rows (any status) + moderate. Used by DonationsTab.
 * Contact PII (donation_contacts) is fetched lazily per row (admin-only read).
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase-client'
import { adaptDonation } from './useDonations'

export function useAdminDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setDonations((data ?? []).map(adaptDonation))
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const fetchContact = async (id) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('donation_contacts')
      .select('real_name, email, phone')
      .eq('donation_id', id)
      .maybeSingle()
    if (error || !data) return null
    return { realName: data.real_name, email: data.email, phone: data.phone }
  }

  const approve = async (id) => {
    if (!supabase) return
    await supabase.from('donations').update({ status: 'approved' }).eq('id', id)
    reload()
  }

  const reject = async (id) => {
    if (!supabase) return
    await supabase.from('donations').update({ status: 'rejected' }).eq('id', id)
    reload()
  }

  const remove = async (id) => {
    if (!supabase) return
    // donation_contacts cascade-deletes via FK.
    await supabase.from('donations').delete().eq('id', id)
    reload()
  }

  // No adminNote column in the Supabase schema — kept as a no-op so the note UI
  // doesn't throw. (Contract mismatch: donation_contacts has no admin_note field.)
  const updateAdminNote = async () => {}

  return { donations, loading, fetchContact, approve, reject, remove, updateAdminNote }
}
