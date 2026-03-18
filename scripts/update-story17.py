#!/usr/bin/env python3
"""Update Story 17 (existing doc) with full content"""
import sys, json, urllib.request
sys.path.insert(0, __import__('os').path.dirname(__file__))
from importlib import import_module
sf = import_module('seed-firestore')

DOC_ID = 'i0NZuxvK1y5te13qr12I'

titleVi = 'Giải Mã Thư Ếm Di Truyền ADN - Hai Đời Làm Thầy Pháp'
titleEn = 'Decoding Hereditary Curse ADN - Two Generations of Sorcerers'

contentVi = '''Anh 9 ghé nhà Người Bất Tử mời:
– Cậu Năm xuống nhà anh Sáu xui gia của tôi chơi. Ảnh cũng bị bệnh, từ dưới quê lên thành phố chữa bệnh, đi nhiều nơi nhưng vẫn chưa khỏi.
Người Bất Tử lên xe Honda, anh Chính chở xuống kho 18, ghé vào nhà con gái của anh 6 xui gia.
Anh 6 bước ra bắt tay anh Chính, mời vào nhà ngồi uống nước trà.
Anh 9 giới thiệu:
– Với anh Sáu, đây là thầy Năm Lợi. Còn đây là anh Sáu sui gia của tui, bị bệnh viêm xoang trán.
Anh Sáu, 55 tuổi, khuôn mặt xám đen, ốm, tiều tụy:
– Tôi đau nhức đầu lắm. Đi bệnh viện chữa và nhiều nơi rồi mà vẫn chưa thấy khỏi.
Người Bất Tử:
– Anh 6 ngồi xếp bằng dưới đất, để tôi xem anh bị bệnh gì.
Anh Sáu ngồi xếp bằng dưới đất. Người Bất Tử đặt bàn tay ánh sáng xuống đỉnh đầu anh Sáu, 30 giây.
Anh Sáu bỗng nhiên mở mắt ra:
– Tôi nhìn thấy 3 cây kim vàng nhỏ, dài 15 cm, bay ra khỏi trán.
Người Bất Tử:
– Anh có thù oán gì với ai hay không mà bị thư ba cây kim vàng?

Anh Sáu bỗng nhiên nói một tràng tiếng Campuchia:
– Tôi là thầy pháp. Nhờ thầy cứu giúp.
Con gái anh 6 kinh ngạc:
– Ba con không biết nói tiếng Campuchia!
Người Bất Tử:
– Ông nội con là người Campuchia, làm thầy pháp chuyên chữa bệnh mở thư ếm. Ông nội đang nhập vào xác ba con kể chuyện ngày xưa.

Cảnh quá khứ 200 năm trước hiện ra:
Ma Ông Cố Nội, tên Khun Lay. Da ngăm đen, 1m69, người cao to, mặt phúc hậu, áo choàng quấn sarong. Trong nhà ở giữa là bàn thờ tổ, tượng các vị thần.
Ma Khun Lay tay đang cầm 3 cây nhang cắm vào lư hương thì một bệnh nhân bước vào nhà, tay ôm đầu rên rỉ:
– Đau nhức quá chịu không nổi, thầy ơi cứu con!
Ma Khun Lay:
– Cậu ngồi xuống ghế, uống ly nước trà cho khỏe đi.
Bệnh nhân tay cầm ly nước trà uống vội:
– Tôi đau nhức đầu quá. Nhờ thầy xem giúp dùm.
Ma Khun Lay cắm ba cây nhang lên bàn thờ tổ, miệng lâm râm niệm câu thần chú, tay bắt ấn đặt vào vùng thái dương trái, nơi đau nhức của bệnh nhân. Một phút sau, từ thái dương trái, ba cây kim vàng bắn vào tay Ma Khun Lay. Bụp bụp bụp!
Ma Khun Lay giật bàn tay phải đau nhói. 3 giọt máu đen chảy ra.
Ma Khun Chai, con trai, đứng kế bên, tay cầm lấy khăn bùa quấn vào bàn tay hút máu độc ra:
– Ba có sao không?
Ma Khun Lay:
– Ba không sao. Đau nhức một chút, khăn Tổ hút độc ra sẽ khỏi thôi.
Ma Khun Lay nói với bệnh nhân:
– Ông đã bị thư 3 cây kim vàng trong đầu.
Bệnh nhân:
– Hèn gì tôi đi chữa bệnh khắp nơi mà không khỏi!
Ma Khun Chai:
– Ông có thù oán với ai hay không?
Bệnh nhân:
– Có thể do tranh chấp tài sản trong gia đình.
Ma Khun Lay:
– Ông ngồi trước bàn thờ tổ. Tôi sẽ lấy 3 cây kim vàng ra khỏi đầu ông.
Ma Khun Chai đốt 3 cây nhang đưa cho bệnh nhân. Bệnh nhân cúi lạy bàn thờ tổ, cắm nhang và ngồi xuống.
Ma Khun Lay lấy con dao găm, hơ trên ngọn lửa thiêng, miệng đọc thần chú vào con dao rồi để lên đầu bệnh nhân, hút 3 cây kim vàng bay ra ngoài.

Thân hình bệnh nhân bỗng nhiên tay chân co giật, miệng cười ha hả:
– Tao là thầy bùa ếm đây! Còn mày là ai?
Ma Khun Lay:
– Tao là thầy chuyên mở bùa ếm đây.
Ma thầy ếm tay bắt ấn, vẽ 2 vòng tròn chéo, búng ngón tay, một luồng khí đen bắn vào mặt. Ma Khun Lay thân hình lảo đảo bật người ra xa, máu đen từ miệng chảy xuống đất.
Ma Khun Chai giật con dao Tổ trên bàn thờ chém vào đầu. Ma thầy ếm bàn tay bắt ấn đưa lên đỡ. Kẻng! Con dao vuột khỏi tay Ma Khun Chai, bay vèo ngang qua mặt rồi đâm vào vách gỗ nhà.
Ma Khun Lay lấy trong túi áo ra một chiếc khăn ấn màu đỏ, thêu hình một con quỷ nanh vàng, quăng lên xoay tròn trên không trung rồi bất ngờ chụp xuống đầu.
Ma thầy ếm miệng cắn ngón tay trỏ, đọc bùa ếm rồi phun máu lửa vào chiếc khăn ấn quỷ. Chiếc khăn bốc cháy, khói đen khét lẹt. Con quỷ nanh vàng khuôn mặt lở loét bay tới cắn vào cổ.
Ma thầy ếm bắt ấn, bắn ra một luồng âm khí đen xì đâm xuyên qua đầu con quỷ nanh vàng. Thân thể co giật, nổ đùng, tan biến mất.
Ma Khun Chai bay người tới trước, đâm con dao Tổ vào tim thầy bùa ếm. Tay ôm ngực, máu bắn ra khắp vách nhà.
Ma thầy bùa ếm nhào người tới, đâm 3 cây kim vàng vào vùng trán Ma Khun Chai, rồi té gục đầu xuống đất, xuất hồn bay mất.
Ma Khun Chai hai tay ôm đầu rên la:
– Đau nhức quá! Cứu con, ba ơi!
Ma Khun Lay lấy chiếc khăn ấn chụp vào trán con, miệng đọc thần chú, hút 3 cây kim vàng dài 15 cm rớt xuống kêu leng keng.
Lúc này bệnh nhân bỗng hồi tỉnh dậy, tay sờ lên đầu, mừng rỡ:
– Tôi đã hết nhức đầu rồi! Cảm ơn thầy!

Con gái anh 6 nói thêm:
– Ông cố nội con đã gỡ được 3 cây kim vàng cho ông nội con và người bị ếm rồi. Thì tại sao bây giờ ba con lại bị ếm 3 cây kim vàng?
Người Bất Tử:
– Bùa ngải thư ếm di truyền ADN nhiều đời, chứ không phải 3 đời đâu. Ba con chỉ bị ảnh hưởng bởi ADN di truyền, chứ không phải bị ếm thật.
Con gái anh 6:
– Con có bị ảnh hưởng bùa ếm bởi ADN của ba con không vậy thầy? Con cũng hay bị nhức đầu giống ba con.
Người Bất Tử:
– Phải giải quyết được cái ân oán di truyền ADN của nhiều đời trước thì mới không di truyền đến con cháu nhiều đời sau.
Con gái anh Sáu:
– Vậy giải quyết bằng cách nào thưa thầy?
Người Bất Tử:
– Con cũng ngồi xuống kế bên ba con đi.

Nói xong, Người Bất Tử liền điều khiển linh hồn mình bay theo Ma Khun Lay, bay vào tiềm thức ADN quá khứ để giải quyết ân oán.
Ma Khun Lay xuất hồn ra khỏi xác cháu là anh 6, cùng con là Ma Khun Chai, bay đến ngôi nhà ông thầy bùa ếm.
Linh hồn Người Bất Tử bay theo sau.
Ma thầy ếm đang ngồi trong nhà vẽ bùa, chợt nghe tiếng động, nhìn ra ngoài cửa thấy có ba người đàn ông bước vào:
– Bọn mày đến nhà tao để làm gì?
Linh hồn Người Bất Tử:
– Để giúp ông chữa bệnh đau tim.
Thầy bùa ếm:
– Sao mày biết tao bị đau tim?
Linh hồn Người Bất Tử:
– Trong cuộc chiến tâm linh, ông đã đánh bùa 3 cây kim vàng vào đầu ông Ma Khun Chai này, đúng không?
Ma thầy bùa ếm:
– À tao nhớ rồi. Chính mày, Ma Khun Chai, đã đâm con dao Tổ vào tim của tao. Làm tim tao đau nhức mỗi khi trời lạnh.
Ma Khun Lay:
– Chuyện đã xảy ra gần 200 năm rồi. Cũng cần giải quyết cho xong ân oán của mình đi.
Ma thầy bùa ếm liền quăng ra một lá bùa ma mị.
Người Bất Tử tay phải phóng ra một tia lửa đỏ đốt lá bùa cháy khét lẹt.
Ma thầy bùa:
– Mày là thằng nào?
Người Bất Tử:
– Tôi là người chuyên đi hóa giải nghiệp, giúp người.
Ma thầy bùa:
– Hóa giải nghiệp bằng cách nào?
Ma Khun Chai:
– Nhờ có thầy chữa bệnh cho thằng 6 con tôi, nên tôi đã nhờ thầy bay từ tương lai đến quá khứ này, để giúp cho chúng ta khỏi đau bệnh và giải thoát. Ông nghĩ sao? Có đồng ý hay không?
Ma thầy bùa:
– Tôi đồng ý.

Linh hồn Người Bất Tử:
– Bây giờ ông hãy đọc chú để thu hồi 3 cây kim vàng trong đầu Ma Khun Chai ra đi.
Ma thầy bùa ếm:
– Tao chỉ học bùa đánh và bùa ếm, chứ không có học giải bùa thư ếm. Vậy làm sao mà giải được?
Linh hồn Người Bất Tử:
– Không sao. Chỉ cần ông ủy quyền cho tôi thì tôi sẽ giải được bùa ếm.
Ma thầy bùa:
– Vậy tôi ủy quyền cho thầy giúp dùm.
Người Bất Tử bàn tay phải phóng ra 3 tia ánh sáng xuyên vào não, trong tiềm thức ADN Ma Khun Chai. 3 cây kim vàng và bùa chú bay ra khỏi đầu bốc cháy.
Ma Khun Chai:
– Tôi không còn cảm giác nhức đầu nữa.
Ma thầy bùa ếm:
– Nhờ thầy lấy con dao vô hình trong tim ra dùm tôi.
Linh hồn Người Bất Tử:
– Cái này phải để cho ông Ma Khun Chai thu hồi con dao Tổ.
Ma Khun Lay:
– Chúng tôi chỉ biết đánh, ai thắng là được, chứ không biết hóa giải là gì cả. Xin nhờ thầy giải dùm, để chúng tôi học được cách hóa giải ân oán và được siêu thoát.
Linh hồn Người Bất Tử:
– Chỉ có tình yêu thương và sự hiểu biết mới xoá bỏ được hận thù ngàn năm.
Người Bất Tử đưa bàn tay phải phóng ra một luồng ánh sáng vàng biến thành con dao mổ. Lồng ngực Ma thầy bùa bị chẻ đôi. Con dao Tổ bay ra ngoài bốc cháy biến mất. Lồng ngực tự động khép kín lại.
Ma thầy bùa hít một hơi thở vào căng lồng ngực rồi thở ra:
– Tôi không còn bị đau nhói trong tim nữa. Rất là vi diệu. Nhờ thầy chỉ cho chúng tôi cách nào để được siêu thoát.
Linh hồn Người Bất Tử:
– Các thầy phải báo cho ông tổ biết, sau đó đốt hết kinh sách bùa chú và bàn thờ tổ đi, để cho ông tổ cũng được siêu thoát và các thầy mới siêu thoát được.

Ma thầy bùa ếm đốt ba cây nhang cắm lên bàn thờ tổ, lấy hết kinh sách bùa chú để lên bàn thờ và đốt bỏ. Rồi liền bay vào đám lửa đỏ. Linh hồn Ma thầy bùa cháy sáng lên, bay vào vũ trụ biến mất.
Ma Khun Lay nhìn thấy, liền thức tỉnh, nắm tay con trai, bay về ngôi nhà mình và đốt cháy. Hai cha con cùng bay vào tự thiêu, cháy hết quá khứ, không còn bị luân hồi nữa. Linh hồn hai Ma sáng đẹp, bay lên vũ trụ biến mất.
Linh hồn Người Bất Tử cũng bay về thế giới hiện tại, nhập vào xác.
Con gái anh 6:
– Con nghe thấy mà sợ quá. Nghiệp báo di truyền ADN có thật sự hóa giải được không thưa thầy?
Người Bất Tử:
– Con hãy đợi 7 ngày sau thì sẽ biết.

7 ngày sau. Anh Sáu đến nhà anh Chính mời Người Bất Tử ra chơi để cảm tạ.
Người Bất Tử nhìn khuôn mặt anh 6 thấy hồng hào, cơ thể khỏe mạnh, lên 5 kg.
Anh 9:
– Mời cậu Năm ngồi uống nước chè.
Anh Sáu:
– Cảm ơn thầy. Tôi đã hết bệnh rồi, nên hôm nay sẽ về quê.'''

