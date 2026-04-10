import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function parseEnv(raw) {
  const entries = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const splitAt = trimmed.indexOf('=')
    if (splitAt <= 0) {
      continue
    }
    const key = trimmed.slice(0, splitAt).trim()
    const value = trimmed.slice(splitAt + 1).trim()
    entries[key] = value
  }

  return entries
}

const envPath = resolve(process.cwd(), '.env')
const envFromFile = existsSync(envPath)
  ? parseEnv(readFileSync(envPath, 'utf8'))
  : {}

function readEnv(key) {
  return String(process.env[key] ?? envFromFile[key] ?? '').trim()
}

const checks = [
  { key: 'VITE_FIREBASE_API_KEY', label: 'Firebase API key', target: 'web+play' },
  {
    key: 'VITE_FIREBASE_AUTH_DOMAIN',
    label: 'Firebase auth domain',
    target: 'web+play',
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    label: 'Firebase project id',
    target: 'web+play',
  },
  {
    key: 'VITE_FIREBASE_STORAGE_BUCKET',
    label: 'Firebase storage bucket',
    target: 'web+play',
  },
  {
    key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    label: 'Firebase messaging sender id',
    target: 'web+play',
  },
  { key: 'VITE_FIREBASE_APP_ID', label: 'Firebase app id', target: 'web+play' },
  {
    key: 'VITE_FIREBASE_FUNCTIONS_REGION',
    label: 'Firebase functions region',
    target: 'play',
  },
  {
    key: 'VITE_ANDROID_PACKAGE_NAME',
    label: 'Android package name',
    target: 'play',
  },
]

const statuses = checks.map((check) => ({
  ...check,
  value: readEnv(check.key),
}))

const firebaseCoreKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const firebaseCoreReady = firebaseCoreKeys.every(
  (key) => readEnv(key).length > 0
)
const functionsRegionReady = readEnv('VITE_FIREBASE_FUNCTIONS_REGION').length > 0
const androidPackageReady = readEnv('VITE_ANDROID_PACKAGE_NAME').length > 0

const webReady = firebaseCoreReady
const playReady = firebaseCoreReady && functionsRegionReady && androidPackageReady

console.log('\nEarth Chat release preflight\n')
console.log('Check                                    Target    Status')
console.log('-------------------------------------------------------------')

for (const status of statuses) {
  const ok = status.value.length > 0
  const line = `${status.label.padEnd(40)} ${status.target.padEnd(8)} ${
    ok ? 'OK' : 'MISSING'
  }`
  console.log(line)
}

console.log('\nSummary')
console.log(`- Web launch profile: ${webReady ? 'READY' : 'BLOCKED'}`)
console.log(`- Play launch profile: ${playReady ? 'READY' : 'BLOCKED'}`)
console.log(
  '- External step: Google Play developer account review/policy tasks are still required.'
)

if (!webReady || !playReady) {
  console.log('\nAction')
  console.log('- Fill missing keys in .env and run `bun run preflight:release` again.')
  process.exitCode = 1
}
