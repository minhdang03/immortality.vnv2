/**
 * Đồ hình "Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân" — 10 bước.
 * pos  = toạ độ % trên artwork (viewBox 1024x1536, gốc trên-trái) — điểm neo glow node.
 * zoom = mức camera phóng vào node trên mobile (1 = toàn cảnh).
 * img  = hình cận cảnh của bước (crossfade trong card). Thay artwork → chỉ chỉnh tại đây.
 */
const stepImg = n => `/nang-luong/steps/step-${String(n).padStart(2, '0')}.webp`

export const ENERGY_INTRO = {
  vi: {
    title: 'Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân',
    subtitle: 'Cho chạy xuống lòng đất — Ra ngoài cơ thể',
    tagline: 'Không dùng luân xa — Hấp thu trực tiếp vào trung tâm não và các tuyến',
    scrollHint: 'Cuộn để bắt đầu dòng chảy',
    sources: ['Ánh sáng vũ trụ', 'Năng lượng mặt trời', 'Năng lượng mặt trăng', 'Khí trời, gió, đất, nước', 'Tình yêu thương, lòng biết ơn, niềm vui, sự thanh tịnh'],
    sourcesTitle: 'Nguồn năng lượng',
  },
  en: {
    title: 'Absorbing Energy — Nourishing the Whole Body',
    subtitle: 'Flowing down into the Earth — Released outside the body',
    tagline: 'No chakras — absorbed directly into the brain center and glands',
    scrollHint: 'Scroll to begin the flow',
    sources: ['Cosmic light', 'Solar energy', 'Lunar energy', 'Air, wind, earth, water', 'Love, gratitude, joy, serenity'],
    sourcesTitle: 'Energy sources',
  },
}

