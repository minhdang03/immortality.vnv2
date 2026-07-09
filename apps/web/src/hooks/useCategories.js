/**
 * useCategories — Supabase path: full CRUD on public.categories.
 * Firestore path: thin stub returning empty list (topics collection was empty).
 *
 * Return shape mirrors useTopics for drop-in compatibility:
 *   { categories, loading, addCategory, updateCategory, deleteCategory }
 *
 * Categories schema: id, parent_id, vi_name, en_name, slug, order_index.
 * Hierarchy built client-side (small dataset; avoids recursive SQL on anon key).
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase-client'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

/** Build a slug from a Vietnamese name (simple, no external dep). */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Check if setting `candidateParentId` as parent of `categoryId` would create a cycle.
 * @param {Array} categories - flat list of all categories
 * @param {string} categoryId - the category being edited
 * @param {string|null} candidateParentId
 * @returns {boolean} true if cycle would be created
 */
export function wouldCreateCycle(categories, categoryId, candidateParentId) {
  if (!candidateParentId) return false
  if (candidateParentId === categoryId) return true
  // Walk ancestors of candidateParentId — if we hit categoryId, it's a cycle.
  const map = Object.fromEntries(categories.map(c => [c.id, c]))
  let cursor = map[candidateParentId]
  const visited = new Set()
  while (cursor?.parent_id) {
    if (visited.has(cursor.id)) break // already detected cycle elsewhere
    visited.add(cursor.id)
    if (cursor.parent_id === categoryId) return true
    cursor = map[cursor.parent_id]
  }
  return false
}

/**
 * Arrange flat list into {roots, childrenOf} for rendering a tree.
 * @param {Array} flat
 * @returns {{ roots: Array, childrenOf: Object }}
 */
export function buildTree(flat) {
  const childrenOf = {}
  const roots = []
  for (const cat of flat) {
    if (cat.parent_id) {
      childrenOf[cat.parent_id] = childrenOf[cat.parent_id] || []
      childrenOf[cat.parent_id].push(cat)
    } else {
      roots.push(cat)
    }
  }
  const sort = arr => arr.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  sort(roots)
  Object.values(childrenOf).forEach(sort)
  return { roots, childrenOf }
}

async function fetchCategories() {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('categories')
    .select('id, parent_id, vi_name, en_name, slug, order_index')
    .order('order_index', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(async () => {
    if (!USE_SUPABASE) return
    setLoading(true)
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('[useCategories] fetch error', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const addCategory = async ({ vi_name, en_name, parent_id, order_index }) => {
    if (!supabase) return
    const slug = slugify(vi_name) + '-' + Date.now()
    const { error } = await supabase.from('categories').insert({
      id: slug,
      vi_name,
      en_name: en_name || vi_name,
      slug,
      parent_id: parent_id || null,
      order_index: order_index ?? 0,
    })
    if (error) throw error
    await reload()
  }

  const updateCategory = async (id, updates) => {
    if (!supabase) return
    // Prevent cycles before saving
    if (updates.parent_id !== undefined && wouldCreateCycle(categories, id, updates.parent_id)) {
      throw new Error('Setting this parent would create a category cycle.')
    }
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    await reload()
  }

  const deleteCategory = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory, reload }
}
