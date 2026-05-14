// api/_lib/r2.js — Shared R2 (S3-compatible) client + image upload helpers.
// Used by /api/upload-from-url (fetch from public URL) and /api/upload-file (raw bytes).

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const MAX_BYTES = 8 * 1024 * 1024
export const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
export const ALLOWED_INTENTS = new Set(['article', 'khaitri'])

let s3 = null
export function getS3() {
  if (s3) return s3
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 env vars not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)')
  }
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return s3
}

export function safeFilename(slug, ext) {
  const clean = (slug || 'untitled').toString().toLowerCase()
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 80)
  return `${clean}-${Date.now()}.${ext}`
}

export function extFromContentType(ct) {
  if (ct.includes('jpeg')) return 'jpg'
  if (ct.includes('webp')) return 'webp'
  if (ct.includes('gif')) return 'gif'
  return 'png'
}

// Upload buffer to R2; return { url, key, bytes, contentType } on success.
// Throws on misconfig or R2 error (err.code = 'r2_not_configured' when env missing).
export async function uploadToR2({ bytes, contentType, intent, slug }) {
  const bucket = process.env.R2_BUCKET_NAME
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '')
  if (!bucket || !publicBase) {
    const err = new Error('R2_BUCKET_NAME / R2_PUBLIC_URL missing')
    err.code = 'r2_not_configured'
    throw err
  }
  const ext = extFromContentType(contentType)
  const folder = intent === 'article' ? 'articles' : 'khaitri'
  const filename = safeFilename(slug, ext)
  const prefix = process.env.R2_KEY_PREFIX || 'immortality-vn'
  const key = `${prefix}/${folder}/${filename}`

  await getS3().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return {
    url: `${publicBase}/${key}`,
    key,
    bytes: bytes.length,
    contentType,
  }
}
