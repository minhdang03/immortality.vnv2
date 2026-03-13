import SunIcon from '../components/SunIcon'

const MOVES = [
  { vi: 'Khởi Động Năng Lượng Mặt Trời', en: 'Solar Energy Activation' },
  { vi: 'Thái Dương Chưởng — Chưởng Mặt Trời', en: 'Solar Palm — Sun Palm Strike' },
  { vi: 'Hỏa Xà Quyền — Quyền Rắn Lửa', en: 'Fire Snake Fist' },
  { vi: 'Nhật Nguyệt Liên Hoàn — Mặt Trời Mặt Trăng Liên Kết', en: 'Sun-Moon Chain Strike' },
  { vi: 'Thiên Địa Quy Nhất — Trời Đất Hợp Nhất', en: 'Heaven-Earth Unification' },
  { vi: 'Vũ Trụ Xoay Chuyển — Xoáy Năng Lượng', en: 'Universe Rotation — Energy Vortex' },
  { vi: 'Kim Cương Bất Hoại — Thân Kim Cương', en: 'Diamond Indestructible Body' },
  { vi: 'Phi Thuyền Quyền — Quyền Bay', en: 'Spacecraft Fist — Flying Fist' },
  { vi: 'Hạt Bất Tử — Kích Hoạt Hạt Nguyên Tử', en: 'Immortal Particle — Atomic Activation' },
  { vi: 'Thái Dương Đại Pháp — Hoàn Thiện Năng Lượng', en: 'Grand Solar Method — Energy Completion' },
]

export default function PracticePage({ t, lang }) {
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
        {MOVES.map((move, i) => (
          <div key={i} className={`practice-move fade-up fade-up-d${(i % 4) + 1}`}>
            <div className="practice-move-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="practice-move-content">
              <h3 className="practice-move-title">{lang === 'vi' ? move.vi : move.en}</h3>
              <p className="practice-move-desc">
                {lang === 'vi' ? 'Hướng dẫn chi tiết đang cập nhật...' : 'Detailed instructions being updated...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
