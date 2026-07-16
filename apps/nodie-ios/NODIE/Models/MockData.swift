import SwiftUI

/// Dữ liệu giả port 1:1 từ `Aion Prototype v3.dc.html`.
/// Thay bằng repository Supabase ở phase wire — giữ nguyên shape để view không đổi.
enum MockData {
    static let questions: [Question] = [
        Question(
            id: "q1", tag: "Não bộ", hasExpert: true,
            title: "Active recall vs spaced repetition — cái nào giúp consolidation trí nhớ tốt hơn?",
            meta: "3 câu trả lời · 2,1k đã đọc", author: "Ngọc Mai", time: "5 giờ trước",
            body: "Mình học nhiều nhưng quên nhanh. Trong hai kỹ thuật active recall và spaced repetition, cái nào tác động mạnh hơn tới quá trình consolidation lúc ngủ?",
            answers: [
                Answer(id: "q1a1", who: "TS. Lan Hương", role: "· Chuyên gia thần kinh học",
                       time: "4 giờ trước", isBest: true, votes: 42,
                       avatarFrom: Color(hex: 0xC9B8F5), avatarTo: Color(hex: 0x5B43D8),
                       text: "Cả hai bổ trợ nhau: active recall tạo dấu vết mạnh, spaced repetition canh đúng thời điểm trước khi quên. Nhưng consolidation thật sự diễn ra trong giấc ngủ sâu — nên ngủ đủ sau khi học quan trọng hơn cả hai.",
                       litBase: 128,
                       replies: [
                        AnswerReply(id: "q1a1r1", parent: nil, who: "Ngọc Mai",
                                    avatarFrom: Color(hex: 0xFFD7A8), avatarTo: Color(hex: 0xC96B2F),
                                    time: "3 giờ trước",
                                    text: "Vậy nếu học buổi tối thì nên ngủ luôn sau đó để consolidation tốt nhất phải không ạ?",
                                    litBase: 6),
                        AnswerReply(id: "q1a1r2", parent: "q1a1r1", who: "TS. Lan Hương",
                                    avatarFrom: Color(hex: 0xC9B8F5), avatarTo: Color(hex: 0x5B43D8),
                                    time: "2 giờ trước",
                                    text: "Đúng vậy. Học xong trong vòng ~3 giờ trước khi ngủ cho hiệu quả rõ nhất.",
                                    litBase: 31),
                        AnswerReply(id: "q1a1r3", parent: nil, who: "Lê Vũ",
                                    avatarFrom: Color(hex: 0xC9F5D8), avatarTo: Color(hex: 0x3F9E63),
                                    time: "1 giờ trước",
                                    text: "Cảm ơn TS, rất rõ ràng 🙏",
                                    litBase: 12),
                       ]),
                Answer(id: "q1a2", who: "Hà Chi", role: "", time: "3 giờ trước", isBest: false, votes: 11,
                       avatarFrom: Color(hex: 0xF5B8DD), avatarTo: Color(hex: 0xB85A9E),
                       text: "Mình thấy kết hợp: active recall ngay sau khi học, rồi spaced repetition theo lịch giãn dần.",
                       litBase: 24, replies: []),
                Answer(id: "q1a3", who: "Lê Vũ", role: "", time: "1 giờ trước", isBest: false, votes: 3,
                       avatarFrom: Color(hex: 0xC9F5D8), avatarTo: Color(hex: 0x3F9E63),
                       text: "Bổ sung: dạy lại cho người khác là dạng active recall mạnh nhất.",
                       litBase: 9, replies: []),
            ]
        ),
        Question(
            id: "q2", tag: "Y học trường thọ", hasExpert: true,
            title: "Telomere và tốc độ lão hoá — can thiệp lối sống nào có bằng chứng mạnh nhất?",
            meta: "7 câu trả lời · 2,4k đã đọc", author: "Trần Quân", time: "8 giờ trước",
            body: "Trong các can thiệp lối sống (vận động, giấc ngủ, dinh dưỡng, quản lý stress), cái nào hiện có bằng chứng mạnh nhất về việc làm chậm rút ngắn telomere?",
            answers: [
                Answer(id: "q2a1", who: "BS. Minh Đức", role: "· Chuyên gia y học tuổi thọ",
                       time: "6 giờ trước", isBest: true, votes: 38,
                       avatarFrom: Color(hex: 0xA8D8FF), avatarTo: Color(hex: 0x2B5C8A),
                       text: "Bằng chứng mạnh nhất là vận động aerobic đều đặn; giấc ngủ sâu đứng thứ hai. Thực phẩm bổ sung thì bằng chứng còn yếu.",
                       litBase: 96, replies: []),
            ]
        ),
        Question(
            id: "q3", tag: "Vũ trụ học", hasExpert: false,
            title: "Bản đồ 3D vật chất tối mới nói gì về cấu trúc lớn của vũ trụ?",
            meta: "2 câu trả lời · 950 đã đọc", author: "Lê Vũ", time: "Hôm qua",
            body: "Sau buổi seminar mình vẫn chưa hiểu ý nghĩa của bản đồ vật chất tối mới với mô hình ΛCDM. Ai giải thích giúp mình?",
            answers: [
                Answer(id: "q3a1", who: "Phong Trần", role: "", time: "20 giờ trước", isBest: false, votes: 9,
                       avatarFrom: Color(hex: 0xFFD7A8), avatarTo: Color(hex: 0xC96B2F),
                       text: "Điểm chính: phân bố vật chất tối \"mượt\" hơn dự đoán của ΛCDM một chút (tension S8). Chưa đủ để bác bỏ mô hình nhưng là gợi ý thú vị.",
                       litBase: 14, replies: []),
            ]
        ),
    ]

