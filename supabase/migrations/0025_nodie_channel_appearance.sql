-- 0025_nodie_channel_appearance.sql — mặt mũi của kênh: emoji + màu avatar + màu badge.
--
-- Vì sao phải nằm ở DB chứ không suy ra ở client: prototype cho mỗi kênh một bộ riêng và
-- KHÔNG suy được từ `kind` — `naobo` và `vutru` cùng là KÊNH nhưng badge tím #5B43D8 vs
-- xanh #2B5C8A. Emoji càng không: 🧠 cho não bộ, 🔭 cho vũ trụ học là hiểu biết về nội dung,
-- không có công thức nào sinh ra được. Đây là lựa chọn của người tạo kênh — mà chỉ admin
-- mới tạo kênh (quyết định 2026-07-14), nên đặt luôn lúc tạo.
--
-- DM cố tình để trống cả ba: avatar DM lấy chữ cái đầu của người kia và màu suy từ uid họ
-- (khuôn avatar mặc định của Slack/Google) — không ai đi chọn emoji cho từng cuộc 1-1.
--
-- Lưu hex dạng chuỗi '#RRGGBB' chứ không int: đây là giá trị thiết kế, người ta copy thẳng
-- từ Figma/prototype vào. Ép qua int là thêm một bước dịch để sai.

alter table public.channels add column if not exists emoji      text;
alter table public.channels add column if not exists avatar_hex text;
alter table public.channels add column if not exists badge_hex  text;

-- Chặn hex sai định dạng ngay ở DB: client parse '#GGGGGG' sẽ ra màu đen câm lặng,
-- không lỗi, và không ai biết kênh hỏng cho tới lúc nhìn thấy.
alter table public.channels drop constraint if exists channels_hex_format;
alter table public.channels add constraint channels_hex_format check (
  (avatar_hex is null or avatar_hex ~ '^#[0-9A-Fa-f]{6}$')
  and (badge_hex is null or badge_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- Kênh seed: lấy đúng giá trị prototype cho `naobo` (Aion Prototype v3).
-- `thongbao` không có trong prototype → dùng cặp vàng của bảng token (gold #B8862B).
update public.channels set emoji = '🧠', avatar_hex = '#ECE7FB', badge_hex = '#5B43D8'
  where slug = 'naobo' and emoji is null;
update public.channels set emoji = '📢', avatar_hex = '#F3E9D5', badge_hex = '#B8862B'
  where slug = 'thongbao' and emoji is null;
