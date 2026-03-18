/**
 * Seed Khai Trí: NĂNG LƯỢNG, ÁNH SÁNG VÀ BẤT TỬ ĐẠO
 * Run: node scripts/seed-khaitri-nangluong.cjs
 */
const { seedCollection } = require('./firebase-client.cjs')

const items = [
  {
    date: '2026-03-18',
    tag: { vi: 'Năng Lượng', en: 'Energy' },
    vi: {
      title: 'Khai Trí: Năng Lượng, Ánh Sáng và Bất Tử Đạo',
      question: 'Bất Tử Đạo chủ yếu chỉ cho con người sử dụng năng lượng vật chất, chuyển đổi năng lượng cho bản thân mình và các vong linh?',
      summary: 'Giải đáp về bản chất năng lượng Big Bang, linh hồn của ánh sáng, sự khác biệt giữa Bất Tử Đạo và Phật giáo, bằng chứng sự sống bất tử, và cốt lõi của thực hành.',
      body: `Hỏi: Dạ thưa Thầy, con mới được tiếp xúc nghe Thầy giảng về năng lượng và ADN. Vậy Bất Tử Đạo chủ yếu chỉ cho con người sử dụng năng lượng vật chất, chuyển đổi năng lượng cho bản thân mình và các vong linh, rồi năng lượng này chuyển về hố đen để tái chế hoặc vào vũ trụ Big Bang?\nVấn đề ở đây: cái năng lượng đó bao gồm những yếu tố gì? Nó có trạng thái tâm thức hay không? Trạng thái ánh sáng năng lượng Big Bang nó như thế nào? Nó có từ bi, trí huệ, có linh hồn, hay nó chỉ là ánh sáng vô hồn? Nhờ Thầy khai thị chỗ này để chúng con rõ đường đi hơn ạ.

Đáp: Big Bang gồm hai nguồn năng lượng: điện âm và điện dương hút nhau. Giống như đàn ông đàn bà hút lấy nhau rồi sinh ra em bé. Vũ trụ thì tạo ra một vụ nổ lớn sinh ra vạn vật.\nMuốn tìm hiểu thêm nguyên lý năng lượng chứa gì thì phải học hỏi theo khoa học, kết hợp lại với thấy nghe biết hiểu, sẽ rõ ràng hơn.\nChúng ta được sinh ra từ sự va chạm, thúc đẩy, bùng nổ, tan vỡ từ mảnh nhỏ hạt bụi. Mệt mỏi, đau bệnh, ung thư, tai nạn đều đến từ sự va chạm thúc đẩy của Big Bang ADN. Không muốn đau bệnh chết thì chỉ có sự thấy, biết, hiểu và không va chạm. Chỉ trao đổi, chỉ yêu thương mà sống thì không gây ra chia ly.\nSự sống tự mỗi người đã đầy đủ. Không tranh giành, không phân biệt, không chiến tranh màu da sắc tộc, không phân biệt tôn giáo. Tất cả chúng ta là một. Lúc đó mới đạt được tình yêu thương đại đồng, hợp nhất một giống loài người, thương yêu nhau, giúp đỡ nhau, chia sẻ bình đẳng. Tương lai đó mới gọi là thiên đường tại thế: tự do, bình đẳng, trí tuệ, hạnh phúc viên mãn.

Hỏi: Vậy ánh sáng có linh hồn hay không?

Đáp: Bóng tối hay ánh sáng đều có linh hồn. Bóng tối linh hồn thì chứa đựng tất cả. Ánh sáng linh hồn thì ban phát cho tất cả. Ánh sáng chỉ có một, và nó chuyển đổi thành nhiều ánh sáng khác nhau, có màu sắc khác nhau, ngôn ngữ giao tiếp cũng khác nhau. Ánh sáng cuối cùng là ánh sáng vô nhiễm.

Hỏi: Còn nói về Phật giáo, theo con được tìm hiểu thì mỗi người nhìn lời Phật dạy ở nhiều góc cạnh khác nhau. Nhưng cốt lõi của đạo Phật hướng về tâm thức: vạn pháp duy tâm tạo, mình là chủ nhân của nghiệp thân ý khẩu, nhân duyên nhân quả, luân hồi sanh tử theo dòng nghiệp thức mà chính mình tạo tác. Điểm cuối đạo Phật: mọi việc đã trải nghiệm, việc làm đã xong, nhân quả trả vay đã hết, niết bàn tịch tĩnh, trạng thái biết hết thấu hết vạn pháp nhưng không còn dính vào nhân quả ba đường sáu cõi. Ý con biết vậy.

Đáp: Rồi ông Phật có thoát được chưa?\nÔng Phật là người chứng Đạo, thấy được Đạo, chứ không phải là người đạt Đạo. Ông Phật nói về tánh không nhưng lại nói về tâm có, cho nên vẫn còn dính chấp và không nhập vào Bất Tử Đạo được. Cho nên vẫn phải chết.\nNói rằng linh hồn để được giải thoát, nhưng hồn không độ được xác thì vẫn phải quay lại luân hồi mãi mãi, vì bài học vẫn chưa xong. Ông Phật không biết cách dạy, cũng không biết cách độ ai cả. Chính ông ta cũng nói như vậy. Những người học vẫn u mê, vẫn tìm về cõi chết là bóng tối, chứ không phải tìm về ánh sáng để được sống bất tử tại thế.\nBất Tử Đạo giảng là Không Đạo. Cho nên không có giáo chủ, không có tâm, không có tánh, không có giới luật, không có cúng dường quỳ lạy, không có đau bệnh ung thư tai nạn, không có địa ngục. Chỉ có thiên đường ánh sáng. Ai học về Không Đạo thì vào được.\nNếu đạo Phật ok thì bây giờ đâu có lòi ra những cái ung thư thối hoắc? Tiền cúng dường cho Phật mấy ngàn năm nay lên đến hàng tỷ tỷ đô. Nếu đem tiền đó xây dựng thì đã được thiên đường tại thế rồi, không phải địa ngục trần gian.

Hỏi: Vậy bằng chứng sự sống bất tử nằm ở đâu?

Đáp: Vũ trụ đã cho chúng ta thấy rồi. Rùa ăn uống thô sơ, không y tế chăm sóc, mà vẫn sống hơn 200 tuổi. Thực vật cũng vậy: phía trên ngọn lá hút năng lượng ánh sáng mặt trời, va chạm với metan dưới lòng đất, tạo ra khí oxy cho vạn vật hưởng thụ. Ban đêm thì hút oxy lại, thải ra metan carbon. Đó là hành trình sự sống hơn 4000 năm tuổi, sờ sờ trước mắt. Chưa nói đến các loại linh thạch: thạch anh, ruby, hột xoàn, kim cương, tuổi thọ lên đến hàng triệu tỷ năm.\nCái mà chúng ta thấy thì không chịu thấy. Cái ông Phật chỉ là lý thuyết suông mà vẫn lắm người tin. Nếu ông ta hay thì tại sao lại đi ăn nấm độc rồi chết? Trí tuệ ở chỗ nào?\nĐây là trí tuệ khoa học vũ trụ. Ai thích thì học, không thích thì thôi.

Hỏi: Bất Tử Đạo là tổ tiên ông bà cha mẹ, cởi mở, là thiên đường. Vậy khi trở về thiên đường rồi thì còn cần gì nữa?

Đáp: Bất Tử Đạo không có tôn giáo, không có giáo chủ. Ai muốn đến thì đến, ai muốn đi thì đi. Không dụ ai vào đạo, cũng không khủng bố tâm tánh ai cả. Vì trong mỗi con người đều có Không Đạo, trí tuệ toàn năng, quyền năng sáng tạo, đầy đủ viên mãn rồi.\nKhi chúng ta trở về thiên đường rồi, thì còn chướng ngại, cố chấp, giới luật của ông Phật để làm gì? Lúc này trí tuệ đã đầy đủ rồi, chỉ có độ tận chúng sinh mà thôi.\nHãy nghĩ: hơn 8 tỷ người đều vào Không Đạo, lúc đó còn chiến tranh, phân biệt sắc tộc, màu da, tôn giáo nào tồn tại để phân biệt chính tà hơn thua nữa hay không? Lúc đó thế giới này là thiên đường hạnh phúc, yêu thương, tự do, bình đẳng. Đây cũng chỉ là một lý thuyết, nhưng phải được thực hành liên tục trong một thời gian lâu dài.

Hỏi: Vậy cốt lõi được đưa lên hàng đầu có phải là niềm tin vào sự thật không? Trong khi nhiều người thấy, biết được điều này, thực hành, nhưng nhiều người lại bảo viễn vông, tinh thần bất ổn, rồi chấp nhận cái chết?

Đáp: Cốt lõi không phải là lý thuyết và niềm tin, mà là thực hành để chứng thực. Khi mình cảm nhận được nó rất tốt cho bản thân, tinh thần và trí tuệ của mình, thì lúc đó mới gọi là tạm tin chính mình. Rồi thực hành tiếp, đến khi không còn dính chấp, không còn nghi ngờ, tiếp tục tự tin đi trên con đường mà mình chọn.\nCòn những người không làm được, bất ổn, chấp nhận cái chết, là vì họ tin theo một tôn giáo, một Phật giáo, thì họ phải chịu.\nĐây là một phương pháp khoa học vũ trụ năng lượng ánh sáng trí tuệ. Nói theo Phật học thì gọi là chánh tinh tấn. Nói theo Thiên Chúa học thì là đức tin Tin Lành.`,
    },
    en: {
      title: 'Khai Trí: Energy, Light and the Immortality Path',
      question: '',
      summary: '',
      body: '',
    },
  },
]

seedCollection('khaitri', items).catch(err => { console.error('❌', err.message); process.exit(1) })
