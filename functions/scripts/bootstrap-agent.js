/**
 * Bootstrap a goclaw agent's Firebase identity in one command.
 *
 * What it does (idempotent):
 *   1. Create or update Firebase Auth user with given email/password
 *   2. Write /admins/{uid} with the requested role
 *   3. Log the op to /agent_log
 *   4. Print UID for the agent to use when signing in
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   node functions/scripts/bootstrap-agent.js \
 *     --email khaitri-bot@battudao.local \
 *     --password 'StrongPassHere' \
 *     --role mod-khaitri
 *
 * Roles: admin | mod-articles | mod-khaitri
 */

const admin = require('firebase-admin')

const VALID_ROLES = ['admin', 'mod-articles', 'mod-khaitri']

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--')) continue
    out[argv[i].slice(2)] = argv[i + 1]
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv)
  const { email, password, role } = args

  if (!email || !password || !role) {
    console.error('Required: --email <email> --password <password> --role <role>')
    console.error('Roles:', VALID_ROLES.join(' | '))
    process.exit(1)
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role: ${role}. Must be one of: ${VALID_ROLES.join(', ')}`)
    process.exit(1)
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() })
  }
  const auth = admin.auth()
  const db = admin.firestore()

  // 1. Create or fetch user
  let user
  try {
    user = await auth.getUserByEmail(email)
    console.log('Existing user found, updating password...')
    await auth.updateUser(user.uid, { password })
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      console.log('Creating new user...')
      user = await auth.createUser({ email, password, emailVerified: true, disabled: false })
    } else {
      throw e
    }
  }

  // 2. Write /admins/{uid}
  await db.collection('admins').doc(user.uid).set({
    role,
    email,
    grantedAt: admin.firestore.FieldValue.serverTimestamp(),
    grantedBy: 'cli-bootstrap-agent',
    isAgent: true,
  })

  // 3. Audit log
  await db.collection('agent_log').add({
    action: 'bootstrap.goclaw-agent',
    params: { email, role, uid: user.uid },
    status: 'success',
    actor: 'cli-bootstrap-agent',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  })

  console.log('\n=== AGENT READY ===')
  console.log('UID:    ', user.uid)
  console.log('Email:  ', email)
  console.log('Role:   ', role)
  console.log('\nGoclaw agent signs in via Firebase Auth (email+password) → gets idToken → uses idToken in Firestore writes. Rules check /admins/{uid}.role.')
  process.exit(0)
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
