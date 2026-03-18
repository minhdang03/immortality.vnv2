#!/usr/bin/env python3
"""Update Story 16 (existing doc) with full content"""
import sys, json, urllib.request
sys.path.insert(0, __import__('os').path.dirname(__file__))
from importlib import import_module
sf = import_module('seed-firestore')

DOC_ID = 'ivi3TXPzb57aDk9CaQNz'

contentVi = '''Cô Út, 30 tuổi, nhờ thầy đến nhà xem hộ:
– Chị Huệ bị bệnh gì mà khi lạnh thì đổ mồ hôi lạnh, nước từ trên đỉnh đầu nhỏ giọt xuống tới bàn chân. Còn khi hết lạnh thì có một cục lửa nóng chạy tới đâu đốt nóng tới đó. Đi bệnh viện xét nghiệm siêu âm chẩn đoán cũng không biết bệnh gì. Đến thầy bà cúng giải cũng chưa khỏi.
Cô Út kể tiếp:
– Sau đó em được người từ bên Mỹ về giới thiệu pháp môn tu thiền của sư phụ Thanh Hải Vô Thượng Sư. Em đã thọ pháp, ngồi thiền, ăn chay, niệm danh hiệu sư phụ. Một thời gian thì bệnh nóng lạnh cũng tạm thời chấm dứt.
– Khi quán Ánh Sáng và quán Âm Thanh, em nhìn thấy được những vong hồn đi theo phía sau lưng xuống cầu thang, tóc dài che phủ khuôn mặt. Lúc đó em chưa biết sợ vì nghe những đồng tu nói: khi nhìn thấy vong hồn người chết thì niệm danh hiệu sư phụ, sư phụ sẽ xuất hiện đưa vong ma đi. Cho nên em mới kêu vong hồn đó cho em nhìn thấy mặt.
– Vong hồn đó liền đưa bàn tay xương xẩu, móng tay nhọn hoắt, vén mái tóc dài bùi nhùi lên. Khuôn mặt xương khô, hai hốc mắt lõm sâu màu đen, cái xương mũi trắng hếu, còn cái miệng toàn là xương với răng, hai hàm răng vàng ố chạm vào nhau kêu lọc cọc. Vong hồn nói: "Khuôn mặt tao nè. Có đẹp không?"
– Vừa nhìn thấy khuôn mặt ma quái, em sợ quá, thân hình rung lọc cọc, một luồng khí lạnh chạy vào cơ thể. Em cầu xin sư phụ Thanh Hải Vô Thượng Sư đến cứu. Nhưng chờ hoài chẳng thấy sư phụ đâu. Vong hồn đó biến mất.
– Rồi em đi nằm ngủ, đang mơ màng thì bị người đàn ông đó đè lên người. Em sợ quá, ánh sáng từ trán bắn ra, vong hồn đó tan biến. Sau đó phải nằm nghiêng một bên ngủ thì không bị ma đè nữa. Em cầu xin sư phụ đừng cho con nhìn thấy hồn ma nữa.

Người Bất Tử nhìn sơ qua, cảm thấy ớn lạnh nổi da gà. Ngôi nhà này âm khí nặng nề. Một bên thờ cửu huyền, một bên thờ Quan Công, ở giữa bàn thờ Phật, Bà Quan Âm.
– Cô Huệ ngồi xuống ghế, dựa thẳng lưng, đầu nhìn thẳng về phía trước. Để tôi xem bệnh. Tình trạng của cô là bị bệnh ADN trong tiền kiếp. Bệnh này gọi là sốt rét ma nước.
Người Bất Tử bàn tay phải phóng ra một tia ánh sáng màu trắng vàng xuyên vào giữa trán cô Huệ.
Cô Huệ giật mình, hai tay chới với:
– Cứu tôi với!
Tiếng nói của một người con gái vang lên.
Cô Út:
– Ai vậy thầy?
Người Bất Tử:
– Một cô gái còn trẻ bị té xuống cái ao sen chết đuối nước.
Hai bàn tay liền chụp hai cổ tay cô gái kéo lên khỏi mặt nước.
– Cô là ai?
– Tôi là cô ruột của cháu Huệ.
Cô Út:
– Cô có phải là cô Quế?
– Đúng rồi. Con là ai?
– Con là Út Hường, con của mẹ Hương.
– Tại sao cô bị té xuống ao sen?

Cô Quế kể: Hôm đó cô đi dự tiệc sinh nhật bạn, có uống chút bia. Khi về gần đến nhà, cô Quế bước xuống cầu ván trong ao sen để rửa mặt súc miệng cho hết mùi rượu bia. Đang ngồi trên cầu thả hai chân xuống nước thì bỗng có một bàn tay người đàn ông lông lá xanh rêu từ dưới ao giơ cao lên, chụp vào cổ chân kéo xuống nước.
Cô Quế chới với miệng la lớn: "Cứu tôi với!" Hai tay cô cố bám vào cây cầu. Lúc đó không có ai. Cô bị lôi tuột xuống chỗ nước sâu và chết ngạt.
Trước mắt cô Quế là một người đàn ông trung niên, hai con mắt trắng giã lồi ra ngoài, da mặt lở loét, quần áo lính tơi tả. Hai tay ôm cô vào lòng, cái miệng lở loét hôn vào đôi môi rồi thì thầm:
– Em đẹp lắm. Nhiều lần em đến đây rửa mặt, anh đã nhìn thấy em say đắm nhưng chưa có dịp. Hôm nay trời xui đất khiến, hai đứa mình được ở bên nhau.
Cô Út:
– Rồi người đàn ông đó bây giờ đang ở đâu?
Bỗng Ma Lính từ dưới nước bay người lên, chụp hai chân cô Quế kéo xuống nước.
Cô Quế hoảng sợ kêu la:
– Thầy ơi cứu tôi!
Người Bất Tử hai bàn tay chụp hai tay hồn cô Quế kéo lên:
– Mày là ai, sao dám bắt hồn cô Quế?
Ma Lính:
– Tao là chồng của cô ấy. Còn mày là ai mà dám xen vào chuyện của tao?
Người Bất Tử:
– Mày có đến nhà mai mối và cưới hỏi hay không?
Ma Lính:
– Tao là ma chết ở ao sen. Tao không có lên bờ được.
Người Bất Tử:
– Vậy là mày đã giết cô ấy. Tội mày nặng lắm.
Ma Lính:
– Tao không cố tình. Cô ấy thân hình lảo đảo té nhào xuống nước. Tao đã cố đẩy cô ấy lên nhưng mà không được.
Người Bất Tử:
– Bây giờ mày hãy buông chân cô ấy ra. Tao sẽ giúp mày và hồn cô ấy được giải thoát khỏi ao sen này.
Ma Lính:
– Tao không buông. Cô ấy là vợ của tao.
Cô Quế:
– Thưa thầy, tôi không phải là vợ của hắn. Nhờ thầy cứu giúp để tôi được siêu thoát khỏi tên ma ác này.
Người Bất Tử:
– Ông đã nghe cô này nói rồi đó. Hãy buông tay đi.
Ma Lính liền há miệng phun ra một luồng nước bùn sình hôi thối bay thẳng vào mặt.
Người Bất Tử chỉ kịp nhắm hai con mắt lại. Bùn sình bắn trúng mặt. Mùi hôi thối bốc lên nồng nặc.

Cô Út bàn tay phải cầm con dao gọt trái cây trên bàn lên, đâm vào mu bàn tay Ma Lính. Nghe cái bụp! Máu phun lên màu xanh rêu.
Ma Lính buông chân hồn cô Quế ra.
Người Bất Tử mở mắt ra, kéo mạnh hồn cô Quế bay lên khỏi ao sen.
Ma Lính khuôn mặt co giật, hai con mắt lồi ra, lỗ mũi chảy xuống hai dòng máu xanh, miệng há to, hai cái răng nanh lòi ra trắng hếu, bay vọt lên bờ. Bàn tay lông lá cầm cây súng lục bóp cò. Đùng đùng đùng! Ba viên đạn ma đen xì bay xoáy tới.
Người Bất Tử bàn tay phải đánh ra một luồng ánh sáng đỏ. Ba viên đạn bay ngược trở lại, ghim vào hai con mắt và giữa trán. Ba dòng máu xanh rêu chảy xuống khuôn mặt. Ma Lính cơ thể co giật.
Người Bất Tử bay tới, bàn tay biến ra một cây dao mã tấu chém xuống giữa đỉnh đầu.
Ma Lính hai tay chắp lại:
– Cầu xin thầy hãy tha mạng cho tôi.
Người Bất Tử dừng tay:
– Ông đã biết tội lỗi của mình gây ra hay chưa?
Ma Lính:
– Tôi rất hối hận vì đã không giúp được cho cô gái này thoát chết đuối nước. Vì tôi cũng bị bắn chết ở ao sen này.
Người Bất Tử:
– Ông có muốn được xoá sạch bệnh tật và hoàn hồn để siêu thoát khỏi nơi đây hay không?
Ma Lính:
– Tôi đã nằm dưới ao sen này nhiều năm rồi. Rất cô đơn, lạnh lẽo và buồn chán. Khi cô Quế rớt xuống nước chết, tôi rất mừng vì có người bầu bạn và tâm sự. Nhưng bây giờ tôi đã hiểu. Xin cô Quế và người thân trong gia đình hãy thương tình hỷ xả, tha thứ cho tôi.
Hồn cô Quế:
– Tôi cũng rất hối hận vì nghe lời bạn bè uống rượu bia và bị té chết, còn báo hại cho đứa cháu Huệ phải bị bệnh sốt rét ma hành hạ. Con hãy tha lỗi cho cô Quế nhé.
Cô Huệ:
– Là một câu chuyện buồn. Một bài học đắt giá cho những ai không biết nghe lời cha mẹ. Thôi cô hãy nhờ thầy giúp chữa bệnh hoàn linh hồn để được siêu thoát.
Cô Út:
– Con chúc cô được về thiên đàng ánh sáng.

Hồn cô Quế:
– Xin thầy chữa bệnh và hoàn hồn giúp cho.
Người Bất Tử phóng một luồng ánh sáng trắng vàng vào đầu. Hồn cô Quế há miệng ói ra bùn sình hôi thối. Linh hồn sáng đẹp bay lên vũ trụ biến mất.
Ma Lính miệng ói ra bùn sình hôi thối, quần áo lính cháy tan. Cơ thể được ánh sáng hồi sinh. Linh hồn sáng đẹp bay về vũ trụ.

Cô Huệ, mồ hôi lạnh đã ngưng chảy, cơ thể dần ấm nóng lại:
– Em cũng đã nhìn thấy ánh sáng nhưng không biết cách sử dụng. Thầy có thể chỉ phương pháp dùng ánh sáng để chữa bệnh và siêu độ vong hồn cho em học được không? Vì sau khi cha mẹ qua đời thì bệnh nóng lạnh lại tái phát.
Người Bất Tử:
– Nếu cô ngồi thiền theo kiểu kiết già lâu năm thì rất dễ bị u xơ u nang buồng trứng. Em có hay đau ở dưới vùng bụng dưới rốn hay không?
Cô Huệ:
– Có hay đau. Đi khám phụ khoa bác sĩ cho biết bị u nang đa nhân xơ buồng trứng.
Cô Út Hường:
– Tại sao ngồi thiền kiểu kiết già thì dễ bị u nang u xơ buồng trứng vậy thầy?
Người Bất Tử:
– Khi hai đường ống dẫn khí huyết bị bẻ cong, khí huyết không lưu thông trong thời gian 2 giờ thì chuyện gì sẽ xảy ra?
Cô Út Hường có học về ngành y nên cũng biết:
– Phần dưới hai chân sẽ bị lạnh teo và bị liệt. Còn phần trên sẽ bị co lại, lâu ngày sẽ bị u nang u xơ, co giãn động tĩnh mạch.
Người Bất Tử:
– Cho nên hai luồng khí nóng và khí lạnh bất hòa, mới có hiện tượng lạnh chảy mồ hôi lạnh và nóng đốt chảy mồ hôi nóng.
Cô Huệ:
– Hôm qua em bị đau bụng dưới quá, đi bệnh viện phụ sản khám. Bác sĩ chẩn đoán bị u nang đa nhân xơ phải mổ. Nghe nhiều người nói khi mổ rồi thì vẫn sẽ tái phát. Em sợ quá, nhờ thầy giúp chữa.
Người Bất Tử bàn tay phải để trên đỉnh đầu, thiền năng lượng ánh sáng chạy xuống tới dưới:
– Em có cảm nhận luồng hơi nóng chạy xuống dưới bụng tử cung và xuống hai chân ra ngoài hay không?
Cô Huệ:
– Em có cảm nhận được rồi ạ. Hơi nóng chạy vào tới đâu thì những cơn đau hình như tan biến mất.
Người Bất Tử:
– Mỗi ngày em chỉ cần làm đúng theo hướng dẫn thì sẽ mau lành bệnh. Vì năng lượng ánh sáng nóng chạy làm thông kinh mạch và dẫn khí huyết chạy vào những nơi bị bế tắc, thông rác cholesterol ứ đọng trong mạch. Cholesterol xấu tụ thành u nang đa nhân xơ, gây đau bụng cấp ở phía dưới rốn, đường sinh dục nữ. Kết hợp uống nước lọc và giảm ăn dầu mỡ chất béo, ăn nhiều rau xanh để tạo pH tốt.
Trong 7 ngày, các u nang đa nhân xơ đã teo nhỏ dần và tan biến mất.
Cô Huệ:
– Em bị u nang ở ngực bên phải. Khi đau sờ vào có một cục tròn nhỏ bằng hạt đậu. Chắc ngày mai em sẽ đi bệnh viện khám ngực.
Người Bất Tử:
– Không sao đâu. Thầy sẽ hướng dẫn em chữa u ngực đúng cách thì sẽ tan hết ngay.
Sau khi phóng năng lượng vào u nang ngực, đau nhức đã giảm. Ngày sau cô Huệ báo cáo: u nang ngực đã tan biến mất.'''

