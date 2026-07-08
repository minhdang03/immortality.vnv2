/**
 * Card giải thích 1 bước — dùng chung cho scroll story + explore mode.
 * key={step.id} trên <article> → remount khi đổi bước → animation vào chạy lại.
 * Hình cận cảnh (step.img) crossfade theo bước; onError tự ẩn nếu thiếu file.
 */
export default function StepCard({ step, lang }) {
  if (!step) return null
  const c = step[lang] || step.vi
  return (
    <article className="nl-card" key={step.id}>
      {step.img && (
        <div className="nl-card-media">
          <img src={step.img} alt={c.title} width="768" height="768"
            loading="lazy" decoding="async"
            onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
        </div>
      )}
      <div className="nl-card-body">
        <div className="nl-card-num">{step.num}</div>
        <h3 className="nl-card-title">{c.title}</h3>
        <ul className="nl-card-points">
          {c.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </article>
  )
}
