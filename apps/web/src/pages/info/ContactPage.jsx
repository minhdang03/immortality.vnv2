import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import SunIcon from '../../components/shared/SunIcon'

export default function ContactPage({ t }) {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const name = form.name.trim()
    const email = form.email.trim()
    const message = form.message.trim()
    // Match server-side regex from firestore.rules
    if (name.length < 2 || message.length < 5) { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); return }
    setStatus('sending')
    try {
      await addDoc(collection(db, 'contacts'), {
        name: name.slice(0, 100),
        email: email.slice(0, 200),
        message: message.slice(0, 4000),
        status: 'new',
        createdAt: serverTimestamp(),
      })
      setForm({ name: '', email: '', message: '' })
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      console.error('contact submit failed', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title fade-up"><SunIcon size={20} /> {t.contactTitle}</h2>
      {status === 'sent' && <div className="contact-thanks fade-up">{t.contactThanks}</div>}
      {status === 'error' && <div className="contact-thanks fade-up" style={{ color: '#c0392b' }}>Tin nhắn không hợp lệ — kiểm tra lại email và nội dung.</div>}
      <form className="contact-form fade-up fade-up-d1" onSubmit={handleSubmit}>
        <input type="text" placeholder={t.contactName} required maxLength={100} value={form.name} onChange={set('name')} />
        <input type="email" placeholder={t.contactEmail} required maxLength={200} value={form.email} onChange={set('email')} />
        <textarea placeholder={t.contactMsg} required maxLength={4000} value={form.message} onChange={set('message')} />
        <button type="submit" className="submit-btn" disabled={status === 'sending'}>
          {status === 'sending' ? '...' : t.contactSend}
        </button>
      </form>
    </section>
  )
}
