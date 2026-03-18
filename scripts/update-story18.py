#!/usr/bin/env python3
"""Update Story 18 (existing doc) with full content"""
import sys, json, urllib.request
sys.path.insert(0, __import__('os').path.dirname(__file__))
from importlib import import_module
sf = import_module('seed-firestore')

DOC_ID = 'tgIr6wCX43P3hiaIg2Ch'

titleVi = 'Giải Mã Bệnh Thổ Tả - Nhà Anh 7 Nhân Điện'
titleEn = 'Decoding Cholera - The Bio-Energy Healer\'s House'

contentVi = '''Người Bất Tử một hôm rảnh rỗi, rủ anh Hiếu và chị Lý ghé nhà thăm anh chị 7 Nhân Điện.
Chị 7 mời ngồi chơi uống nước trà:
– Anh 7 bị bệnh tiêu chảy mấy ngày nay chưa cầm được.
Người Bất Tử:
– Sao không đưa ảnh đi bệnh viện khám? Có uống thuốc chưa?
Chị 7:
– Anh 7 cố chấp lắm chú Lợi ơi.
Anh 7:
– Tui học Nhân Điện cấp 7, đã chữa bệnh cho người ta khỏi. Hôm nay bị bệnh tiêu chảy thì tui tự chữa. Không đi bệnh viện đâu. Còn uống thuốc thì không cầm được.
Người Bất Tử vào phòng xem. Anh 7 nét mặt xanh đen, cơ thể lạnh:
– Mệt quá. Ỉa chảy hoài mà không cầm được.

Người Bất Tử bàn tay ánh sáng đặt lên đỉnh đầu anh 7.
Anh 7 bất ngờ xoay ngang mình, giật cùi chỏ trúng vào bụng.
Người Bất Tử lùi về sau một bước.
Anh 7 đứng lên, tay phải đấm vào giữa ngực.
Người Bất Tử bàn tay phải chụp nắm đấm, đẩy một cái nhẹ. Anh 7 ngã ngồi xuống giường. Rầm!
Chị 7 và anh Hiếu chạy vào:
– Có chuyện gì vậy chú Lợi?
Người Bất Tử:
– Anh 7 bị ma nhập và ra tay đánh ác liệt.
Chị 7 đi đến đứng cạnh anh 7, bàn tay phải đặt lên trán:
– Anh có sao không?
Anh 7 gạt tay chị ra, đứng dậy, miệng gầm gừ chảy nước dãi, hai bàn tay bóp cổ chị 7:
– Con quỷ cái này tao phải giết mày!
Người Bất Tử bàn tay ánh sáng đánh vào giữa trán. Anh 7 cơ thể co giật, té xuống giường nằm im. Con ma xuất ra khỏi cơ thể.

Chị 7:
– 3 ngày trước, anh 7 có đi chữa bệnh cho một người bị ma nhập. Con ma đòi ăn nguyên con gà mới chịu đi ra.
Chị Lý:
– Anh có dùng LX6 để chữa bệnh qua hình ảnh đúng không?
Anh 7:
– Có. Sao chị biết?
Chị Lý:
– Tôi nhìn thấy có nhiều vong âm nằm trong bụng của anh. Vong âm không ra ngoài được nên tức giận, đấm đá trong bụng. Anh đau lắm đúng không?
Anh 7:
– Đúng vậy. Đau giống như có ai đâm chém trong đó vậy.
Chị Lý giải thích:
– LX6 của anh hút tử khí từ hình ảnh của những người đã chết.
Anh 7:
– Khi chữa bệnh tôi đã ngưng thở, không cho bệnh chạy qua rồi mà.
Chị 7:
– Có đó. Ông nhớ cô Tám Nhân Điện cấp 7 không?
Anh 7:
– Cô Tám học cùng lớp với mình đúng không?
Chị 7:
– Đúng rồi. Cô Tám đã hơn 60 tuổi. Chữa bệnh cho người phụ nữ bị rong kinh huyết trắng. Ngày hôm sau cô Tám cũng bị rong kinh. Anh không nên dùng LX6 chữa bệnh qua hình ảnh và không nên nhíu hậu môn LX1. Nguy hiểm chết người.

Bỗng có một người lạ đi đến, tay cầm tờ giấy xét nghiệm ở đa khoa Quận 4.
Người Bất Tử nhìn nét mặt anh Hai: xanh đen, thân hình ốm nhom.
Anh Hai Nhân Điện:
– Tôi vừa được bác sĩ chẩn đoán bị bệnh ung thư bao tử giai đoạn 2. Cần phải mổ gấp.
Chị Lý:
– Sao anh Hai không nhập viện để điều trị?
Anh Hai Nhân Điện:
– Tôi không có tiền.
Người Bất Tử:
– Anh đang làm nghề gì?
Anh Hai Nhân Điện:
– Tôi là thầy nhân điện, học cùng thầy với thầy Lương Minh Đáng. Ai bị bệnh ung thư, bùa ngải, thư ếm gì tôi cũng chữa hết.
Người Bất Tử:
– Tại sao anh không tự chữa lành bệnh ung thư bao tử của mình?
Anh Hai Nhân Điện:
– Tôi đã bị mất hết năng lượng và lực sống rồi.
Người Bất Tử:
– Nếu anh đồng ý, tôi sẽ truyền năng lực giúp cho.
Anh Hai Nhân Điện đồng ý, ngồi xuống đất theo kiểu ngồi thiền, hai bàn tay để trên đùi ngửa lên.

Người Bất Tử bàn tay phải phóng ánh sáng vào đỉnh đầu anh Hai, 30 giây.
Anh Hai Nhân Điện bỗng nhiên cơ thể lắc lư, hai bàn tay nắm lại, tay phải đánh ra một luồng khí đen xì bay trúng vào giữa ngực Người Bất Tử.
Bất ngờ bị trúng đòn. Luồng khí đen chạy vào bên trong tim đau nhói. Miệng ói ra một ngụm máu đen. Tay ôm ngực lùi về sau một bước.
Anh Hai Nhân Điện mở to cặp mắt quỷ:
– Mày là ai? Sao dám cứu giúp nó!
Từ cặp mắt phóng ra hai luồng khí màu đỏ bay xẹt trúng vào đầu.
Người Bất Tử thân hình lảo đảo, tay ôm đầu đau nhức như búa bổ.
Anh Hai Nhân Điện đứng lên tung một cú đá vào giữa ngực.
Người Bất Tử hụp xuống, xoay người, tung một cú đá quét đất trúng bàn chân. Anh Hai Nhân Điện té ngã xuống đất. Bịch!
Người Bất Tử bay tới tung cú đạp xuống ngực. Anh Hai Nhân Điện miệng ói ra một đống nước nhầy tanh hôi.
Người Bất Tử giơ cao bàn tay ánh sáng chặt xuống đầu. Anh Hai Nhân Điện bị ánh sáng đập vào đầu, cơ thể co giật, miệng ói nhớt xanh rồi tỉnh lại.
Chị 7 tay cầm ly nước trà nóng:
– Anh Hai uống đi cho khỏe. Hình như anh Hai cũng bị ma nhập.
Chị Lý:
– Không phải ma. Mà là quỷ dữ lắm.

Người Bất Tử:
– Anh Hai cảm thấy trong người có khỏe hơn không?
Anh Hai Nhân Điện vui mừng:
– Cơ thể tôi có sức sống và nguồn năng lượng mới.
Người Bất Tử hướng dẫn công thức để tự chữa trị bệnh ung thư bao tử thời kỳ 2.
Anh Hai Nhân Điện:
– Tôi đã có năng lượng và đã biết cách chữa bệnh rồi. Xin cảm ơn thầy Lợi.

7 ngày sau. Anh Hai Nhân Điện tìm gặp, khuôn mặt hồng hào, miệng cười vui vẻ, tay cầm tờ giấy xét nghiệm bệnh viện Quận 4 mới chẩn đoán:
– Bệnh ung thư bao tử kỳ 2 tôi đã biến mất!
Người Bất Tử:
– Chúc mừng anh.
Anh Hai Nhân Điện:
– Tôi còn một chứng bệnh nữa: bệnh thận mãn.
Người Bất Tử:
– Anh có cần tôi phụ chữa giúp hay không?
Anh Hai Nhân Điện:
– Tôi đã biết cách xả bệnh rồi. Tôi sẽ tự chữa.
Người Bất Tử:
– Anh không nên chữa bệnh cho người khác trong lúc xả bệnh nhé.
Anh Hai Nhân Điện:
– Cảm ơn thầy Lợi. Tôi nhớ rồi.

30 ngày sau. Người Bất Tử đi ngang qua nhà anh 9, tình cờ gặp lại anh Hai Nhân Điện đang đứng mua thuốc lá. Nét mặt xanh đen, thân hình ốm teo tàn tạ, ốm hơn lúc mới gặp.
Người Bất Tử:
– Có phải anh Hai đã chữa bệnh cho người nào đó?
Anh Hai Nhân Điện:
– Tôi có chữa bệnh cho một thằng bạn tên là Bảy Rô.
Người Bất Tử:
– Thôi tiêu rồi. Khi còn nhỏ tôi đã biết ông Bảy Rô làm thầy pháp, âm binh rất nhiều.
1 tháng sau, ông Bảy Rô qua đời. Và anh Hai Nhân Điện, nghe nói cũng đi theo.'''

