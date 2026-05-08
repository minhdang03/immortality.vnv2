import { useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore'

const COPY = {
  vi: {
    eyebrow: '— Bản tin tuần',
    title: 'Nhận trí tuệ',
    titleEm: 'mỗi sáng Chủ Nhật',
    body: 'Một bài viết chọn lọc, một câu hỏi Khai Trí, một câu chuyện thật — gửi vào hộp thư của bạn mỗi tuần. Không spam, hủy bất kỳ lúc nào.',
    placeholder: 'email@cua-ban.com',
    submit: 'Đăng ký',
    submitting: 'Đang gửi...',
    success: 'Cảm ơn anh/chị! Em sẽ gửi bản tin Chủ Nhật tới.',
    duplicate: 'Email này đã đăng ký rồi.',
    error: 'Có lỗi. Anh/chị thử lại nhé.',
  },
  en: {
    eyebrow: '— Weekly digest',
    title: 'Wisdom every',
    titleEm: 'Sunday morning',
    body: 'One curated article, one Khai Trí question, one real story — delivered to your inbox weekly. No spam, unsubscribe anytime.',
    placeholder: 'your@email.com',
    submit: 'Subscribe',
    submitting: 'Sending...',
    success: 'Thank you! Newsletter coming this Sunday.',
    duplicate: 'This email is already subscribed.',
    error: 'Something went wrong. Please try again.',
  },
}

export default function NewsletterBand({ lang = 'vi', source = 'home' }) {
  const t = COPY[lang] || COPY.vi
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | dup | error

  async function submit(e) {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!clean || !/^\S+@\S+\.\S+$/.test(clean)) return
    setState('sending')
    try {
      const dup = await getDocs(query(collection(db, 'newsletter_signups'), where('email', '==', clean), limit(1)))
      if (!dup.empty) { setState('dup'); return }
      await addDoc(collection(db, 'newsletter_signups'), {
        email: clean,
        timestamp: serverTimestamp(),
        source, lang,
        status: 'pending',
      })
      setState('done')
      setEmail('')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="newsletter-band">
      <div className="newsletter-band-inner">
        <div className="newsletter-text">
          <div className="newsletter-eyebrow">{t.eyebrow}</div>
          <h2>{t.title} <em>{t.titleEm}</em></h2>
          <p>{t.body}</p>
        </div>
        <form className="newsletter-form" onSubmit={submit}>
          <input
            type="email"
            required
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'sending' || state === 'done'}
            aria-label={t.placeholder}
          />
          <button type="submit" disabled={state === 'sending' || state === 'done'}>
            {state === 'sending' ? t.submitting : t.submit}
          </button>
          {state === 'done' && <div className="newsletter-msg success">{t.success}</div>}
          {state === 'dup' && <div className="newsletter-msg warn">{t.duplicate}</div>}
          {state === 'error' && <div className="newsletter-msg error">{t.error}</div>}
        </form>
      </div>
    </section>
  )
}
