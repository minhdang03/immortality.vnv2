import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'

// Articles CRUD
export function useArticles() {
  const [firestoreArticles, setFirestoreArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setFirestoreArticles(docs)
        setLoading(false)
      }, () => {
        // Firestore not configured yet, use defaults only
        setLoading(false)
      })
      return unsub
    } catch {
      setLoading(false)
    }
  }, [])

  const addArticle = async (article) => {
    await addDoc(collection(db, 'articles'), {
      ...article,
      createdAt: serverTimestamp(),
    })
  }

  const updateArticle = async (id, data) => {
    await updateDoc(doc(db, 'articles', id), data)
  }

  const deleteArticle = async (id) => {
    await deleteDoc(doc(db, 'articles', id))
  }

  return { firestoreArticles, loading, addArticle, updateArticle, deleteArticle }
}

// Comments
export function useComments(articleId) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!articleId) return
    try {
      const q = query(
        collection(db, 'articles', articleId, 'comments'),
        orderBy('createdAt', 'asc')
      )
      const unsub = onSnapshot(q, (snap) => {
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, () => {
        // Firestore not configured, use localStorage fallback
        const saved = localStorage.getItem(`comments_${articleId}`)
        if (saved) setComments(JSON.parse(saved))
      })
      return unsub
    } catch {
      const saved = localStorage.getItem(`comments_${articleId}`)
      if (saved) setComments(JSON.parse(saved))
    }
  }, [articleId])

  const addComment = async (name, text) => {
    const comment = { name, text, createdAt: new Date().toISOString() }
    try {
      await addDoc(collection(db, 'articles', articleId, 'comments'), {
        ...comment,
        createdAt: serverTimestamp(),
      })
    } catch {
      // Fallback to localStorage
      const updated = [...comments, { ...comment, id: Date.now().toString() }]
      setComments(updated)
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updated))
    }
  }

  return { comments, addComment }
}