    /// 6 người của cộng đồng — `people` trong prototype.
    static let people: [Person] = [
        Person(id: "hachi", name: "Hà Chi", emoji: "🙂", bg: Color(hex: 0xF5DCEB), sub: "Cùng Lab trường thọ #3"),
        Person(id: "quan", name: "Trần Quân", emoji: "😎", bg: Color(hex: 0xDDEEE3), sub: "Theo dõi lẫn nhau"),
        Person(id: "mai", name: "Ngọc Mai", emoji: "🌸", bg: Color(hex: 0xFFE3C9), sub: "Khoa học não bộ"),
        Person(id: "vu", name: "Lê Vũ", emoji: "🌿", bg: Color(hex: 0xDDEEE3), sub: "Vũ trụ học"),
        Person(id: "huong", name: "TS. Lan Hương", emoji: "🧠", bg: Color(hex: 0xECE7FB), sub: "Chuyên gia thần kinh học"),
        Person(id: "duc", name: "BS. Minh Đức", emoji: "🧬", bg: Color(hex: 0xE3ECF7), sub: "Y học tuổi thọ"),
    ]

    /// Hồ sơ đầy đủ — `memberData` trong prototype. Khoá trùng `people.id`.
    static let members: [String: Member] = [
        "huong": Member(
            id: "huong", name: "TS. Lan Hương", emoji: "🧠",
            gradient: [Color(hex: 0xC9B8F5), Color(hex: 0x5B43D8)], verified: true,
            level: "Chuyên gia thần kinh học · cấp 9",
            join: "Tham gia 02.2025 · quản trị kênh Khoa học não bộ",
            bio: "Nghiên cứu neuroplasticity & trí nhớ dài hạn. Tin rằng não không bao giờ ngừng tự viết lại — nếu ta chịu chiếu sáng.",
            stats: [.init(value: "312", label: "lần chiếu sáng"), .init(value: "1,8k", label: "trả lời hay"),
                    .init(value: "12,4k", label: "người theo dõi"), .init(value: "94%", label: "AI đánh giá")],
            fields: [.init(label: "🧠 Não bộ", bg: Color(hex: 0xECE7FB), fg: Color(hex: 0x5B43D8)),
                     .init(label: "💤 Giấc ngủ", bg: Color(hex: 0xE3ECF7), fg: Color(hex: 0x2B5C8A))],
            posts: [.init(title: "Neuroplasticity sau tuổi 40: não chưa từng ngừng tự viết lại", meta: "214 ☀ · 2 giờ trước"),
                    .init(title: "Trả lời: Active recall vs spaced repetition", meta: "42 ▲ hữu ích · 4 giờ trước")]),
        "quan": Member(
            id: "quan", name: "Trần Quân", emoji: "😎",
            gradient: [Color(hex: 0xA8D8C0), Color(hex: 0x3F9E63)], verified: false,
            level: "Người Toả Sáng · cấp 5",
            join: "Tham gia 05.2025 · học liên tục 96 ngày",
            bio: "Đang đào sâu y học trường thọ. Mê telomere và can thiệp lối sống có bằng chứng.",
            stats: [.init(value: "58", label: "lần chiếu sáng"), .init(value: "23", label: "trả lời hay"),
                    .init(value: "640", label: "người theo dõi"), .init(value: "71%", label: "AI đánh giá")],
            fields: [.init(label: "🧬 Trường thọ", bg: Color(hex: 0xF3E9D5), fg: Color(hex: 0x8A6D3F)),
                     .init(label: "🧠 Não bộ", bg: Color(hex: 0xECE7FB), fg: Color(hex: 0x5B43D8))],
            posts: [.init(title: "Tổng hợp 4 bài về telomere cho Lab #3", meta: "31 ☀ · hôm qua")]),
        "hachi": Member(
            id: "hachi", name: "Hà Chi", emoji: "🙂",
            gradient: [Color(hex: 0xF5B8DD), Color(hex: 0xB85A9E)], verified: false,
            level: "Người Học Sâu · cấp 3",
            join: "Tham gia 06.2025 · chuỗi 30 ngày",
            bio: "Đang thử nghiệm giấc ngủ sâu và ghi chép học tập mỗi ngày.",
            stats: [.init(value: "40", label: "lần chiếu sáng"), .init(value: "11", label: "trả lời hay"),
                    .init(value: "380", label: "người theo dõi"), .init(value: "62%", label: "AI đánh giá")],
            fields: [.init(label: "💤 Giấc ngủ", bg: Color(hex: 0xE3ECF7), fg: Color(hex: 0x2B5C8A)),
                     .init(label: "🧠 Não bộ", bg: Color(hex: 0xECE7FB), fg: Color(hex: 0x5B43D8))],
            posts: [.init(title: "Ngày 30 giữ giấc ngủ sâu: lần đầu đạt 2h15p", meta: "89 ☀ · 4 giờ trước")]),
        "mai": Member(
            id: "mai", name: "Ngọc Mai", emoji: "🌸",
            gradient: [Color(hex: 0xFFD7A8), Color(hex: 0xC96B2F)], verified: false,
            level: "Người Hỏi · cấp 3",
            join: "Tham gia 04.2025",
            bio: "Hỏi nhiều để hiểu sâu — tin rằng câu hỏi tốt là nửa câu trả lời.",
            stats: [.init(value: "67", label: "câu đã hỏi"), .init(value: "8", label: "trả lời hay"),
                    .init(value: "290", label: "người theo dõi"), .init(value: "58%", label: "AI đánh giá")],
            fields: [.init(label: "🧠 Não bộ", bg: Color(hex: 0xECE7FB), fg: Color(hex: 0x5B43D8))],
            posts: [.init(title: "Active recall vs spaced repetition — cái nào nhớ lâu hơn?", meta: "3 trả lời · 5 giờ trước")]),
        "vu": Member(
            id: "vu", name: "Lê Vũ", emoji: "🌿",
            gradient: [Color(hex: 0xC9F5D8), Color(hex: 0x3F9E63)], verified: false,
            level: "Người Khám Phá · cấp 2",
            join: "Tham gia 06.2025",
            bio: "Mê vũ trụ học, đang học về vật chất tối.",
            stats: [.init(value: "22", label: "lần chiếu sáng"), .init(value: "3", label: "trả lời hay"),
                    .init(value: "120", label: "người theo dõi"), .init(value: "44%", label: "AI đánh giá")],
            fields: [.init(label: "🔭 Vũ trụ", bg: Color(hex: 0xE3ECF7), fg: Color(hex: 0x2B5C8A))],
            posts: [.init(title: "Bản đồ 3D vật chất tối mới nói gì?", meta: "2 trả lời · hôm qua")]),
        "duc": Member(
            id: "duc", name: "BS. Minh Đức", emoji: "🧬",
            gradient: [Color(hex: 0xA8C8E8), Color(hex: 0x2B5C8A)], verified: true,
            level: "Chuyên gia y học tuổi thọ · cấp 8",
            join: "Tham gia 03.2025",
            bio: "Bác sĩ lão khoa. Phân biệt bằng chứng mạnh và hào nhoáng trong y học trường thọ.",
            stats: [.init(value: "198", label: "lần chiếu sáng"), .init(value: "920", label: "trả lời hay"),
                    .init(value: "9,2k", label: "người theo dõi"), .init(value: "91%", label: "AI đánh giá")],
            fields: [.init(label: "🧬 Trường thọ", bg: Color(hex: 0xF3E9D5), fg: Color(hex: 0x8A6D3F))],
            posts: [.init(title: "Trả lời: can thiệp lối sống nào làm chậm rút telomere", meta: "38 ▲ hữu ích · 6 giờ trước")]),
    ]

