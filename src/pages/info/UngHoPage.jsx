import { useDonations } from '../../hooks/useDonations'
import DonationChannels from '../../components/ungho/DonationChannels'
import DonationForm from '../../components/ungho/DonationForm'
import DonorWall from '../../components/ungho/DonorWall'
import '../../styles/pages/ungho.css'

function splitItems(raw) {
  return (raw || '').split('|').map(s => s.trim()).filter(Boolean)
}

export default function UngHoPage({ t, lang, channels }) {
  const { donations } = useDonations(50)

  return (
    <section className="ungho-page">
      <header className="ungho-header">
        <h1 className="ungho-title">{t.unghoTitle}</h1>
        <p className="ungho-subtitle">{t.unghoSubtitle}</p>
      </header>

      <section className="ungho-section">
        <h2 className="ungho-section-title">{t.unghoWhyTitle}</h2>
        {t.unghoWhyBody.split('\n\n').map((p, i) => (
          <p key={i} className="ungho-paragraph">{p}</p>
        ))}
      </section>

      <section className="ungho-section">
        <h2 className="ungho-section-title">{t.unghoUsageTitle}</h2>
        <div className="ungho-usage-grid">
          <div>
            <h3 className="ungho-usage-heading">{t.unghoUsageNow}</h3>
            <ul className="ungho-list">
              {splitItems(t.unghoUsageNowItems).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="ungho-usage-heading">{t.unghoUsageFuture}</h3>
            <ul className="ungho-list">
              {splitItems(t.unghoUsageFutureItems).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ungho-section">
        <h2 className="ungho-section-title">{t.unghoChannelsTitle}</h2>
        <DonationChannels t={t} channels={channels} />
      </section>

      <section className="ungho-section">
        <h2 className="ungho-section-title">{t.unghoFormTitle}</h2>
        <DonationForm t={t} />
      </section>

      <section className="ungho-section">
        <h2 className="ungho-section-title">{t.unghoWallTitle}</h2>
        <DonorWall t={t} lang={lang} donations={donations} />
      </section>

      <blockquote className="ungho-message">
        <h3 className="ungho-message-title">{t.unghoMessageTitle}</h3>
        <p className="ungho-message-body">"{t.unghoMessageBody}"</p>
      </blockquote>
    </section>
  )
}
