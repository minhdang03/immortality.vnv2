import useCRUD from './useCRUD'
import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType } from './_supabase-content'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function useKhaiTri() {
  // Supabase path: order by order_index asc (series ordering)
  const { data: supaItems, loading: supaLoading, fresh: supaFresh } = useSupabaseSWR(
    'cached_khaitri',
    () => fetchContentByType('khaitri', { orderCol: 'order_index', ascending: true }),
    []
  )

  // Firestore path (unchanged via useCRUD)
  const { items, loading: fsLoading, fresh: fsFresh, add, update, remove } = useCRUD('khaitri')

  if (USE_SUPABASE) {
    return { khaitri: supaItems, loading: supaLoading, fresh: supaFresh, addKhaiTri: add, updateKhaiTri: update, deleteKhaiTri: remove }
  }
  return { khaitri: items, loading: fsLoading, fresh: fsFresh, addKhaiTri: add, updateKhaiTri: update, deleteKhaiTri: remove }
}
