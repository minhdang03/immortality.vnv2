import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTheme } from './hooks/useTheme'
import { useUserRole } from './hooks/useUserRole'
import { useAuth as useSupabaseAuth } from './hooks/useAuth'
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
import './styles/chatbot.css'

// Layout
import BackgroundEffects from './components/layout/BackgroundEffects'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import RSSButton from './components/shared/RSSButton'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { HomeSkeleton, ListSkeleton, DetailSkeleton, PageSkeleton } from './components/shared/Skeleton'
import Footer from './components/layout/Footer'
import Chatbot from './components/shared/Chatbot'
import PwaInstallBanner from './components/pwa/PwaInstallBanner'

// Pages — core
const HomePage = lazy(() => import('./pages/core/HomePage'))
const SearchPage = lazy(() => import('./pages/core/SearchPage'))
// Pages — content
const ArticlesPage = lazy(() => import('./pages/content/ArticlesPage'))
const ArticleDetail = lazy(() => import('./pages/content/ArticleDetail'))
const TopicPage = lazy(() => import('./pages/content/TopicPage'))
const CategoryBrowsePage = lazy(() => import('./pages/content/category-browse-page'))
const StoriesPage = lazy(() => import('./pages/content/StoriesPage'))
const KhaiTriPage = lazy(() => import('./pages/content/KhaiTriPage'))
// Pages — info
const AboutPage = lazy(() => import('./pages/info/AboutPage'))
const ContactPage = lazy(() => import('./pages/info/ContactPage'))
const PracticePage = lazy(() => import('./pages/info/PracticePage'))
const UngHoPage = lazy(() => import('./pages/info/UngHoPage'))
const NangLuongPage = lazy(() => import('./pages/info/NangLuongPage'))
const CongDongPage = lazy(() => import('./pages/info/CongDongPage'))
// Admin
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export default function App() {
  const [lang, setLang] = useState(() => {
    // Per-domain default: immortality.vn targets international audience → EN.
    // battudao.com (and any other host, incl. localhost) → VI (content is VI-first).
    const host = window.location.hostname
    const domainDefault = host.includes('immortality.vn') ? 'en' : 'vi'
    // v2 key — bumped to invalidate stale prefs from a prior build when battudao.com
    // briefly defaulted to EN. Any explicit toggle on the new build re-saves to v2.
    const stored = localStorage.getItem(`lang:v2:${host}`)
    if (stored === 'vi' || stored === 'en') return stored
    // Clear legacy keys so they don't keep overriding the domain default.
    localStorage.removeItem(`lang:${host}`)
    localStorage.removeItem('lang')
    return domainDefault
  })
  // Initial page from URL — prevents flash of 'home' before applyPath() runs on deep-link refresh.
  const [page, setPage] = useState(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '/'
    if (p.startsWith('/article/') || p.startsWith('/articles/')) return 'article'
    if (p.startsWith('/khaitri/')) return 'khaitri'
    if (p.startsWith('/story/')) return 'stories'
    if (p.startsWith('/topic/')) return 'topic'
    if (p.startsWith('/category/')) return 'category'
    if (p === '/' || !p) return 'home'
    const id = p.replace(/^\//, '').replace(/\/$/, '').split('/')[0]
    return id || 'home'
  })
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null) // slug for /category/:slug
  const [menuOpen, setMenuOpen] = useState(false)
  const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

  // Supabase auth state (only active when flag is 'supabase').
  // Hook always called (rules of hooks) — result used conditionally below.
  const supabaseAuth = useSupabaseAuth()

  const [user, setUser] = useState(null)
  const { firestoreArticles, loading: articlesLoading, fresh: articlesFresh, addArticle, updateArticle, deleteArticle } = useArticles()
  const { getT, firestoreVi, firestoreEn, updateTranslations } = useTranslations()
  const { topics: TOPICS, loading: topicsLoading, addTopic, updateTopic, deleteTopic } = useTopics()
  const { stories: firestoreStories, loading: storiesLoading, fresh: storiesFresh, addStory, updateStory, deleteStory } = useStories()
  const { khaitri, fresh: khaitriFresh, addKhaiTri, updateKhaiTri, deleteKhaiTri } = useKhaiTri()
  const { teachings, addTeaching, updateTeaching, deleteTeaching } = useTeachings()
  const { practices, addPractice, updatePractice, deletePractice } = usePractices()
  const { settings: siteSettings, loading: settingsLoading, updateSettings } = useSiteSettings()
  const { dark, toggle: toggleTheme } = useTheme(siteSettings?.defaultTheme)
  // On the Supabase path, user + role come from useSupabaseAuth; pass supabase user
  // to useUserRole so it can also resolve role (useUserRole handles both shapes).
  const activeUser = USE_SUPABASE ? supabaseAuth.user : user
  const { role: userRole } = useUserRole(activeUser)
  const homeLoading = articlesLoading || topicsLoading || storiesLoading || settingsLoading
  const { fontSize, increase: fontIncrease, decrease: fontDecrease, reset: fontReset } = useFontSize(siteSettings?.defaultFontSize)
  const t = getT(lang)
  const allArticles = firestoreArticles

  // Analytics & SEO
  usePageView(page, selectedArticle, lang)
  useSEO(page, selectedArticle, selectedTopic, lang, TOPICS)

  // Firebase auth — only active when NOT on Supabase path.
  // On Supabase path, user state comes from supabaseAuth above.
  useEffect(() => {
    if (USE_SUPABASE) return
    try { return onAuthStateChanged(auth, setUser) }
    catch { /* not configured */ }
  }, [USE_SUPABASE])

  // Match bài viết theo mọi biến thể slug/id — dùng chung cho applyPath + deep-link retry
  const findArticleBySlug = (list, slug) => list.find(a =>
    articleSlug(a) === slug ||
    String(a.id) === slug ||
    a.sourceRef === slug ||
    a.viSlug === slug ||
    a.enSlug === slug
  )

  // History API routing
  const applyPath = () => {
    const path = window.location.pathname
    if (!path || path === '/') { setPage('home'); return }

    // Special parameterized routes
    if (path.startsWith('/topic/')) { setSelectedTopic(path.slice(7)); setPage('topic'); return }
    if (path.startsWith('/category/')) { setSelectedCategory(path.slice(10)); setPage('category'); return }
    // Accept both /article/:slug (canonical) and /articles/:slug (common typo) — redirect plural to singular.
    if (path.startsWith('/articles/')) {
      const slug = path.slice(10)
      if (slug) { history.replaceState({}, '', `/article/${slug}`) }
    }
    if (path.startsWith('/article/')) {
      const found = findArticleBySlug(articlesRef.current, path.slice(9))
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

  // Stable ref to articles — popstate handler reads current value without re-binding
  // every time SWR cache → network revalidate produces a new array reference.
  const articlesRef = useRef(allArticles)
  useEffect(() => { articlesRef.current = allArticles }, [allArticles])

  const pathAppliedRef = useRef(false)
  useEffect(() => {
    const path = window.location.pathname
    const isArticlePath = path?.startsWith('/article/') || path?.startsWith('/articles/')
    if (!isArticlePath) {
      // Route thường: áp path đúng 1 lần
      if (!pathAppliedRef.current) { applyPath(); pathAppliedRef.current = true }
      return
    }
    if (selectedArticle) { pathAppliedRef.current = true; return }

    // Deep-link bài viết (Facebook/Zalo): thử match lại MỖI LẦN danh sách đổi —
    // snapshot đầu có thể rỗng/thiếu bài; KHÔNG dừng chỉ vì fresh bật.
    const slug = path.startsWith('/articles/') ? path.slice(10) : path.slice(9)
    const found = findArticleBySlug(allArticles, slug)
    if (found) {
      if (path.startsWith('/articles/')) history.replaceState({}, '', `/article/${slug}`)
      setSelectedArticle(found)
      setPage('article')
      pathAppliedRef.current = true
      return
    }
    // Data đã fresh mà vẫn không có slug (bài bị xoá/sai link/fetch lỗi trả rỗng)
    // → 404 mềm về danh sách bài viết thay vì kẹt DetailSkeleton vĩnh viễn.
    if (articlesFresh) {
      setPage('articles')
      history.replaceState({}, '', '/articles')
      pathAppliedRef.current = true
    }
  }, [allArticles, articlesFresh, selectedArticle])

  useEffect(() => {
    const onPopState = () => applyPath()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  const navigate = (p, extra) => {
    trackNavigation(page, p)
    setMenuOpen(false)
    const update = () => {
      if (p === 'topic') {
        setSelectedTopic(extra); setPage('topic')
        history.pushState({}, '', `/topic/${extra}`)
      } else if (p === 'category') {
        setSelectedCategory(extra); setPage('category')
        history.pushState({}, '', `/category/${extra}`)
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

  // Strip /ungho from nav when admin has the page hidden (master toggle off).
  const navItems = (siteSettings.navItems || []).filter(
    item => item.id !== 'ungho' || siteSettings.unghoEnabled
  )

  return (
    <>
      <BackgroundEffects />
      <div className="app-wrap">
        <Header
          t={t} lang={lang} dark={dark} page={page} menuOpen={menuOpen}
          navigate={navigate}
          toggleTheme={() => { toggleTheme(); trackThemeToggle(dark ? 'light' : 'dark') }}
          setLang={(l) => { setLang(l); localStorage.setItem(`lang:v2:${window.location.hostname}`, l); trackLanguageChange(l) }}
          setMenuOpen={setMenuOpen}
          user={user} navItems={navItems}
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
          {page === 'category' && (
            <CategoryBrowsePage t={t} lang={lang} slug={selectedCategory} navigate={navigate} articles={allArticles} />
          )}
          {page === 'article' && selectedArticle && (
            <ArticleDetail
              t={t} lang={lang} article={selectedArticle} navigate={navigate}
              articles={allArticles} topics={TOPICS}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={activeUser} onUpdateArticle={updateArticle}
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
            <StoriesPage t={t} lang={lang} firestoreStories={firestoreStories} fresh={storiesFresh} navigate={navigate}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={activeUser} onUpdateStory={updateStory}
            />
          )}
          {page === 'practice' && (
            <PracticePage t={t} lang={lang} practices={practices} />
          )}
          {page === 'khaitri' && (
            <KhaiTriPage t={t} lang={lang} items={activeUser ? khaitri : khaitri.filter(k => k.status !== 'draft')} fresh={khaitriFresh} navigate={navigate}
              fontSize={fontSize} onFontIncrease={fontIncrease} onFontDecrease={fontDecrease} onFontReset={fontReset}
              user={activeUser} onUpdateKhaiTri={updateKhaiTri}
            />
          )}
          {page === 'contact' && (
            <ContactPage t={t} />
          )}
          {page === 'nang-luong' && (
            <NangLuongPage lang={lang} />
          )}
          {page === 'ungho' && siteSettings.unghoEnabled && (
            <UngHoPage t={t} lang={lang} channels={siteSettings.donationChannels} />
          )}
          {page === 'ungho' && !siteSettings.unghoEnabled && (
            <p style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              {lang === 'vi' ? 'Trang đang chuẩn bị, vui lòng quay lại sau.' : 'Page coming soon. Please check back later.'}
            </p>
          )}
          {page === 'cong-dong' && (
            <CongDongPage lang={lang} navigate={navigate} />
          )}
          {page === 'admin' && (
            <AdminPanel
              t={t} lang={lang} user={activeUser} userRole={userRole}
              supabaseSignIn={USE_SUPABASE ? supabaseAuth.signIn : null}
              supabaseSignOut={USE_SUPABASE ? supabaseAuth.signOut : null}
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

        <Footer t={t} lang={lang} articles={allArticles} navigate={navigate} siteSettings={siteSettings} />

        <BottomNav t={t} lang={lang} page={page} navigate={navigate} navItems={navItems} />
        <Chatbot lang={lang} userId={activeUser?.uid ?? activeUser?.id} />
        <PwaInstallBanner lang={lang} />
      </div>
    </>
  )
}
