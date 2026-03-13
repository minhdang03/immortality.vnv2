import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { DEFAULT_T } from '../data/translations'


/* ─── TRANSLATIONS ─── */
export function useTranslations() {
  const [firestoreVi, setFirestoreVi] = useState(null)
  const [firestoreEn, setFirestoreEn] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let loaded = 0
    const checkDone = () => { if (++loaded >= 2) setLoading(false) }
    try {
      const unsubVi = onSnapshot(doc(db, 'translations', 'vi'), (snap) => {
        if (snap.exists()) setFirestoreVi(snap.data())
        checkDone()
      }, () => checkDone())

      const unsubEn = onSnapshot(doc(db, 'translations', 'en'), (snap) => {
        if (snap.exists()) setFirestoreEn(snap.data())
        checkDone()
      }, () => checkDone())

      return () => { unsubVi(); unsubEn() }
    } catch { setLoading(false) }
  }, [])

  const getT = (lang) => ({
    ...DEFAULT_T[lang],
    ...(lang === 'vi' ? firestoreVi : firestoreEn),
  })

  const updateTranslations = async (lang, data) => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'translations', lang), data, { merge: true })
  }

  return { getT, firestoreVi, firestoreEn, loading, updateTranslations }
}

/* ─── ARTICLES CRUD (with localStorage cache) ─── */
export function useArticles() {
  const [firestoreArticles, setFirestoreArticles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_articles')) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_articles'))

  useEffect(() => {
    try {
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setFirestoreArticles(articles)
        setLoading(false)
        try { localStorage.setItem('cached_articles', JSON.stringify(articles)) } catch {}
      }, () => { setLoading(false) })
      return unsub
    } catch { setLoading(false) }
  }, [])

  const addArticle = async (article) => {
    await addDoc(collection(db, 'articles'), { ...article, createdAt: serverTimestamp() })
  }
  const updateArticle = async (id, data) => { await updateDoc(doc(db, 'articles', id), data) }
  const deleteArticle = async (id) => { await deleteDoc(doc(db, 'articles', id)) }

  return { firestoreArticles, loading, addArticle, updateArticle, deleteArticle }
}

/* ─── COMMENTS ─── */
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
        ...comment, createdAt: serverTimestamp(),
      })
    } catch {
      const updated = [...comments, { ...comment, id: Date.now().toString() }]
      setComments(updated)
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updated))
    }
  }

  return { comments, addComment }
}

/* ─── STORIES CRUD (with localStorage cache) ─── */
export function useStories() {
  const [stories, setStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_stories')) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_stories'))

  useEffect(() => {
    try {
      const q = query(collection(db, 'stories'), orderBy('order', 'asc'))
      const unsub = onSnapshot(q, (snap) => {
        const s = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setStories(s)
        setLoading(false)
        try { localStorage.setItem('cached_stories', JSON.stringify(s)) } catch {}
      }, () => { setLoading(false) })
      return unsub
    } catch { setLoading(false) }
  }, [])

  const addStory = async (story) => { await addDoc(collection(db, 'stories'), { ...story, createdAt: serverTimestamp() }) }
  const updateStory = async (id, data) => { await updateDoc(doc(db, 'stories', id), data) }
  const deleteStory = async (id) => { await deleteDoc(doc(db, 'stories', id)) }

  return { stories, loading, addStory, updateStory, deleteStory }
}

/* ─── TOPICS CRUD (with localStorage cache) ─── */
export function useTopics() {
  const [topics, setTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_topics')) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_topics'))

  useEffect(() => {
    try {
      const q = query(collection(db, 'topics'), orderBy('order', 'asc'))
      const unsub = onSnapshot(q, (snap) => {
        const t = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setTopics(t)
        setLoading(false)
        try { localStorage.setItem('cached_topics', JSON.stringify(t)) } catch {}
      }, () => { setLoading(false) })
      return unsub
    } catch { setLoading(false) }
  }, [])

  const addTopic = async (topic) => { await addDoc(collection(db, 'topics'), topic) }
  const updateTopic = async (id, data) => { await updateDoc(doc(db, 'topics', id), data) }
  const deleteTopic = async (id) => { await deleteDoc(doc(db, 'topics', id)) }

  return { topics, loading, addTopic, updateTopic, deleteTopic }
}