    /// Thứ tự hiển thị lấy từ `convoOrder` của prototype.
    static let conversations: [Conversation] = [
        Conversation(id: "naobo", name: "Khoa học não bộ", emoji: "🧠", avatarBg: Color(hex: 0xECE7FB),
                     isRound: false, kindLabel: "KÊNH", kindBg: Color(hex: 0x5B43D8),
                     sub: "12,4k thành viên · TS. Lan Hương quản trị", isBroadcast: true,
                     time: "14:02", unread: 3),
        Conversation(id: "lab", name: "Lab trường thọ #3", emoji: "🧬", avatarBg: Color(hex: 0xF3E9D5),
                     isRound: false, kindLabel: "NHÓM", kindBg: Color(hex: 0xB8862B),
                     sub: "24 thành viên · 6 đang hoạt động", isBroadcast: false,
                     time: "09:18", unread: 12),
        Conversation(id: "hachi", name: "Hà Chi", emoji: "🙂", avatarBg: Color(hex: 0xF5DCEB),
                     isRound: true, kindLabel: nil, kindBg: nil,
                     sub: "Đang hoạt động", isBroadcast: false, time: "08:55", unread: 1),
        Conversation(id: "vutru", name: "Vũ trụ học hiện đại", emoji: "🔭", avatarBg: Color(hex: 0xE3ECF7),
                     isRound: false, kindLabel: "KÊNH", kindBg: Color(hex: 0x2B5C8A),
                     sub: "8,1k thành viên", isBroadcast: true, time: "11:40", unread: 0),
        Conversation(id: "quan", name: "Trần Quân", emoji: "😎", avatarBg: Color(hex: 0xDDEEE3),
                     isRound: true, kindLabel: nil, kindBg: nil,
                     sub: "Hoạt động 2 giờ trước", isBroadcast: false, time: "Hôm qua", unread: 0),
    ]

