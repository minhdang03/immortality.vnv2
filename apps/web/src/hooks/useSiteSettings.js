import { useSupabaseSWR } from './useSupabaseSWR'
import { supabase } from '../supabase'
import { DEFAULT_HOME_CARDS, DEFAULT_NAV_ITEMS } from '../config/pages'

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
    // Trang mới thêm vào registry sau khi settings đã lưu: tự merge vào cuối nav,
    // admin vẫn ẩn/sắp xếp được như thường.
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
  const { data: settings, loading } = useSupabaseSWR(
    'cached_site_settings',
    async () => {
      const raw = await fetchSupabaseSettings()
      return migrateSettings(raw) ?? DEFAULT_SETTINGS
    },
    DEFAULT_SETTINGS
  )

  // Merge-upsert the site settings blob (admin only via RLS).
  const updateSettings = async (data) => {
    if (!supabase) return
    const current = (await fetchSupabaseSettings()) || {}
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'site', value: { ...current, ...data }, updated_at: new Date().toISOString() })
    if (error) throw error
  }

  return { settings, loading, updateSettings }
}
