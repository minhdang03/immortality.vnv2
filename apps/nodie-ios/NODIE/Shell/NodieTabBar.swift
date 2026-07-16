import SwiftUI

/// Nhãn và ký hiệu lấy nguyên từ `Aion Prototype v3.dc.html`.
enum NodieTab: String, CaseIterable, Identifiable {
    case feed = "Bảng tin"
    case qa = "Hỏi đáp"
    case conversations = "Chat"
    case journey = "Hành trình"
    case friends = "Bạn bè"

    var id: String { rawValue }

    /// Chỉ 3 tab này có nút vào. Bảng tin & Hành trình còn nguyên code và còn nhánh
    /// trong `RootTabView` — chỉ tạm rút khỏi tab bar, sẽ mở lại sau. Vì vậy tab bar
    /// lặp qua đây chứ KHÔNG qua `allCases`.
    static let visibleTabs: [NodieTab] = [.qa, .conversations, .friends]

    /// Nhãn hiển thị — rawValue tiếng Việt làm KEY tra String Catalog.
    /// `Text(tab.rawValue)` trực tiếp là init verbatim (String biến), không tra catalog.
    var title: LocalizedStringKey { LocalizedStringKey(rawValue) }

    /// Prototype dùng ký tự Unicode chứ không phải icon font — giữ nguyên cho khớp.
    var glyph: String {
        switch self {
        case .feed: return "✦"
        case .qa: return "?"
        case .conversations: return "◧"
        case .journey: return "◍"
        case .friends: return "◎"
        }
    }
}

/// Tab bar nổi dạng viên thuốc tối, cách mép dưới một khoảng.
struct NodieTabBar: View {
    let selection: NodieTab
    /// Tổng tin chưa đọc — chấm đếm trên tab Chat (chuẩn FB/IG/Zalo). 0 = không vẽ gì.
    var unreadCount: Int = 0
    let onSelect: (NodieTab) -> Void

    var body: some View {
        HStack(spacing: 0) {
            ForEach(NodieTab.visibleTabs) { tab in
                Button {
                    onSelect(tab)
                } label: {
                    VStack(spacing: 1) {
                        Text(verbatim: tab.glyph)
                            .font(NodieTypography.tabIcon)
                            .overlay(alignment: .topTrailing) {
                                if tab == .conversations, unreadCount > 0 {
                                    UnreadBadge(count: unreadCount)
                                        .scaleEffect(0.72)   // viên của row 20pt — trên glyph tab thì thu lại
                                        .offset(x: 14, y: -5)
                                }
                            }
                        Text(tab.title).font(NodieTypography.tabLabel)
                    }
                    .foregroundStyle(selection == tab ? NodieColors.cream : NodieColors.tabDim)
                    .frame(maxWidth: .infinity)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(tab.title))
                .accessibilityValue(tab == .conversations && unreadCount > 0
                                    ? Text("\(unreadCount) tin chưa đọc") : Text(verbatim: ""))
                .accessibilityAddTraits(selection == tab ? [.isSelected, .isButton] : .isButton)
            }
        }
        .padding(.vertical, 11)
        .padding(.horizontal, NodieSpacing.sm)
        .background(Capsule().fill(NodieColors.ink))
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.bottom, NodieSpacing.sm)
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        NodieColors.bg.ignoresSafeArea()
        NodieTabBar(selection: .qa) { _ in }
    }
}
