#!/usr/bin/env node
// Reset agent@battudao.com password using admin SDK.
// Outputs the new password to stdout. Run: node functions/scripts/reset-agent-password.js

const admin = require('firebase-admin')
const crypto = require('crypto')
const path = require('path')

const sa = require(path.resolve(__dirname, '../../src/immortalityvn-firebase-adminsdk-fbsvc-a75c1f4b0e.json'))
admin.initializeApp({ credential: admin.credential.cert(sa) })

const EMAIL = 'agent@battudao.com'

function genPwd() {
  const raw = crypto.randomBytes(18).toString('base64url')
  return raw.slice(0, 24)
}

;(async () => {
  try {
    const user = await admin.auth().getUserByEmail(EMAIL)
    console.log(`✓ User exists: uid=${user.uid}, email=${user.email}, disabled=${user.disabled}`)

    const newPwd = genPwd()
    await admin.auth().updateUser(user.uid, { password: newPwd, emailVerified: true, disabled: false })
    console.log(`\n✓ Password reset successfully.`)
    console.log(`\n  EMAIL:    ${EMAIL}`)
    console.log(`  PASSWORD: ${newPwd}`)
    console.log(`  UID:      ${user.uid}\n`)

    // Verify role grant
    const adminDoc = await admin.firestore().collection('admins').doc(user.uid).get()
    if (adminDoc.exists) {
      console.log(`✓ Role: ${adminDoc.data().role}`)
    } else {
      console.log(`⚠ No /admins/${user.uid} doc — granting "agent" role...`)
      await admin.firestore().collection('admins').doc(user.uid).set({
        email: EMAIL,
        role: 'agent',
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
        grantedBy: 'reset-agent-password.js',
      })
      console.log(`✓ Granted role: agent`)
    }
    process.exit(0)
  } catch (e) {
    console.error('✗ Error:', e.code, e.message)
    process.exit(1)
  }
})()
