#!/usr/bin/env node
// Snapshot recent docs across articles + khaitri + agent_log (last 30 min).

const admin = require('firebase-admin')
const path = require('path')
const sa = require(path.resolve(__dirname, '../../src/immortalityvn-firebase-adminsdk-fbsvc-a75c1f4b0e.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()

const since = admin.firestore.Timestamp.fromMillis(Date.now() - 30 * 60 * 1000)

async function dump(coll, label) {
  try {
    const snap = await db.collection(coll)
      .where('createdAt', '>=', since)
      .orderBy('createdAt', 'desc')
      .limit(10).get()
    console.log(`\n=== ${label} (${snap.size} docs in last 30 min) ===`)
    snap.forEach(d => {
      const x = d.data()
      console.log(`\n  id: ${d.id}`)
      console.log(`  createdAt: ${x.createdAt?.toDate?.().toISOString() || '?'}`)
      console.log(`  createdBy: ${x.createdBy || '?'}`)
      console.log(`  sourceRef: ${x.sourceRef || '(none)'}`)
      console.log(`  status:    ${x.status || '?'}`)
      if (x.topic) console.log(`  topic:     ${x.topic}`)
      if (x.order) console.log(`  order:     ${x.order}`)
      console.log(`  date:      ${x.date}`)
      console.log(`  vi.title:  ${x.vi?.title || '?'}`)
      console.log(`  en.title:  ${x.en?.title || '?'}`)
      console.log(`  tag:       ${JSON.stringify(x.tag)}`)
      console.log(`  image:     ${x.image || '(none)'}`)
      console.log(`  vi.body excerpt: ${(x.vi?.body || '').slice(0, 120).replace(/\n/g,' ')}...`)
    })
  } catch (e) { console.error(`  ${label} err:`, e.message) }
}

async function dumpLog() {
  try {
    const snap = await db.collection('agent_log')
      .where('createdAt', '>=', since)
      .orderBy('createdAt', 'desc')
      .limit(20).get()
    console.log(`\n=== agent_log (${snap.size} entries in last 30 min) ===`)
    snap.forEach(d => {
      const x = d.data()
      console.log(`\n  ${x.createdAt?.toDate?.().toISOString()} | ${x.action} | ${x.actor || x.email || '?'}`)
      if (x.intent) console.log(`    intent: ${x.intent}`)
      if (x.docId) console.log(`    docId: ${x.docId}`)
      if (x.path) console.log(`    path: ${x.path}`)
      if (x.method) console.log(`    method: ${x.method}`)
      if (x.detail) console.log(`    detail:`, JSON.stringify(x.detail))
      if (x.error) console.log(`    error: ${x.error}`)
    })
  } catch (e) { console.error('  agent_log err:', e.message) }
}

;(async () => {
  await dump('articles', 'ARTICLES')
  await dump('khaitri', 'KHAITRI')
  await dumpLog()
  process.exit(0)
})()
