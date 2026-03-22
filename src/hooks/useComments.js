import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

const RATE_LIMIT_KEY = 'comment_timestamps'
const RATE_LIMIT_MAX = 2
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited() {
  const raw = localStorage.getItem(RATE_LIMIT_KEY)
  const timestamps = raw ? JSON.parse(raw) : []
  const now = Date.now()
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  return recent.length >= RATE_LIMIT_MAX
}

function recordSubmission() {
  const raw = localStorage.getItem(RATE_LIMIT_KEY)
  const timestamps = raw ? JSON.parse(raw) : []
  const now = Date.now()
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, now]))
}

export function useComments(articleId, isAdmin = false) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!articleId) return
    try {
      const q = query(
        collection(db, 'articles', articleId, 'comments'),
        orderBy('createdAt', 'asc')
      )
      const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setComments(isAdmin ? all : all.filter(c => c.status === 'approved'))
      }, () => {
        const saved = localStorage.getItem(`comments_${articleId}`)
        if (saved) setComments(JSON.parse(saved))
      })
      return unsub
    } catch {
      const saved = localStorage.getItem(`comments_${articleId}`)
      if (saved) setComments(JSON.parse(saved))
    }
  }, [articleId, isAdmin])

  const addComment = async (name, text) => {
    if (isRateLimited()) return { error: 'rate_limited' }
    const comment = { name, text, status: 'pending', createdAt: new Date().toISOString() }
    try {
      await addDoc(collection(db, 'articles', articleId, 'comments'), {
        ...comment, createdAt: serverTimestamp(),
      })
      recordSubmission()
    } catch {
      recordSubmission()
    }
    return {}
  }

  const approveComment = async (id) => {
    await updateDoc(doc(db, 'articles', articleId, 'comments', id), { status: 'approved' })
  }

  const deleteComment = async (id) => {
    await deleteDoc(doc(db, 'articles', articleId, 'comments', id))
  }

  return { comments, addComment, approveComment, deleteComment }
}
