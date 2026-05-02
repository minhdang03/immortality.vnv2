/**
 * Public hook: read approved donations for donor wall.
 * Reads from `donations` collection where status == 'approved', sorted recent first.
 * Sensitive contact info lives in separate `donation_contacts` collection (admin-only).
 */
import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import {
  collection, query, where, orderBy, limit, onSnapshot,
  addDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore'

export function useDonations(maxItems = 50) {
  const { data: donations, loading } = useFirestoreSWR(
    `cached_donations_approved_${maxItems}`,
    (onData, onError) => {
      const q = query(
        collection(db, 'donations'),
        where('status', '==', 'approved'),
        orderBy('approvedAt', 'desc'),
        limit(maxItems),
      )
      return onSnapshot(
        q,
        (snap) => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        onError,
      )
    },
    [],
  )

  return { donations: donations || [], loading }
}

/**
 * Submit donation: writes 2 docs atomically (public-safe + private contact).
 * Uses writeBatch to ensure both succeed or fail together.
 */
export async function submitDonation({
  name, isAnonymous, message, amount, email, phone,
}) {
  const trimmedName = (name || '').trim()
  if (!trimmedName) throw new Error('Name is required')
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')

  // Pre-allocate id so both docs share it
  const publicRef = doc(collection(db, 'donations'))
  const id = publicRef.id
  const privateRef = doc(db, 'donation_contacts', id)

  const batch = writeBatch(db)

  batch.set(publicRef, {
    displayName: isAnonymous ? '' : trimmedName,  // empty → wall renders "anonymous label"
    isAnonymous: !!isAnonymous,
    message: (message || '').trim() || null,
    amount: Number(amount),
    status: 'pending',
    createdAt: serverTimestamp(),
    approvedAt: null,
  })

  batch.set(privateRef, {
    realName: trimmedName,
    email: (email || '').trim() || null,
    phone: (phone || '').trim() || null,
    adminNote: null,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
  return id
}
