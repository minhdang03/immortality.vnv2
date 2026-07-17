// push-on-message — đẩy APNs khi có tin nhắn mới. Database Webhook (INSERT trên
// `public.messages`) gọi vào đây.
//
// DM không push là DM chết: người ta nhắn xong không ai biết mà trả lời.
//
// Ai KHÔNG được nhận, và vì sao:
//   - Chính người gửi — máy họ vừa gõ xong, báo lại là phiền.
//   - Người đã tắt thông báo kênh (`muted_until` còn hiệu lực) — họ đã nói "đừng réo".
//   - Người đã CHẶN người gửi — chặn mà vẫn hiện banner tên người đó thì chặn để làm gì.
// Ba luật này phải nằm ở ĐÂY chứ không ở client: client chỉ ẩn được cái đã hiện lên rồi.

import { createClient } from 'jsr:@supabase/supabase-js@2'

/// Host chọn theo TỪNG token (`device_tokens.apns_env`, migration 0027), không phải một
/// biến chung: máy dev và máy TestFlight sống song song, mà token của môi trường này gõ cửa
/// môi trường kia thì APNs trả `BadDeviceToken` cho một token hoàn toàn hợp lệ — trông y hệt
/// token hỏng nên cực khó lần ra.
const APNS_HOST: Record<string, string> = {
  sandbox: 'https://api.sandbox.push.apple.com',
  production: 'https://api.push.apple.com',
}

const TEAM_ID = Deno.env.get('APNS_TEAM_ID')!
const KEY_ID = Deno.env.get('APNS_KEY_ID')!
const BUNDLE_ID = Deno.env.get('APNS_BUNDLE_ID')!
const WEBHOOK_SECRET = Deno.env.get('PUSH_WEBHOOK_SECRET')!

/// APNs từ chối provider token sinh quá dày (`TooManyProviderTokenUpdates`) và cho dùng lại
/// tới 1 giờ. Cache ở module scope — Edge Function tái dùng instance nên phần lớn lời gọi
/// không phải ký lại. 50 phút để không bao giờ chạm mép hết hạn.
let cachedJWT: { token: string; madeAt: number } | null = null

async function apnsJWT(): Promise<string> {
  const now = Date.now()
  if (cachedJWT && now - cachedJWT.madeAt < 50 * 60 * 1000) return cachedJWT.token

  const pem = Deno.env.get('APNS_KEY_P8')!
  const der = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----|\s/g, '')),
    (c) => c.charCodeAt(0),
  )
  const key = await crypto.subtle.importKey(
    'pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
  )

  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const body = `${b64({ alg: 'ES256', kid: KEY_ID })}.${b64({ iss: TEAM_ID, iat: Math.floor(now / 1000) })}`

  // APNs muốn chữ ký ECDSA dạng raw r||s — đúng thứ WebCrypto trả về.
  // (OpenSSL mặc định cho ra DER; nhầm chỗ này là APNs trả InvalidProviderToken.)
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(body),
  )
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const token = `${body}.${sigB64}`
  cachedJWT = { token, madeAt: now }
  return token
}

interface MessageRecord {
  id: string
  channel_id: string
  user_id: string | null
  body: string | null
  metadata: { media?: { kind: string } } | null
}

