/**
 * CategoriesTab — admin CRUD for public.categories.
 * Supabase-gated: only rendered when VITE_DATA_BACKEND === 'supabase'.
 * Follows TopicsTab patterns (same form layout, same action buttons).
 */
import { useState } from 'react'
import { useCategories, buildTree, wouldCreateCycle } from '../../hooks/useCategories'
import CategoryTree from '../category-tree'

const EMPTY = { vi_name: '', en_name: '', parent_id: '', order_index: 0 }

export default function CategoriesTab({ lang }) {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
  const [editing, setEditing] = useState(null) // null | 'new' | category.id
  const [form, setForm] = useState(EMPTY)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startNew = () => {
    setForm({ ...EMPTY, order_index: categories.length })
    setEditing('new')
    setErr('')
  }

  const startEdit = (cat) => {
    setForm({
      vi_name: cat.vi_name || '',
      en_name: cat.en_name || '',
      parent_id: cat.parent_id || '',
      order_index: cat.order_index ?? 0,
    })
    setEditing(cat.id)
    setErr('')
  }

  const handleSave = async () => {
    if (!form.vi_name.trim()) { setErr(lang === 'vi' ? 'Tên (VI) là bắt buộc' : 'VI name is required'); return }
    const parentId = form.parent_id || null

    if (editing !== 'new' && wouldCreateCycle(categories, editing, parentId)) {
      setErr(lang === 'vi' ? 'Không thể đặt cha gây vòng lặp' : 'Parent selection would create a cycle')
      return
    }

    setSaving(true)
    setErr('')
    try {
      const payload = {
        vi_name: form.vi_name.trim(),
        en_name: form.en_name.trim() || form.vi_name.trim(),
        parent_id: parentId,
        order_index: Number(form.order_index) || 0,
      }
      if (editing === 'new') await addCategory(payload)
      else await updateCategory(editing, payload)
      setEditing(null)
      setForm(EMPTY)
    } catch (e) {
      setErr(e.message || (lang === 'vi' ? 'Lỗi lưu danh mục' : 'Error saving category'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const msg = lang === 'vi' ? 'Xoá danh mục này? Con cháu sẽ mất cha.' : 'Delete this category? Children will lose their parent.'
    if (!window.confirm(msg)) return
    try { await deleteCategory(id) } catch (e) { setErr(e.message) }
  }

  const { roots, childrenOf } = buildTree(categories)

  // Parent options: all categories except the one being edited (prevent self-parent)
  const parentOptions = categories.filter(c => c.id !== editing)

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-read" onClick={startNew}>
          {lang === 'vi' ? 'Thêm danh mục' : 'Add category'}
        </button>
      </div>

      {editing !== null && (
        <div className="admin-form">
          {err && <div className="admin-error" style={{ marginBottom: 8 }}>{err}</div>}
          <div className="admin-form-grid">
            <div>
              <label>{lang === 'vi' ? 'Tên (VI) *' : 'Name (VI) *'}</label>
              <input value={form.vi_name} onChange={e => setField('vi_name', e.target.value)} placeholder="Tên tiếng Việt" />
            </div>
            <div>
              <label>{lang === 'vi' ? 'Tên (EN)' : 'Name (EN)'}</label>
              <input value={form.en_name} onChange={e => setField('en_name', e.target.value)} placeholder="English name" />
            </div>
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{lang === 'vi' ? 'Danh mục cha' : 'Parent category'}</label>
              <select value={form.parent_id} onChange={e => setField('parent_id', e.target.value)}>
                <option value="">{lang === 'vi' ? '— Không có cha —' : '— None (top level) —'}</option>
                {parentOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? `  └ ${lang === 'vi' ? c.vi_name : c.en_name}` : (lang === 'vi' ? c.vi_name : c.en_name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
              <input type="number" value={form.order_index} onChange={e => setField('order_index', e.target.value)} style={{ maxWidth: 80 }} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn-read" onClick={handleSave} disabled={saving}>
              {saving ? '…' : (lang === 'vi' ? 'Lưu' : 'Save')}
            </button>
            <button className="btn-video" onClick={() => { setEditing(null); setErr('') }}>
              {lang === 'vi' ? 'Huỷ' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-dim)', padding: 24 }}>
          {lang === 'vi' ? 'Đang tải…' : 'Loading…'}
        </div>
      ) : categories.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
          {lang === 'vi' ? 'Chưa có danh mục. Bấm "Thêm danh mục" để bắt đầu.' : 'No categories yet. Click "Add category" to start.'}
        </div>
      ) : (
        <div className="admin-articles" style={{ paddingTop: 8 }}>
          <CategoryTree
            roots={roots}
            childrenOf={childrenOf}
            lang={lang}
            renderActions={(cat) => (
              <>
                <button className="btn-sm" style={{ marginRight: 4 }} onClick={() => startEdit(cat)}>
                  {lang === 'vi' ? 'Sửa' : 'Edit'}
                </button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(cat.id)}>
                  {lang === 'vi' ? 'Xoá' : 'Del'}
                </button>
              </>
            )}
          />
        </div>
      )}
    </>
  )
}
