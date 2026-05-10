#!/usr/bin/env node
// Tail recent agent_log + new articles/khaitri to track goclaw activity in real-time.
// Run: node functions/scripts/tail-goclaw.js

const admin = require('firebase-admin')
const path = require('path')

const SA_PATH = path.resolve(__dirname, '../../secrets/firebase-admin-sa.json')
const sa = require(SA_PATH)

admin.initializeApp({ credential: admin.credential.cert(sa) })
const db = admin.firestore()

const startedAt = admin.firestore.Timestamp.now()
console.log(`\n🛰  Tailing goclaw activity from ${startedAt.toDate().toISOString()}\n`)
console.log('   Watching: /agent_log, /articles, /khaitri\n')
console.log('   Press Ctrl+C to stop.\n')

function fmtTs(t) {
  if (!t) return '?'
  const d = t.toDate ? t.toDate() : new Date(t)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

// 1. Tail agent_log
db.collection('agent_log')
  .where('createdAt', '>=', startedAt)
  .orderBy('createdAt', 'asc')
  .onSnapshot(snap => {
    snap.docChanges().forEach(c => {
      if (c.type !== 'added') return
      const x = c.doc.data()
      console.log(`📋 [agent_log] ${fmtTs(x.createdAt)}`)
      console.log(`   action: ${x.action}`)
      console.log(`   actor:  ${x.actor || x.email || '?'}`)
      if (x.details) console.log(`   details:`, JSON.stringify(x.details))
      if (x.intent) console.log(`   intent: ${x.intent}`)
      if (x.docId) console.log(`   docId: ${x.docId}`)
      console.log('')
    })
  }, err => console.error('agent_log err:', err.message))

// 2. Tail new articles
db.collection('articles')
  .where('createdAt', '>=', startedAt)
  .orderBy('createdAt', 'asc')
  .onSnapshot(snap => {
    snap.docChanges().forEach(c => {
      if (c.type !== 'added') return
      const x = c.doc.data()
      console.log(`📰 [articles] NEW DOC ${c.doc.id}`)
      console.log(`   sourceRef: ${x.sourceRef}`)
      console.log(`   topic:     ${x.topic}`)
      console.log(`   date:      ${x.date}`)
      console.log(`   status:    ${x.status}`)
      console.log(`   createdBy: ${x.createdBy}`)
      console.log(`   image:     ${x.image || '(none)'}`)
      console.log(`   vi.title:  ${x.vi?.title}`)
      console.log(`   en.title:  ${x.en?.title}`)
      console.log(`   tag:       ${JSON.stringify(x.tag)}`)
      console.log('')
    })
  }, err => console.error('articles err:', err.message))

// 3. Tail new khaitri
db.collection('khaitri')
  .where('createdAt', '>=', startedAt)
  .orderBy('createdAt', 'asc')
  .onSnapshot(snap => {
    snap.docChanges().forEach(c => {
      if (c.type !== 'added') return
      const x = c.doc.data()
      console.log(`💡 [khaitri] NEW DOC ${c.doc.id}`)
      console.log(`   sourceRef: ${x.sourceRef}`)
      console.log(`   order:     ${x.order}`)
      console.log(`   date:      ${x.date}`)
      console.log(`   status:    ${x.status}`)
      console.log(`   createdBy: ${x.createdBy}`)
      console.log(`   vi.title:  ${x.vi?.title}`)
      console.log(`   en.title:  ${x.en?.title}`)
      console.log(`   tag:       ${JSON.stringify(x.tag)}`)
      console.log('')
    })
  }, err => console.error('khaitri err:', err.message))

process.on('SIGINT', () => { console.log('\n👋 Stopped tailing.\n'); process.exit(0) })
