/**
 * Reusable wrapper: agent calls this to write an audit row to /agent_log
 * before/after every privileged op (deploy rules, run migration, grant role, etc.)
 *
 * Usage:
 *   const { logAgentOp } = require('./log-agent-op')
 *   await logAgentOp({
 *     action: 'deploy.firestore.rules',
 *     params: { project: 'immortalityvn' },
 *     status: 'success',
 *   })
 *
 * Read in admin UI via AgentLogTab. Writes use admin SDK only (rules forbid client write).
 */

const admin = require('firebase-admin')
const os = require('os')

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() })
}
const db = admin.firestore()

// Pin actor identity from process env so a CLI caller cannot forge `actor` field.
// Format: `cli:<user>@<host>` — non-spoofable via JS args (still requires SA file access).
function deriveCliActor() {
  const user = process.env.USER || process.env.USERNAME || 'unknown'
  const host = os.hostname() || 'unknown-host'
  return `cli:${user}@${host}`
}

async function logAgentOp({ action, params = {}, status = 'success', error = null, actor }) {
  if (!action) throw new Error('logAgentOp: action required')
  const doc = {
    action,
    params,
    status,
    // Force-derive actor — caller-supplied value ignored to prevent log forgery.
    actor: deriveCliActor(),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }
  if (error) doc.error = String(error?.message || error).slice(0, 1000)
  const ref = await db.collection('agent_log').add(doc)
  return ref.id
}

module.exports = { logAgentOp }

// Allow direct CLI invocation for ad-hoc logging:
//   node functions/scripts/log-agent-op.js '{"action":"manual.note","params":{"msg":"hi"}}'
if (require.main === module) {
  const arg = process.argv[2]
  if (!arg) { console.error('Usage: node log-agent-op.js \'{"action":"...", ...}\''); process.exit(1) }
  const payload = JSON.parse(arg)
  logAgentOp(payload)
    .then(id => { console.log('Logged:', id); process.exit(0) })
    .catch(e => { console.error(e); process.exit(1) })
}