contentEn = '''Brother 9 visited the Immortal:
– Come visit Brother 6, my in-law. He's sick too, came up from the countryside to the city for treatment, been to many places but still not cured.
The Immortal got on the Honda, Brother Chinh drove to Warehouse 18, stopping at the house of Brother 6's daughter.
Brother 6 stepped out, shook hands with Brother Chinh, invited them inside for tea.
Brother 9 introduced:
– Brother 6, this is Master Loi. And this is Brother 6, my in-law, suffering from frontal sinusitis.
Brother 6, 55 years old, face ashen black, thin, haggard:
– I have terrible headaches. Been to hospitals and many places, still not cured.
The Immortal:
– Brother 6, sit cross-legged on the floor. Let me examine what's wrong.
Brother 6 sat down. The Immortal placed his light-hand on the crown of Brother 6's head for 30 seconds.
Brother 6 suddenly opened his eyes:
– I can see 3 small golden needles, 15 cm long, flying out of my forehead.
The Immortal:
– Do you have any grudge with anyone? You've been cursed with three golden needles.

Brother 6 suddenly spoke a stream of Cambodian language.
– I am a sorcerer. Please help me, master.
Brother 6's daughter, shocked:
– My father doesn't speak Cambodian!
The Immortal:
– Your great-grandfather was Cambodian, a sorcerer specializing in removing curses. He's possessing your father's body to tell the story from long ago.

A scene from 200 years ago appeared:
Great-Grandfather Ghost, named Khun Lay. Dark skin, 1m69, tall and large, kind face, wearing a sarong robe. In the center of the house was an ancestral altar with deity statues.
Khun Lay was holding 3 incense sticks to place in the burner when a patient walked in, clutching his head and groaning:
– The pain is unbearable, master! Save me!
Khun Lay:
– Sit down, drink some tea first.
The patient gulped the tea:
– My head hurts so badly. Please examine me.
Khun Lay placed three incense sticks on the ancestral altar, chanted softly, placed his hand with a mudra on the patient's left temple for one minute. From the left temple, three golden needles shot into Khun Lay's hand. Thud thud thud!
Khun Lay jerked his right hand in pain. Three drops of black blood dripped out.
Khun Chai, his son, stood beside him, wrapping a charm cloth around the hand to draw out the poison:
– Are you okay, Father?
Khun Lay:
– I'm fine. A little pain, the ancestral cloth draws the poison out.
Khun Lay told the patient:
– You've been cursed with 3 golden needles in your head.
The patient:
– No wonder I've been to healers everywhere and nothing worked!
Khun Chai:
– Do you have a grudge with anyone?
The patient:
– Possibly from a family property dispute.
Khun Lay:
– Sit before the ancestral altar. I'll remove the 3 golden needles from your head.
Khun Chai lit 3 incense sticks for the patient. The patient bowed to the altar, placed the incense, and sat down.
Khun Lay heated a dagger over the sacred flame, chanted into the blade, placed it on the patient's head, and drew out the 3 golden needles.

The patient's body suddenly convulsed, mouth laughing wildly:
– I am the curse master! Who are you?
Khun Lay:
– I am the master who specializes in removing curses.
The Curse Master formed a mudra, drew two crossed circles, snapped his fingers, and a stream of black energy shot into Khun Lay's face. Khun Lay staggered back, black blood dripping from his mouth.
Khun Chai grabbed the ancestral blade from the altar and swung at the Curse Master's head. The Curse Master's hand blocked it with a mudra. Clang! The blade flew from Khun Chai's hand, whizzed past his face, and embedded in the wooden wall.
Khun Lay pulled a red charm cloth from his pocket, embroidered with a yellow-fanged demon, threw it spinning into the air, and it dropped onto the Curse Master's head.
The Curse Master bit his index finger, read a curse, and spat blood-fire at the charm cloth. The cloth burst into flames, black acrid smoke. The yellow-fanged demon flew out and bit the Curse Master's neck.
The Curse Master formed a mudra, shot a stream of black energy through the demon's head. The demon convulsed, exploded, and vanished.
Khun Chai lunged forward and stabbed the ancestral blade into the Curse Master's heart. Blood sprayed across the walls.
The Curse Master lurched forward and drove 3 golden needles into Khun Chai's forehead, then collapsed, his soul flying away.
Khun Chai clutched his head, screaming:
– The pain! Save me, Father!
Khun Lay pressed the charm cloth to his son's forehead, chanted, and drew out the 3 golden needles. They clinked on the floor.
The patient suddenly woke up, touched his head, and exclaimed:
– My headache is gone! Thank you, master!

Brother 6's daughter:
– Great-grandfather already removed the 3 golden needles for grandfather and the patient. So why does my father now have the 3 golden needles?
The Immortal:
– Curse inheritance through ADN spans many generations, not just three. Your father is affected by inherited ADN, not a direct curse.
Brother 6's daughter:
– Am I also affected by my father's curse ADN, master? I get headaches just like him.
The Immortal:
– You must resolve the ancestral grudge across many past generations to stop the inheritance to future descendants.
Brother 6's daughter:
– How do we resolve it, master?
The Immortal:
– Sit down next to your father.

The Immortal directed his soul to fly with Khun Lay's ghost into the ADN subconscious past to resolve the ancient grudge.
Khun Lay's ghost left Brother 6's body, together with his son Khun Chai, and flew to the Curse Master's house.
The Immortal's soul followed behind.
The Curse Master was sitting inside drawing curse symbols when he heard sounds. Looking out the door, he saw three men entering:
– What are you doing at my house?
The Immortal's soul:
– To help you heal your heart disease.
The Curse Master:
– How do you know I have heart disease?
The Immortal's soul:
– During the spiritual battle, you drove 3 golden needles into Khun Chai's head, correct?
The Curse Master:
– Ah, I remember now. It was you, Khun Chai, who stabbed the ancestral blade into my heart. My heart aches every cold day since.
Khun Lay:
– This happened nearly 200 years ago. Time to settle our grudge.
The Curse Master threw out a bewitching curse talisman.
The Immortal's right hand shot a red flame, burning the talisman to a crisp.
The Curse Master:
– Who are you?
The Immortal:
– I am someone who specializes in resolving karma and helping people.
The Curse Master:
– How do you resolve karma?
Khun Chai:
– Thanks to the master healing my descendant Brother 6, I've asked the master to fly from the future to this past, to help all of us heal and find liberation. What do you think? Do you agree?
The Curse Master:
– I agree.

The Immortal's soul:
– Now please recite the spell to recall the 3 golden needles from Khun Chai's head.
The Curse Master:
– I only learned offensive curses and hexes. I never learned how to undo them. How can I undo what I don't know how to undo?
The Immortal's soul:
– No problem. Just authorize me, and I can undo the curse.
The Curse Master:
– Then I authorize you.
The Immortal's right hand shot 3 beams of light into the brain, into the ADN subconscious of Khun Chai. The 3 golden needles and curse spells flew out of his head and burst into flames.
Khun Chai:
– I no longer feel the headache.
The Curse Master:
– Please remove the invisible blade from my heart too, master.
The Immortal's soul:
– This requires Khun Chai to recall his ancestral blade.
Khun Lay:
– We only know how to fight. Whoever wins, wins. We don't know what "resolving" means. Please help us, so we can learn how to resolve grudges and find liberation.
The Immortal's soul:
– Only love and understanding can erase thousand-year hatred.
The Immortal's right hand shot a beam of golden light that transformed into a surgical scalpel. The Curse Master's chest split open. The ancestral blade flew out, caught fire, and vanished. The chest sealed itself shut.
The Curse Master drew a deep breath, filling his chest, then exhaled:
– I no longer feel the stabbing pain in my heart. Truly miraculous. Please show us how to find liberation, master.
The Immortal's soul:
– You must inform the founding ancestors, then burn all scriptures, curse books, and the ancestral altar. Only when they are also freed can you be freed.

The Curse Master lit three incense sticks on the ancestral altar, gathered all scriptures and curse materials, placed them on the altar, and set them ablaze. Then he flew into the red flames. The Curse Master's soul burned bright, flew into the universe, and vanished.
Khun Lay watched, awakened. He grabbed his son's hand, flew back to their own house, and set it on fire. Father and son flew into the flames together, burning away the entire past, no longer bound by reincarnation. Both souls shone beautifully, flew up to the universe, and vanished.
The Immortal's soul flew back to the present, re-entering his body.
Brother 6's daughter:
– I heard everything and I'm terrified. Can karmic ADN inheritance truly be resolved, master?
The Immortal:
– Wait 7 days and you'll know.

7 days later. Brother 6 came to Brother Chinh's house to invite the Immortal out to express gratitude.
The Immortal looked at Brother 6's face: rosy, healthy, gained 5 kg.
Brother 9:
– Come sit and have some tea, Brother Loi.
Brother 6:
– Thank you, master. I'm cured. I'm going home to the countryside today.'''