contentEn = '''One leisurely day, the Immortal invited Brother Hieu and Sister Ly to visit Brother and Sister 7, who practiced Bio-Energy healing.
Sister 7 invited them for tea:
– Brother 7 has had diarrhea for days and can't stop it.
The Immortal:
– Why not take him to the hospital? Has he taken any medicine?
Sister 7:
– Brother 7 is so stubborn, Brother Loi.
Brother 7:
– I studied Bio-Energy level 7. I've cured other people. Today I have diarrhea, I'll cure myself. I'm not going to any hospital. Medicine doesn't work either.
The Immortal went into the room to examine. Brother 7's face was greenish-black, body cold:
– I'm exhausted. Non-stop diarrhea that won't stop.

The Immortal placed his light-hand on the crown of Brother 7's head.
Brother 7 suddenly twisted sideways and drove an elbow into the Immortal's stomach.
The Immortal stepped back.
Brother 7 stood up and punched at the Immortal's chest.
The Immortal's right hand caught the fist and gave a gentle push. Brother 7 fell sitting onto the bed. Crash!
Sister 7 and Brother Hieu ran in:
– What happened, Brother Loi?
The Immortal:
– Brother 7 is possessed and attacking violently.
Sister 7 walked over and placed her hand on Brother 7's forehead:
– Are you okay, dear?
Brother 7 slapped her hand away, stood up, growling with drool streaming, both hands squeezing Sister 7's throat:
– You witch, I'll kill you!
The Immortal struck light-hand into the center of Brother 7's forehead. Brother 7's body convulsed, collapsed onto the bed, motionless. The ghost exited his body.

Sister 7:
– 3 days ago, Brother 7 went to treat someone who was possessed. The ghost demanded to eat an entire chicken before it would leave.
Sister Ly:
– Did you use LX6 to heal through images?
Brother 7:
– Yes. How did you know?
Sister Ly:
– I can see many dark spirits trapped inside your stomach. They can't get out, so they're furious, punching and kicking inside. It hurts badly, right?
Brother 7:
– Exactly. It feels like someone is stabbing and slashing inside.
Sister Ly explained:
– Your LX6 absorbs death energy from images of dead people.
Brother 7:
– But when I heal, I hold my breath so the disease doesn't transfer.
Sister 7:
– Remember Sister Tam, also Bio-Energy level 7?
Brother 7:
– The one from our class?
Sister 7:
– Yes. Sister Tam, over 60 years old, treated a woman with menstrual bleeding. The next day Sister Tam herself started bleeding. You shouldn't use LX6 to heal through images, and you shouldn't clench LX1. It's deadly.

Suddenly a stranger walked in, holding a test result from District 4 General Hospital.
The Immortal looked at Brother Hai's face: greenish-black, skeletal thin.
Brother Hai Bio-Energy:
– I've just been diagnosed with stage 2 stomach cancer. Needs emergency surgery.
Sister Ly:
– Why don't you check into the hospital for treatment?
Brother Hai Bio-Energy:
– I don't have money.
The Immortal:
– What do you do for a living?
Brother Hai Bio-Energy:
– I'm a Bio-Energy master, trained under the same teacher as Master Luong Minh Dang. Cancer, curses, hexes, I cure everything.
The Immortal:
– Then why can't you cure your own stomach cancer?
Brother Hai Bio-Energy:
– I've lost all my energy and life force.
The Immortal:
– If you agree, I'll transfer energy to help you.
Brother Hai Bio-Energy agreed, sat on the floor in meditation posture, palms face-up on his thighs.

The Immortal's right hand shot light into Brother Hai's crown for 30 seconds.
Brother Hai Bio-Energy's body suddenly swayed, fists clenched, right hand shooting a stream of black energy that struck the Immortal's chest.
Caught off guard. The black energy pierced into the heart, sharp pain. The Immortal spat a mouthful of black blood. Clutching his chest, stepping back.
Brother Hai Bio-Energy opened wide demonic eyes:
– Who are you? How dare you try to save him!
From his eyes, two red energy beams shot out, striking the Immortal's head.
The Immortal staggered, clutching his head, pain like hammers pounding.
Brother Hai Bio-Energy stood and launched a kick to the chest.
The Immortal ducked, spun, swept a ground kick that caught the foot. Brother Hai fell. Thud!
The Immortal lunged forward, stomping down on the chest. Brother Hai's mouth vomited a heap of stinking slime.
The Immortal raised his light-hand high and struck down on the head. Brother Hai's body convulsed from the light impact, mouth vomiting green mucus, then regained consciousness.
Sister 7 handed him a cup of hot tea:
– Drink this, Brother Hai. It seems you were possessed too.
Sister Ly:
– Not just a ghost. A very fierce demon.

The Immortal:
– Brother Hai, do you feel better now?
Brother Hai Bio-Energy, elated:
– My body has new life force and energy.
The Immortal taught him the formula to self-treat stage 2 stomach cancer.
Brother Hai Bio-Energy:
– I have the energy now and I know how to heal. Thank you, Master Loi.

7 days later. Brother Hai Bio-Energy found the Immortal, face rosy, smiling, holding a new test result from District 4 Hospital:
– My stage 2 stomach cancer has vanished!
The Immortal:
– Congratulations.
Brother Hai Bio-Energy:
– I have one more condition: chronic kidney disease.
The Immortal:
– Do you need me to help?
Brother Hai Bio-Energy:
– I already know how to expel the disease. I'll treat myself.
The Immortal:
– You must not treat anyone else while you're still expelling your own disease.
Brother Hai Bio-Energy:
– Thank you, Master Loi. I'll remember.

30 days later. The Immortal was passing Brother 9's house and ran into Brother Hai Bio-Energy buying cigarettes. Face greenish-black, body withered and skeletal, thinner than when they first met.
The Immortal:
– Did you treat someone, Brother Hai?
Brother Hai Bio-Energy:
– I treated a friend named Bay Ro.
The Immortal:
– It's over. Since I was a child, I knew Bay Ro was a sorcerer with many dark spirits.
1 month later, Bay Ro passed away. And Brother Hai Bio-Energy, they say, followed him.'''

