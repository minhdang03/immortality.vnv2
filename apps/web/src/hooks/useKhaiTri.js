import useCRUD from './useCRUD'

export function useKhaiTri() {
  const { items, loading, fresh, add, update, remove } = useCRUD('khaitri')
  return { khaitri: items, loading, fresh, addKhaiTri: add, updateKhaiTri: update, deleteKhaiTri: remove }
}