contentEn = '''Miss Ut, 30 years old, asked the master to visit:
– My sister Hue has a strange illness. When cold, she sweats cold water dripping from the top of her head down to her feet. When the cold stops, a ball of fire runs through her body burning wherever it goes. Hospitals can't diagnose it. Spiritual healers can't cure it.
Miss Ut continued:
– Someone from America introduced Supreme Master Ching Hai's meditation method. I received the dharma, meditated cross-legged, ate vegetarian, chanted the master's name. After a while, the hot-cold symptoms temporarily stopped.
– When practicing Light and Sound meditation, I could see ghosts following behind me down the stairs, long hair covering their faces. I wasn't afraid because fellow practitioners said: when you see dead spirits, chant the master's name and the master will appear to take them away. So I asked the ghost to show me its face.
– The ghost raised a bony hand with sharp nails, parted its tangled long hair. A dried skull face, two deep black eye sockets, white nasal bone, a mouth of nothing but bone and teeth, yellow-stained teeth clacking together. The ghost said: "Here's my face. Am I beautiful?"
– The moment I saw that terrifying face, I was shaking, a cold energy rushed into my body. I begged Supreme Master Ching Hai to come save me. But waited and waited, no master appeared. The ghost vanished.
– Then I went to sleep, was half-dreaming when that man pressed down on me. Terrified, light shot from my forehead and the ghost disappeared. After that I had to sleep on my side to avoid being pressed down again. I begged the master to never let me see ghosts again.

The Immortal glanced around, felt chills and goosebumps. This house was heavy with dark energy. One side had an ancestral altar, one side had Guan Gong, in the middle was a Buddhist altar with Guanyin.
– Sister Hue, sit down straight, look straight ahead. Let me examine. Your condition is past life ADN disease. This illness is called malaria from water ghosts.
The Immortal's right hand shot a beam of white-gold light into the center of Hue's forehead.
Hue startled, arms flailing:
– Help me!
A young woman's voice rang out.
Miss Ut:
– Who is that, master?
The Immortal:
– A young woman who fell into a lotus pond and drowned.
He grabbed both wrists and pulled the girl up from the water.
– Who are you?
– I am Hue's paternal aunt.
Miss Ut:
– Are you Aunt Que?
– Yes. Who are you?
– I'm Ut Huong, daughter of Mother Huong.
– Why did you fall into the lotus pond?

Aunt Que told her story: She went to a friend's birthday party, drank some beer. Coming home, she stepped onto the wooden bridge over the lotus pond to wash her face and rinse her mouth to remove the alcohol smell. Sitting on the bridge with feet dangling in the water, suddenly a hairy green-mossy male hand reached up from below and grabbed her ankle, pulling her down.
Aunt Que flailed, screaming: "Help me!" Her hands gripped the bridge. No one was around. She was dragged into deep water and suffocated.
Before her eyes was a middle-aged man, white bulging eyes, ulcerated skin, tattered soldier's uniform. He embraced her, his ulcerated mouth kissing her lips, whispering:
– You're so beautiful. Many times you came here to wash your face, I watched you with longing but never had the chance. Today fate brings us together.
Miss Ut:
– Where is that man now?
Suddenly the Soldier Ghost flew up from the water, grabbed Aunt Que's feet and pulled her down.
Aunt Que screamed:
– Master, save me!
The Immortal grabbed both hands of Aunt Que's soul and pulled up:
– Who are you? How dare you capture Aunt Que's soul?
Soldier Ghost:
– I'm her husband. Who are you to interfere?
The Immortal:
– Did you ever go to her family to propose and marry her properly?
Soldier Ghost:
– I'm a ghost who died in this lotus pond. I can't go ashore.
The Immortal:
– Then you killed her. Your crime is heavy.
Soldier Ghost:
– I didn't mean to. She was stumbling and fell into the water. I tried to push her up but couldn't.
The Immortal:
– Now release her feet. I'll help both you and her soul find liberation from this lotus pond.
Soldier Ghost:
– I won't let go. She's my wife.
Aunt Que:
– Master, I am not his wife. Please save me from this evil ghost.
The Immortal:
– You've heard what she said. Let go.
The Soldier Ghost opened his mouth and spat a stream of stinking mud-water straight at the Immortal's face. He barely closed his eyes in time. Mud splattered his face, the stench overwhelming.

Miss Ut grabbed a fruit-peeling knife from the table and stabbed it into the back of the Soldier Ghost's hand. Thud! Green-moss blood spurted up.
The Soldier Ghost released Aunt Que's feet.
The Immortal opened his eyes, pulled Aunt Que's soul free, flying above the lotus pond.
The Soldier Ghost's face contorted, eyes bulging, green blood streaming from his nostrils, mouth wide open showing white fangs. He flew up to the bank, hairy hand grabbing a pistol. Bang bang bang! Three ghost bullets, black, spinning toward them.
The Immortal's right hand fired a beam of red light. The three bullets reversed course, embedding in both eyes and the center of the forehead. Three streams of green-moss blood ran down the ghost's face. Body convulsing.
The Immortal flew forward, hand transforming into a machete swinging down at the Soldier Ghost's head.
The Soldier Ghost clasped both hands together:
– Please spare my life, master.
The Immortal stopped:
– Do you understand the harm you've caused?
Soldier Ghost:
– I deeply regret that I couldn't save this girl from drowning. Because I was also shot dead at this lotus pond.
The Immortal:
– Do you want to be cleansed and have your soul restored to find liberation?
Soldier Ghost:
– I've been lying at the bottom of this lotus pond for many years. So lonely, cold, and bored. When Aunt Que fell in and died, I was happy to have a companion to talk to. But now I understand. I beg Aunt Que and her family to please forgive me.
Aunt Que's soul:
– I also deeply regret listening to friends and drinking, then falling to my death, and causing my niece Hue to suffer from water ghost malaria. Please forgive your Aunt Que.
Hue:
– It's a sad story. An expensive lesson for those who don't listen to their parents. Aunt, please let the master help restore your soul for liberation.
Miss Ut:
– I wish you safe passage to the paradise of light, Aunt.

Aunt Que's soul:
– Please heal me and restore my soul, master.
The Immortal shot a beam of white-gold light into her head. Aunt Que's soul opened her mouth and vomited stinking mud. Her soul brightened beautifully, flew up to the universe and vanished.
The Soldier Ghost vomited stinking mud, his soldier's uniform burned away. His body was restored by light. His soul brightened, flew to the universe.

Hue's cold sweating stopped. Her body gradually warmed:
– I've also seen light but didn't know how to use it. Master, can you teach me how to use light to heal and liberate souls? Because after my parents passed away, the hot-cold symptoms returned.
The Immortal:
– If you've been meditating cross-legged for years, you're very susceptible to ovarian cysts and fibroids. Do you often have pain below your navel?
Hue:
– Yes, often. The gynecologist diagnosed ovarian cysts and multiple fibroids.
Miss Ut Huong:
– Why does cross-legged meditation cause ovarian cysts, master?
The Immortal:
– When two blood-energy channels are kinked, blood can't circulate. After 2 hours, what happens?
Miss Ut Huong, having studied medicine, knew:
– The lower legs go cold and numb. The upper portion constricts, eventually developing cysts and fibroids, varicose veins.
The Immortal:
– That's why the two streams of hot and cold energy are at war, causing cold sweats and hot flashes.
Hue:
– Yesterday I had severe lower abdominal pain. The hospital diagnosed ovarian cysts and multiple fibroids requiring surgery. I've heard that even after surgery they come back. I'm scared. Please help.
The Immortal placed his right hand on the crown of her head, channeling light energy downward:
– Do you feel the warm current flowing down to your uterus and out through both legs?
Hue:
– Yes, I can feel it. Wherever the warmth reaches, the pain seems to dissolve.
The Immortal:
– Practice this daily and you'll heal quickly. The warm light energy unblocks meridians, drives blood flow into blocked areas, dissolves cholesterol buildup. Bad cholesterol accumulates into cysts and fibroids, causing acute lower abdominal pain. Combine with drinking clean water, reducing fatty foods, eating more greens for good pH.
Within 7 days, the cysts and fibroids had shrunk and vanished completely.
Hue:
– I have a lump in my right breast, small as a bean. I'll probably go get it checked tomorrow.
The Immortal:
– Don't worry. I'll show you how to treat the breast lump correctly and it will dissolve right away.
After channeling energy into the breast lump, the pain subsided. The next day Hue reported: the breast lump had completely vanished.'''

