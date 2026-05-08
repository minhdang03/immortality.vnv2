import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTheme } from './hooks/useTheme'
import { useUserRole } from './hooks/useUserRole'
import { useArticles } from './hooks/useArticles'
import { useTranslations } from './hooks/useTranslations'
import { useTopics } from './hooks/useTopics'
import { useStories } from './hooks/useStories'
import { useKhaiTri } from './hooks/useKhaiTri'
import { useTeachings } from './hooks/useTeachings'
import { usePractices } from './hooks/usePractices'
import { useSiteSettings } from './hooks/useSiteSettings'
import { useFontSize } from './hooks/useFontSize'
import { articleSlug } from './utils/slug'
import { matchRoute } from './config/pages'
import { usePageView, trackThemeToggle, trackLanguageChange, trackNavigation } from './hooks/useAnalytics'
import { useSEO } from './hooks/useSEO'
import './styles/app.css'

// Layout
import BackgroundEffects from './components/layout/BackgroundEffects'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import RSSButton from './components/shared/RSSButton'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { HomeSkeleton, ListSkeleton, DetailSkeleton, PageSkeleton } from './components/shared/Skeleton'
import Footer from './components/layout/Footer'

// Pages — core
const HomePage = lazy(() => import('./pages/core/HomePage'))
const SearchPage = lazy(() => import('./pages/core/SearchPage'))
// Pages — content
const ArticlesPage = lazy(() => import('./pages/content/ArticlesPage'))
const ArticleDetail = lazy(() => import('./pages/content/ArticleDetail'))
const TopicPage = lazy(() => import('./pages/content/TopicPage'))
const StoriesPage = lazy(() => import('./pages/content/StoriesPage'))
const KhaiTriPage = lazy(() => import('./pages/content/KhaiTriPage'))
// Pages — info
const AboutPage = lazy(() => import('./pages/info/AboutPage'))
const ContactPage = lazy(() => import('./pages/info/ContactPage'))
const PracticePage = lazy(() => import('./pages/info/PracticePage'))
const UngHoPage = lazy(() => import('./pages/info/UngHoPage'))
const CongDongPage = lazy(() => import('./pages/info/CongDongPage'))
// Admin
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export default function App() {
  const [lang, setLang] = useState(() => {
    // Domain dictates default language. Per-domain override lives at lang:<host>
    // so toggling EN on immortality.vn doesn't leak EN into battudao.com.
    const host = window.location.hostname
    const domainDefault = host.includes('immortality.vn') ? 'en' : 'vi'
    // One-shot migrate legacy unscoped key to per-domain (only on the host where it was last set).
    const legacy = localStorage.getItem('lang')
    if (legacy && !localStorage.getItem(`lang:${host}`)) {
      localStorage.setItem(`lang:${host}`, legacy)
      localStorage.removeItem('lang')
    }
    return localStorage.getItem(`lang:${host}`) || domainDefault
  })
  // Initial page from URL — prevents flash of 'home' before applyPath() runs on deep-link refresh.
  const [page, setPage] = useState(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '/'
    if (p.startsWith('/article/') || p.startsWith('/articles/')) return 'article'
    if (p.startsWith('/khaitri/')) return 'khaitri'
    if (p.startsWith('/story/')) return 'stories'
    if (p.startsWith('/topic/')) return 'topic'
    if (p === '/' || !p) return 'home'
    const id = p.replace(/^\//, '').replace(/\/$/, '').split('/')[0]
    return id || 'home'
  })
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const { firestoreArticles, loading: articlesLoading, addArticle, updateArticle, deleteArticle } = useArticles()
  const { getT, firestoreVi, firestoreEn, updateTranslations } = useTranslations()
  const { topics: TOPICS, loading: topicsLoading, addTopic, updateTopic, deleteTopic } = useTopics()
  const { stories: firestoreStories, loading: storiesLoading, addStory, updateStory, deleteStory } = useStories()
  const { khaitri, addKhaiTri, updateKhaiTri, deleteKhaiTri } = useKhaiTri()
  const { teachings, addTeaching, updateTeaching, deleteTeaching } = useTeachings()
  const { practices, addPractice, updatePractice, deletePractice } = usePractices()
  const { settings: siteSettings, loading: settingsLoading, updateSettings } = useSiteSettings()
  const { dark, toggle: toggleTheme } = useTheme(siteSettings?.defaultTheme)
  const { role: userRole } = useUserRole(user)
  const homeLoading = articlesLoading || topicsLoading || storiesLoading || settingsLoading
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
    // Accept both /article/:slug (canonical) and /articles/:slug (common typo) — redirect plural to singular.
    if (path.startsWith('/articles/')) {
      const slug = path.slice(10)
      if (slug) { history.replaceState({}, '', `/article/${slug}`) }
    }
    if (path.startsWith('/article/')) {
      const slug = path.slice(9)
      const found = allArticles.find(a =>
        articleSlug(a) === slug ||
        String(a.id) === slug ||
        a.sourceRef === slug ||
        a.viSlug === slug ||
        a.enSlug === slug
      )
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
  }, [allArticles])

  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  const navigate = (p, extra) => {
    trackNavigation(page, p)
    setMenuOpen(false)
    const update = () => {
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
    // View Transitions API — smooth crossfade between pages
    if (document.startViewTransition) {
      document.startViewTransition(update)
    } else {
      update()
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
          setLang={(l) => { setLang(l); localStorage.setItem(`lang:${window.location.hostname}`, l); trackLanguageChange(l) }}
          setMenuOpen={setMenuOpen}
          user={user} navItems={siteSettings.navItems}
        />

        <main className="container">
          <ErrorBoundary key={page}>
          <Suspense fallback={
            // On F5 of any detail URL, show DetailSkeleton — not ListSkeleton.
            // (After SPA navigation, this branch becomes false and the page-state branch decides.)
            (typeof window !== 'undefined' && /^\/(article|articles|khaitri|story)\//.test(window.location.pathname)) ? <DetailSkeleton /> :
            page === 'home' ? <HomeSkeleton /> :
            page === 'article' ? <DetailSkeleton /> :
            ['articles', 'stories', 'khaitri', 'topic'].includes(page) ? <ListSkeleton /> :
            <PageSkeleton />
          }>
          {page === 'home' && (
            <HomePage t={t} lang={lang} topics={TOPICS} articles={allArticles} stories={firestoreStories} loading={homeLoading} navigate={navigate} siteSettings={siteSettings} />
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
          {page === 'article' && !selectedArticle && <DetailSkeleton />}
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
            <KhaiTriPage t={t} lang={lang} items={user ? khaitri : khaitri.filter(k => k.status !== 'draft')} navigate={navigate}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={user} onUpdateKhaiTri={updateKhaiTri}
            />
          )}
          {page === 'contact' && (
            <ContactPage t={t} />
          )}
          {page === 'ungho' && (
            <UngHoPage t={t} lang={lang} channels={siteSettings.donationChannels} />
          )}
          {page === 'cong-dong' && (
            <CongDongPage lang={lang} navigate={navigate} />
          )}
          {page === 'admin' && (
            <AdminPanel
              t={t} lang={lang} user={user} userRole={userRole}
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
          </ErrorBoundary>
        </main>

        <Footer t={t} lang={lang} articles={allArticles} navigate={navigate} />

        <BottomNav t={t} lang={lang} page={page} navigate={navigate} navItems={siteSettings.navItems} />
      </div>
    </>
  )
}
