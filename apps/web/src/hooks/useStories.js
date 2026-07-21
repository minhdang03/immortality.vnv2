import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType, createContent, updateContent, deleteContent } from './_supabase-content'

export function useStories() {
  const { data: stories, loading, fresh } = useSupabaseSWR(
    'cached_stories',
    () => fetchContentByType('story', { orderCol: 'order_index', ascending: true }),
    []
  )

  const addStory = (story) => createContent('story', story)
  const updateStory = (id, data) => updateContent(id, 'story', data)
  const deleteStory = (id) => deleteContent(id)

  return { stories, loading, fresh, addStory, updateStory, deleteStory }
}
