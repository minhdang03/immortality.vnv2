import SwiftUI
import UIKit

/// Thẻ danh tính — avatar chữ cái, tên, vai trò, bio. Sửa được tại chỗ.
struct ProfileIdentityCard: View {
    let profile: UserProfile?
    @Binding var isEditing: Bool
    @Binding var draftName: String
    @Binding var draftBio: String
    let isBusy: Bool
    let onSave: () -> Void
    let onCancel: () -> Void
    let onEdit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: NodieSpacing.lg) {
                Text(profile?.initial ?? "?")
                    .font(.system(size: 26, weight: .medium, design: .serif))
                    .foregroundStyle(NodieColors.cream)
                    .frame(width: 64, height: 64)
                    .background(Circle().fill(NodieColors.ink))

                VStack(alignment: .leading, spacing: 4) {
                    if isEditing {
                        TextField("Tên hiển thị", text: $draftName)
                            .font(NodieTypography.chatName)
                            .foregroundStyle(NodieColors.ink)
                            .textInputAutocapitalization(.words)
                            .accessibilityIdentifier("Tên hiển thị")
                    } else {
                        Text(profile?.displayName ?? "Chưa đặt tên")
                            .font(NodieTypography.chatName)
                            .foregroundStyle(profile?.displayName == nil ? NodieColors.inkFaint : NodieColors.ink)
                            .accessibilityIdentifier("profileName")
                    }

                    // Chỉ hiện vai trò khi khác 'user' — không gắn nhãn lên người thường.
                    if let roleLabel = profile?.roleLabel {
                        Text(roleLabel)
                            .font(NodieTypography.tag)
                            .foregroundStyle(NodieColors.purple)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(NodieColors.expertBg))
                    }
                }

                Spacer(minLength: 0)
            }

            if isEditing {
                TextField("Đôi dòng về bạn…", text: $draftBio, axis: .vertical)
                    .font(NodieTypography.bodySm)
                    .foregroundStyle(NodieColors.inkBody)
                    .lineLimit(3...5)
                    .padding(NodieSpacing.md)
                    .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.surface))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(NodieColors.chipBorder, lineWidth: 1))
                    .padding(.top, NodieSpacing.lg)
                    .accessibilityIdentifier("Đôi dòng về bạn…")

                HStack(spacing: NodieSpacing.sm) {
                    Button(action: onCancel) {
                        Text("Huỷ")
                            .font(NodieTypography.chip)
                            .foregroundStyle(NodieColors.inkSoft)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
                    }
                    .buttonStyle(.plain)

                    Button(action: onSave) {
                        ZStack {
                            if isBusy { ProgressView().tint(.white) }
                            else { Text("Lưu").font(NodieTypography.chip).foregroundStyle(.white) }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Capsule().fill(NodieColors.accent))
                    }
                    .buttonStyle(.plain)
                    .disabled(isBusy)
                    .accessibilityIdentifier("saveProfile")
                }
                .padding(.top, NodieSpacing.md)
            } else {
                if let bio = profile?.bio, !bio.isEmpty {
                    Text(bio)
                        .font(NodieTypography.bodySm)
                        .foregroundStyle(NodieColors.inkBody)
                        .lineSpacing(4)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.top, NodieSpacing.lg)
                }

                Button(action: onEdit) {
                    Text("Sửa hồ sơ")
                        .font(NodieTypography.meta)
                        .foregroundStyle(NodieColors.inkSoft)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 6)
                        .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .padding(.top, NodieSpacing.lg)
                .accessibilityIdentifier("editProfile")
            }
        }
    }
}

