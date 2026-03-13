import { useState } from 'react'
import { STORIES, STORY_TAGS, STORY_CONTENT } from '../data/stories'

function StoryDetail({ story, lang, onBack }) {
  const content = STORY_CONTENT[story.id]
  const tag = STORY_TAGS[story.tag]
  return (
    <div className="story-detail fade-up">
      <button className="back-btn" onClick={onBack}>← {lang === 'vi' ? 'Quay lại' : 'Back'}</button>
      <div className="story-detail-header">
        <span className="story-num-lg">{String(story.id).padStart(2, '0')}</span>
        <span className={`story-tag tag-${story.tag}`}>{lang === 'vi' ? tag.vi : tag.en}</span>
      </div>
      <h1 className="story-detail-title">{lang === 'vi' ? story.vi : story.en}</h1>
      <div className="story-detail-body">
        {content
          ? (lang === 'vi' ? content.vi : content.en).split('\n\n').map((p, i) => <p key={i}>{p}</p>)
          : <p className="story-placeholder">{lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...'}</p>
        }
      </div>
    </div>
  )
}

export default function StoriesPage({ t, lang }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  if (selected) {
    return <StoryDetail story={selected} lang={lang} onBack={() => setSelected(null)} />
  }

  const tags = ['all', ...Object.keys(STORY_TAGS)]
  const filtered = filter === 'all' ? STORIES : STORIES.filter(s => s.tag === filter)

  return (
    <section className="stories-page fade-up">
      <h1 className="stories-title">
        {lang === 'vi' ? '37 Câu Chuyện Người Bất Tử' : '37 Stories of The Immortal'}
      </h1>
      <p className="stories-subtitle">
        {lang === 'vi'
          ? 'Hành trình hơn 40 năm khám phá, chiến đấu và chữa lành'
          : 'A journey of over 40 years of discovery, battle and healing'}
      </p>

      <div className="stories-filters">
        {tags.map(tag => (
          <button
            key={tag}
            className={`story-filter ${filter === tag ? 'active' : ''} ${tag !== 'all' ? `tag-${tag}` : ''}`}
            onClick={() => setFilter(tag)}
          >
            {tag === 'all'
              ? (lang === 'vi' ? 'Tất cả' : 'All')
              : (lang === 'vi' ? STORY_TAGS[tag].vi : STORY_TAGS[tag].en)
            }
            {tag === 'all'
              ? ` (${STORIES.length})`
              : ` (${STORIES.filter(s => s.tag === tag).length})`
            }
          </button>
        ))}
      </div>

      <div className="stories-list">
        {filtered.map((story, i) => {
          const tag = STORY_TAGS[story.tag]
          const hasContent = !!STORY_CONTENT[story.id]
          return (
            <div
              key={story.id}
              className={`story-item fade-up fade-up-d${(i % 4) + 1} ${hasContent ? 'has-content' : ''}`}
              onClick={() => setSelected(story)}
            >
              <span className="story-num">{String(story.id).padStart(2, '0')}</span>
              <div className="story-info">
                <div className="story-item-title">{lang === 'vi' ? story.vi : story.en}</div>
                <span className={`story-tag tag-${story.tag}`}>{lang === 'vi' ? tag.vi : tag.en}</span>
              </div>
              <span className="story-arrow">›</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
