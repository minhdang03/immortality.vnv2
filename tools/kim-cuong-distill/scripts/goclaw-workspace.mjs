import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'

export const WORKSPACE_VOLUME = 'goclaw_goclaw-workspace'
export const CANONICAL_GROUP_PATH = 'de-tu-dang-zalo/de-tu-dang-zalo/group-kim-cuong'

export function workspaceTargets() {
  return [
    CANONICAL_GROUP_PATH,
    'gia-han/giahan1-bot/group-kim-cuong',
    'gia-han/gia-han/group-kim-cuong',
    'gia-han/giahan1-bot/448301215/group-kim-cuong',
    'gia-han/teams/019daba5-4b45-7d81-a9a6-538455c56532/448301215/group-kim-cuong',
  ]
}

export function mirrorFiles(files) {
  const entries = Object.entries(files).filter(([, path]) => path)
  const args = ['run', '--rm', '-v', `${WORKSPACE_VOLUME}:/ws`]
  for (const [name, path] of entries) {
    args.push('-v', `${path}:/src/${basename(name)}:ro`)
  }
  const copies = workspaceTargets().flatMap((target) => [
    `mkdir -p /ws/${target}`,
    `chmod 700 /ws/${target}`,
    ...entries.map(([name]) => `cp /src/${basename(name)} /ws/${target}/${basename(name)}`),
    ...entries.map(([name]) => `chmod 600 /ws/${target}/${basename(name)}`),
  ])
  args.push('alpine', 'sh', '-c', copies.join('\n'))
  execFileSync('docker', args, { encoding: 'utf8', timeout: 30_000 })
}

export function readCanonicalFile(name) {
  try {
    return execFileSync('docker', [
      'run', '--rm', '-v', `${WORKSPACE_VOLUME}:/ws`, 'alpine',
      'cat', `/ws/${CANONICAL_GROUP_PATH}/${basename(name)}`,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30_000 })
  } catch {
    return null
  }
}

export function removeCanonicalFile(name) {
  execFileSync('docker', [
    'run', '--rm', '-v', `${WORKSPACE_VOLUME}:/ws`, 'alpine',
    'rm', '-f', `/ws/${CANONICAL_GROUP_PATH}/${basename(name)}`,
  ], { encoding: 'utf8', timeout: 30_000 })
}
