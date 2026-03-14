import { khaitriSlug } from '../../utils/slug'
import SunIcon from '../SunIcon'
import ShareButtons from '../ShareButtons'
import InlineEdit from '../InlineEdit'
import { ReadingProgress, ReadingTime, FontSizeControls, renderText } from '../ReadingHelpers'

export default function KhaiTriDetail({ item, lang, t, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, onBack, allItems, user, onUpdate }) {
  const langKey = lang === 'vi' ? 'vi' : 'en'
  const d = item[langKey] || {}
  const tag = lang === 'vi' ? item.tag?.vi : item.tag?.en
  const body = d.body || ''

  const isAdmin = !!user
  const saveField = (nestedPath) => async (value) => {
    if (onUpdate && item.id) {
      // nestedPath like 'vi.body' or 'vi.question'
      const parts = nestedPath.split('.')
      if (parts.length === 2) {
        const current = item[parts[0]] || {}
        await onUpdate(item.id, { [parts[0]]: { ...current, [parts[1]]: value } })
      } else {
        await onUpdate(item.id, { [nestedPath]: value })
      }
    }
  }

  const currentIndex = allItems.findIndex(it => it.id === item.id)
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null

  return (
    <>
      <ReadingProgress />
      <div className="khaitri-detail fade-up">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={() => navigate('home')}>{t.navHome}</button>
          <span className="breadcrumb-sep">/</span>
          <button onClick={() => onBack()}>{lang === 'vi' ? 'Khai Trí' : 'Khai Trí'}</button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{(d.title || '').slice(0, 30)}{(d.title || '').length > 30 ? '...' : ''}</span>
        </div>

        {/* Header */}
        <div className="khaitri-detail-header">
          <span className="khaitri-detail-num">{String(item.order || 1).padStart(2, '0')}</span>
          {tag && <span className="khaitri-detail-tag">{tag}</span>}
        </div>

        <h1 className="khaitri-detail-title">{d.title}</h1>

        {/* Meta */}
        <div className="detail-meta">
          {tag && <span className="article-tag">{tag}</span>}
          <ReadingTime text={body} lang={lang} />
        </div>

        {/* Toolbar */}
        <div className="detail-toolbar">
          <FontSizeControls fontSize={fontSize} onIncrease={onFontIncrease} onDecrease={onFontDecrease} onReset={onFontReset} />
          <ShareButtons title={d.title || ''} shareUrl={`${window.location.origin}/khaitri/${khaitriSlug(item)}`} t={t} />
        </div>

        {/* Question */}
        <div className="section-editable">
          <span style={{ flex: 1 }} />
          {isAdmin && <InlineEdit value={d.question} onSave={saveField(`${langKey}.question`)} lang={lang} label={lang === 'vi' ? 'Câu hỏi' : 'Question'} />}
        </div>
        {d.question && (
          <div className="khaitri-detail-question">
            <SunIcon size={14} />
            <span>{d.question}</span>
          </div>
        )}

        {/* Summary */}
        <div className="section-editable">
          <span style={{ flex: 1 }} />
          {isAdmin && <InlineEdit value={d.summary} onSave={saveField(`${langKey}.summary`)} lang={lang} label={lang === 'vi' ? 'Tóm tắt' : 'Summary'} />}
        </div>
        {d.summary && (
          <div className="khaitri-detail-summary">{d.summary}</div>
        )}

        {/* Body */}
        <div className="section-editable">
          <span style={{ flex: 1 }} />
          {isAdmin && <InlineEdit value={body} onSave={saveField(`${langKey}.body`)} lang={lang} label={lang === 'vi' ? 'Nội dung trả lời' : 'Answer'} />}
        </div>
        <div className="khaitri-detail-body detail-body">
          {body
            ? renderText(body)
            : <p style={{ color: 'var(--text-dim)' }}>{lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...'}</p>
          }
        </div>

        {/* Share bottom */}
        <div className="detail-share">
          <ShareButtons title={d.title || ''} shareUrl={`${window.location.origin}/khaitri/${khaitriSlug(item)}`} t={t} />
        </div>

        {/* Prev/Next */}
        <div className="story-nav">
          {prevItem ? (
            <button className="story-nav-btn story-nav-prev" onClick={() => onBack(prevItem)}>
              <span className="story-nav-label">&larr; {lang === 'vi' ? 'Trước' : 'Previous'}</span>
              <span className="story-nav-title">{String(prevItem.order).padStart(2, '0')}. {(prevItem.vi?.title || prevItem.en?.title || '').slice(0, 40)}</span>
            </button>
          ) : <div />}
          {nextItem ? (
            <button className="story-nav-btn story-nav-next" onClick={() => onBack(nextItem)}>
              <span className="story-nav-label">{lang === 'vi' ? 'Tiếp' : 'Next'} &rarr;</span>
              <span className="story-nav-title">{String(nextItem.order).padStart(2, '0')}. {(nextItem.vi?.title || nextItem.en?.title || '').slice(0, 40)}</span>
            </button>
          ) : <div />}
        </div>
      </div>
    </>
  )
}
