// Offline regression test for /api/upload-from-url and /api/upload-file handlers.
// Mocks req/res + the auth/db/r2 modules — exercises just the request-shape logic,
// no Firebase / R2 calls.
//
// What it locks down:
//   1. /api/upload-from-url returns 400 public_url_required for data:/blob:/file: URLs
//      (previously these hit safeFetch and returned a generic 422 source_fetch_blocked).
//   2. /api/upload-file rejects missing X-Intent (400) and bad Content-Type (415)
//      before touching R2.
//   3. /api/upload-file streams raw bytes through readRawBody — empty body → 400 empty_body.
//
// Run: node functions/scripts/test-upload-handlers.mjs

import { Readable } from 'node:stream'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const LOADER_SRC = `
const stubs = new Map([
  ['_lib/auth.js', \`
    export function applyCors(req, res) { return false }
    export async function requireAgent(req) { return { ok: true, uid: 'test', email: 'agent@battudao.com' } }
    export function jsonError(res, status, error, detail) {
      res.statusCode = status
      res.body = JSON.stringify({ ok: false, error, detail })
      return res
    }
  \`],
  ['_lib/db.js', \`
    export function db() { return { collection: () => ({ add: async () => {} }) } }
    export const FieldValue = { serverTimestamp: () => null }
  \`],
  ['_lib/r2.js', \`
    export const MAX_BYTES = 8 * 1024 * 1024
    export const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
    export const ALLOWED_INTENTS = new Set(['article', 'khaitri'])
    export async function uploadToR2({ bytes, contentType, intent, slug }) {
      return { url: 'https://stub/' + (slug || 'x') + '.' + contentType.split('/')[1], key: 'stub/key', bytes: bytes.length, contentType }
    }
  \`],
])
export async function resolve(specifier, ctx, next) {
  for (const [tail, _] of stubs) if (specifier.endsWith(tail)) return { url: 'stub:' + tail, shortCircuit: true }
  return next(specifier, ctx)
}
export async function load(url, ctx, next) {
  if (url.startsWith('stub:')) return { format: 'module', source: stubs.get(url.slice(5)), shortCircuit: true }
  return next(url, ctx)
}
`
const tmp = mkdtempSync(join(tmpdir(), 'upload-test-'))
const loaderPath = join(tmp, 'loader.mjs')
writeFileSync(loaderPath, LOADER_SRC)
register(pathToFileURL(loaderPath))

const { default: uploadFromUrl } = await import('../../api/upload-from-url.js')
const { default: uploadFile } = await import('../../api/upload-file.js')

function makeRes() {
  return {
    statusCode: 200, body: null, headers: {},
    setHeader(k, v) { this.headers[k] = v },
    status(c) { this.statusCode = c; return this },
    send(b) { this.body = b; return this },
    end() { return this },
  }
}

function makeJsonReq(body) {
  return { method: 'POST', headers: { authorization: 'Bearer x', 'content-type': 'application/json' }, body }
}

function makeStreamReq(headers, bodyBuffer) {
  const stream = Readable.from([bodyBuffer || Buffer.alloc(0)])
  stream.method = 'POST'
  stream.headers = { authorization: 'Bearer x', ...headers }
  return stream
}

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} — ${detail}`) }
}

console.log('upload-from-url: scheme detection')
{
  const res = makeRes()
  await uploadFromUrl(makeJsonReq({ url: 'data:image/png;base64,AAAA', intent: 'article' }), res)
  const j = JSON.parse(res.body)
  check('data: URL → 400 public_url_required', res.statusCode === 400 && j.error === 'public_url_required', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFromUrl(makeJsonReq({ url: 'blob:https://x/abc', intent: 'article' }), res)
  const j = JSON.parse(res.body)
  check('blob: URL → 400 public_url_required', res.statusCode === 400 && j.error === 'public_url_required', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFromUrl(makeJsonReq({ url: 'file:///etc/passwd', intent: 'article' }), res)
  const j = JSON.parse(res.body)
  check('file: URL → 400 public_url_required', res.statusCode === 400 && j.error === 'public_url_required', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFromUrl(makeJsonReq({ intent: 'article' }), res)
  const j = JSON.parse(res.body)
  check('missing url → 400 missing_url', res.statusCode === 400 && j.error === 'missing_url', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFromUrl(makeJsonReq({ url: 'https://example.com/x.png', intent: 'bogus' }), res)
  const j = JSON.parse(res.body)
  check('invalid intent → 400 invalid_intent', res.statusCode === 400 && j.error === 'invalid_intent', `got ${res.statusCode} ${j.error}`)
}

console.log('upload-file: header + body validation')
{
  const res = makeRes()
  await uploadFile(makeStreamReq({ 'content-type': 'image/png' }, Buffer.alloc(0)), res)
  const j = JSON.parse(res.body)
  check('missing X-Intent → 400 invalid_intent', res.statusCode === 400 && j.error === 'invalid_intent', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFile(makeStreamReq({ 'content-type': 'image/svg+xml', 'x-intent': 'article' }, Buffer.alloc(0)), res)
  const j = JSON.parse(res.body)
  check('bad Content-Type → 415 unsupported_content_type', res.statusCode === 415 && j.error === 'unsupported_content_type', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  await uploadFile(makeStreamReq({ 'content-type': 'image/png', 'x-intent': 'article' }, Buffer.alloc(0)), res)
  const j = JSON.parse(res.body)
  check('empty body → 400 empty_body', res.statusCode === 400 && j.error === 'empty_body', `got ${res.statusCode} ${j.error}`)
}
{
  const res = makeRes()
  const png = Buffer.from('89504e470d0a1a0a', 'hex')
  await uploadFile(makeStreamReq({ 'content-type': 'image/png', 'x-intent': 'article', 'x-slug': 'test' }, png), res)
  const j = JSON.parse(res.body)
  check('valid raw png → 200 + r2 stub', res.statusCode === 200 && j.ok === true && j.bytes === png.length, `got ${res.statusCode} ${JSON.stringify(j)}`)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