highlightsVi = '''Anh 7 Nhân Điện cấp 7, chữa bệnh cho người khác khỏi, nhưng chính mình bị tiêu chảy không cầm được, rồi bị ma nhập bóp cổ vợ.
Dùng LX6 hút tử khí qua hình ảnh: vong âm chui vào bụng, đấm đá bên trong, không ra ngoài được. Cô Tám cấp 7 chữa rong kinh cho người, hôm sau chính mình bị rong kinh.
Anh Hai Nhân Điện tự xưng chữa được mọi bệnh nhưng chính mình bị ung thư bao tử giai đoạn 2, mất hết năng lượng và lực sống.
Được chữa khỏi ung thư trong 7 ngày. Được dặn rõ: không chữa bệnh cho ai trong lúc xả bệnh.
30 ngày sau: ốm teo tàn tạ hơn lúc mới gặp. Đã chữa bệnh cho Bảy Rô, thầy pháp âm binh nhiều. 1 tháng sau cả hai đều chết.
Chữa bệnh cho người khác mà không đủ sức thì chính mình chết trước. Được cứu rồi mà không nghe lời thì không ai cứu được nữa.'''

highlightsEn = '''Brother 7, Bio-Energy level 7, cures others but can't stop his own diarrhea, then gets possessed and strangles his wife.
Using LX6 absorbs death energy through images: spirits enter the stomach, thrashing inside, can't get out. Sister Tam level 7 treated someone's hemorrhage, got it herself the next day.
Brother Hai claims to cure everything but has stage 2 stomach cancer himself, drained of all energy and life force.
Cured of cancer in 7 days. Explicitly warned: don't treat anyone while still expelling your own disease.
30 days later: more emaciated than when they first met. Had treated Bay Ro, a sorcerer with many dark spirits. 1 month later both are dead.
Healing others without sufficient strength kills the healer first. Saved once but refusing to listen means no one can save you again.'''