export const ENERGY_STEPS = [
  {
    id: 'hap-thu', num: 1, pos: { x: 50, y: 8 }, zoom: 1.6, img: stepImg(1),
    vi: { title: 'Hấp Thu Năng Lượng', points: ['Hấp thu năng lượng từ vũ trụ, ánh sáng, khí trời, thiên nhiên, đất trời…', 'Qua đỉnh đầu (trung tâm não giữa)', 'Dạng ánh sáng, khí, năng lượng tinh khiết'] },
    en: { title: 'Absorbing Energy', points: ['Absorb energy from the universe, light, air, nature, heaven and earth…', 'Through the crown (mid-brain center)', 'As light, breath, pure energy'] },
  },
  {
    id: 'nao-giua', num: 2, pos: { x: 50, y: 11.5 }, zoom: 2.1, img: stepImg(2),
    vi: { title: 'Trung Tâm Não Giữa', points: ['Nơi tiếp nhận và điều phối năng lượng chính', 'Kích hoạt toàn bộ hệ thống tuyến nội tiết và cơ quan', 'Tăng trí tuệ, sự sáng suốt, an định tâm trí'] },
    en: { title: 'Mid-Brain Center', points: ['Main receiver and coordinator of energy', 'Activates the entire endocrine system and organs', 'Enhances wisdom, clarity, and a settled mind'] },
  },
  {
    id: 'tuyen-tung', num: 3, pos: { x: 46, y: 13 }, zoom: 2.4, img: stepImg(3),
    vi: { title: 'Tuyến Tùng', points: ['Điều hòa nhịp sinh học', 'Giấc ngủ sâu, trực giác, kết nối tâm linh'] },
    en: { title: 'Pineal Gland', points: ['Regulates the biological rhythm', 'Deep sleep, intuition, spiritual connection'] },
  },
  {
    id: 'tuyen-yen', num: 4, pos: { x: 52, y: 14.5 }, zoom: 2.4, img: stepImg(4),
    vi: { title: 'Tuyến Yên', points: ['Điều khiển toàn bộ hệ thống tuyến nội tiết', 'Cân bằng hormone, tăng trưởng, phục hồi'] },
    en: { title: 'Pituitary Gland', points: ['Governs the entire endocrine system', 'Hormone balance, growth, recovery'] },
  },
  {
    id: 'tim-phoi', num: 5, pos: { x: 50, y: 31.5 }, zoom: 1.9, img: stepImg(5),
    vi: { title: 'Tim & Phổi', points: ['Năng lượng làm sạch và mở rộng lồng ngực, phổi', 'Tăng oxy, tăng tuần hoàn, giúp tim khỏe, cảm xúc an hòa'] },
    en: { title: 'Heart & Lungs', points: ['Energy cleanses and expands the chest and lungs', 'More oxygen, better circulation, a strong heart, peaceful emotions'] },
  },
  {
    id: 'thuong-than', num: 6, pos: { x: 44, y: 38.5 }, zoom: 2.1, img: stepImg(6),
    vi: { title: 'Tuyến Thượng Thận', points: ['Tăng sức chịu đựng, giảm stress', 'Điều hòa năng lượng, huyết áp, phản ứng cơ thể'] },
    en: { title: 'Adrenal Glands', points: ['Greater endurance, less stress', 'Regulates energy, blood pressure, bodily responses'] },
  },
  {
    id: 'tieu-hoa', num: 7, pos: { x: 52, y: 42.5 }, zoom: 2.1, img: stepImg(7),
    vi: { title: 'Hệ Tiêu Hóa', points: ['Năng lượng làm ấm, kích hoạt dạ dày, ruột, gan, tụy…', 'Tăng hấp thu, chuyển hóa, đào thải độc tố'] },
    en: { title: 'Digestive System', points: ['Energy warms and activates the stomach, intestines, liver, pancreas…', 'Better absorption, metabolism, detoxification'] },
  },
  {
    id: 'sinh-duc', num: 8, pos: { x: 50, y: 47.5 }, zoom: 2.1, img: stepImg(8),
    vi: { title: 'Tuyến Sinh Dục', points: ['Nam: tăng sinh lực, tinh khí — điều hòa hormone, cải thiện sinh lý', 'Nữ: cân bằng nội tiết tố — điều hòa chu kỳ, nuôi dưỡng, gìn giữ năng lượng nữ tính'] },
    en: { title: 'Reproductive Glands', points: ['Men: greater vitality and essence — balanced hormones, improved function', 'Women: balanced hormones — regulated cycles, nurturing feminine energy'] },
  },
  {
    id: 'lan-toa', num: 9, pos: { x: 50, y: 60 }, zoom: 1.15, img: stepImg(9),
    vi: { title: 'Lan Tỏa & Nuôi Dưỡng', points: ['Năng lượng lan tỏa khắp cơ thể: tế bào, cơ, xương, máu, thần kinh…', 'Tăng đề kháng, phục hồi tổn thương', 'Mang lại sức khỏe, sự tập trung, trí tuệ và bình an'] },
    en: { title: 'Radiating & Nourishing', points: ['Energy spreads through the whole body: cells, muscles, bones, blood, nerves…', 'Stronger immunity, healing of damage', 'Health, focus, wisdom and peace'] },
  },
  {
    id: 'long-dat', num: 10, pos: { x: 50, y: 84 }, zoom: 1.8, focusY: 0.62, cardTop: true, img: stepImg(10),
    vi: { title: 'Xuống Lòng Đất & Ra Ngoài Cơ Thể', points: ['Năng lượng dư thừa, độc tố, tạp khí được dẫn xuống chân', 'Trả về lòng đất, hòa vào nguồn năng lượng Trái Đất', 'Thải bỏ năng lượng xấu, khí độc qua mồ hôi, hơi thở, nước tiểu, đại tiện, da, lông, móng…', 'Cơ thể nhẹ nhàng, thanh sạch, tươi mới'] },
    en: { title: 'Into the Earth & Outside the Body', points: ['Excess energy, toxins and impurities are guided down the legs', 'Returned to the earth, merging with the planet’s energy', 'Negative energy and toxins leave through sweat, breath, urine, elimination, skin, hair, and nails…', 'The body feels light, clean and refreshed'] },
  },
]

// Đường năng lượng chính (viewBox 0 0 1024 1536): thiên hà → đỉnh đầu → cột sống → chân → rễ đất
export const ENERGY_PATH = 'M512,20 C512,80 512,140 512,205 C512,340 500,480 512,620 C520,760 512,900 512,1040 C512,1180 512,1300 512,1450'
