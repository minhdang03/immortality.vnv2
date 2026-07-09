/**
 * CategoryBrowsePage — /category/:slug
 * Shows a category (and its children) with all matching content.
 * Supabase path: queries content where category_id IN subtree of slug.
 * Firestore path: falls back to showing all articles (no category_id on Firestore docs).
 */
import { useState, useEffect, useMemo } from 'react'
import { useCategories, buildTree } from '../../hooks/useCategories'
import CategoryTree from '../../components/category-tree'
import ArticleCard from '../../components/shared/ArticleCard'
import SunIcon from '../../components/shared/SunIcon'
import { supabase } from '../../lib/supabase-client'

const USE_SUPABASE = import.meta.env.VITE_DATA_BACKEND === 'supabase'

/** Collect all category ids in the subtree rooted at `rootId`. */
function subtreeIds(rootId, childrenOf) {
  const ids = [rootId]
  const queue = [...(childrenOf[rootId] || [])]
  while (queue.length) {
    const node = queue.shift()
    ids.push(node.id)
    queue.push(...(childrenOf[node.id] || []))
  }
  return ids
}

async function fetchContentByCategory(categoryIds) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('content')
    .select('id, type, slug, vi, en, content_date, category_id, image, tag')
    .in('category_id', categoryIds)
    .eq('status', 'published')
    .order('content_date', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    topic: row.category_id,
    date: row.content_date,
    image: row.image,
    tag: row.tag,
    vi: row.vi,
    en: row.en,
  }))
}

export default function CategoryBrowsePage({ lang, t, slug, navigate, articles: firestoreArticles }) {
  const { categories, loading: catsLoading } = useCategories()
  const [content, setContent] = useState([])
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const { roots, childrenOf } = useMemo(() => buildTree(categories), [categories])

  // Find category by slug param
  const rootCat = useMemo(
    () => categories.find(c => c.slug === slug || c.id === slug) || null,
    [categories, slug]
  )

  // When rootCat resolves, set selectedId if not yet set
  useEffect(() => {
    if (rootCat && !selectedId) setSelectedId(rootCat.id)
  }, [rootCat, selectedId])

  // Load content for selected category subtree
  useEffect(() => {
    if (!USE_SUPABASE || !selectedId) return
    const ids = subtreeIds(selectedId, childrenOf)
    setContentLoading(true)
    fetchContentByCategory(ids)
      .then(setContent)
      .catch(err => console.error('[CategoryBrowsePage] content fetch', err))
      .finally(() => setContentLoading(false))
  }, [selectedId, childrenOf])

  const selectedCat = categories.find(c => c.id === selectedId)
  const catName = selectedCat ? (lang === 'vi' ? selectedCat.vi_name : (selectedCat.en_name || selectedCat.vi_name)) : ''

  // Firestore fallback: just show all articles (no category filtering)
  const displayItems = USE_SUPABASE ? content : (firestoreArticles || [])

  if (catsLoading) {
    return (
      <section className="section fade-up">
        <div style={{ color: 'var(--text-dim)', padding: 32, textAlign: 'center' }}>
          {lang === 'vi' ? 'Đang tải danh mục…' : 'Loading categories…'}
        </div>
      </section>
    )
  }

  return (
    <section className="section fade-up">
      <button className="detail-back" onClick={() => navigate('home')}>{t?.back || '←'}</button>

      <h2 className="section-title">
        <SunIcon size={20} />
        {lang === 'vi' ? 'Danh Mục' : 'Categories'}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: category nav tree */}
        <nav className="cat-nav-sidebar" aria-label={lang === 'vi' ? 'Danh mục' : 'Categories'}>
          {categories.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              {lang === 'vi' ? 'Chưa có danh mục' : 'No categories yet'}
            </div>
          ) : (
            <CategoryTree
              roots={roots}
              childrenOf={childrenOf}
              lang={lang}
              selected={selectedId}
              onSelect={cat => setSelectedId(cat.id)}
            />
          )}
        </nav>

        {/* Right: content list */}
        <div className="cat-content-area">
          {selectedCat && (
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>
              {catName}
              {!contentLoading && (
                <span style={{ marginLeft: 8, fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  ({displayItems.length})
                </span>
              )}
            </h3>
          )}

          {contentLoading && (
            <div style={{ color: 'var(--text-dim)', padding: '16px 0' }}>
              {lang === 'vi' ? 'Đang tải…' : 'Loading…'}
            </div>
          )}

          {!contentLoading && displayItems.length === 0 && (
            <div className="no-results">
              {lang === 'vi' ? 'Chưa có nội dung trong danh mục này.' : 'No content in this category yet.'}
            </div>
          )}

          {!contentLoading && displayItems.map((item, i) => (
            <ArticleCard key={item.id} article={item} lang={lang} t={t} index={i} navigate={navigate} />
          ))}
        </div>
      </div>
    </section>
  )
}
