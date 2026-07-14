// OG locale packs per domain — battudao.com (vi) vs immortality.vn (en).
// Keep brand strings in sync with apps/web/src/hooks/useSEO.js OG_DEFAULTS.

const LOCALES = {
  vi: {
    lang: 'vi',
    site: 'https://battudao.com',
    siteName: 'Bất Tử Đạo - Immortality',
    // Full brand title — homepage/fallback only; per-page titles keep the short "| siteName" suffix
    fullTitle: 'Bất Tử Đạo, Lạc Việt Quốc, Trí Tuệ Người Việt Nam, Khoa Học Y Vũ Trụ',
    desc: 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.',
    ogLocale: 'vi_VN',
    ogLocaleAlt: 'en_US',
    readMore: 'Đọc tiếp tại',
  },
  en: {
    lang: 'en',
    site: 'https://immortality.vn',
    siteName: 'Immortality',
    fullTitle: 'Immortality — Lạc Việt Nation, Vietnamese Wisdom, Cosmic Medical Science',
    desc: 'Discover the light within you — a healing journey from ancient Vietnamese wisdom. Solar energy, meditation, and cosmic intelligence.',
    ogLocale: 'en_US',
    ogLocaleAlt: 'vi_VN',
    readMore: 'Read more at',
  },
}

// Static page OG copy per language. "| siteName" suffix is appended at render time.
const PAGE_OG = {
  stories: {
    vi: { title: '37 Câu Chuyện', desc: 'Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.' },
    en: { title: '37 Stories', desc: 'True stories of healing journeys and spiritual awakening.' },
  },
  khaitri: {
    vi: { title: 'Khai Trí', desc: 'Hỏi đáp trí tuệ — giải đáp những câu hỏi về tâm linh, sức khỏe và bất tử.' },
    en: { title: 'Khai Trí — Enlightenment Q&A', desc: 'Wisdom Q&A — answers on spirituality, health and immortality.' },
  },
  about: {
    vi: { title: 'Giới Thiệu', desc: 'Tìm hiểu về Bất Tử Đạo và phương pháp năng lượng Mặt Trời.' },
    en: { title: 'About', desc: 'Learn about the Immortality Dao and the solar energy method.' },
  },
  practice: {
    vi: { title: 'Thái Dương Quyền', desc: 'Học Thái Dương Quyền — bài tập năng lượng mặt trời cho sức khỏe và trí tuệ.' },
    en: { title: 'Thái Dương Quyền — Solar Practice', desc: 'Learn Thái Dương Quyền — solar energy exercises for health and wisdom.' },
  },
  articles: {
    vi: { title: 'Bài Viết', desc: 'Tất cả bài viết về tâm linh, sức khỏe và bất tử.' },
    en: { title: 'Articles', desc: 'All articles on spirituality, health and immortality.' },
  },
  contact: {
    vi: { title: 'Liên Hệ', desc: 'Liên hệ với chúng tôi để được hỗ trợ và tư vấn.' },
    en: { title: 'Contact', desc: 'Get in touch with us for support and guidance.' },
  },
  'nang-luong': {
    vi: { title: 'Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân', desc: 'Đồ hình tương tác: hấp thu năng lượng trực tiếp vào trung tâm não và các tuyến — không dùng luân xa — cho chạy xuống lòng đất, ra ngoài cơ thể.' },
    en: { title: 'Energy Absorption — Whole-Body Nourishment', desc: 'Interactive map: absorb energy directly into the brain centers and glands — no chakras — flowing down into the earth and out of the body.' },
  },
  search: {
    vi: { title: 'Tìm Kiếm', desc: 'Tìm kiếm bài viết, câu chuyện và nội dung trên Bất Tử Đạo.' },
    en: { title: 'Search', desc: 'Search articles, stories and content on Immortality.' },
  },
}

module.exports = { LOCALES, PAGE_OG }
