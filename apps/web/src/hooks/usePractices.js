import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType, createContent, updateContent, deleteContent } from './_supabase-content'

export function usePractices() {
  const { data: practices, loading } = useSupabaseSWR(
    'cached_practices',
    () => fetchContentByType('practice', { orderCol: 'order_index', ascending: true }),
    []
  )

  const addPractice = (item) => createContent('practice', item)
  const updatePractice = (id, data) => updateContent(id, 'practice', data)
  const deletePractice = (id) => deleteContent(id)

  return { practices, loading, addPractice, updatePractice, deletePractice }
}
