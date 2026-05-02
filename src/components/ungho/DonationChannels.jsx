import { useState } from 'react'

function CopyButton({ value, t }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard may be unavailable */ }
  }
  return (
    <button type="button" className="ungho-copy-btn" onClick={onCopy}>
      {copied ? t.unghoChannelCopied : t.unghoChannelCopy}
    </button>
  )
}

export default function DonationChannels({ t, channels }) {
  const vietqr = channels?.vietqr
  const paypal = channels?.paypal

  const hasBank = vietqr?.enabled && (vietqr.accountNumber || vietqr.qrImageUrl)
  const hasPaypal = paypal?.enabled && (paypal.link || paypal.email)

  if (!hasBank && !hasPaypal) {
    return <p className="ungho-empty">{t.unghoChannelEmpty}</p>
  }

  return (
    <div className="ungho-channels">
      {hasBank && (
        <article className="ungho-channel-card">
          <h3 className="ungho-channel-title">{t.unghoChannelBank}</h3>
          {vietqr.qrImageUrl && (
            <img src={vietqr.qrImageUrl} alt="VietQR" className="ungho-qr" loading="lazy" />
          )}
          <dl className="ungho-channel-details">
            {vietqr.accountNumber && (
              <>
                <dt>{t.unghoChannelBankNumber}</dt>
                <dd>
                  <span className="ungho-mono">{vietqr.accountNumber}</span>
                  <CopyButton value={vietqr.accountNumber} t={t} />
                </dd>
              </>
            )}
            {vietqr.bankName && (
              <>
                <dt>{t.unghoChannelBankName}</dt>
                <dd>{vietqr.bankName}</dd>
              </>
            )}
            {vietqr.accountHolder && (
              <>
                <dt>{t.unghoChannelBankHolder}</dt>
                <dd>{vietqr.accountHolder}</dd>
              </>
            )}
          </dl>
          {vietqr.note && <p className="ungho-channel-note">{vietqr.note}</p>}
        </article>
      )}

      {hasPaypal && (
        <article className="ungho-channel-card">
          <h3 className="ungho-channel-title">{t.unghoChannelPaypal}</h3>
          {paypal.link && (
            <a href={paypal.link} target="_blank" rel="noopener noreferrer" className="ungho-paypal-link">
              {t.unghoChannelPaypalLink} →
            </a>
          )}
          {paypal.email && (
            <dl className="ungho-channel-details">
              <dt>Email</dt>
              <dd>
                <span className="ungho-mono">{paypal.email}</span>
                <CopyButton value={paypal.email} t={t} />
              </dd>
            </dl>
          )}
          {paypal.note && <p className="ungho-channel-note">{paypal.note}</p>}
        </article>
      )}
    </div>
  )
}