    static let messages: [String: [ChatMessage]] = [
        "hachi": [
            ChatMessage(who: nil, isMine: false, text: "Tối nay học chung không? Mình đặt phòng thảo luận lúc 21:00 rồi", time: "08:52"),
            ChatMessage(who: nil, isMine: true, text: "Ok luôn! Mình đang đọc dở chương về trí nhớ dài hạn", time: "08:54"),
            ChatMessage(who: nil, isMine: false, text: "Tốt quá, tối nay mình hỏi bạn phần consolidation nhé", time: "08:55"),
        ],
        "lab": [
            ChatMessage(who: "Trần Quân", isMine: false, text: "Mình vừa tổng hợp 4 bài về telomere, mọi người xem trước buổi tối nay nha", time: "09:12"),
            ChatMessage(who: "Hà Chi", isMine: false, text: "Bài số 2 hay đấy, phần can thiệp lối sống có số liệu mới", time: "09:15"),
            ChatMessage(who: nil, isMine: true, text: "Mình sẽ chuẩn bị phần tóm tắt nghiên cứu Stanford 2025", time: "09:18"),
        ],
        "naobo": [
            ChatMessage(who: "TS. Lan Hương", isMine: false, text: "📄 Bài mới: Neuroplasticity sau tuổi 40 — dữ liệu từ nghiên cứu dọc 12.000 người. Link bài đọc đầy đủ trong mô tả kênh.", time: "14:02"),
            ChatMessage(who: "TS. Lan Hương", isMine: false, text: "Tối thứ Sáu sẽ có buổi Q&A trực tiếp về chủ đề này, mọi người gửi câu hỏi trước nhé.", time: "14:05"),
        ],
        "vutru": [
            ChatMessage(who: "Ban biên tập", isMine: false, text: "🔭 Ghi âm buổi seminar về vật chất tối đã có trong mục Tài nguyên.", time: "11:40"),
        ],
        "quan": [
            ChatMessage(who: nil, isMine: false, text: "Cảm ơn bạn đã trả lời câu hỏi về telomere nhé, rất rõ ràng!", time: "Hôm qua"),
        ],
    ]

