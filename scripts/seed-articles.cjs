/**
 * Seed 2 articles into Firestore using Firebase Admin SDK
 *
 * Setup:
 * 1. Go to Firebase Console → Project Settings → Service accounts
 * 2. Click "Generate new private key" → save as scripts/serviceAccountKey.json
 * 3. Run: node scripts/seed-articles.js
 */
const admin = require('firebase-admin')
const serviceAccount = require('../src/immortalityvn-firebase-adminsdk-fbsvc-a75c1f4b0e.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const articles = [
  {
    topic: '',
    date: '2026-03-13',
    tag: { vi: 'Mất Ngủ', en: 'Insomnia' },
    vi: {
      title: 'Phương pháp Phi Thuyền chữa mất ngủ kinh niên',
      question: 'Con bị đau đầu, mất ngủ 4 năm. Uống thuốc tây thì ngủ được, không uống là thức trắng.',
      summary: 'Phương pháp phi thuyền - du lịch không gian vũ trụ bằng tâm thức - giúp đốt rác thông tin trong não, chữa mất ngủ, stress, trầm cảm. Một người Mỹ mất ngủ mấy chục năm đã khỏi nhờ phương pháp này.',
      body: 'Có một người Mỹ cũng giống bạn, mấy chục năm trời. Sau này cô vợ người Việt học phương pháp phi thuyền, rồi ổng cũng hết.\n\nPhi thuyền là gì? Các bạn nhắm mắt lại, nhìn ra chỗ có ánh sáng và bóng tối. Đừng suy nghĩ gì. Suy nghĩ tới cũng được, nhưng đừng để ý tới nó. Chủ ý của bạn là nhìn ra thật xa, phóng ra ngoài vũ trụ, nơi có ánh sáng mờ mờ ảo. Đừng đâm thẳng vào ánh sáng, thấy nó sáng thì lắc qua, lắc lại, rồi bạn sẽ đi. Gọi là du lịch không gian vũ trụ.\n\nMột thời gian sau, bạn sẽ ngủ được. Đi du lịch xong rồi, bạn nghĩ tới "khách sạn thiên đường." Khi thấy nó hiện ra, sáng đẹp, có cây cảnh, bông hoa, nước, núi non đầy đủ, bạn đi vào đó. Vào thì sẽ thấy những thiên thần vũ trụ đón bạn, đưa vào phòng ngủ rất đẹp, trắng tinh, chung quanh có hoa thơm. Bạn nằm đó, nghĩ tới sáng thức dậy, đau đầu từ từ biến mất.\n\nNguyên lý theo người nói: Đau đầu, mất ngủ kinh niên là do não bị tắc nghẽn. Rác thông tin, hình ảnh quá nhiều chất đầy trong não. Tắc nghẽn não rồi lan xuống vai, gáy, cổ, cột sống lưng. Hai con mắt thịt nhìn thấy vật chất, hút vô não giữa. Não giữa đốt rác, lấy năng lượng vận hành cơ thể. Không biết đốt thì rác chất đống, não nóng lên giống hiệu ứng nhà kính, bực bội, mất ngủ.\n\nPhi thuyền tức là cho linh hồn đi ra ngoài vũ trụ du lịch, học hỏi. Ánh sáng vô đốt rác trong não, rác cháy xong lòi ra trí tuệ. Phương pháp này chữa được mất ngủ, stress, trầm cảm, đau nhức cơ thể.',
    },
    en: {
      title: 'The Spaceship Method for Chronic Insomnia',
      question: 'I have had headaches and insomnia for 4 years. Western medicine helps me sleep, but without it I stay awake all night.',
      summary: 'The spaceship method - cosmic travel through consciousness - helps burn information waste in the brain, curing insomnia, stress, and depression. An American man who suffered insomnia for decades was healed through this method.',
      body: 'There was an American man just like you, suffering for decades. Later, his Vietnamese wife learned the spaceship method, and he was cured.\n\nWhat is the spaceship? Close your eyes, look toward where there is light and shadow. Don\'t think about anything. Thoughts may come, but don\'t pay attention to them. Your intention is to look far away, projecting into outer space, where there is a faint, ethereal light. Don\'t fly straight into the light — when you see it shining, sway left and right, and you will go. This is called cosmic space travel.\n\nAfter some time, you will be able to sleep. When you finish traveling, think of "heavenly hotel." When you see it appear — bright and beautiful, with gardens, flowers, water, and mountains — enter it. Inside, celestial beings will welcome you, leading you to a beautiful, pure white room surrounded by fragrant flowers. Lie there, think about waking up in the morning, and your headache will gradually disappear.\n\nThe principle: Chronic headaches and insomnia are caused by brain congestion. Too much information waste and images fill the brain. This congestion spreads down to the shoulders, neck, and spine. Our physical eyes see material things, pulling them into the midbrain. The midbrain burns this waste to generate energy for the body. If you don\'t know how to burn it, waste piles up, the brain heats up like the greenhouse effect — causing irritability and insomnia.\n\nThe spaceship means letting your soul travel out into the universe to explore and learn. Light enters and burns the waste in the brain; when the waste burns away, wisdom emerges. This method can cure insomnia, stress, depression, and body aches.',
    },
  },
  {
    topic: '',
    date: '2026-03-13',
    tag: { vi: 'Tâm Linh', en: 'Spirituality' },
    vi: {
      title: 'Đừng nhốt Chúa hay Phật vào trái tim',
      question: 'Con theo đạo Công Giáo. Nhắm mắt nhìn sâu vào tim thì tim đập nhanh, hơi mệt, và con thấy hình ảnh. Quay nhìn ra ánh sáng cửa sổ thì con thấy Chúa Giêsu.',
      summary: 'Đừng nhốt hình ảnh Chúa hay Phật vào trái tim — sẽ gây ức chế, tim đập nhanh, mệt mỏi. Hãy nhìn ra ánh sáng, vì Chúa Giêsu đã nói "Ta là ánh sáng." Nhìn ánh sáng thì gặp Chúa thật sự, sống động.',
      body: 'Công giáo hay Phật giáo đều chung một mục đích: niềm tin tâm linh. Cái khác nhau giữa khoa học và tôn giáo nằm ở chỗ nào?\n\nBạn nói nhìn vào tim thì tim đập nhanh, mệt. Đó là vì bạn đang niệm Chúa vào tâm, vào tim. Bạn tưởng đưa vào nơi tôn quý, nhưng thực tế không phải vậy. Chúa hay Phật không phải để nhốt vào tâm. Chúng ta nhìn vào gương của họ, vào chân lý họ dạy, rồi thực hành để đạt được phẩm hạnh, yêu thương, cứu độ. Còn nhốt họ vào trong thì giống nhốt vào địa ngục.\n\nBạn đưa hình ảnh Chúa bị đóng đinh, đội vòng gai, máu me vào tim, thì làm sao tim không đau? Đưa ông Phật vào tâm cũng vậy, ông Phật đã chết rồi, đưa bức tượng vào thì nó ức chế thần kinh, não đơ, tim đơ, chết dần chết mòn. Tín ngưỡng mà không có khoa học thì thành mê tín.\n\nCái hên là bạn đã nhìn ra ánh sáng. Bạn đang cứu ông Chúa ra khỏi ngực tim của bạn đó. Đừng đưa vào nữa.\n\nChúa Giêsu nói "Ta là ánh sáng." Vậy sao không nhìn ánh sáng mà đi nhìn tượng chết? Bạn nhìn ánh sáng thì thấy hình ảnh Chúa sống động, nói chuyện được, giống thật. Đó mới là tu, là học. Chúa trực tiếp dạy bạn luôn.\n\nTrái tim cần tự do, đập tự do, hít thở tự do. Bạn nhìn vào ánh sáng thì tim hấp thu năng lượng, mạnh lên, đập ổn định. Còn đè lên tim bằng hình ảnh thì giống đặt viên đá lên ống nước, máu không chảy được, tắc nghẽn, dồn lên, nặng thì đột tử.\n\nĐừng quỳ lạy. Họ đâu có muốn bạn làm nô lệ. Ý họ muốn dạy bạn thành Phật, thành Chúa, chứ không phải thành chúng sinh. Trái tim rộng mở, tình yêu thương to lớn giống ánh sáng mặt trời chiếu hàng tỷ năng lượng nuôi muôn loài.',
    },
    en: {
      title: "Don't Trap Jesus or Buddha in Your Heart",
      question: "I'm Catholic. When I close my eyes and look deep into my heart, it beats fast and I feel tired, and I see images. When I look toward the window light, I see Jesus Christ.",
      summary: "Don't trap images of Jesus or Buddha in your heart — it causes suppression, rapid heartbeat, and fatigue. Look toward the light instead, for Jesus said 'I am the light.' Looking at the light, you'll meet the real, living Christ.",
      body: "Catholicism and Buddhism share the same purpose: spiritual faith. What is the difference between science and religion?\n\nYou say looking into your heart makes it beat fast and you feel tired. That's because you're chanting Christ into your heart. You think you're placing Him somewhere sacred, but that's not the case. Christ or Buddha is not meant to be locked in your heart. We look at their example, at the truth they taught, then practice to achieve virtue, love, and salvation. Locking them inside is like locking them in hell.\n\nYou're putting the image of Christ being crucified, wearing a crown of thorns, bleeding — into your heart. How could your heart not hurt? Putting Buddha into your heart is the same — Buddha has already passed, putting a statue inside suppresses your nerves, your brain freezes, your heart freezes, slowly dying. Faith without science becomes superstition.\n\nThe good news is you already looked toward the light. You are rescuing Christ from your chest. Don't put Him back in.\n\nJesus Christ said \"I am the light.\" So why look at a dead statue instead of looking at the light? When you look at the light, you see Christ vivid and alive, able to speak, looking real. That is true practice, true learning. Christ teaches you directly.\n\nThe heart needs freedom — to beat freely, to breathe freely. When you look at the light, your heart absorbs energy, grows stronger, beats steadily. But pressing images onto your heart is like placing a stone on a water pipe — blood can't flow, it gets blocked, builds up, and in severe cases leads to sudden death.\n\nDon't kneel in worship. They never wanted you to be a slave. Their intention was to teach you to become a Buddha, to become a Christ — not to remain a suffering being. An open heart with great love is like the sun radiating billions of energy units to nourish all living things.",
    },
  },
]

async function seed() {
  for (const article of articles) {
    const docRef = await db.collection('articles').add({
      ...article,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`Added: "${article.vi.title}" → ${docRef.id}`)
  }
  console.log('\nDone! 2 articles seeded.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
