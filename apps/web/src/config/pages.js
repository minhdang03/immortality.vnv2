/**
 * Single source of truth for all page configuration.
 * Adding a new page? Just add one entry to PAGES below.
 */

const PAGES = [
  {
    id: 'home',
    path: '',
    labelVi: 'Trang Chủ', labelEn: 'Home',
    icon: '🏠',
    navDefault: { visible: true, showInBottom: true },
  },
  {
    id: 'articles',
    path: 'articles',
    labelVi: 'Bài Viết', labelEn: 'Articles',
    titleVi: 'Bài Viết', titleEn: 'Articles',
    descVi: 'Tất cả bài viết về tâm linh, sức khỏe và bất tử.', descEn: 'All articles on spirituality, health and immortality.',
    icon: '📝',
    navDefault: { visible: false, showInBottom: false },
    adminTab: { vi: 'Bài viết', en: 'Articles' },
  },
  {
    id: 'stories',
    path: 'stories',
    aliases: ['story/', '37-cau-chuyen'],
    labelVi: '37 Chuyện', labelEn: 'Stories',
    titleVi: '37 Câu Chuyện', titleEn: '37 Stories',
    descVi: 'Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.', descEn: 'True stories of healing and spiritual awakening.',
    icon: '📖',
    navDefault: { visible: true, showInBottom: true },
    adminTab: { vi: 'Câu chuyện', en: 'Stories' },
    homeCard: { icon: 'book', descVi: 'Hành trình tu luyện siêu trí tuệ qua những câu chuyện có thật', descEn: 'The journey of super-intelligence cultivation through true stories' },
  },
  {
    id: 'khaitri',
    path: 'khaitri',
    aliases: ['khaitri/'],
    redirectFrom: ['revelations'],
    labelVi: 'Khai Trí', labelEn: 'Khai Trí',
    titleVi: 'Khai Trí', titleEn: 'Khai Trí',
    descVi: 'Hỏi đáp trí tuệ — giải đáp những câu hỏi về tâm linh, sức khỏe và bất tử.', descEn: 'Q&A wisdom — answers on spirituality, health, and immortality.',
    icon: '💡',
    navDefault: { visible: true, showInBottom: true },
    adminTab: { vi: 'Khai Trí', en: 'Khai Trí' },
    homeCard: { icon: 'layers', descVi: 'Hỏi đáp với Người Bất Tử về chân lý cuộc sống', descEn: 'Q&A with the Immortal about life truths' },
  },
  {
    id: 'about',
    path: 'about',
    labelVi: 'Giới Thiệu', labelEn: 'About',
    titleVi: 'Giới Thiệu', titleEn: 'About',
    descVi: 'Tìm hiểu về Bất Tử Đạo và phương pháp năng lượng Mặt Trời.', descEn: 'Learn about the Path of Immortality and the Solar Energy method.',
    icon: 'ℹ️',
    navDefault: { visible: true, showInBottom: false },
    homeCard: { icon: 'info', descVi: 'Lý thuyết nền tảng về siêu trí tuệ và con đường bất tử', descEn: 'Foundational theory of super-intelligence and the path to immortality' },
  },
  {
    id: 'practice',
    path: 'practice',
    labelVi: 'Thái Dương Quyền', labelEn: 'Solar Fist',
    titleVi: 'Thái Dương Quyền', titleEn: 'Solar Fist',
    descVi: 'Học Thái Dương Quyền — bài tập năng lượng mặt trời cho sức khỏe và trí tuệ.', descEn: 'Learn Solar Fist — sun energy exercises for health and wisdom.',
    icon: '☀️',
    navDefault: { visible: true, showInBottom: true },
    adminTab: { vi: 'Thái Dương Quyền', en: 'Solar Fist' },
    homeCard: { icon: 'sun', descVi: '10 chiêu thức luyện năng lượng mặt trời', descEn: '10 movements of solar energy cultivation' },
  },
  {
    id: 'nang-luong',
    path: 'nang-luong',
    aliases: ['hap-thu-nang-luong'],
    labelVi: 'Năng Lượng', labelEn: 'Energy',
    titleVi: 'Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân', titleEn: 'Absorbing Energy — Nourishing the Whole Body',
    descVi: 'Đồ hình tương tác: hấp thu năng lượng trực tiếp vào trung tâm não và các tuyến — không dùng luân xa — cho chạy xuống lòng đất, ra ngoài cơ thể.',
    descEn: 'Interactive diagram: absorbing energy directly into the brain center and glands — no chakras — flowing into the earth and released outside the body.',
    icon: '✨',
    navDefault: { visible: true, showInBottom: false },
    homeCard: { icon: 'sun', descVi: 'Đồ hình tương tác: dòng chảy năng lượng nuôi dưỡng toàn thân', descEn: 'Interactive map of the energy flow nourishing the whole body' },
  },
  {
    id: 'contact',
    path: 'contact',
    labelVi: 'Liên Hệ', labelEn: 'Contact',
    titleVi: 'Liên Hệ', titleEn: 'Contact',
    descVi: 'Liên hệ với chúng tôi để được hỗ trợ và tư vấn.', descEn: 'Contact us for support and guidance.',
    icon: '✉️',
    navDefault: { visible: true, showInBottom: true },
  },
  {
    id: 'cong-dong',
    path: 'cong-dong',
    labelVi: 'Cộng Đồng', labelEn: 'Community',
    titleVi: 'Cộng Đồng Bất Tử Đạo', titleEn: 'Bất Tử Đạo Community',
    descVi: 'Sắp ra mắt — App iOS & Android, đọc offline, thông báo bài mới, thảo luận với cộng đồng.',
    descEn: 'Coming soon — iOS & Android app, offline reading, notifications, community discussions.',
    icon: '✦',
    navDefault: { visible: false, showInBottom: false }, // hidden from default nav until launch; admin can toggle on
  },
  {
    id: 'ungho',
    path: 'ungho',
    labelVi: 'Ủng Hộ', labelEn: 'Support',
    titleVi: 'Ủng Hộ Người Bất Tử', titleEn: 'Support The Immortal',
    descVi: 'Đồng hành cùng Huỳnh Phú Sang trên hành trình khai mở Bất Tử Đạo.',
    descEn: 'Accompany Huỳnh Phú Sang on the path of awakening Immortality.',
    icon: '🤝',
    // No navDefault → hidden from header menu, bottom nav. No homeCard → hidden from home.
    // Only direct link access at /ungho.
    adminTab: { vi: 'Ủng Hộ', en: 'Donations' },
  },
  {
    id: 'search',
    path: 'search',
    labelVi: 'Tìm Kiếm', labelEn: 'Search',
    titleVi: 'Tìm Kiếm', titleEn: 'Search',
    descVi: 'Tìm kiếm bài viết, câu chuyện và nội dung trên Bất Tử Đạo.', descEn: 'Search articles, stories and content on Immortality.',
    icon: '🔍',
  },
  {
    id: 'category',
    path: 'category',
    labelVi: 'Danh Mục', labelEn: 'Categories',
    titleVi: 'Danh Mục', titleEn: 'Categories',
    descVi: 'Duyệt nội dung theo danh mục.', descEn: 'Browse content by category.',
    icon: '📂',
    navDefault: { visible: false, showInBottom: false },
  },
  {
    id: 'admin',
    path: 'admin',
    labelVi: 'Quản Trị', labelEn: 'Admin',
    titleVi: 'Quản Trị', titleEn: 'Admin',
    descVi: 'Trang quản trị nội dung Bất Tử Đạo.', descEn: 'Immortality content management panel.',
    icon: '⚙️',
  },
]

