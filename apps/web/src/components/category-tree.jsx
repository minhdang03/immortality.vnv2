/**
 * CategoryTree — recursive parent-child renderer.
 * Used in both admin CRUD UI and public browse page.
 *
 * Props:
 *   roots        — top-level categories (from buildTree())
 *   childrenOf   — map of parent_id → children[]
 *   lang         — 'vi' | 'en'
 *   onSelect     — (category) => void  — called when user clicks a node
 *   selected     — currently selected category id (optional)
 *   renderActions — (category) => ReactNode — optional per-node admin actions
 *   depth        — internal recursion depth (starts at 0)
 */
export default function CategoryTree({
  roots,
  childrenOf,
  lang,
  onSelect,
  selected,
  renderActions,
  depth = 0,
}) {
  if (!roots || roots.length === 0) return null

  return (
    <ul className={`cat-tree depth-${depth}`} style={{ listStyle: 'none', paddingLeft: depth === 0 ? 0 : 16, margin: 0 }}>
      {roots.map(cat => {
        const name = lang === 'vi' ? cat.vi_name : (cat.en_name || cat.vi_name)
        const children = childrenOf[cat.id] || []
        const isSelected = selected === cat.id

        return (
          <li key={cat.id} className="cat-tree-node" style={{ marginBottom: 4 }}>
            <div
              className={`cat-tree-item ${isSelected ? 'selected' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 6,
                background: isSelected ? 'var(--accent, #f59e0b22)' : 'transparent',
                cursor: onSelect ? 'pointer' : 'default',
              }}
            >
              <span
                className="cat-tree-label"
                style={{ flex: 1, fontWeight: depth === 0 ? 600 : 400, fontSize: depth === 0 ? '0.95rem' : '0.88rem' }}
                onClick={() => onSelect?.(cat)}
              >
                {depth > 0 && <span style={{ color: 'var(--text-dim)', marginRight: 4 }}>└</span>}
                {name}
                {children.length > 0 && (
                  <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    ({children.length})
                  </span>
                )}
              </span>
              {renderActions && (
                <span className="cat-tree-actions" onClick={e => e.stopPropagation()}>
                  {renderActions(cat)}
                </span>
              )}
            </div>

            {children.length > 0 && (
              <CategoryTree
                roots={children}
                childrenOf={childrenOf}
                lang={lang}
                onSelect={onSelect}
                selected={selected}
                renderActions={renderActions}
                depth={depth + 1}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
