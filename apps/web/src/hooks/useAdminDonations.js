/**
 * Admin hook: read all donations (any status) + actions.
 * Used by admin DonationsTab.
 */
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import {
  collection, query, orderBy, onSnapshot,
  doc, getDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore'

export function useAdminDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const fetchContact = async (id) => {
    const snap = await getDoc(doc(db, 'donation_contacts', id))
    return snap.exists() ? snap.data() : null
  }

  const approve = async (id) => {
    await updateDoc(doc(db, 'donations', id), {
      status: 'approved',
      approvedAt: serverTimestamp(),
    })
  }

  const reject = async (id) => {
    await updateDoc(doc(db, 'donations', id), {
      status: 'rejected',
      approvedAt: null,
    })
  }

  const remove = async (id) => {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'donations', id))
    batch.delete(doc(db, 'donation_contacts', id))
    await batch.commit()
  }

  const updateAdminNote = async (id, note) => {
    await updateDoc(doc(db, 'donation_contacts', id), { adminNote: note })
  }

  return { donations, loading, fetchContact, approve, reject, remove, updateAdminNote }
}