/// Đóng góp của tôi — theo nguyên lý "chiếu sáng" của app.
/// Ba dòng đều đọc Supabase thật (`questions`/`answers`/`question_saves` — migration 0022).
struct ProfileContributionSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Đóng góp của bạn")

            VStack(spacing: 0) {
                link(to: .myQuestions, icon: "questionmark.circle", title: "Câu hỏi của tôi")
                Divider().background(NodieColors.rule)
                link(to: .myAnswers, icon: "text.bubble", title: "Trả lời của tôi")
                Divider().background(NodieColors.rule)
                link(to: .saved, icon: "bookmark", title: "Đã lưu")
            }
            .padding(.top, NodieSpacing.md)
            .background(RoundedRectangle(cornerRadius: 16).fill(NodieColors.surface))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
        }
    }

    /// NavigationLink chứ không `ProfileRow(action:)`: màn này nằm trong hai stack khác
    /// nhau nên không tự append vào path nào được — để link tự tìm stack đang bọc nó.
    private func link(to route: ProfileRoute, icon: String, title: LocalizedStringKey) -> some View {
        NavigationLink(value: route) {
            ProfileRow(icon: icon, title: title, showsChevron: true)
        }
        .buttonStyle(.plain)
    }
}

/// Cài đặt — thông báo (cục bộ), ngôn ngữ (mở Settings hệ thống: app có nhiều localization
/// thì iOS tự cho chọn ngôn ngữ riêng từng app, không phải tự viết picker),
/// người đã chặn + điều khoản (App Store 1.2).
struct ProfileSettingsSection: View {
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @Environment(\.openURL) private var openURL
    let onOpenBlockedUsers: () -> Void
    let onOpenTerms: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Cài đặt")

            VStack(spacing: 0) {
                Toggle(isOn: $notificationsEnabled) {
                    Label {
                        Text("Thông báo").font(NodieTypography.bodySm).foregroundStyle(NodieColors.ink)
                    } icon: {
                        Image(systemName: "bell").foregroundStyle(NodieColors.inkMuted)
                    }
                }
                .tint(NodieColors.accent)
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 14)

                Divider().background(NodieColors.rule)
                ProfileRow(icon: "globe", title: "Ngôn ngữ",
                           trailing: Text(verbatim: Self.currentLanguageName)) {
                    if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
                }
                Divider().background(NodieColors.rule)
                ProfileRow(icon: "hand.raised", title: "Người đã chặn", action: onOpenBlockedUsers)
                Divider().background(NodieColors.rule)
                ProfileRow(icon: "doc.text", title: "Điều khoản sử dụng", action: onOpenTerms)
            }
            .padding(.vertical, 0)
            .background(RoundedRectangle(cornerRadius: 16).fill(NodieColors.surface))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
        }
    }

    /// Tên ngôn ngữ app đang chạy, viết bằng chính ngôn ngữ đó ("Tiếng Việt", "English", "日本語").
    private static var currentLanguageName: String {
        let code = Locale.preferredLanguages.first ?? "vi"
        let name = Locale(identifier: code).localizedString(forIdentifier: code) ?? code
        return name.prefix(1).uppercased() + name.dropFirst()
    }
}

/// Dòng cài đặt/điều hướng dùng chung.
/// `title` tra String Catalog; `trailing` là Text để caller tự quyết localize hay verbatim.
/// Có `action` thì cả dòng thành nút và hiện chevron.
/// `showsChevron` cho trường hợp dòng nằm sẵn trong NavigationLink: link lo phần bấm,
/// dòng chỉ cần vẽ mũi tên (không tự bọc Button — hai nút lồng nhau tranh cú chạm).
struct ProfileRow: View {
    let icon: String
    let title: LocalizedStringKey
    var trailing: Text?
    var action: (() -> Void)?
    var showsChevron = false

    var body: some View {
        if let action {
            Button(action: action) { content }
                .buttonStyle(.plain)
        } else {
            content
        }
    }

    private var content: some View {
        HStack(spacing: NodieSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundStyle(NodieColors.inkMuted)
                .frame(width: 20)

            Text(title)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.ink)

            Spacer()

            if let trailing {
                trailing
                    .font(NodieTypography.meta)
                    .foregroundStyle(NodieColors.inkFaint)
            }

            if action != nil || showsChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(NodieColors.inkFaint)
            }
        }
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.vertical, 14)
        .contentShape(Rectangle())
    }
}
