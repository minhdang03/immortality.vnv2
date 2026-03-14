import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTheme } from './hooks/useTheme'
import { useArticles, useTranslations, useTopics, useStories, useKhaiTri, useTeachings, usePractices, useSiteSettings } from './hooks/useFirestore'
import { useFontSize } from './hooks/useFontSize'
import { articleSlug } from './utils/slug'
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
const StoriesPage = lazy(() => import('./pages/StoriesPage'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const KhaiTriPage = lazy(() => import('./pages/KhaiTriPage'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export default function App() {
  const [lang, setLang] = useState('vi')
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
    if (hash === '/stories' || hash.startsWith('/story/')) { setPage('stories'); return }
    if (hash === '/practice') { setPage('practice'); return }
    if (hash === '/khaitri' || hash.startsWith('/khaitri/') || hash === '/revelations') { setPage('khaitri'); if (hash === '/revelations') window.location.hash = '/khaitri'; return }
    if (hash === '/admin') { setPage('admin'); return }
  }

  const hashAppliedRef = useRef(false)
  useEffect(() => {
    if (hashAppliedRef.current) return
    const hash = window.location.hash.slice(1)
    // Article routes need articles data — wait until loaded
    if (hash?.startsWith('/article/') && allArticles.length === 0) return
    applyHash()
    hashAppliedRef.current = true
  }, [allArticles.length])

  useEffect(() => {
    const onHashChange = () => applyHash()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  // SEO - page titles
  const PAGE_TITLES = {
    stories: { vi: '37 Câu Chuyện', en: '37 Stories' },
    khaitri: { vi: 'Khai Trí', en: 'Khai Trí' },
    about: { vi: 'Giới Thiệu', en: 'About' },
    practice: { vi: 'Thái Dương Quyền', en: 'Solar Fist' },
    contact: { vi: 'Liên Hệ', en: 'Contact' },
    search: { vi: 'Tìm Kiếm', en: 'Search' },
    admin: { vi: 'Quản Trị', en: 'Admin' },
  }
  const setMeta = (title, description) => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
  }

  const PAGE_DESCRIPTIONS = {
    stories: { vi: 'Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.', en: 'True stories of healing and spiritual awakening.' },
    khaitri: { vi: 'Hỏi đáp trí tuệ — giải đáp những câu hỏi về tâm linh, sức khỏe và bất tử.', en: 'Q&A wisdom — answers on spirituality, health, and immortality.' },
    about: { vi: 'Tìm hiểu về Bất Tử Đạo và phương pháp năng lượng Mặt Trời.', en: 'Learn about the Path of Immortality and the Solar Energy method.' },
    practice: { vi: 'Học Thái Dương Quyền — bài tập năng lượng mặt trời cho sức khỏe và trí tuệ.', en: 'Learn Solar Fist — sun energy exercises for health and wisdom.' },
    contact: { vi: 'Liên hệ với chúng tôi để được hỗ trợ và tư vấn.', en: 'Contact us for support and guidance.' },
    search: { vi: 'Tìm kiếm bài viết, câu chuyện và nội dung trên Bất Tử Đạo.', en: 'Search articles, stories and content on Immortality.' },
    admin: { vi: 'Trang quản trị nội dung Bất Tử Đạo.', en: 'Immortality content management panel.' },
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
