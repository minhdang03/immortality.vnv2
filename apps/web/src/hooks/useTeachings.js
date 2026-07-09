import useCRUD from './useCRUD'
import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType } from './_supabase-content'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

export function useTeachings() {
  const { data: supaItems, loading: supaLoading } = useSupabaseSWR(
    'cached_teachings',
    () => fetchContentByType('teaching', { orderCol: 'order_index', ascending: true }),
    []
  )

  const { items, loading: fsLoading, add, update, remove } = useCRUD('teachings')

  const teachings = USE_SUPABASE ? supaItems : items
  const loading = USE_SUPABASE ? supaLoading : fsLoading

  return { teachings, loading, addTeaching: add, updateTeaching: update, deleteTeaching: remove }
}
