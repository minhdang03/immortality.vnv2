import SwiftUI

/// Danh sách người đã chặn + bỏ chặn — sheet từ màn Cá nhân.
/// Có màn quản lý thì "Chặn" mới là quyết định đảo được; không có nó user chỉ dám báo cáo.
struct BlockedUsersView: View {
    @Bindable var qa: QAStore
    @Environment(\.dismiss) private var dismiss

    @State private var profiles: [UserProfile] = []
    @State private var isLoading = true

    var body: some View {
        VStack(spacing: 0) {
            header

            if isLoading {
                Spacer()
                ProgressView().tint(NodieColors.accent)
                Spacer()
            } else if profiles.isEmpty {
                Spacer()
                Text("Chưa chặn ai.")
                    .font(NodieTypography.body)
                    .foregroundStyle(NodieColors.inkMuted)
                Spacer()
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(profiles) { profile in
                            row(profile)
                            Divider().background(NodieColors.rule)
                        }
                    }
                    .padding(.horizontal, NodieSpacing.screenH)
                }
            }
        }
        .background(NodieColors.bg)
        .task {
            profiles = await qa.blockedProfiles()
            isLoading = false
        }
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "xmark", accessibilityLabel: "Đóng") { dismiss() }
            EyebrowLabel(text: "Người đã chặn", font: NodieTypography.eyebrow)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private func row(_ profile: UserProfile) -> some View {
        HStack(spacing: NodieSpacing.md) {
            InitialAvatar(initial: profile.initial, size: 34)

            Text(verbatim: profile.displayName?.nilIfEmpty ?? String(localized: "Ẩn danh"))
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.ink)

            Spacer()

            Button {
                Task {
                    await qa.unblock(userId: profile.id)
                    profiles.removeAll { $0.id == profile.id }
                }
            } label: {
                Text("Bỏ chặn")
                    .font(NodieTypography.meta)
                    .foregroundStyle(NodieColors.inkSoft)
                    .padding(.horizontal, 13)
                    .padding(.vertical, 6)
                    .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 12)
    }
}
