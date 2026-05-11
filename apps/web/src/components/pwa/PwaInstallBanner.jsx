/**
 * PwaInstallBanner.jsx
 *
 * Subtle bottom banner that appears after 30 seconds on first mobile visit,
 * prompting the user to install Bất Tử Đạo as a PWA on their home screen.
 *
 * Rules:
 *  - Mobile-only (hidden on desktop via CSS)
 *  - Shows only once per session (dismiss saves to sessionStorage)
 *  - Never shows if app is already installed (standalone mode)
 *  - Requires `beforeinstallprompt` to be available (Android Chrome)
 *  - iOS Safari: shows manual instructions (no programmatic prompt)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  onInstallReady,
  onInstalled,
  showInstallPrompt,
  isRunningStandalone,
} from '../../lib/pwa-install-prompt-manager.js'

const DISMISSED_KEY = 'btd:pwa_banner_dismissed'
const DELAY_MS = 30_000

const COPY = {
  vi: {
    title: 'Cài đặt Bất Tử Đạo',
    body: 'Truy cập nhanh hơn, đọc offline.',
    install: 'Cài đặt',
    dismiss: 'Để sau',
    iosTitle: 'Thêm vào màn hình chính',
    iosBody: 'Nhấn  chia sẻ  rồi chọn "Thêm vào màn hình chính".',
    iosGot: 'Đã hiểu',
  },
  en: {
    title: 'Install Bất Tử Đạo',
    body: 'Faster access, read offline.',
    install: 'Install',
    dismiss: 'Later',
    iosTitle: 'Add to Home Screen',
    iosBody: 'Tap the share button then choose "Add to Home Screen".',
    iosGot: 'Got it',
  },
}

function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

export default function PwaInstallBanner({ lang = 'vi' }) {
  const t = COPY[lang] || COPY.vi
  const [visible, setVisible] = useState(false)
  const [canInstallNative, setCanInstallNative] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Never show if already installed
    if (isRunningStandalone()) return
    // Never show if dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const ios = isIosSafari()
    setIsIos(ios)

    let timer

    if (ios) {
      // iOS Safari — show manual instructions after delay
      timer = setTimeout(() => setVisible(true), DELAY_MS)
      return () => clearTimeout(timer)
    }

    // Android Chrome — wait for beforeinstallprompt
    const cleanup = onInstallReady(() => {
      setCanInstallNative(true)
      timer = setTimeout(() => setVisible(true), DELAY_MS)
    })

    // Track install completion — hide banner
    const cleanupInstalled = onInstalled(() => setVisible(false))

    return () => {
      clearTimeout(timer)
      cleanup()
      cleanupInstalled()
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const outcome = await showInstallPrompt()
    if (outcome === 'accepted' || outcome === 'unavailable') {
      setVisible(false)
    }
    // If dismissed by native dialog, keep banner visible so user can try again
  }, [])

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      className="pwa-install-banner"
      role="complementary"
      aria-label={isIos ? t.iosTitle : t.title}
    >
      <div className="pwa-install-banner__content">
        <div className="pwa-install-banner__icon" aria-hidden="true">✦</div>
        <div className="pwa-install-banner__text">
          <strong>{isIos ? t.iosTitle : t.title}</strong>
          <span>{isIos ? t.iosBody : t.body}</span>
        </div>
        <div className="pwa-install-banner__actions">
          {!isIos && (
            <button
              className="pwa-install-banner__btn-install"
              onClick={handleInstall}
              type="button"
            >
              {t.install}
            </button>
          )}
          <button
            className="pwa-install-banner__btn-dismiss"
            onClick={handleDismiss}
            type="button"
            aria-label={isIos ? t.iosGot : t.dismiss}
          >
            {isIos ? t.iosGot : '✕'}
          </button>
        </div>
      </div>
    </div>
  )
}
