export default function StoryThread({ thread, lang }) {
  if (!thread) return null

  return (
    <div className="story-thread-v2">
      <div className="thread-v2-icon">
        <svg viewBox="0 0 48 10" fill="none">
          <circle className="thread-dot" cx="4" cy="5" r="3" />
          <line className="thread-line" x1="7" y1="5" x2="41" y2="5" />
          <circle className="thread-dot" cx="44" cy="5" r="3" />
        </svg>
      </div>
      <h3 className="thread-v2-header">
        {lang === 'vi' ? 'Xuyên Suốt' : 'The Thread'}
      </h3>
      <p className="thread-v2-body">{thread}</p>
    </div>
  )
}
