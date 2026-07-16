import SwiftUI

/// Màn "Chiếu câu hỏi" — soạn câu hỏi mới.
///
/// **AI tự nhận lĩnh vực:** không bắt user chọn lĩnh vực trước khi gõ. Người đang có câu hỏi
/// trong đầu thì muốn gõ ngay, bắt phân loại trước là dựng rào ở đúng chỗ họ hào hứng nhất.
/// Đọc xong mới đoán, và luôn cho bấm "Đổi" để cãi lại.
///
/// Bản này khớp keyword như prototype — CHỖ NÀY LÀ TẠM. Nó chỉ dò mặt chữ nên
/// "quên tên người quen" ra Não bộ là may, chứ "sao tôi mệt suốt" thì chịu. Chỗ cắm AI phân
/// loại ngữ nghĩa thật là `detectedTag`; ngoài nó ra không gì phải đổi.
struct AskQuestionView: View {
    @Bindable var qa: QAStore
    /// Gọi khi tạo xong để màn list mở luôn câu vừa chiếu.
    let onCreated: (UUID) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var context = ""
    /// User đã bấm "Đổi"/chọn chip → thôi nghe AI, theo tay.
    @State private var tagManual = false
    /// Lĩnh vực user tự chọn — chỉ có nghĩa khi `tagManual`.
    @State private var pickedTag: String?
    @State private var sending = false

    /// 5 lĩnh vực của app, thứ tự này cũng là thứ tự ưu tiên khi câu hỏi khớp nhiều luật.
    private static let fieldRules: [(name: String, pattern: String)] = [
        ("Não bộ", "não|trí nhớ|nhớ|neuro|thần kinh|nhận thức|tập trung|học thuộc|recall|dẫn truyền|synap"),
        ("Giấc ngủ", "ngủ|giấc|melatonin|rem|thức dậy|mất ngủ|circadian|nhịp sinh học"),
        ("Y học trường thọ", "trường thọ|tuổi thọ|telomere|lão hoá|lão hóa|tế bào|nad|senolytic|tuổi sinh học|sức khoẻ|sức khỏe"),
        ("Dinh dưỡng", "ăn|dinh dưỡng|nhịn ăn|fasting|protein|calo|thực phẩm|chế độ ăn|vitamin|khoáng"),
        ("Vũ trụ học", "vũ trụ|thiên hà|vật chất tối|hố đen|lượng tử|ngôi sao|big bang|không gian|thiên văn"),
    ]

    private static let allTags = fieldRules.map(\.name)

