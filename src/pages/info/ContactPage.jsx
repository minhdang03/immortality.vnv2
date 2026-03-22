import { useState } from 'react'
import SunIcon from '../../components/shared/SunIcon'

export default function ContactPage({ t }) {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section className="section">
      <h2 className="section-title fade-up"><SunIcon size={20} /> {t.contactTitle}</h2>
      {sent && <div className="contact-thanks fade-up">{t.contactThanks}</div>}
      <form className="contact-form fade-up fade-up-d1" onSubmit={handleSubmit}>
        <input type="text" placeholder={t.contactName} required />
        <input type="email" placeholder={t.contactEmail} required />
        <textarea placeholder={t.contactMsg} required />
        <button type="submit" className="submit-btn">{t.contactSend}</button>
      </form>
    </section>
  )
}