highlightsVi = '''Anh 6 bị viêm xoang trán: gốc rễ là 3 cây kim vàng bùa ếm di truyền ADN từ ông cố nội người Campuchia, 200 năm trước.
Anh 6 bỗng nói tiếng Campuchia: ông cố nội nhập xác kể chuyện quá khứ. Con gái kinh ngạc vì ba mình không biết tiếng Campuchia.
Thầy bùa ếm chỉ biết đánh, không biết giải: "Tao chỉ học bùa đánh, chứ không học giải bùa."
Ông Khun Lay cũng chỉ biết đánh: "Chúng tôi chỉ biết đánh, ai thắng là được, chứ không biết hóa giải là gì."
Người Bất Tử bay từ tương lai về quá khứ 200 năm trước, gặp thầy bùa tại chính ngôi nhà năm xưa, giải ân oán gốc.
"Chỉ có tình yêu thương và sự hiểu biết mới xoá bỏ được hận thù ngàn năm."
Cả ba (thầy bùa, ông Khun Lay, Khun Chai) đều tự thiêu cháy quá khứ để siêu thoát. 7 ngày sau anh 6 hồng hào, lên 5 kg.'''

highlightsEn = '''Brother 6's chronic sinusitis: root cause is 3 golden curse needles inherited through ADN from his Cambodian great-grandfather, 200 years ago.
Brother 6 suddenly speaks Cambodian: great-grandfather possesses him to tell the past. His daughter is shocked because her father doesn't know Cambodian.
The Curse Master only knows offense, not defense: "I only learned to curse, not to undo curses."
Khun Lay also only knows fighting: "We only know how to fight. Whoever wins, wins. We don't know what resolving means."
The Immortal flies from the future 200 years into the past, meets the Curse Master at his original house, resolves the root grudge.
"Only love and understanding can erase thousand-year hatred."
All three (Curse Master, Khun Lay, Khun Chai) self-immolate their past for liberation. 7 days later Brother 6 is rosy-cheeked, gained 5 kg.'''

