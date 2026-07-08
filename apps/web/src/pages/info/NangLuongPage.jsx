import BigBangIntro from '../../components/nangluong/BigBangIntro'
import ScrollStory from '../../components/nangluong/ScrollStory'
import CosmicBackdrop from '../../components/nangluong/cosmic-backdrop'

/**
 * Trang /nang-luong — đồ hình "Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân".
 * Bố cục: nền sao vũ trụ (suốt trang) → Big Bang intro cinematic (skip được)
 * → scroll story (10 bước, pin). Hết — không explore/outro.
 */
export default function NangLuongPage({ lang }) {
  return (
    <div className="nl-page">
      {/* Vũ trụ: sao parallax + hyperspace + sao băng — delay sao nở đúng lúc Big Bang nổ */}
      <CosmicBackdrop delay={1940} />

      {/* Intro "Khai Thiên" — hư không → Big Bang → ánh sáng chiếu vào não (kèm strip nguồn năng lượng) */}
      <BigBangIntro lang={lang} />

      {/* Scroll story — 10 bước ghim màn hình */}
      <ScrollStory lang={lang} />
    </div>
  )
}
