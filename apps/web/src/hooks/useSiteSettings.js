import { useFirestoreSWR } from './useFirestoreSWR'
import { useSupabaseSWR } from './useSupabaseSWR'
import { supabase } from '../supabase'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { DEFAULT_HOME_CARDS, DEFAULT_NAV_ITEMS } from '../config/pages'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

async function fetchSupabaseSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site')
    .single()
  if (error || !data) return null
  return data.value
}

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
    // Trang mới thêm vào registry sau khi settings đã lưu trên Firestore
    // (vd nang-luong): tự merge vào cuối nav, admin vẫn ẩn/sắp xếp được như thường.
    const saved = new Set(migrated.navItems.map(i => i.id))
    DEFAULT_NAV_ITEMS.forEach(def => {
      if (!saved.has(def.id)) migrated.navItems.push({ ...def })
    })
  }
  if (migrated.homeCards) {
    migrated.homeCards = migrated.homeCards.map(card =>
      card.id === 'revelations' ? { ...card, id: 'khaitri', labelVi: card.labelVi === 'Khai Thị' ? 'Khai Trí' : card.labelVi, labelEn: card.labelEn === 'Revelations' ? 'Enlightenment Q&A' : card.labelEn } : card
    )
    const savedCards = new Set(migrated.homeCards.map(c => c.id))
    DEFAULT_HOME_CARDS.forEach(def => {
      if (!savedCards.has(def.id)) migrated.homeCards.push({ ...def })
    })
  }
  return migrated
}

export function useSiteSettings() {
  const supaResult = useSupabaseSWR(
    'cached_site_settings',
    async () => {
      const raw = await fetchSupabaseSettings()
      return migrateSettings(raw) ?? DEFAULT_SETTINGS
    },
    DEFAULT_SETTINGS
  )

  const fsResult = useFirestoreSWR(
    'cached_site_settings',
    (onData, onError) => {
      return onSnapshot(doc(db, 'settings', 'site'), (snap) => {
        onData(snap.exists() ? migrateSettings(snap.data()) : DEFAULT_SETTINGS)
      }, onError)
    },
    DEFAULT_SETTINGS
  )

  const { data: settings, loading } = USE_SUPABASE ? supaResult : fsResult

  // Writes stay on Firestore for this phase
  const updateSettings = async (data) => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'settings', 'site'), data, { merge: true })
  }

  return { settings, loading, updateSettings }
}
