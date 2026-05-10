const admin = require('firebase-admin')
const serviceAccount = require('../secrets/firebase-admin-sa.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

const article = {
  topic: '',
  date: '2026-03-18',
  tag: { vi: 'Thanh Lọc', en: 'Purification' },
  vi: {
    title: 'Thanh lọc cơ thể và năng lượng mặt trời',
    question: 'Máu xấu, nấm da đều ảnh hưởng đến gan thận.',
    summary: 'Thanh lọc cơ thể bằng thực phẩm tự nhiên và năng lượng mặt trời - nguồn tế bào gốc từ thượng đế giúp đề kháng mọi bệnh tật.',
    body: 'Ăn uống thanh lọc\n\nĂn nhiều rau xanh: rau bồ ngót, cải bẹ xanh, rau ngò rí. Uống nhiều nước. Cam, chanh, nước dừa, thơm. Uống nước trà búp sen, lá đu đủ, râu bắp, và các loại khác. Uống nhiều loại cho đủ đầy đủ chất thì mới tốt cho lục phủ ngũ tạng.\n\nĐường đi của năng lượng\n\nNhìn ánh sáng, thu hút năng lượng cho nó chạy vào trong não. Chạy xuống tuyến tùng, tuyến yên, thượng thận, tiến xuống hệ tiêu hóa, bộ phận sinh dục. Thanh lọc, làm sạch tế bào. Đưa các chất độc xuống dưới lòng đất.\n\nĐừng lưu giữ gì trong não\n\nĐiều cần nhớ: đừng lưu giữ bất cứ ý nào trong não. Cái biết nó đã tự lưu, sao chép thành năng lượng vào vũ trụ rồi. Chúng ta không cần nhớ. Nhớ là phải luân hồi.\n\nĐộng thực vật là năng lượng trung hòa\n\nNếu không hiểu tác dụng của động thực vật là năng lượng để trung hòa thì không tạo ra được nguồn năng lượng kháng thể. Hiểu rồi thì cơ thể đề kháng với bất cứ loại đau bệnh nào.\n\nTế bào gốc từ Mặt Trời\n\nNăng lượng mặt trời thực chất là tế bào gốc. Là vaccine thượng đế chích vào con người. Có thể đề kháng bất cứ loại virus nào, chất độc nào, luôn cả chất độc phóng xạ, bom nguyên tử. Chúng ta cũng có thể sống. Còn không thì chết nhanh.',
  },
  en: {
    title: 'Body Purification and Solar Energy',
    question: 'Bad blood and skin fungus both affect the liver and kidneys.',
    summary: 'Purifying the body through natural foods and solar energy — the source of stem cells from the Creator that helps resist all diseases.',
    body: 'Purifying Diet\n\nEat plenty of green vegetables: katuk leaves, mustard greens, and cilantro. Drink lots of water. Oranges, lemons, coconut water, pineapple. Drink lotus bud tea, papaya leaf tea, corn silk tea, and other varieties. Drink many types to get a full range of nutrients — only then is it good for all the organs.\n\nThe Path of Energy\n\nLook at the light, draw the energy and let it flow into the brain. It runs down through the pineal gland, pituitary gland, adrenal glands, then descends into the digestive system and reproductive organs. Purifying, cleansing the cells. Sending the toxins down into the earth.\n\nDo Not Store Anything in the Brain\n\nThe key thing to remember: do not store any thought in the brain. What is known has already saved itself, copied as energy into the universe. We do not need to remember. To remember is to reincarnate.\n\nPlants and Animals Are Neutralizing Energy\n\nIf you do not understand that the function of plants and animals is energy for neutralization, then you cannot create a source of antibody energy. Once you understand, the body can resist any kind of illness.\n\nStem Cells from the Sun\n\nSolar energy is essentially stem cells. It is the vaccine the Creator injects into humans. It can resist any virus, any toxin, including radioactive substances and atomic bombs. We can still survive. Otherwise, death comes quickly.',
  },
}

async function run() {
  const ref = await db.collection('articles').add({
    ...article,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log(`Added: "${article.vi.title}" → ${ref.id}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