lessonVi = '''Chỉ biết đánh, không biết giải. "Tao chỉ học bùa đánh và bùa ếm, chứ không có học giải bùa thư ếm."
Thầy bùa ếm biết đánh 3 cây kim vàng vào đầu người, nhưng không biết cách lấy ra. Ông Khun Lay biết mở bùa ếm, nhưng chỉ bằng cách hút bệnh vào tay mình, máu đen chảy ra. Ma Khun Chai biết cầm dao đâm vào tim kẻ thù, nhưng không biết cách hóa giải oán thù. Tất cả chỉ biết đánh. Không ai biết giải. 200 năm trôi qua, ân oán vẫn nguyên vẹn, di truyền qua ADN cho con cháu. Bài học: biết đánh mà không biết giải thì vòng luẩn quẩn không bao giờ dừng.

Bay từ tương lai về quá khứ sửa ân oán gốc.
Người Bất Tử điều khiển linh hồn bay theo Ma Khun Lay vào tiềm thức ADN quá khứ 200 năm trước. Gặp thầy bùa ếm tại chính ngôi nhà năm xưa. Giải ân oán ngay tại thời điểm xảy ra. Giống câu chuyện 14 (bay vào cái gai gót chân, gặp thợ săn và nai vàng): quay lại đúng khoảnh khắc gây thương, sửa lại, bệnh hiện tại tự xoá. Quá khứ không phải chuyện đã xong. Quá khứ vẫn sống trong ADN. Phải quay lại đúng nơi, đúng lúc, mới sửa được.

Ủy quyền để giải: người gây nghiệp phải đồng ý. "Chỉ cần ông ủy quyền cho tôi thì tôi sẽ giải được bùa ếm."
Thầy bùa ếm đánh 3 cây kim vàng nhưng không biết giải. Người Bất Tử biết giải nhưng không tự ý làm. Phải được thầy bùa ủy quyền. Tại sao? Vì thầy bùa là người tạo ra nghiệp. Người ngoài không có quyền xoá nghiệp thay. Người gây ra phải đồng ý thì người giải mới có quyền hành động. Bài học: không ai xoá nghiệp hộ ai nếu người gây nghiệp không đồng ý buông bỏ.

Tự thiêu quá khứ: đốt nhà, đốt bửu bối, bay vào lửa.
Ma thầy bùa đốt kinh sách bùa chú, bàn thờ tổ, rồi bay vào lửa. Linh hồn cháy sáng lên, bay vào vũ trụ. Ma Khun Lay nhìn thấy, dắt con trai bay về nhà mình, đốt cháy, hai cha con cùng bay vào tự thiêu. Không ai ép. Cả ba tự quyết định. Giống câu chuyện 10 (Ma Đạo Sĩ đốt y phục bửu bối) và câu chuyện 13 (Ma thầy pháp cởi bỏ áo mão). Nguyên lý xuyên suốt: siêu thoát là đốt cháy mọi thứ thuộc về quá khứ. Giữ lại một thứ thì còn mắc kẹt. Đốt hết thì sáng.

Chỉ có tình yêu thương và sự hiểu biết mới xoá hận thù ngàn năm. "Chỉ có tình yêu thương và sự hiểu biết mới xóa bỏ được hận thù ngàn năm."
Ma Khun Lay nói: "Chúng tôi chỉ biết đánh." Người Bất Tử trả lời: "Chỉ có tình yêu thương và sự hiểu biết mới xoá bỏ được hận thù ngàn năm." Rồi dùng ánh sáng mở lồng ngực thầy bùa, lấy con dao Tổ ra, vết thương tự lành. Không phải đánh mạnh hơn. Không phải bùa giỏi hơn. Mà là hiểu nhau, chữa lành cho nhau, rồi cùng buông. Bạo lực chỉ thêm xiềng xích. Tình yêu thương mới là chìa khóa.'''

