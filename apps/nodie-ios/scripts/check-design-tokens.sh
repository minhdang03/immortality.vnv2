#!/bin/bash
# Gate chống drift design token: mọi màu phải đi qua NodieColors (DesignSystem/).
#
# Vì sao tồn tại: màu đỏ lỗi 0xB3261E từng bị hardcode lặp 7 lần ở 3 file (Login,
# PasswordRecovery, Profile) vì NodieColors thiếu token `error` — mỗi màn tự chế một ít
# là bảng màu Claude Design trôi dần mà không ai thấy. Grep rẻ hơn code review.
#
# Luật: `Color(hex:` chỉ được xuất hiện trong DesignSystem/ (nơi định nghĩa token)
# và Models/MockData.swift (fixture prototype cho 2 tab đang ẩn — chết cùng MockData).
# Cần màu mới → thêm token vào NodieColors.swift rồi dùng token, không nhét hex vào view.
#
# Chạy tay: ./scripts/check-design-tokens.sh   (exit 0 = sạch, 1 = có vi phạm)
set -u
cd "$(dirname "$0")/.."

violations=$(grep -rn "Color(hex:" NODIE --include="*.swift" \
  | grep -v "NODIE/DesignSystem/" \
  | grep -v "NODIE/Models/MockData.swift")

if [ -n "$violations" ]; then
  echo "✗ Hex màu ngoài DesignSystem — chuyển thành token trong NodieColors.swift:"
  echo "$violations"
  exit 1
fi
echo "✓ Design tokens sạch — không có Color(hex:) ngoài DesignSystem/."