    static let attracted: [AttractedItem] = [
        AttractedItem(source: "Kênh · Khoa học não bộ", sourceColor: NodieColors.accent, matchPercent: 94,
                      title: "Consolidation trí nhớ diễn ra trong giấc ngủ sâu như thế nào",
                      reason: "Trả lời trực tiếp câu bạn vừa chiếu sáng về trí nhớ & giấc ngủ.",
                      footnote: "TS. Lan Hương · 8 phút đọc", hasAvatar: true, ctaLabel: nil),
        AttractedItem(source: "Hỏi đáp", sourceColor: NodieColors.gold, matchPercent: 81,
                      title: "\"Active recall vs spaced repetition — cái nào giúp consolidation tốt hơn?\"",
                      reason: nil, footnote: nil, hasAvatar: false, ctaLabel: "Chuyên gia trả lời ↗"),
        AttractedItem(source: "Nhóm · Lab trường thọ #3", sourceColor: NodieColors.accent, matchPercent: 62,
                      title: "Thảo luận tối nay: giấc ngủ sâu & phục hồi tế bào thần kinh",
                      reason: nil, footnote: "21:00 · 18 người · liên quan điều bạn chiếu sáng",
                      hasAvatar: false, ctaLabel: nil),
    ]

    static let projections: [Projection] = [
        Projection(dot: NodieColors.accent, title: "Chiếu câu hỏi: \"Trí nhớ dài hạn củng cố lúc ngủ thế nào?\"",
                   meta: "Hôm nay, 07:20 · đã hút 6 nội dung về"),
        Projection(dot: NodieColors.gold, title: "Viết trả lời về telomere — được đánh dấu hữu ích",
                   meta: "Hôm qua, 21:40 · Hỏi đáp"),
        Projection(dot: NodieColors.accent, title: "Dạy lại consolidation cho nhóm Lab #3",
                   meta: "Hôm qua, 20:00 · Nhóm · 52 phút"),
        Projection(dot: NodieColors.chipBorder, title: "Chiếu hình dung: cấu trúc lưới vật chất tối",
                   meta: "13.07 · chưa hút đủ — còn ở kho"),
    ]
}
