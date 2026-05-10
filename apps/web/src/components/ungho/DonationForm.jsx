import { useState } from 'react'
import { submitDonation } from '../../hooks/useDonations'

const INITIAL = {
  name: '', isAnonymous: false, amount: '', message: '', email: '', phone: '',
}

export default function DonationForm({ t }) {
  const [form, setForm] = useState(INITIAL)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await submitDonation({
        name: form.name,
        isAnonymous: form.isAnonymous,
        amount: Number(form.amount),
        message: form.message,
        email: form.email,
        phone: form.phone,
      })
      setDone(true)
      setForm(INITIAL)
    } catch (err) {
      console.error(err)
      setError(t.unghoFormError)
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="ungho-form-thanks">
        <p>{t.unghoFormThanks}</p>
        <button type="button" className="cta-btn-outline" onClick={() => setDone(false)}>
          {t.unghoFormSubmit} ↻
        </button>
      </div>
    )
  }

  return (
    <form className="ungho-form" onSubmit={onSubmit}>
      <p className="ungho-form-hint">{t.unghoFormHint}</p>

      <label className="ungho-field">
        <span>{t.unghoFormName} <em>*</em></span>
        <input
          type="text" required maxLength={80}
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </label>

      <label className="ungho-field-checkbox">
        <input
          type="checkbox"
          checked={form.isAnonymous}
          onChange={e => set('isAnonymous', e.target.checked)}
        />
        <span>{t.unghoFormAnonymous}</span>
      </label>

      <label className="ungho-field">
        <span>{t.unghoFormAmount} <em>*</em></span>
        <input
          type="number" required min={1} step={1000}
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
        />
      </label>

      <label className="ungho-field">
        <span>{t.unghoFormMessage}</span>
        <textarea
          rows={3} maxLength={500}
          value={form.message}
          onChange={e => set('message', e.target.value)}
        />
      </label>

      <div className="ungho-field-row">
        <label className="ungho-field">
          <span>{t.unghoFormEmail}</span>
          <input
            type="email" maxLength={120}
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
        </label>
        <label className="ungho-field">
          <span>{t.unghoFormPhone}</span>
          <input
            type="tel" maxLength={30}
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </label>
      </div>

      {error && <p className="ungho-form-error">{error}</p>}

      <button type="submit" className="cta-btn-outline" disabled={sending}>
        {sending ? t.unghoFormSending : t.unghoFormSubmit}
      </button>
    </form>
  )
}
