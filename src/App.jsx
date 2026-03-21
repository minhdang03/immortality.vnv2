import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTheme } from './hooks/useTheme'
import { useArticles, useTranslations, useTopics, useStories, useKhaiTri, useTeachings, usePractices, useSiteSettings } from './hooks/useFirestore'
import { useFontSize } from './hooks/useFontSize'
import { articleSlug } from './utils/slug'
import { PAGE_TITLES, PAGE_DESCRIPTIONS, matchRoute } from './config/pages'
import { usePageView, trackThemeToggle, trackLanguageChange, trackNavigation } from './hooks/useAnalytics'
import { useSEO } from './hooks/useSEO'
import './styles/app.css'

// Layout
import BackgroundEffects from './components/BackgroundEffects'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import RSSButton from './components/RSSButton'

// Pages
const HomePage = lazy(() => import('./pages/HomePage'))
const TopicPage = lazy(() => import('./pages/TopicPage'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'))
const StoriesPage = lazy(() => import('./pages/StoriesPage'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const KhaiTriPage = lazy(() => import('./pages/KhaiTriPage'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export default function App() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang')
    if (saved) return saved
    const host = window.location.hostname
    return host.includes('immortality.vn') ? 'en' : 'vi'
  })
  const [page, setPage] = useState('home')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const { dark, toggle: toggleTheme } = useTheme()
  const { firestoreArticles, loading, addArticle, updateArticle, deleteArticle } = useArticles()
  const { getT, firestoreVi, firestoreEn, updateTranslations } = useTranslations()
  const { topics: TOPICS, addTopic, updateTopic, deleteTopic } = useTopics()
  const { stories: firestoreStories, addStory, updateStory, deleteStory } = useStories()
  const { khaitri, addKhaiTri, updateKhaiTri, deleteKhaiTri } = useKhaiTri()
  const { teachings, addTeaching, updateTeaching, deleteTeaching } = useTeachings()
  const { practices, addPractice, updatePractice, deletePractice } = usePractices()
  const { settings: siteSettings, updateSettings } = useSiteSettings()
  const { fontSize, increase: fontIncrease, decrease: fontDecrease, reset: fontReset } = useFontSize(siteSettings?.defaultFontSize)
  const t = getT(lang)
  const allArticles = firestoreArticles

  // Analytics & SEO
  usePageView(page, selectedArticle, lang)
  useSEO(page, selectedArticle, selectedTopic, lang, TOPICS)

  // Firebase auth
  useEffect(() => {
    try { return onAuthStateChanged(auth, setUser) }
    catch { /* not configured */ }
  }, [])

  // History API routing
  const applyPath = () => {
    const path = window.location.pathname
    if (!path || path === '/') { setPage('home'); return }

    // Special parameterized routes
    if (path.startsWith('/topic/')) { setSelectedTopic(path.slice(7)); setPage('topic'); return }
    if (path.startsWith('/article/')) {
      const slug = path.slice(9)
      const found = allArticles.find(a => articleSlug(a) === slug || String(a.id) === slug)
      if (found) { setSelectedArticle(found); setPage('article') }
      return
    }

    // Data-driven simple routes
    const match = matchRoute(path)
    if (match) {
      setPage(match.id)
      if (match.redirect) history.replaceState({}, '', match.redirect)
    }
  }

  const pathAppliedRef = useRef(false)
  useEffect(() => {
    if (pathAppliedRef.current) return
    const path = window.location.pathname
    if (path?.startsWith('/article/') && allArticles.length === 0) return
    applyPath()
    pathAppliedRef.current = true
  }, [allArticles.length])

  useEffect(() => {
    const onPopState = () => applyPath()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  })

  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  // SEO - page titles
  const setMeta = (title, description) => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
  }

  useEffect(() => {
    const siteDesc = lang === 'vi'
      ? 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.'
      : 'Discover the light within — a healing journey from ancient Vietnamese wisdom.'

    if (page === 'article' && selectedArticle) {
      const d = selectedArticle[lang]
      if (d) setMeta(`${d.title} | ${t.siteName}`, d.summary || siteDesc)
    } else if (page === 'topic' && selectedTopic) {
      const tp = TOPICS.find(tp => tp.id === selectedTopic)
      const topicName = tp ? (lang === 'vi' ? tp.vi : tp.en) : selectedTopic
      setMeta(`${topicName} | ${t.siteName}`, siteDesc)
    } else if (PAGE_TITLES[page]) {
      const pt = PAGE_TITLES[page]
      const pd = PAGE_DESCRIPTIONS[page]
      setMeta(
        `${lang === 'vi' ? pt.vi : pt.en} | ${t.siteName}`,
        pd ? (lang === 'vi' ? pd.vi : pd.en) : siteDesc
      )
    } else {
      setMeta(`${t.siteName} - ${t.siteTagline}`, siteDesc)
    }
  }, [page, selectedArticle, selectedTopic, lang])

  const navigate = (p, extra) => {
    trackNavigation(page, p)
    setMenuOpen(false)
    if (p === 'topic') {
      setSelectedTopic(extra); setPage('topic')
      history.pushState({}, '', `/topic/${extra}`)
    } else if (p === 'article') {
      setSelectedArticle(extra); setPage('article')
      history.pushState({}, '', `/article/${articleSlug(extra)}`)
    } else {
      setPage(p)
      history.pushState({}, '', p === 'home' ? '/' : `/${p}`)
    }
  }

  return (
    <>
      <BackgroundEffects />
      <div className="app-wrap">
        <Header
          t={t} lang={lang} dark={dark} page={page} menuOpen={menuOpen}
          navigate={navigate}
          toggleTheme={() => { toggleTheme(); trackThemeToggle(dark ? 'light' : 'dark') }}
          setLang={(l) => { setLang(l); localStorage.setItem('lang', l); trackLanguageChange(l) }}
          setMenuOpen={setMenuOpen}
          user={user} navItems={siteSettings.navItems}
        />

        <main className="container">
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Đang tải...</div>}>
          {page === 'home' && (
            <HomePage t={t} lang={lang} topics={TOPICS} articles={allArticles} stories={firestoreStories} loading={loading} navigate={navigate} siteSettings={siteSettings} />
          )}
          {page === 'topic' && (
            <TopicPage t={t} lang={lang} topics={TOPICS} articles={allArticles} selectedTopic={selectedTopic} navigate={navigate} />
          )}
          {page === 'article' && selectedArticle && (
            <ArticleDetail
              t={t} lang={lang} article={selectedArticle} navigate={navigate}
              articles={allArticles} topics={TOPICS}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={user} onUpdateArticle={updateArticle}
            />
          )}
          {page === 'search' && (
            <SearchPage t={t} lang={lang} articles={allArticles} navigate={navigate} />
          )}
          {page === 'about' && (
            <AboutPage t={t} lang={lang} teachings={teachings} />
          )}
          {page === 'articles' && (
            <ArticlesPage t={t} lang={lang} articles={allArticles} topics={TOPICS} navigate={navigate} />
          )}
          {page === 'stories' && (
            <StoriesPage t={t} lang={lang} firestoreStories={firestoreStories} navigate={navigate}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={user} onUpdateStory={updateStory}
            />
          )}
          {page === 'practice' && (
            <PracticePage t={t} lang={lang} practices={practices} />
          )}
          {page === 'khaitri' && (
            <KhaiTriPage t={t} lang={lang} items={khaitri} navigate={navigate}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={user} onUpdateKhaiTri={updateKhaiTri}
            />
          )}
          {page === 'contact' && (
            <ContactPage t={t} />
          )}
          {page === 'admin' && (
            <AdminPanel
              t={t} lang={lang} user={user}
              articles={allArticles} topics={TOPICS} stories={firestoreStories}
              khaitri={khaitri} teachings={teachings} practices={practices}
              firestoreVi={firestoreVi} firestoreEn={firestoreEn}
              onAddArticle={addArticle} onUpdateArticle={updateArticle} onDeleteArticle={deleteArticle}
              onAddTopic={addTopic} onUpdateTopic={updateTopic} onDeleteTopic={deleteTopic}
              onAddStory={addStory} onUpdateStory={updateStory} onDeleteStory={deleteStory}
              onAddKhaiTri={addKhaiTri} onUpdateKhaiTri={updateKhaiTri} onDeleteKhaiTri={deleteKhaiTri}
              onAddTeaching={addTeaching} onUpdateTeaching={updateTeaching} onDeleteTeaching={deleteTeaching}
              onAddPractice={addPractice} onUpdatePractice={updatePractice} onDeletePractice={deletePractice}
              onUpdateTranslations={updateTranslations}
              siteSettings={siteSettings} onUpdateSettings={updateSettings}
            />
          )}
          </Suspense>
        </main>

        <footer className="footer">
          <div className="footer-links">
            <RSSButton articles={allArticles} lang={lang} />
          </div>
          {t.footer}
        </footer>

        <BottomNav t={t} lang={lang} page={page} navigate={navigate} navItems={siteSettings.navItems} />
      </div>
    </>
  )
}
