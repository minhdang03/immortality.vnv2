import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType, createContent, updateContent, deleteContent } from './_supabase-content'

export function useTeachings() {
  const { data: teachings, loading } = useSupabaseSWR(
    'cached_teachings',
    () => fetchContentByType('teaching', { orderCol: 'order_index', ascending: true }),
    []
  )

  const addTeaching = (item) => createContent('teaching', item)
  const updateTeaching = (id, data) => updateContent(id, 'teaching', data)
  const deleteTeaching = (id) => deleteContent(id)

  return { teachings, loading, addTeaching, updateTeaching, deleteTeaching }
}