highlightsVi = '''Cô Huệ theo thiền Thanh Hải, quán Ánh Sáng thấy vong hồn nhưng không biết cách xử lý. Niệm danh hiệu sư phụ, chờ hoài không ai đến cứu.
Gốc bệnh nóng lạnh: cô ruột Quế chết đuối dưới ao sen, bị Ma Lính giữ hồn không cho siêu thoát. Bệnh truyền sang cháu gái qua ADN.
Ma Lính không ác ý ban đầu: chết ở ao sen, cô đơn nhiều năm, khi cô Quế té xuống thì mừng vì có người bầu bạn.
Cô Út cầm dao gọt trái cây đâm vào tay Ma Lính cứu chị: người thường cũng can thiệp được khi có lòng dũng cảm.
Ngồi thiền kiết già lâu năm gây u nang đa nhân xơ buồng trứng: hai đường ống dẫn khí huyết bị bẻ cong, khí huyết không lưu thông.
Năng lượng ánh sáng thông kinh mạch, cholesterol tan biến, u nang teo nhỏ trong 7 ngày, u ngực tan ngày hôm sau.'''

highlightsEn = '''Hue followed Supreme Master Ching Hai's meditation, saw ghosts during Light contemplation but didn't know what to do. Chanted the master's name, waited, no one came.
Root of the hot-cold disease: Aunt Que drowned in a lotus pond, her soul held captive by a Soldier Ghost. Disease transferred to the niece through ADN.
The Soldier Ghost wasn't initially malicious: died alone in the pond, lonely for years, happy when Que fell in because he finally had company.
Miss Ut grabbed a fruit knife and stabbed the ghost's hand to save her sister: ordinary people can intervene with courage.
Years of cross-legged meditation caused ovarian cysts: blood-energy channels kinked, circulation blocked.
Light energy unblocks meridians, cholesterol dissolves, cysts shrink in 7 days, breast lump gone the next day.'''