lessonVi = '''Hút bệnh vào mình để chữa cho người: con đường chết.
Anh 7 dùng LX6 hút tử khí qua hình ảnh. Vong âm chui vào bụng, không ra ngoài được, đấm đá bên trong gây đau. Cô Tám chữa rong kinh cho người, hôm sau tự bị rong kinh. Anh 7 chữa ma nhập cho bệnh nhân, con ma nhảy sang nhập anh 7, bóp cổ vợ. Phương pháp hút bệnh vào mình để chữa cho người khác là tự sát. Bệnh không biến mất. Bệnh chỉ chuyển từ người này sang người kia. Khác hoàn toàn với phương pháp Người Bất Tử: dùng ánh sáng xoá bệnh, không hút vào mình.

Tự xưng chữa được mọi bệnh mà chính mình bệnh nặng: con đường đang đi là sai. "Ai bị bệnh ung thư, bùa ngải, thư ếm gì tôi cũng chữa hết."
Anh Hai Nhân Điện nói chữa được mọi bệnh. Nhưng chính anh Hai bị ung thư bao tử giai đoạn 2, mất hết năng lượng và lực sống. Không có tiền nhập viện. Người chữa bệnh cho người khác mà không giữ được sức khỏe cho chính mình thì phương pháp đó có vấn đề. Thầy thuốc mà tự mình bệnh nặng: dấu hiệu rõ nhất con đường đang đi là sai.

Không nghe lời dặn: cái giá là cái chết. "Anh không nên chữa bệnh cho người khác trong lúc xả bệnh nhé."
Người Bất Tử dặn rõ ràng. Anh Hai hứa nhớ. 30 ngày sau gặp lại: ốm teo tàn tạ, đã chữa bệnh cho Bảy Rô, thầy pháp âm binh nhiều. 1 tháng sau cả hai đều chết. Bài học đau nhất trong câu chuyện 18: được cứu sống rồi mà không giữ lời, quay lại con đường cũ thì chết. Không ai cứu được người không chịu nghe.

Hai loại thầy chữa bệnh: hút bệnh vào mình vs dùng ánh sáng xoá bệnh.
Nhân Điện hút tử khí, bệnh chuyển từ người sang người. Thầy chữa bệnh rồi chính thầy bị bệnh. Người Bất Tử dùng ánh sáng xoá bệnh: ánh sáng đốt cháy gốc rễ, bệnh không tồn tại nữa, không chuyển sang ai. Sự khác biệt cốt lõi: một bên là chuyển bệnh, một bên là xoá bệnh. Chuyển bệnh thì ai đó phải gánh. Xoá bệnh thì không ai gánh cả.

Quỷ dữ ẩn bên trong người bệnh, chờ ai đụng vào là tấn công. "Mày là ai? Sao dám cứu giúp nó!"
Người Bất Tử vừa phóng ánh sáng vào đỉnh đầu anh Hai, lập tức bị quỷ bên trong tấn công: luồng khí đen đánh vào tim, hai luồng khí đỏ bắn vào đầu, đá vào ngực. Quỷ không muốn ai cứu anh Hai. Vì anh Hai đang là vật chủ nuôi quỷ. Bài học: nhiều người bệnh nặng bên trong có "thứ gì đó" không muốn bệnh nhân khỏi. Ai đến chữa thì bị tấn công. Phải đánh thắng quỷ trước khi chữa bệnh cho người.'''

