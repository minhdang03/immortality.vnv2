#!/usr/bin/env node
const admin = require('firebase-admin')
const path = require('path')
const sa = require(path.resolve(__dirname, '../../src/immortalityvn-firebase-adminsdk-fbsvc-a75c1f4b0e.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })

;(async () => {
  const id = 'Zjwl7TE7ySVl2y7y36SZ'
  await admin.firestore().collection('articles').doc(id).update({
    'vi.question': 'Linh thai là gì?',
    'en.question': 'What is Linh Thai?',
    updatedBy: 'admin-fix-card-display',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log('✓ patched question fields on', id)
  process.exit(0)
})()