lessonVi = '''1. Nhìn thấy ánh sáng mà không biết cách dùng thì vô ích
"Em cũng đã nhìn thấy ánh sáng nhưng không biết cách sử dụng."
Cô Huệ quán Ánh Sáng theo phương pháp thiền, nhìn thấy vong hồn, nhìn thấy ánh sáng từ trán bắn ra đuổi ma đè. Nhưng không ai dạy cách sử dụng ánh sáng đó để chữa bệnh, để giải thoát vong hồn. Niệm danh hiệu sư phụ, chờ sư phụ đến cứu, chờ hoài không ai đến. Ánh sáng đã có sẵn bên trong cô Huệ. Nhưng thiếu phương pháp sử dụng thì ánh sáng đó chỉ là tia chớp ngẫu nhiên, không phải công cụ.

2. Thiền sai tư thế gây bệnh phụ khoa
"Khi hai đường ống dẫn khí huyết bị bẻ cong, khí huyết không lưu thông trong thời gian 2 giờ…"
Ngồi kiết già hai chân bắt chéo, hai ống dẫn khí huyết bị bẻ cong. Phần dưới lạnh teo, phần trên co lại, lâu ngày thành u nang u xơ. Thiền định không sai. Tư thế sai. Phương pháp tốt mà thực hành sai vẫn gây bệnh.

3. Ma Lính không ác, chỉ cô đơn
"Tôi đã nằm dưới ao sen này nhiều năm rồi. Rất cô đơn, lạnh lẽo và buồn chán."
Ma Lính bị bắn chết ở ao sen. Nằm dưới đáy ao nhiều năm, cô đơn lạnh lẽo. Khi cô Quế té xuống, Ma Lính mừng vì có người bầu bạn. Không phải ác, chỉ cô đơn đến mức bám víu bất cứ ai đến gần.

4. Dao gọt trái cây cũng là vũ khí
Cô Út, người thường, không biết võ, không biết phóng ánh sáng. Nhưng khi thấy Ma Lính nắm chân chị mình, cô Út cầm con dao gọt trái cây đâm vào mu bàn tay ma. Vũ khí không quan trọng. Lòng dũng cảm mới quan trọng.

5. Cả hai bên đều hối hận
Ma Lính hối hận vì không cứu được cô Quế. Cô Quế hối hận vì nghe lời bạn bè uống rượu rồi té chết. Không ai hoàn toàn vô tội. Không ai hoàn toàn có tội. Khi cả hai bên cùng hối hận và tha thứ, ánh sáng mới xoá được bóng tối.'''

