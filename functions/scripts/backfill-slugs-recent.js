#!/usr/bin/env node
// Stamp viSlug/enSlug on any articles missing them.
// Idempotent: only updates docs where slug fields are missing.

const admin = require('firebase-admin')
const path = require('path')
const sa = require(path.resolve(__dirname, '../../secrets/firebase-admin-sa.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })

const VI_MAP = 'àáạảãâầấậẩẫăằắặẳẵ→a,èéẹẻẽêềếệểễ→e,ìíịỉĩ→i,òóọỏõôồốộổỗơờớợởỡ→o,ùúụủũưừứựửữ→u,ỳýỵỷỹ→y,đ→d'
const SLUG_MAP = {}
VI_MAP.split(',').forEach(g => { const [c, t] = g.split('→'); for (const ch of c) SLUG_MAP[ch] = t })
const toSlug = s => !s ? '' : s.toLowerCase().split('').map(c => SLUG_MAP[c] || c).join('')
  .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

;(async () => {
  const snap = await admin.firestore().collection('articles').get()
  let updated = 0, skipped = 0
  for (const d of snap.docs) {
    const x = d.data()
    if (x.viSlug && x.enSlug) { skipped++; continue }
    const viSlug = toSlug(x.vi?.title) || ''
    const enSlug = toSlug(x.en?.title) || ''
    await d.ref.update({ viSlug, enSlug })
    console.log(`✓ ${d.id} viSlug=${viSlug} enSlug=${enSlug}`)
    updated++
  }
  console.log(`\nDone. Updated: ${updated} | Already-stamped: ${skipped}`)
  process.exit(0)
})()
