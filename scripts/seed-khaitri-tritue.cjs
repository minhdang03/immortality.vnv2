/**
 * Seed Khai Trí: TRÍ TUỆ, TỰ DO VÀ MẮT THẦN THỨ BA
 * Run: node scripts/seed-khaitri-tritue.cjs
 */
const { seedCollection } = require('./firebase-client.cjs')

const items = [
  {
    date: '2026-03-21',
    tag: { vi: 'Trí Tuệ', en: 'Wisdom' },
    vi: {
      title: 'Khai Trí: Trí Tuệ, Tự Do và Mắt Thần Thứ Ba',
      question: 'Mong muốn của em là nâng cao trí tuệ hết sức có thể.',
      summary: 'Giải đáp về trí tuệ và tự do, nô lệ trí tuệ, những kẻ giấu mặt kiểm soát nhân loại, mở rộng tầm nhìn, và khai mở con mắt thứ ba (trung tâm não giữa).',
      body: `Hỏi: Mong muốn của em là nâng cao trí tuệ hết sức có thể.

Đáp: Vậy em mong muốn nâng cao trí tuệ để làm gì?

Hỏi: Em muốn nâng cao trí tuệ để bản thân trở nên tự do hơn, không bị ràng buộc, và có thể truyền được nhiều kiến thức hơn cho con cháu.

Đáp: Không đơn giản đâu.

Hỏi: Mong anh nói thêm vì em chưa hiểu hết được. Em nghĩ là tuỳ vào cách nhìn nhận của mỗi người.

Đáp: Đúng. Trí tuệ đem lại lợi ích rất to lớn cho loài người. Như khi thấy có hàng tỷ người đang sống trong nô lệ, trong trí tuệ độc tôn, thì em sẽ làm gì?

Hỏi: Em sẽ giành tự do của em, sau đó giúp đỡ cho những người muốn thoát ra khỏi sự nô lệ này.

Đáp: Giúp người muốn thoát ra khỏi sự nô lệ thì cũng dễ. Nhưng đa số người bị nô lệ trí tuệ, họ không biết. Họ còn rất tự hào về sự nô lệ. Thậm chí có người còn nói rằng họ thích được nô lệ.
Vậy em sẽ làm gì để thức tỉnh họ?

Hỏi: Trước tiên em sẽ gợi cho họ những lợi ích thật sự khi không bị nô lệ. Gợi ý cho họ thay đổi môi trường sống, suy nghĩ, để họ dần thức tỉnh khỏi ách nô lệ.

Đáp: Có những chủ nô. Là những ai, em có biết hay không?

Hỏi: Em bị nô lệ bởi chính sự thiếu hiểu biết của mình. Bị nô lệ cho những suy nghĩ lạc hậu của ông bà cha mẹ. Những định kiến, những bộ lọc đặt vào não từ khi còn bé.

Đáp: Đúng, nhưng vẫn chưa đủ. Còn rất nhiều kẻ giấu mặt. Em chưa chỉ ra được hết những cái hạn chế. Những kẻ giấu mặt sẽ bị lộ mưu mô sau khi người dân thoát ra được những hạn chế trước mắt, để họ dần tỉnh táo và nhìn ra những thứ hạn chế nguy hiểm hơn.

Hỏi: Vâng ạ, phải tự lo cho bản thân tốt trước khi giúp mọi người. Hôm nay đọc bình luận của anh trong một bài viết, em chợt nhận ra cách nhìn nhận của em vẫn còn hạn hẹp. Không biết anh có gợi ý nào giúp em mở rộng tầm nhìn?

Đáp: Tầm nhìn thì có hàng trăm ngàn hướng: tầm ngắn, tầm dài, rộng, cao, sâu. Em phải hỏi đúng tầm nhìn của mình. Em muốn nhìn về cái gì?

Hỏi: Tầm sâu ạ. Nhìn nhận mọi thứ xung quanh em trong đời sống thường ngày, và cả nhìn vào bên trong bản thân em, hiểu rõ, hoàn thiện bản thân.

Đáp: Muốn có tầm nhìn như ý thì gọi nó là mắt thần thứ ba, trung tâm não giữa. Muốn khai mở con mắt thứ ba thì cũng không khó lắm. Cái khó ở đây là chúng ta phải biết, phải hiểu rõ về sự lợi hại của nó khi được khai mở. Tức là ta đang giải thoát linh hồn của mình ra khỏi sự giam cầm và bị trấn ếm, hay tu luyện, thiền luyện.

Hỏi: Em nghĩ rằng cái hại phải chăng là dù ta đã tự do nhưng linh hồn vẫn đang trải nghiệm qua cơ thể, nên mới có cái hại?

Đáp: Cái hại là do mình không biết gì về linh hồn của mình, và mình vô tình bán rẻ linh hồn cho quỷ dữ làm nô lệ. Sợ thêm một lần nữa, linh hồn rất sợ phải bị chính chúng ta lại bắt nhốt vào cái nơi tăm tối của địa ngục trần gian.
Linh hồn đã trải nghiệm qua bao tỷ năm rồi, nhưng vẫn phải học thêm những cái mới về hiện tại.

Hỏi: Em đồng ý. Nhiều người vẫn tự giam mình vào những hình thức nô lệ. Bản thân trải nghiệm cái mới là cần thiết cho phát triển và tiến hoá?

Đáp: Đúng vậy.`,
    },
    en: {
      title: 'Khai Trí: Wisdom, Freedom and the Third Eye',
      question: 'My wish is to elevate my intellect as much as possible.',
      summary: 'Discussion on wisdom and freedom, intellectual slavery, hidden controllers of humanity, expanding vision, and opening the third eye (the pineal gland center).',
      body: `Q: My wish is to elevate my intellect as much as possible.

A: So what do you want to elevate your intellect for?

Q: I want to elevate my intellect so that I become freer, unbound, and can pass on more knowledge to my children and grandchildren.

A: It's not that simple.

Q: Please explain more because I don't fully understand. I think it depends on each person's perspective.

A: Correct. Wisdom brings enormous benefits to humanity. When you see billions of people living in slavery, in intellectual tyranny, what would you do?

Q: I would fight for my own freedom first, then help those who want to escape this slavery.

A: Helping people who want to escape slavery is easy enough. But the majority of people enslaved intellectually don't even know it. They are even proud of their slavery. Some even say they enjoy being enslaved.
So what would you do to awaken them?

Q: First, I would show them the real benefits of not being enslaved. Suggest they change their environment, their thinking, so they gradually awaken from the yoke of slavery.

A: There are slave masters. Do you know who they are?

Q: I am enslaved by my own ignorance. Enslaved by the backward thinking of my grandparents and parents. The prejudices, the filters implanted in my brain since childhood.

A: Correct, but still not enough. There are many hidden figures. You haven't identified all the limitations. These hidden figures will be exposed after people break free from the immediate limitations, becoming clear-headed enough to see the more dangerous restrictions.

Q: Yes, one must take care of oneself first before helping others. Today, reading your comment on a post, I suddenly realized my perspective is still narrow. Do you have any suggestions to help me broaden my vision?

A: Vision has hundreds of thousands of directions: short-range, long-range, wide, high, deep. You must ask about the right vision for yourself. What do you want to see?

Q: Deep vision. Perceiving everything around me in daily life, and also looking within myself, understanding clearly, perfecting myself.

A: To have such vision, it is called the third eye, the center of the midbrain. Opening the third eye is not too difficult. The difficulty lies in knowing and understanding the benefits and dangers when it is opened. That is, we are liberating our soul from imprisonment and suppression, through cultivation and meditation practice.

Q: I think the danger is perhaps that even though we are free, the soul is still experiencing through the body, hence the danger?

A: The danger is because we know nothing about our own soul, and we inadvertently sell our soul cheaply to demons as slaves. Fearful once more, the soul is terrified of being imprisoned again by us into the dark place of earthly hell.
The soul has experienced through billions of years, but still needs to learn new things about the present.

Q: I agree. Many people still imprison themselves in forms of slavery. Experiencing new things is necessary for development and evolution?

A: That's right.`,
    },
  },
]

seedCollection('khaitri', items).catch(err => { console.error('❌', err.message); process.exit(1) })
