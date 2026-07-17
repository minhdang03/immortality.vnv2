import SwiftUI

/// Bọc chuỗi "2 phút trước" để nó TỰ TRÔI.
///
/// `relativeTime` bên model là computed — hỏi lúc nào nó cũng trả đúng giờ lúc đó. Cái thiếu
/// không nằm ở model mà ở chỗ **không ai hỏi lại**: SwiftUI chỉ dựng lại body khi state đổi,
/// mà thời gian trôi thì không phải state. TimelineView chính là cái đồng hồ gõ cửa mỗi phút.
///
/// `.everyMinute` chứ không `.periodic(1s)`: đơn vị nhỏ nhất `RelativeTime` nói ra là phút —
/// gõ mỗi giây là dựng lại 60 lần để in ra một chuỗi y hệt.
///
/// Nhận `@ViewBuilder` chứ không nhận `Date` rồi tự vẽ `Text`: bốn chỗ hiện giờ trong app ghép
/// chuỗi bốn kiểu khác nhau ("tên · giờ", "giờ · ☀ 12"…). Ép chung một khuôn `Text` thì phải đẻ
/// ra bốn tham số định dạng — bọc rẻ hơn.
///
/// **Bọc HẸP** — đúng dòng `Text` thôi. TimelineView dựng lại cả cây con của nó mỗi phút; bọc cả
/// card là mỗi phút dựng lại toàn bộ nhánh reply lồng bên dưới.
struct NodieRelativeTimeText<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        TimelineView(.everyMinute) { _ in content() }
    }
}
