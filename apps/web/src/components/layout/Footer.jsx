import RSSButton from '../shared/RSSButton'

/**
 * Editorial Sacred — 5-col footer with brand + links + social.
 * Mounts once at App level under <main>.
 */
const DEFAULT_TAGLINE_VI = 'Loài người Kim Cương — Bình đẳng, Tự do, Hạnh phúc. Thiên đường tại thế.'
const DEFAULT_TAGLINE_EN = 'Diamond Humanity — Equality, Freedom, Happiness. Heaven on Earth.'

export default function Footer({ t, lang, articles, navigate, siteSettings = {} }) {
  const taglineVi = siteSettings.footerTaglineVi || DEFAULT_TAGLINE_VI
  const taglineEn = siteSettings.footerTaglineEn || DEFAULT_TAGLINE_EN
  const exploreLinks = [
    { id: 'articles', vi: 'Bài viết', en: 'Articles' },
    { id: 'khaitri', vi: 'Khai Trí', en: 'Khai Trí' },
    { id: 'stories', vi: 'Câu chuyện', en: 'Stories' },
    { id: 'practice', vi: 'Thái Dương Quyền', en: 'Sun Practice' },
  ]
  const communityLinks = [
    { id: 'cong-dong', vi: 'Cộng đồng', en: 'Community', soon: true },
    { vi: 'iOS app', en: 'iOS app', soon: true, href: '#' },
    { vi: 'Android app', en: 'Android app', soon: true, href: '#' },
  ]
  const aboutLinks = [
    { id: 'about', vi: 'Giới thiệu', en: 'About' },
    { id: 'contact', vi: 'Liên hệ', en: 'Contact' },
    ...(siteSettings.unghoEnabled ? [{ id: 'ungho', vi: 'Ủng hộ', en: 'Support' }] : []),
    // Trang pháp lý phải với tới được từ UI, không chỉ qua URL trực tiếp
    // (App Store Connect trỏ về /privacy — reviewer có thể bấm quanh site).
    { id: 'privacy', vi: 'Quyền riêng tư', en: 'Privacy' },
    { id: 'terms', vi: 'Điều khoản', en: 'Terms' },
    // Admin dời từ header xuống đây (audit: icon admin public gây nhiễu)
    { id: 'admin', vi: 'Quản trị', en: 'Admin' },
  ]

  const go = (id) => (e) => { e.preventDefault(); navigate(id) }

  return (
    <footer className="footer-editorial">
      <div className="footer-inner">
        <div className="footer-cols">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-mark">✦</span>
              <span>{t.siteName || 'Bất Tử Đạo'}</span>
            </div>
            <p>"{lang === 'vi' ? taglineVi : taglineEn}"</p>
          </div>

          <div>
            <h4>{lang === 'vi' ? 'Khám phá' : 'Explore'}</h4>
            <ul>
              {exploreLinks.map(l => (
                <li key={l.id}>
                  <a href={`/${l.id}`} onClick={go(l.id)}>{lang === 'vi' ? l.vi : l.en}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{lang === 'vi' ? 'Cộng đồng' : 'Community'}</h4>
            <ul>
              {communityLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href || `/${l.id}`} onClick={l.id ? go(l.id) : undefined}>
                    {lang === 'vi' ? l.vi : l.en}
                    {l.soon && <span className="footer-soon">Soon</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{lang === 'vi' ? 'Về' : 'About'}</h4>
            <ul>
              {aboutLinks.map(l => (
                <li key={l.id}>
                  <a href={`/${l.id}`} onClick={go(l.id)}>{lang === 'vi' ? l.vi : l.en}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{lang === 'vi' ? 'Theo dõi' : 'Follow'}</h4>
            <ul>
              <li><a href="https://www.facebook.com/battudao" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://t.me/battudao" target="_blank" rel="noreferrer">Telegram</a></li>
              <li><a href="https://youtube.com/@battudao" target="_blank" rel="noreferrer">YouTube</a></li>
              <li><RSSButton articles={articles} lang={lang} /></li>
            </ul>
          </div>
        </div>

        <div className="footer-copy">
          <span>© {new Date().getFullYear()} Bất Tử Đạo · battudao.com</span>
          <span>{lang === 'vi' ? 'Tiếng Việt · English' : 'Vietnamese · English'}</span>
        </div>
      </div>
    </footer>
  )
}
