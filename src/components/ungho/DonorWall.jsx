function formatAmount(n, lang) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return ''
  return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(n) + ' ₫'
}

function formatDate(ts, lang) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function DonorWall({ t, lang, donations }) {
  if (!donations.length) {
    return <p className="ungho-empty">{t.unghoWallEmpty}</p>
  }

  return (
    <ul className="ungho-wall">
      {donations.map(d => {
        const name = d.isAnonymous || !d.displayName ? t.unghoWallAnonymous : d.displayName
        return (
          <li key={d.id} className="ungho-wall-item">
            <div className="ungho-wall-row">
              <span className="ungho-wall-name">{name}</span>
              <span className="ungho-wall-amount">{formatAmount(d.amount, lang)}</span>
            </div>
            {d.message && <p className="ungho-wall-message">"{d.message}"</p>}
            <span className="ungho-wall-date">{formatDate(d.approvedAt || d.createdAt, lang)}</span>
          </li>
        )
      })}
    </ul>
  )
}
