import { useState } from 'react'
import SunIcon from '../components/SunIcon'

export default function RevelationsPage({ t, lang, revelations }) {
  const [openId, setOpenId] = useState(null)

  return (
    <section className="revelations-page fade-up">
      <div className="revelations-header">
        <div className="revelations-sun"><SunIcon size={60} /></div>
        <h1 className="revelations-title">
          {lang === 'vi' ? 'Khai Thị' : 'Revelations'}
        </h1>
        <p className="revelations-subtitle">
          {lang === 'vi'
            ? 'Hỏi đáp trực tiếp với Người Bất Tử'
            : 'Direct Q&A with The Immortal'}
        </p>
      </div>

      <div className="revelations-list">
        {revelations.map((item, i) => {
          const question = lang === 'vi' ? item.questionVi : item.questionEn
          const answer = lang === 'vi' ? item.answerVi : item.answerEn
          const isOpen = openId === item.id
          return (
            <div key={item.id} className={`revelation-item fade-up fade-up-d${(i % 4) + 1} ${isOpen ? 'open' : ''}`}>
              <button className="revelation-question" onClick={() => setOpenId(isOpen ? null : item.id)}>
                <span className="revelation-num">{String(item.order || i + 1).padStart(2, '0')}</span>
                <span className="revelation-q-text">{question}</span>
                <span className={`revelation-arrow ${isOpen ? 'open' : ''}`}>&#9662;</span>
              </button>
              {isOpen && answer && (
                <div className="revelation-answer">
                  {answer.split('\n\n').map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {revelations.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 40 }}>
            {lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...'}
          </div>
        )}
      </div>
    </section>
  )
}
