import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTheme } from './hooks/useTheme'
import { useArticles, useTranslations, useTopics } from './hooks/useFirestore'
import { useFontSize } from './hooks/useFontSize'
import { articleSlug } from './utils/slug'
import './styles/app.css'

// Layout
import BackgroundEffects from './components/BackgroundEffects'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import RSSButton from './components/RSSButton'

// Pages
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import ArticleDetail from './pages/ArticleDetail'
import SearchPage from './pages/SearchPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export default function App() {
  const [lang, setLang] = useState('vi')
  const [page, setPage] = useState('home')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const { dark, toggle: toggleTheme } = useTheme()
  const { fontSize, increase: fontIncrease, decrease: fontDecrease, reset: fontReset } = useFontSize()
  const { firestoreArticles, loading, addArticle, updateArticle, deleteArticle } = useArticles()
  const { getT, firestoreVi, firestoreEn, updateTranslations } = useTranslations()
  const { topics: TOPICS, addTopic, updateTopic, deleteTopic } = useTopics()
  const t = getT(lang)
  const allArticles = firestoreArticles

  // Firebase auth
  useEffect(() => {
    try { return onAuthStateChanged(auth, setUser) }
    catch { /* not configured */ }
  }, [])

  // Hash routing
  const applyHash = () => {
    const hash = window.location.hash.slice(1)
    if (!hash || hash === '/') { setPage('home'); return }
    if (hash.startsWith('/topic/')) { setSelectedTopic(hash.slice(7)); setPage('topic'); return }
    if (hash.startsWith('/article/')) {
      const slug = hash.slice(9)
      const found = allArticles.find(a => articleSlug(a) === slug || String(a.id) === slug)
      if (found) { setSelectedArticle(found); setPage('article') }
      return
    }
    if (hash === '/search') { setPage('search'); return }
    if (hash === '/contact') { setPage('contact'); return }
    if (hash === '/about') { setPage('about'); return }
    if (hash === '/admin') { setPage('admin'); return }
  }

  const hashAppliedRef = useRef(false)
  useEffect(() => {
    if (!hashAppliedRef.current && allArticles.length > 0) {
      applyHash()
      hashAppliedRef.current = true
    }
  }, [allArticles.length])

  useEffect(() => {
    const onHashChange = () => applyHash()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  // SEO
  useEffect(() => {
    if (page === 'article' && selectedArticle) {
      const d = selectedArticle[lang]
      if (d) {
        document.title = `${d.title} | ${t.siteName}`
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', d.title)
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', d.summary)
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', d.title)
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', d.summary)
      }
    } else {
      document.title = `${t.siteName} - ${t.siteTagline}`
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${t.siteName} - ${t.heroTitle}`)
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.heroSub)
    }
  }, [page, selectedArticle, lang])

  const navigate = (p, extra) => {
    setMenuOpen(false)
    if (p === 'topic') {
      setSelectedTopic(extra); setPage('topic')
      window.location.hash = `/topic/${extra}`
    } else if (p === 'article') {
      setSelectedArticle(extra); setPage('article')
      window.location.hash = `/article/${articleSlug(extra)}`
    } else {
      setPage(p)
      window.location.hash = p === 'home' ? '/' : `/${p}`
    }
  }

  return (
    <>
      <BackgroundEffects />
      <div className="app-wrap">
        <Header
          t={t} lang={lang} dark={dark} page={page} menuOpen={menuOpen}
          navigate={navigate} toggleTheme={toggleTheme}
          setLang={setLang} setMenuOpen={setMenuOpen}
          user={user}
        />

        <main className="container">
          {page === 'home' && (
            <HomePage t={t} lang={lang} topics={TOPICS} articles={allArticles} loading={loading} navigate={navigate} />
          )}
          {page === 'topic' && (
            <TopicPage t={t} lang={lang} topics={TOPICS} articles={allArticles} selectedTopic={selectedTopic} navigate={navigate} />
          )}
          {page === 'article' && selectedArticle && (
            <ArticleDetail
              t={t} lang={lang} article={selectedArticle} navigate={navigate}
              articles={allArticles} topics={TOPICS}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
            />
          )}
          {page === 'search' && (
            <SearchPage t={t} lang={lang} articles={allArticles} navigate={navigate} />
          )}
          {page === 'about' && (
            <AboutPage t={t} lang={lang} />
          )}
          {page === 'contact' && (
            <ContactPage t={t} />
          )}
          {page === 'admin' && (
            <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading...</div>}>
            <AdminPanel
              t={t} lang={lang} user={user}
              articles={allArticles} topics={TOPICS}
              firestoreVi={firestoreVi} firestoreEn={firestoreEn}
              onAddArticle={addArticle} onUpdateArticle={updateArticle} onDeleteArticle={deleteArticle}
              onAddTopic={addTopic} onUpdateTopic={updateTopic} onDeleteTopic={deleteTopic}
              onUpdateTranslations={updateTranslations}
            />
            </Suspense>
          )}
        </main>

        <footer className="footer">
          <div className="footer-links">
            <RSSButton articles={allArticles} lang={lang} />
          </div>
          {t.footer}
        </footer>

        <BottomNav t={t} page={page} navigate={navigate} />
      </div>
    </>
  )
}
