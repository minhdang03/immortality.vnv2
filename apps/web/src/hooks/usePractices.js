import useCRUD from './useCRUD'
import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType } from './_supabase-content'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function usePractices() {
  const { data: supaItems, loading: supaLoading } = useSupabaseSWR(
    'cached_practices',
    () => fetchContentByType('practice', { orderCol: 'order_index', ascending: true }),
    []
  )

  const { items, loading: fsLoading, add, update, remove } = useCRUD('practices')

  const practices = USE_SUPABASE ? supaItems : items
  const loading = USE_SUPABASE ? supaLoading : fsLoading

  return { practices, loading, addPractice: add, updatePractice: update, deletePractice: remove }
}
