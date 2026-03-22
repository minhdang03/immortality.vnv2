import { useMemo } from 'react'
import SunIcon from '../../components/shared/SunIcon'

const DEFAULT_MOVES = [
  { order: 1, titleVi: 'Khởi Động Năng Lượng Mặt Trời', titleEn: 'Solar Energy Activation', descVi: '', descEn: '' },
  { order: 2, titleVi: 'Thái Dương Chưởng — Chưởng Mặt Trời', titleEn: 'Solar Palm — Sun Palm Strike', descVi: '', descEn: '' },
  { order: 3, titleVi: 'Hỏa Xà Quyền — Quyền Rắn Lửa', titleEn: 'Fire Snake Fist', descVi: '', descEn: '' },
  { order: 4, titleVi: 'Nhật Nguyệt Liên Hoàn — Mặt Trời Mặt Trăng Liên Kết', titleEn: 'Sun-Moon Chain Strike', descVi: '', descEn: '' },
  { order: 5, titleVi: 'Thiên Địa Quy Nhất — Trời Đất Hợp Nhất', titleEn: 'Heaven-Earth Unification', descVi: '', descEn: '' },
  { order: 6, titleVi: 'Vũ Trụ Xoay Chuyển — Xoáy Năng Lượng', titleEn: 'Universe Rotation — Energy Vortex', descVi: '', descEn: '' },
  { order: 7, titleVi: 'Kim Cương Bất Hoại — Thân Kim Cương', titleEn: 'Diamond Indestructible Body', descVi: '', descEn: '' },
  { order: 8, titleVi: 'Phi Thuyền Quyền — Quyền Bay', titleEn: 'Spacecraft Fist — Flying Fist', descVi: '', descEn: '' },
  { order: 9, titleVi: 'Hạt Bất Tử — Kích Hoạt Hạt Nguyên Tử', titleEn: 'Immortal Particle — Atomic Activation', descVi: '', descEn: '' },
  { order: 10, titleVi: 'Thái Dương Đại Pháp — Hoàn Thiện Năng Lượng', titleEn: 'Grand Solar Method — Energy Completion', descVi: '', descEn: '' },
]

function mergeMoves(firestorePractices) {
  if (firestorePractices && firestorePractices.length > 0) return firestorePractices
  return DEFAULT_MOVES
}

export default function PracticePage({ t, lang, practices }) {
  const moves = useMemo(() => mergeMoves(practices), [practices])

  return (
    <section className="practice-page fade-up">
      <div className="practice-header">
        <div className="practice-sun"><SunIcon size={60} /></div>
        <h1 className="practice-title">
          {lang === 'vi' ? 'Thái Dương Quyền' : 'Solar Fist (Thái Dương Quyền)'}
        </h1>
        <p className="practice-subtitle">
          {lang === 'vi' ? 'Võ Mặt Trời — Võ Năng Lượng Vũ Trụ' : 'Sun Martial Art — Cosmic Energy Martial Art'}
        </p>
      </div>

      <div className="practice-intro">
        <p>
          {lang === 'vi'
            ? 'Thái Dương Quyền là bộ võ năng lượng mặt trời, kết hợp giữa võ thuật cổ truyền Việt Nam và y học vũ trụ tiền Big Bang. Thực hành Thái Dương Quyền giúp kích hoạt năng lượng mặt trời trong cơ thể, tăng cường sức khỏe, tự chữa lành bệnh tật, và kết nối với nguồn năng lượng vũ trụ.'
            : 'Thái Dương Quyền (Solar Fist) is a solar energy martial art combining traditional Vietnamese martial arts with pre-Big Bang cosmic medicine. Practicing Solar Fist activates solar energy within the body, enhances health, self-heals diseases, and connects with cosmic energy sources.'}
        </p>
        <p>
          {lang === 'vi'
            ? 'Bộ võ gồm 10 động tác cơ bản, mỗi động tác kích hoạt một trung tâm năng lượng khác nhau trong cơ thể, từ hệ thống dây thần kinh ADN đến hạt nguyên tử bất tử.'
            : 'The art consists of 10 basic movements, each activating a different energy center in the body, from the DNA nervous system to the immortal atomic particle.'}
        </p>
      </div>

      <h2 className="practice-section-title">
        {lang === 'vi' ? '10 Động Tác Cơ Bản' : '10 Basic Movements'}
      </h2>

      <div className="practice-moves">
        {moves.map((move, i) => {
          const title = lang === 'vi' ? move.titleVi : move.titleEn
          const desc = lang === 'vi' ? move.descVi : move.descEn
          return (
            <div key={move.id || i} className={`practice-move fade-up fade-up-d${(i % 4) + 1}`}>
              <div className="practice-move-num">{String(move.order || i + 1).padStart(2, '0')}</div>
              <div className="practice-move-content">
                <h3 className="practice-move-title">{title}</h3>
                <p className="practice-move-desc">
                  {desc || (lang === 'vi' ? 'Hướng dẫn chi tiết đang cập nhật...' : 'Detailed instructions being updated...')}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