lessonEn = '''Only knowing offense, never knowing resolution. "I only learned to curse, not to undo curses."
The Curse Master knows how to drive golden needles into someone's head but can't remove them. Khun Lay removes curses by absorbing the poison into his own hand. Khun Chai stabs the enemy's heart but can't resolve the grudge. Everyone knows how to attack. No one knows how to resolve. 200 years pass, the grudge remains intact, inherited through ADN. Knowing how to fight without knowing how to resolve means the cycle never ends.

Flying from the future to the past to fix the root grudge.
The Immortal flies his soul through Khun Lay's ADN subconscious 200 years into the past. Meets the Curse Master at his original house. Resolves the grudge at the exact moment it occurred. Same as story 14: return to the moment of injury, correct it, present illness erases itself. The past isn't over. The past lives in ADN. Must return to the right place, right time, to fix it.

Authorization to resolve: the one who caused the karma must consent. "Just authorize me, and I can undo the curse."
The Curse Master cast the needles but can't undo them. The Immortal can undo them but won't act unilaterally. Must be authorized by the curse caster. Why? Because the caster created the karma. Outsiders have no right to erase someone else's karma. The one who caused it must consent before the resolver can act. No one erases karma on behalf of someone who refuses to let go.

Self-immolating the past: burning the house, the tools, flying into the flames.
The Curse Master burns his scriptures, altar, then flies into the flames. Soul brightens, ascends. Khun Lay watches, takes his son's hand, flies home, burns it down, both fly into the fire. No one forced. All three chose. Same as story 10 and story 13: liberation means burning everything from the past. Keep one thing and stay trapped. Burn everything and shine.

Only love and understanding erase thousand-year hatred. "Only love and understanding can erase thousand-year hatred."
Khun Lay says: "We only know how to fight." The Immortal answers: "Only love and understanding can erase thousand-year hatred." Then uses light to open the Curse Master's chest, removes the ancestral blade, the wound heals itself. Not fighting harder. Not better curses. Understanding each other, healing each other, then letting go together. Violence only adds chains. Love is the key.'''