export default PAGES

// Lookup map
export const PAGE_MAP = Object.fromEntries(PAGES.map(p => [p.id, p]))

// For nav settings dropdowns (all pages that can appear in nav)
export const ALL_NAV_PAGES = PAGES
  .filter(p => p.navDefault || p.id === 'search' || p.id === 'articles')
  .map(p => ({ id: p.id, labelVi: p.labelVi, labelEn: p.labelEn }))

// Emoji icons for admin settings UI
export const NAV_ICONS = Object.fromEntries(
  PAGES.filter(p => p.icon).map(p => [p.id, p.icon])
)

// Default nav items (Firestore fallback)
export const DEFAULT_NAV_ITEMS = PAGES
  .filter(p => p.navDefault)
  .map(p => ({ id: p.id, labelVi: p.labelVi, labelEn: p.labelEn, ...p.navDefault }))

// Default home cards
export const DEFAULT_HOME_CARDS = PAGES
  .filter(p => p.homeCard)
  .map(p => ({
    id: p.id, icon: p.homeCard.icon,
    labelVi: p.titleVi || p.labelVi, labelEn: p.titleEn || p.labelEn,
    descVi: p.homeCard.descVi, descEn: p.homeCard.descEn, visible: true,
  }))

// SEO titles & descriptions (for App.jsx)
export const PAGE_TITLES = Object.fromEntries(
  PAGES.filter(p => p.titleVi).map(p => [p.id, { vi: p.titleVi, en: p.titleEn }])
)
export const PAGE_DESCRIPTIONS = Object.fromEntries(
  PAGES.filter(p => p.descVi).map(p => [p.id, { vi: p.descVi, en: p.descEn }])
)