lessonEn = '''1. Seeing light without knowing how to use it is useless
"I've also seen light but didn't know how to use it."
Hue contemplated Light through meditation, saw ghosts, even shot light from her forehead to repel a pressing ghost. But no one taught her how to use that light to heal or liberate souls. She chanted her master's name, waited for rescue that never came. The light was already inside her. But without knowing how to use it, that light was just a random flash, not a tool.

2. Wrong meditation posture causes gynecological disease
"When two blood-energy channels are kinked, blood can't circulate for 2 hours…"
Cross-legged meditation kinks blood vessels. Lower body goes cold, upper body constricts, eventually creating cysts. Meditation isn't wrong. The posture is. A good method practiced incorrectly still causes disease.

3. The Soldier Ghost isn't evil, just lonely
"I've been lying at the bottom of this lotus pond for years. So lonely, cold, and bored."
The Soldier Ghost was shot dead at the lotus pond. Lying at the bottom for years, cold and lonely. When Que fell in, the ghost was happy for company. Not evil, just so lonely it clung to anyone nearby.

4. A fruit knife is also a weapon
Miss Ut, an ordinary person, no martial arts, no light powers. But seeing the ghost grip her sister's feet, she grabbed a fruit knife and stabbed the ghost's hand. The weapon doesn't matter. The courage does.

5. Both sides express regret
The Soldier Ghost regrets failing to save Que. Que regrets listening to friends, drinking, falling to her death. No one is completely innocent. No one is completely guilty. When both sides express regret and forgiveness, only then can light erase the darkness.'''

