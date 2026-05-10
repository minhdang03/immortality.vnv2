import { useState } from 'react'
import { useFirestoreSWR } from './useFirestoreSWR'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { DEFAULT_HOME_CARDS, DEFAULT_NAV_ITEMS } from '../config/pages'

export const DEFAULT_HERO = {
  showSun: true,
  showTitle: true,
  showSubtitle: true,
  showCtaPrimary: true,
  showCtaSecondary: true,
  ctaPrimaryVi: 'Khám Phá Câu Chuyện', ctaPrimaryEn: 'Explore Stories',
  ctaPrimaryLink: 'stories',
  ctaSecondaryVi: '', ctaSecondaryEn: '',
  ctaSecondaryLink: 'search',
}

const DEFAULT_SETTINGS = { navItems: DEFAULT_NAV_ITEMS, homeCards: DEFAULT_HOME_CARDS, hero: DEFAULT_HERO }

// Migrate old 'revelations' references to 'khaitri' in settings
function migrateSettings(data) {
  if (!data) return data
  const migrated = { ...data }
  if (migrated.navItems) {
    migrated.navItems = migrated.navItems.map(item =>
      item.id === 'revelations' ? { ...item, id: 'khaitri', labelVi: item.labelVi === 'Khai Thị' ? 'Khai Trí' : item.labelVi, labelEn: item.labelEn === 'Revelations' ? 'Khai Trí' : item.labelEn } : item
    )
  }
  if (migrated.homeCards) {
    migrated.homeCards = migrated.homeCards.map(card =>
      card.id === 'revelations' ? { ...card, id: 'khaitri', labelVi: card.labelVi === 'Khai Thị' ? 'Khai Trí' : card.labelVi, labelEn: card.labelEn === 'Revelations' ? 'Enlightenment Q&A' : card.labelEn } : card
    )
  }
  return migrated
}

export function useSiteSettings() {
  const { data: settings, loading } = useFirestoreSWR(
    'cached_site_settings',
    (onData, onError) => {
      return onSnapshot(doc(db, 'settings', 'site'), (snap) => {
        if (snap.exists()) {
          onData(migrateSettings(snap.data()))
        } else {
          onData(DEFAULT_SETTINGS)
        }
      }, onError)
    },
    DEFAULT_SETTINGS
  )

  const updateSettings = async (data) => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'settings', 'site'), data, { merge: true })
  }

  return { settings, loading, updateSettings }
}
