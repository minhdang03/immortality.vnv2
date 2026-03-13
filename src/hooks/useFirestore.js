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

/* ─── GENERIC CRUD (for revelations, teachings, practices) ─── */
function useCRUD(collectionName, orderField = 'order') {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`cached_${collectionName}`)) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(() => !localStorage.getItem(`cached_${collectionName}`))

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), orderBy(orderField, 'asc'))
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setItems(data)
        setLoading(false)
        try { localStorage.setItem(`cached_${collectionName}`, JSON.stringify(data)) } catch {}
      }, () => { setLoading(false) })
      return unsub
    } catch { setLoading(false) }
  }, [])

  const add = async (item) => { await addDoc(collection(db, collectionName), { ...item, createdAt: serverTimestamp() }) }
  const update = async (id, data) => { await updateDoc(doc(db, collectionName, id), data) }
  const remove = async (id) => { await deleteDoc(doc(db, collectionName, id)) }

  return { items, loading, add, update, remove }
}

/* ─── REVELATIONS (Khai Thị) ─── */
export function useRevelations() {
  const { items, loading, add, update, remove } = useCRUD('revelations')
  return { revelations: items, loading, addRevelation: add, updateRevelation: update, deleteRevelation: remove }
}

/* ─── TEACHINGS (Giới Thiệu / Đô Tỷ Pháp) ─── */
export function useTeachings() {
  const { items, loading, add, update, remove } = useCRUD('teachings')
  return { teachings: items, loading, addTeaching: add, updateTeaching: update, deleteTeaching: remove }
}

/* ─── PRACTICES (Thái Dương Quyền movements) ─── */
export function usePractices() {
  const { items, loading, add, update, remove } = useCRUD('practices')
  return { practices: items, loading, addPractice: add, updatePractice: update, deletePractice: remove }
}

/* ─── SITE SETTINGS (navigation structure, etc.) ─── */
export const DEFAULT_NAV_ITEMS = [
  { id: 'home', labelVi: 'Trang Chủ', labelEn: 'Home', visible: true, showInBottom: true },
  { id: 'stories', labelVi: '37 Chuyện', labelEn: 'Stories', visible: true, showInBottom: true },
  { id: 'revelations', labelVi: 'Khai Thị', labelEn: 'Revelations', visible: true, showInBottom: true },
  { id: 'about', labelVi: 'Giới Thiệu', labelEn: 'About', visible: true, showInBottom: false },
  { id: 'practice', labelVi: 'Thái Dương Quyền', labelEn: 'Solar Fist', visible: true, showInBottom: true },
  { id: 'contact', labelVi: 'Liên Hệ', labelEn: 'Contact', visible: true, showInBottom: true },
]

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('cached_site_settings'))
      return cached || { navItems: DEFAULT_NAV_ITEMS }
    } catch { return { navItems: DEFAULT_NAV_ITEMS } }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setSettings(data)
          try { localStorage.setItem('cached_site_settings', JSON.stringify(data)) } catch {}
        }
        setLoading(false)
      }, () => { setLoading(false) })
      return unsub
    } catch { setLoading(false) }
  }, [])

  const updateSettings = async (data) => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'settings', 'site'), data, { merge: true })
  }

  return { settings, loading, updateSettings }
}