lessonEn = '''Absorbing disease to heal others: the path to death.
Brother 7 uses LX6 to absorb death energy through images. Spirits enter the stomach, can't get out, thrashing inside causing pain. Sister Tam heals someone's hemorrhage, gets it herself the next day. Brother 7 treats a possessed patient, the spirit jumps to possess him, strangling his wife. Absorbing disease to heal others is suicide. Disease doesn't disappear, it only transfers from one person to another. Completely different from the Immortal's method: light erases disease, never absorbs it.

Claiming to cure everything while gravely ill: the path is wrong. "Cancer, curses, hexes, I cure everything."
Brother Hai claims to cure everything. But he has stage 2 stomach cancer, completely drained of energy. Can't afford hospitalization. A healer who can't maintain their own health is using the wrong method. A gravely ill doctor is the clearest sign: the path is wrong.

Ignoring the warning: the price is death. "You must not treat anyone else while still expelling your own disease."
The Immortal warned clearly. Brother Hai promised to remember. 30 days later: emaciated, had treated Bay Ro, a sorcerer with many dark spirits. Both die within a month. The most painful lesson in story 18: saved once but refusing to keep the promise, returning to old ways, means death. No one can save someone who won't listen.

Two types of healers: absorbing disease vs erasing it with light.
Bio-Energy absorbs death energy, disease transfers from person to person, the healer gets sick. The Immortal uses light to erase disease: light burns the root, disease ceases to exist, transfers to no one. Core difference: one transfers disease, one erases it. Transfer means someone bears the burden. Erasure means no one does.

A fierce demon hides inside the patient, attacking whoever touches. "Who are you? How dare you try to save him!"
The Immortal just channeled light into Brother Hai's crown and was immediately attacked by the demon inside: black energy into the heart, red beams into the head, kick to the chest. The demon doesn't want anyone saving Brother Hai. Because Brother Hai is the host feeding the demon. Many severely ill people have "something inside" that doesn't want them healed. Anyone who tries to help gets attacked. Must defeat the demon before healing the person.'''

threadVi = 'Chữa bệnh cho người khác bằng cách hút bệnh vào mình là tự sát. Tự xưng chữa được mọi bệnh mà chính mình bệnh nặng: con đường đang đi là sai. Được cứu sống rồi mà không nghe lời, quay lại con đường cũ thì chết. Không ai cứu được người không chịu nghe. Ánh sáng xoá bệnh. Hút bệnh chỉ chuyển bệnh. Một bên là tự do. Một bên là cái chết.'

threadEn = 'Healing others by absorbing their disease is suicide. Claiming to cure everything while gravely ill means the path is wrong. Saved once but refusing to listen, returning to old ways, means death. No one saves those who won\'t listen. Light erases disease. Absorption only transfers it. One path leads to freedom. The other leads to death.'

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
print(f'✅ Updated story 18 (doc {DOC_ID}) with all content fields')
