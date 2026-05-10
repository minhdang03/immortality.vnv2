#!/usr/bin/env node
const admin = require('firebase-admin')
const path = require('path')
const sa = require(path.resolve(__dirname, '../../secrets/firebase-admin-sa.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })

;(async () => {
  const id = process.argv[2] || 'Zjwl7TE7ySVl2y7y36SZ'
  const doc = await admin.firestore().collection('articles').doc(id).get()
  if (!doc.exists) { console.log('not found'); process.exit(1) }
  const x = doc.data()
  console.log('id:', id)
  console.log('sourceRef:', x.sourceRef)
  console.log('topic:', x.topic, '| date:', x.date, '| status:', x.status)
  console.log('image:', x.image || '(empty)')
  console.log('tag:', x.tag)
  console.log('\n[VI]')
  console.log('  title:    ', x.vi?.title)
  console.log('  question: ', x.vi?.question || '(empty)')
  console.log('  summary:  ', x.vi?.summary || '(empty)')
  console.log('  body len: ', (x.vi?.body || '').length, 'chars')
  console.log('\n[EN]')
  console.log('  title:    ', x.en?.title)
  console.log('  question: ', x.en?.question || '(empty)')
  console.log('  summary:  ', x.en?.summary || '(empty)')
  console.log('  body len: ', (x.en?.body || '').length, 'chars')
  process.exit(0)
})()
