import { useSupabaseSWR } from './useSupabaseSWR'
import { fetchContentByType, createContent, updateContent, deleteContent } from './_supabase-content'
import { DEFAULT_ARTICLES } from '../data/articles'

export function useArticles() {
  const { data: articles, loading, fresh } = useSupabaseSWR(
    'cached_articles',
    () => fetchContentByType('article', { orderCol: 'content_date', ascending: false, limit: 200 }),
    DEFAULT_ARTICLES
  )

  const addArticle = (article) => createContent('article', article)
  const updateArticle = (id, data) => updateContent(id, 'article', data)
  const deleteArticle = (id) => deleteContent(id)

  return { articles, loading, fresh, addArticle, updateArticle, deleteArticle }
}
