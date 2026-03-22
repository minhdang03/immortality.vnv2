import useCRUD from './useCRUD'

export function useTeachings() {
  const { items, loading, add, update, remove } = useCRUD('teachings')
  return { teachings: items, loading, addTeaching: add, updateTeaching: update, deleteTeaching: remove }
}