threadVi = 'Thiền định nhìn thấy ánh sáng mà không biết dùng thì vô ích. Niệm danh hiệu sư phụ, chờ hoài không ai đến. Ánh sáng đã có sẵn bên trong, thiếu phương pháp thì chỉ là tia chớp ngẫu nhiên. Ngồi thiền sai tư thế, bẻ cong mạch máu, mấy năm thành u nang u xơ. Ma Lính không ác, chỉ cô đơn. Dao gọt trái cây cũng là vũ khí nếu tay cầm dao có tình thương. Và khi cả hai bên đều hối hận, ánh sáng mới xoá được bóng tối.'

threadEn = "Seeing light in meditation without knowing how to use it is useless. Chanting a master's name and waiting for rescue that never comes. The light is already inside, but without method it's just a random flash. Wrong meditation posture kinks blood vessels, years later becomes cysts and fibroids. The Soldier Ghost isn't evil, just lonely. A fruit knife becomes a weapon when held by loving hands. And only when both sides express regret can light erase the darkness."

# Update via PATCH
sf.login()
update_data = {
    'contentVi': contentVi,
    'contentEn': contentEn,
    'highlightsVi': highlightsVi,
    'highlightsEn': highlightsEn,
    'lessonVi': lessonVi,
    'lessonEn': lessonEn,
    'threadVi': threadVi,
    'threadEn': threadEn,
}
fields = sf._to_firestore_fields(update_data)
field_paths = '&'.join([f'updateMask.fieldPaths={k}' for k in update_data.keys()])
url = f'https://firestore.googleapis.com/v1/projects/immortalityvn/databases/(default)/documents/stories/{DOC_ID}?{field_paths}'
data = json.dumps({'fields': fields}).encode()
req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {sf._token}',
}, method='PATCH')
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f'✅ Updated story 16 (doc {DOC_ID}) with all content fields')
