import useCRUD from './useCRUD'

export function useKhaiTri() {
  const { items, loading, add, update, remove } = useCRUD('khaitri')
  return { khaitri: items, loading, addKhaiTri: add, updateKhaiTri: update, deleteKhaiTri: remove }
}
