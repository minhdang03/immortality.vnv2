/**
 * useTopics — legacy flat topics are superseded by public.categories.
 *
 * The old `topics` collection is gone; category management lives in the admin
 * CategoriesTab (useCategories). This stub returns an empty list + no-op writers
 * so components that still accept a `topics` prop (ArticlesPage, TopicPage,
 * AdminPanel) keep working unchanged.
 */
export function useTopics() {
  const noop = async () => {}
  return { topics: [], loading: false, addTopic: noop, updateTopic: noop, deleteTopic: noop }
}
