import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType, createContent, updateContent, deleteContent } from './_supabase-content'

export function useKhaiTri() {
  const { data: khaitri, loading, fresh } = useSupabaseSWR(
    'cached_khaitri',
    () => fetchContentByType('khaitri', { orderCol: 'order_index', ascending: true }),
    []
  )

  const addKhaiTri = (item) => createContent('khaitri', item)
  const updateKhaiTri = (id, data) => updateContent(id, 'khaitri', data)
  const deleteKhaiTri = (id) => deleteContent(id)

  return { khaitri, loading, fresh, addKhaiTri, updateKhaiTri, deleteKhaiTri }
}
