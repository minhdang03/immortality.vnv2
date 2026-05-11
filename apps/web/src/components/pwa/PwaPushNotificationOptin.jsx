/**
 * PwaPushNotificationOptin.jsx
 *
 * Deliberate push notification opt-in UI — shown only on explicit user action,
 * never auto-prompted. Integrates with pwa-fcm-web-push-subscription.js.
 *
 * Topics (anti-FOMO, hard-coded):
 *   - Thầy answered your Khai Trí question
 *   - New article published by Đăng
 *
 * Usage: render wherever you want a "Bật thông báo" button (e.g. KhaiTriPage,
 *        settings panel). Pass the current Firebase auth user.
 */

import { useState, useEffect } from 'react'
import {
  subscribeToPush,
  unsubscribeFromPush,
  getPermissionStatus,
  onForegroundMessage,
} from '../../lib/pwa-fcm-web-push-subscription.js'

const COPY = {
  vi: {
    enable: 'Bật thông báo',
    enabled: 'Thông báo đã bật',
    disable: 'Tắt thông báo',
    denied: 'Trình duyệt đã chặn thông báo',
    deniedHint: 'Vào cài đặt trình duyệt để cho phép thông báo từ trang này.',
    unsupported: 'Trình duyệt không hỗ trợ thông báo đẩy',
    loading: 'Đang xử lý…',
    topics: 'Nhận thông báo khi: Thầy trả lời Khai Trí, bài viết mới từ Đăng.',
    errorRetry: 'Không kết nối được — thử lại',
  },
  en: {
    enable: 'Enable notifications',
    enabled: 'Notifications enabled',
    disable: 'Disable notifications',
    denied: 'Notifications blocked by browser',
    deniedHint: 'Go to browser settings to allow notifications from this site.',
    unsupported: 'Push notifications not supported',
    loading: 'Processing…',
    topics: 'Get notified when: Thầy answers Khai Trí, new article from Đăng.',
    errorRetry: 'Connection failed — try again',
  },
}

export default function PwaPushNotificationOptin({ user = null, lang = 'vi' }) {
  const t = COPY[lang] || COPY.vi
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | unsupported | error
  const [foregroundMsg, setForegroundMsg] = useState(null)

  // Sync current permission state on mount
  useEffect(() => {
    const perm = getPermissionStatus()
    if (perm === 'granted') setStatus('granted')
    else if (perm === 'denied') setStatus('denied')
    else if (perm === 'unsupported') setStatus('unsupported')
  }, [])

  // Listen for foreground messages (app is open) and show inline toast
  useEffect(() => {
    let unsub = () => {}
    onForegroundMessage((payload) => {
      setForegroundMsg(payload?.notification?.body || 'Có thông báo mới')
      setTimeout(() => setForegroundMsg(null), 5000)
    }).then((fn) => { unsub = fn })
    return () => unsub()
  }, [])

  async function handleEnable() {
    setStatus('loading')
    const result = await subscribeToPush(user)
    setStatus(result.status)
  }

  async function handleDisable() {
    setStatus('loading')
    await unsubscribeFromPush(user)
    setStatus('idle')
  }

  if (status === 'unsupported') {
    return (
      <p className="pwa-push__unsupported">{t.unsupported}</p>
    )
  }

  if (status === 'denied') {
    return (
      <div className="pwa-push__denied">
        <p>{t.denied}</p>
        <p className="pwa-push__denied-hint">{t.deniedHint}</p>
      </div>
    )
  }

  return (
    <div className="pwa-push">
      {foregroundMsg && (
        <div className="pwa-push__fg-toast" role="status">
          ✦ {foregroundMsg}
        </div>
      )}

      <p className="pwa-push__topics">{t.topics}</p>

      {status === 'granted' ? (
        <div className="pwa-push__granted">
          <span className="pwa-push__badge">✓ {t.enabled}</span>
          <button
            type="button"
            className="pwa-push__btn-disable"
            onClick={handleDisable}
          >
            {t.disable}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="pwa-push__btn-enable"
          onClick={handleEnable}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? t.loading : status === 'error' ? t.errorRetry : t.enable}
        </button>
      )}
    </div>
  )
}
