import SwiftUI

/// Đích push được TỪ màn Cá nhân.
///
/// Enum riêng chứ không nhét vào FeedRoute/FriendsRoute: màn Cá nhân sống trong CẢ HAI
/// stack đó, mà nó không có cách nào biết mình đang ở stack nào. Đây là lý do
/// `feedPath`/`friendsPath` là `NavigationPath` (chứa được nhiều kiểu) chứ không phải
/// mảng có kiểu — mảng `[FeedRoute]` sẽ nuốt lặng NavigationLink mang ProfileRoute.
enum ProfileRoute: Hashable {
    case myQuestions
    case myAnswers
    case saved
    /// Mở lại một câu hỏi NGAY TRONG stack này, không nhảy sang tab Hỏi đáp: đang xem
    /// "Đã lưu" mà bị quăng sang tab khác thì mất luôn đường quay lại danh sách.
    case question(String)
}

/// Cá Nhân — vào bằng avatar góc header Bảng tin (prototype đã đặt sẵn lối này).
/// Không phải tab thứ 5: prototype chỉ có 4 tab, giữ nguyên.
struct ProfileView: View {
    @Bindable var auth: AuthStore
    /// Cho màn "Người đã chặn" — danh sách chặn sống trong QAStore vì nó lọc nội dung Q&A.
    @Bindable var qa: QAStore
    @Environment(\.dismiss) private var dismiss

    @State private var stats = ProfileStatsStore()
    @State private var isEditing = false
    @State private var draftName = ""
    @State private var draftBio = ""
    @State private var showSignOutConfirm = false
    @State private var showBlockedUsers = false
    @State private var showTerms = false
    @State private var showGuidelines = false
    @State private var showDeleteConfirm = false

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    ProfileIdentityCard(
                        profile: auth.profile,
                        isEditing: $isEditing,
                        draftName: $draftName,
                        draftBio: $draftBio,
                        isBusy: auth.isBusy,
                        onSave: {
                            Task {
                                await auth.updateProfile(displayName: draftName, bio: draftBio)
                                if auth.errorMessage == nil { isEditing = false }
                            }
                        },
                        onCancel: { isEditing = false; resetDraft() },
                        onEdit: { resetDraft(); isEditing = true }
                    )

                    if let error = auth.errorMessage {
                        Text(error)
                            .font(NodieTypography.meta)
                            .foregroundStyle(NodieColors.error)
                            .padding(.top, NodieSpacing.md)
                    }

                    ProfileStatsGrid(stats: stats)
                        .padding(.top, NodieSpacing.xl)

                    // "Đóng góp của bạn" (câu hỏi/trả lời/đã lưu) là nội dung Q&A — trốn
                    // cùng gate với tab Hỏi đáp. User thường chưa mở Q&A thì ba mục này rỗng
                    // và vô nghĩa; chỉ dev (admin/mod) thấy. Xem `NodieTab.qaUnlocked`.
                    if NodieTab.qaUnlocked(role: auth.profile?.role) {
                        ProfileContributionSection()
                            .padding(.top, NodieSpacing.xl)
                    }

                    ProfileSettingsSection(
                        onOpenBlockedUsers: { showBlockedUsers = true },
                        onOpenGuidelines: { showGuidelines = true },
                        onOpenTerms: { showTerms = true }
                    )
                    .padding(.top, NodieSpacing.xl)

                    signOutButton
                        .padding(.top, NodieSpacing.xl)

                    deleteAccountButton
                        .padding(.top, NodieSpacing.md)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.top, NodieSpacing.lg)
                .padding(.bottom, NodieSpacing.xxl)
            }
        }
        .background(NodieColors.bg)
        .confirmationDialog("Đăng xuất khỏi NODIE?", isPresented: $showSignOutConfirm, titleVisibility: .visible) {
            Button("Đăng xuất", role: .destructive) { Task { await auth.signOut() } }
            Button("Huỷ", role: .cancel) {}
        }
        .confirmationDialog("Xoá tài khoản?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Xoá vĩnh viễn", role: .destructive) { Task { await auth.deleteAccount() } }
            Button("Huỷ", role: .cancel) {}
        } message: {
            Text("Hồ sơ và dữ liệu cá nhân bị xoá vĩnh viễn; câu hỏi và trả lời đã đăng chuyển thành ẩn danh. Không thể hoàn tác.")
        }
        .sheet(isPresented: $showBlockedUsers) { BlockedUsersView(qa: qa) }
        .sheet(isPresented: $showTerms) { TermsOfUseView() }
        .sheet(isPresented: $showGuidelines) { CommunityGuidelinesView() }
        // Khai ở ĐÂY chứ không ở RootTabView: màn này được push từ cả stack Bảng tin lẫn
        // stack Bạn bè — khai một lần tại chỗ thì hai stack dùng chung, khỏi chép hai bản.
        .navigationDestination(for: ProfileRoute.self) { route in
            Group {
                switch route {
                case .myQuestions: MyQuestionsView(qa: qa)
                case .myAnswers:   MyAnswersView(qa: qa)
                case .saved:       SavedQuestionsView(qa: qa)
                case .question(let id): QuestionDetailView(qa: qa, questionId: id)
                }
            }
            .nodieDetailScreen()
        }
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "arrow.left") { dismiss() }
            EyebrowLabel(text: "Cá nhân", font: NodieTypography.eyebrow)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private var signOutButton: some View {
        Button {
            showSignOutConfirm = true
        } label: {
            Text("Đăng xuất")
                .font(NodieTypography.chip)
                .foregroundStyle(NodieColors.error)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("signOutButton")
    }

    /// Nhẹ hơn Đăng xuất một bậc thị giác (chỉ chữ, không viền) nhưng vẫn đỏ —
    /// hành động huỷ diệt không được trông như một nút thường.
    private var deleteAccountButton: some View {
        Button {
            showDeleteConfirm = true
        } label: {
            Text("Xoá tài khoản")
                .font(NodieTypography.meta)
                .foregroundStyle(NodieColors.error.opacity(0.8))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("deleteAccountButton")
    }

    private func resetDraft() {
        draftName = auth.profile?.displayName ?? ""
        draftBio = auth.profile?.bio ?? ""
    }
}

#Preview {
    ProfileView(auth: AuthStore(), qa: QAStore())
}