// For HomeSettingsTab page picker
export const PAGE_OPTIONS = ALL_NAV_PAGES.map(p => ({ id: p.id, vi: p.labelVi, en: p.labelEn }))

// Admin panel tabs: content tabs from PAGES + non-page tabs
export const ADMIN_TABS = [
  ...PAGES.filter(p => p.adminTab).map(p => ({
    id: p.id, icon: p.icon, vi: p.adminTab.vi, en: p.adminTab.en,
  })),
  { id: 'teachings', icon: 'ℹ️', vi: 'Giới Thiệu', en: 'Teachings' },
  { id: 'topics', icon: '🏷️', vi: 'Chủ đề', en: 'Topics' },
  { id: 'categories', icon: '📂', vi: 'Danh mục', en: 'Categories' },
  { id: 'analytics', icon: '📊', vi: 'Phân tích nội dung', en: 'Content Analytics' },
  { id: 'translations', icon: '🌐', vi: 'Ngôn ngữ', en: 'Translations' },
  { id: 'homepage', icon: '🏠', vi: 'Trang chủ', en: 'Home Page' },
  { id: 'settings', icon: '⚙️', vi: 'Cài đặt', en: 'Settings' },
  { id: 'contacts', icon: '✉️', vi: 'Liên hệ', en: 'Contacts' },
  { id: 'admins', icon: '👤', vi: 'Quản trị viên', en: 'Admins' },
  { id: 'agentlog', icon: '📋', vi: 'Nhật ký Agent', en: 'Agent Log' },
]

// Routing: match pathname to page id
export function matchRoute(pathname) {
  const clean = pathname.replace(/^\//, '')
  if (!clean) return { id: 'home' }

  // Parameterised routes: /category/:slug
  if (clean.startsWith('category/')) {
    const slug = clean.slice('category/'.length)
    if (slug) return { id: 'category', params: { slug } }
  }

  for (const p of PAGES) {
    if (!p.path) continue
    if (clean === p.path) return { id: p.id }
    if (p.aliases?.some(a => a.endsWith('/') ? clean.startsWith(a) : clean === a)) {
      return { id: p.id }
    }
    if (p.redirectFrom?.includes(clean)) {
      return { id: p.id, redirect: `/${p.path}` }
    }
  }
  return null
}