    private var combined: String { "\(title) \(context)" }
    private var hasText: Bool { !combined.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    private var detectedTag: String? {
        guard hasText else { return nil }
        return Self.fieldRules.first {
            combined.range(of: $0.pattern, options: [.regularExpression, .caseInsensitive]) != nil
        }?.name
    }

    /// Lĩnh vực sẽ gửi đi: tay đè lên AI.
    private var effectiveTag: String? { tagManual ? pickedTag : detectedTag }
    /// AI đoán ra và user chưa cãi → hiện thẻ gợi ý.
    private var aiConfident: Bool { !tagManual && detectedTag != nil }
    /// Hiện hàng chip khi user đòi chọn tay, HOẶC khi đã gõ mà AI chịu thua.
    private var showManualPicker: Bool { tagManual || (hasText && detectedTag == nil) }
    private var canAsk: Bool {
        title.trimmingCharacters(in: .whitespacesAndNewlines).count > 6 && !sending
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    titleField
                    contextField.padding(.top, 10)
                    fieldSection.padding(.top, 18)
                    hint.padding(.top, NodieSpacing.lg)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.vertical, NodieSpacing.lg)
            }
        }
        .background(NodieColors.bg)
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            Button { dismiss() } label: {
                Text("Huỷ")
                    .font(NodieTypography.cta)
                    .foregroundStyle(NodieColors.inkSoft)
                    .padding(.horizontal, 15)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(NodieColors.surface))
                    .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
            }
            .buttonStyle(.plain)

            Text("Chiếu câu hỏi")
                .font(NodieTypography.eyebrow)
                .tracking(NodieSpacing.eyebrowTracking)
                .textCase(.uppercase)
                .foregroundStyle(NodieColors.label)
                .frame(maxWidth: .infinity)

            Button { Task { await submit() } } label: {
                Text("Chiếu sáng")
                    .font(NodieTypography.cta.weight(.bold))
                    .foregroundStyle(canAsk ? .white : NodieColors.cream)
                    .padding(.horizontal, NodieSpacing.lg)
                    .padding(.vertical, NodieSpacing.sm)
                    .background(Capsule().fill(canAsk ? NodieColors.accent : NodieColors.chipBorder))
            }
            .buttonStyle(.plain)
            .disabled(!canAsk)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    // MARK: - Ô nhập

    private var titleField: some View {
        // lineLimit thay vì chiều cao cứng 92pt của prototype: cỡ chữ lớn sẽ cắt mất chữ.
        TextField("Câu hỏi của bạn là gì?", text: $title, axis: .vertical)
            .font(NodieTypography.askField)
            .foregroundStyle(NodieColors.ink)
            .lineLimit(3...6)
            .fieldBox()
    }

    private var contextField: some View {
        TextField("Thêm bối cảnh… (không bắt buộc)", text: $context, axis: .vertical)
            .font(NodieTypography.body)
            .foregroundStyle(NodieColors.inkBody)
            .lineLimit(4...10)
            .fieldBox()
    }

    // MARK: - Lĩnh vực

    private var fieldSection: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack {
                Text("Lĩnh vực")
                    .font(NodieTypography.eyebrowSm)
                    .tracking(NodieSpacing.eyebrowTracking)
                    .textCase(.uppercase)
                    .foregroundStyle(NodieColors.label)
                Spacer()
                if aiConfident {
                    HStack(spacing: 5) {
                        Text("☀").foregroundStyle(NodieColors.sun)
                        Text("AI tự nhận")
                    }
                    .font(NodieTypography.tag)
                    .foregroundStyle(NodieColors.accent)
                }
            }

            if aiConfident, let detectedTag {
                aiCard(tag: detectedTag)
            }
            if showManualPicker {
                tagChips
            }
            if !hasText {
                Text("AI sẽ tự nhận lĩnh vực khi bạn gõ câu hỏi.")
                    .font(NodieTypography.meta)
                    .italic()
                    .foregroundStyle(NodieColors.inkFaint)
            }
        }
    }

    private func aiCard(tag: String) -> some View {
        HStack(spacing: 11) {
            Text("☀")
                .font(.system(size: 15))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(Circle().fill(NodieColors.accent))

            VStack(alignment: .leading, spacing: 1) {
                Text("AI đọc câu hỏi & xếp vào")
                    .font(NodieTypography.tag.weight(.regular))
                    .foregroundStyle(NodieColors.inkMuted)
                Text(tag)
                    .font(NodieTypography.rowTitle.weight(.bold))
                    .foregroundStyle(NodieColors.ink)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button {
                // "Đổi" mở sẵn lựa chọn của AI để user sửa, không bắt chọn lại từ đầu.
                tagManual = true
                pickedTag = detectedTag
            } label: {
                Text("Đổi")
                    .font(NodieTypography.metaSm.weight(.semibold))
                    .foregroundStyle(NodieColors.inkSoft)
                    .padding(.horizontal, NodieSpacing.md)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(NodieColors.surface))
                    .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.tagBg))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.rule, lineWidth: 1))
    }

    private var tagChips: some View {
        FlowRow(spacing: NodieSpacing.sm) {
            ForEach(Self.allTags, id: \.self) { tag in
                let active = effectiveTag == tag
                Button {
                    pickedTag = tag
                    tagManual = true
                } label: {
                    Text(tag)
                        .font(NodieTypography.chip)
                        .foregroundStyle(active ? NodieColors.cream : NodieColors.label)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(active ? NodieColors.ink : NodieColors.tagBg))
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var hint: some View {
        (Text("☀ ").foregroundColor(NodieColors.gold).bold()
         + Text("Câu hỏi rõ được cộng đồng & chuyên gia trả lời nhanh hơn."))
            .font(NodieTypography.metaSm)
            .foregroundStyle(NodieColors.inkSoft)
            .lineSpacing(4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .background(RoundedRectangle(cornerRadius: 13).fill(NodieColors.tagBg))
            .overlay(
                RoundedRectangle(cornerRadius: 13)
                    .strokeBorder(NodieColors.chipBorder, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
            )
    }

    private func submit() async {
        sending = true
        let created = await qa.createQuestion(title: title, body: context, topic: effectiveTag)
        sending = false
        if let created {
            dismiss()
            onCreated(created.id)
        }
    }
}

/// Ô nhập bo tròn của màn hỏi — hai ô chỉ khác font/màu chữ nên gói khung lại một chỗ.
private extension View {
    func fieldBox() -> some View {
        self
            .padding(14)
            .background(RoundedRectangle(cornerRadius: 16).fill(NodieColors.surface))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
    }
}

#if DEBUG
#Preview {
    AskQuestionView(qa: .makePreview()) { _ in }
}
#endif
