#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicWriteJson } from './digest-state.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const UI = join(ROOT, 'ui')
const DATA = join(ROOT, 'data')
const PORT = Number(process.env.PORT || 8765)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

  // API: load qa
  if (url.pathname === '/api/qa' && req.method === 'GET') {
    const p = join(DATA, 'qa.json')
    const body = existsSync(p) ? readFileSync(p) : Buffer.from('{"meta":{},"items":[]}')
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(body)
    return
  }

  // API: save qa item patch
  if (url.pathname === '/api/qa' && req.method === 'PUT') {
    try {
      const chunks = []
      let size = 0
      for await (const c of req) {
        size += c.length
        if (size > 256 * 1024) throw new Error('Request body too large')
        chunks.push(c)
      }
      const patch = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      const p = join(DATA, 'qa.json')
      const data = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { meta: {}, items: [] }
      const idx = data.items.findIndex((item) => item.id === patch.id)
      if (idx < 0) throw new Error('Q&A item not found')
      const item = data.items[idx]
      const allowed = new Set(['candidate', 'verified', 'rejected', 'unanswered'])
      if (!allowed.has(patch.status)) throw new Error('Invalid status')
      if (!Array.isArray(patch.tags) || patch.tags.length > 20 || patch.tags.some((tag) => typeof tag !== 'string' || tag.length > 80)) {
        throw new Error('Invalid tags')
      }
      if (typeof patch.notes !== 'string' || patch.notes.length > 20_000) throw new Error('Invalid notes')
      if (patch.distilled !== null && (typeof patch.distilled !== 'string' || patch.distilled.length > 100_000)) {
        throw new Error('Invalid distilled content')
      }
      if ((patch.status === 'verified' || patch.status === 'rejected') && !item.answer?.msg_id) {
        throw new Error('Cannot decide an item without an answer')
      }

      const decisionsPath = join(DATA, 'qa-decisions.json')
      const decisions = existsSync(decisionsPath)
        ? JSON.parse(readFileSync(decisionsPath, 'utf8'))
        : { version: 1, pairs: {}, questions: {} }
      const now = new Date().toISOString()
      const questionId = item.question.msg_id
      decisions.questions[questionId] = {
        tags: patch.tags || [], notes: patch.notes || '', distilled: patch.distilled || null, updated_at: now,
      }
      if (item.answer?.msg_id) {
        const key = `${questionId}::${item.answer.msg_id}`
        if (patch.status === 'verified') {
          const duplicate = Object.values(decisions.pairs).find((decision) => (
            decision.status === 'verified' && decision.answer_msg_id === item.answer.msg_id &&
            decision.question_msg_id !== questionId
          ))
          if (duplicate) throw new Error('Teacher answer is already verified for another question')
          for (const [otherKey, decision] of Object.entries(decisions.pairs)) {
            if (decision.question_msg_id === questionId && decision.status === 'verified') delete decisions.pairs[otherKey]
          }
        }
        if (patch.status === 'verified' || patch.status === 'rejected') {
          decisions.pairs[key] = {
            question_msg_id: questionId,
            answer_msg_id: item.answer.msg_id,
            status: patch.status,
            updated_at: now,
          }
        } else {
          delete decisions.pairs[key]
        }
      }
      atomicWriteJson(decisionsPath, decisions)
      data.items[idx] = {
        ...item,
        status: patch.status,
        tags: patch.tags,
        notes: patch.notes,
        distilled: patch.distilled,
        updated_at: now,
      }
      atomicWriteJson(p, data)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, item: data.items[idx] }))
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: error.message }))
    }
    return
  }

  // API: export markdown
  if (url.pathname === '/api/export.md' && req.method === 'GET') {
    const p = join(DATA, 'qa.json')
    const data = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { items: [] }
    const lines = ['# Kim Cương Bất Tử — Q&A distill', '']
    for (const it of data.items || []) {
      if (it.status !== 'verified') continue
      lines.push(`## ${it.question?.from || 'Học trò'} — ${it.question?.ts || ''}`)
      lines.push('')
      lines.push(`**Hỏi:** ${it.question?.text || ''}`)
      lines.push('')
      lines.push(`**Đáp (${it.answer?.from || 'Thầy'}):** ${it.distilled || it.answer?.text || ''}`)
      lines.push('')
      if (it.tags?.length) lines.push(`Tags: ${it.tags.join(', ')}`, '')
      lines.push('---', '')
    }
    res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' })
    res.end(lines.join('\n'))
    return
  }

  let path = url.pathname === '/' ? '/index.html' : url.pathname
  const file = join(UI, path.replace(/^\//, ''))
  if (!file.startsWith(UI) || !existsSync(file)) {
    res.writeHead(404)
    res.end('not found')
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Kim Cương distill UI → http://127.0.0.1:${PORT}`)
})
