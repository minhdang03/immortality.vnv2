import useCRUD from './useCRUD'

export function usePractices() {
  const { items, loading, add, update, remove } = useCRUD('practices')
  return { practices: items, loading, addPractice: add, updatePractice: update, deletePractice: remove }
}