Deno.serve(async (req) => {
  // Webhook gọi từ Postgres, không phải từ user → xác thực bằng shared secret.
  // Thiếu bước này thì ai cũng POST vào đây bắn thông báo cho cả cộng đồng.
  if (req.headers.get('x-push-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 })
  }

  const payload = await req.json()
  const msg = payload.record as MessageRecord
  if (!msg?.user_id) return new Response('bỏ qua: tin không có người gửi', { status: 200 })

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Thành viên kênh, trừ người gửi và người đang tắt thông báo.
  const { data: members } = await db
    .from('channel_members')
    .select('user_id, muted_until')
    .eq('channel_id', msg.channel_id)
    .neq('user_id', msg.user_id)

  const now = Date.now()
  let targets = (members ?? [])
    .filter((m) => !m.muted_until || new Date(m.muted_until).getTime() < now)
    .map((m) => m.user_id as string)
  if (targets.length === 0) return new Response('không có ai để báo', { status: 200 })

  // Ai đã chặn người gửi thì bỏ ra.
  const { data: blocks } = await db
    .from('blocks')
    .select('blocker_id')
    .eq('blocked_id', msg.user_id)
    .in('blocker_id', targets)
  const blockers = new Set((blocks ?? []).map((b) => b.blocker_id))
  targets = targets.filter((id) => !blockers.has(id))
  if (targets.length === 0) return new Response('tất cả đã chặn người gửi', { status: 200 })

  const [{ data: tokens }, { data: sender }, { data: channel }] = await Promise.all([
    db.from('device_tokens').select('token, user_id, apns_env').in('user_id', targets),
    db.from('profiles').select('display_name').eq('id', msg.user_id).single(),
    db.from('channels').select('title, kind').eq('id', msg.channel_id).single(),
  ])
  if (!tokens?.length) return new Response('không thiết bị nào đăng ký', { status: 200 })

  const who = sender?.display_name ?? 'Ai đó'
  // DM thì tiêu đề là tên người nhắn; kênh/nhóm thì tên kênh, vì trong kênh cái người ta
  // cần biết trước là "chỗ nào đang có chuyện".
  const title = channel?.kind === 'dm' ? who : (channel?.title ?? 'NODIE')
  const preview = msg.metadata?.media
    ? ({ photo: 'Đã gửi một ảnh', voice: 'Đã gửi một tin thoại', file: 'Đã gửi một tệp' }[
        msg.metadata.media.kind
      ] ?? 'Đã gửi một tệp')
    : (msg.body ?? '')
  const body = channel?.kind === 'dm' ? preview : `${who}: ${preview}`

  const jwt = await apnsJWT()
  const results = await Promise.all(
    tokens.map(async (t) => {
      const host = APNS_HOST[t.apns_env] ?? APNS_HOST.production
      const res = await fetch(`${host}/3/device/${t.token}`, {
        method: 'POST',
        headers: {
          authorization: `bearer ${jwt}`,
          'apns-topic': BUNDLE_ID,
          'apns-push-type': 'alert',
          // Gộp thông báo theo kênh: 20 tin trong một nhóm chat không được đẻ ra
          // 20 banner chồng nhau.
          'apns-collapse-id': msg.channel_id,
        },
        body: JSON.stringify({
          aps: { alert: { title, body }, sound: 'default', 'thread-id': msg.channel_id },
          channel_id: msg.channel_id,
          message_id: msg.id,
        }),
      })
      // 410 = app đã bị gỡ khỏi máy đó. Không dọn thì token chết nằm lại mãi và mỗi tin
      // nhắn lại tốn một lần gọi APNs vô ích.
      if (res.status === 410) {
        await db.from('device_tokens').delete().eq('token', t.token)
      }
      return {
        status: res.status,
        env: t.apns_env,
        userId: t.user_id as string,
        reason: res.ok ? null : (await res.json()).reason,
      }
    }),
  )

  // Push hỏng phải ĐỂ LẠI DẤU VẾT (bảng 0036) — trước đây results tính xong rồi vứt,
  // push chết cả tuần không ai hay. Ghi sổ hỏng thì cũng KHÔNG được làm push hỏng:
  // nuốt lỗi, cùng bất biến với 0031.
  const failures = results.filter((r) => r.status !== 200)
  if (failures.length) {
    const { error } = await db.from('push_failures').insert(
      failures.map((r) => ({
        message_id: msg.id,
        channel_id: msg.channel_id,
        user_id: r.userId,
        apns_env: r.env,
        status: r.status,
        reason: r.reason ?? `http_${r.status}`,
      })),
    )
    if (error) console.error('push_failures ghi sổ hỏng:', error.message)
  }

  const sent = results.filter((r) => r.status === 200).length
  return Response.json({ sent, failed: results.length - sent, results })
})