threadVi = 'Ân oán 200 năm di truyền qua ADN. Thầy bùa chỉ biết đánh, không biết giải. Thầy mở bùa chỉ biết mở, không biết hóa giải ân oán. 200 năm đánh nhau, không ai thắng, con cháu gánh chịu. Chỉ khi cả hai bên cùng đồng ý buông bỏ, cùng tự thiêu quá khứ, thì cả dòng họ mới thoát. Tình yêu thương xoá hận thù. Bạo lực chỉ thêm xiềng xích.'

threadEn = '200-year grudge inherited through ADN. The curse master only knows offense. The curse breaker only knows defense. 200 years of fighting, no one wins, descendants suffer. Only when both sides agree to let go, to burn their past, does the entire lineage escape. Love erases hatred. Violence only adds chains.'

tag = 'spiritual'

# Update via PATCH
sf.login()
update_data = {
    'titleVi': titleVi,
    'titleEn': titleEn,
    'contentVi': contentVi,
    'contentEn': contentEn,
    'highlightsVi': highlightsVi,
    'highlightsEn': highlightsEn,
    'lessonVi': lessonVi,
    'lessonEn': lessonEn,
    'threadVi': threadVi,
    'threadEn': threadEn,
    'tag': tag,
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
print(f'✅ Updated story 17 (doc {DOC_ID}) with all content fields')
