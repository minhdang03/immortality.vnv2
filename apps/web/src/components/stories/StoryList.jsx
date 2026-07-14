import { STORY_TAGS } from '../../data/stories'
import PageHero from '../shared/PageHero'

export default function StoryList({ allStories, filtered, filter, setFilter, lang, onSelect }) {
  const tags = ['all', ...Object.keys(STORY_TAGS)]

  return (
    <section className="stories-page fade-up">
      <PageHero
        eyebrow={lang === 'vi' ? 'Câu Chuyện' : 'Stories'}
        title={lang === 'vi' ? `${allStories.length} Câu Chuyện Người Bất Tử` : `${allStories.length} Stories of The Immortal`}
        subtitle={lang === 'vi'
          ? 'Hành trình hơn 40 năm khám phá, chiến đấu và chữa lành'
          : 'A journey of over 40 years of discovery, battle and healing'}
      />

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
              ? ` (${allStories.length})`
              : ` (${allStories.filter(s => s.tag === tag).length})`
            }
          </button>
        ))}
      </div>

      <div className="stories-list">
        {filtered.map((story, i) => {
          const tag = STORY_TAGS[story.tag]
          const hasContent = !!(story.contentVi || story.contentEn)
          return (
            <div
              key={story.id}
              className={`story-item fade-up fade-up-d${(i % 4) + 1} ${hasContent ? 'has-content' : ''}`}
              onClick={() => onSelect(story)}
            >
              <span className="story-num">{String(story.order).padStart(2, '0')}</span>
              <div className="story-info">
                <div className="story-item-title">{lang === 'vi' ? story.titleVi : story.titleEn}</div>
                {tag && <span className={`story-tag tag-${story.tag}`}>{lang === 'vi' ? tag.vi : tag.en}</span>}
              </div>
              <span className="story-arrow">&rsaquo;</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
