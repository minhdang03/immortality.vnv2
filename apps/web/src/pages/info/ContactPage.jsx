import { useState } from 'react'
import { supabase } from '../../lib/supabase-client'
import SunIcon from '../../components/shared/SunIcon'
import PageHero from '../../components/shared/PageHero'

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
    // Basic client-side validation before the anon insert.
    if (name.length < 2 || message.length < 5) { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); return }
    setStatus('sending')
    if (!supabase) { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); return }
    // Plain insert (contacts are admin-only read).
    const { error } = await supabase.from('contacts').insert({
      name: name.slice(0, 100),
      email: email.slice(0, 200),
      message: message.slice(0, 4000),
    })
    if (error) {
      console.error('contact submit failed', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
      return
    }
    setForm({ name: '', email: '', message: '' })
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <section className="section">
      <PageHero icon={<SunIcon size={40} />} title={t.contactTitle} />
      {/* Always-rendered live region so screen readers announce sent/error status changes */}
      <div aria-live="polite" role="status">
        {status === 'sent' && <div className="contact-thanks fade-up">{t.contactThanks}</div>}
        {status === 'error' && <div className="contact-thanks fade-up" style={{ color: '#c0392b' }}>{t.contactError}</div>}
      </div>
      <form className="contact-form fade-up fade-up-d1" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="contact-name">{t.contactName}</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" placeholder={t.contactName} required maxLength={100} value={form.name} onChange={set('name')} />
        <label className="sr-only" htmlFor="contact-email">{t.contactEmail}</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" placeholder={t.contactEmail} required maxLength={200} value={form.email} onChange={set('email')} />
        <label className="sr-only" htmlFor="contact-message">{t.contactMsg}</label>
        <textarea id="contact-message" name="message" placeholder={t.contactMsg} required maxLength={4000} value={form.message} onChange={set('message')} />
        <button type="submit" className="submit-btn" disabled={status === 'sending'}>
          {status === 'sending' ? '...' : t.contactSend}
        </button>
      </form>
    </section>
  )
}
