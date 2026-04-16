const ALLOWED_PROJECT_ID = 'prj_hsaBVFzPek2Twch02965GKSyqA6u'
const ALLOWED_HOST_PREFIX = 'maturahelp-'
const OVERRIDE_ENV = 'VERCEL_FORCE_BUILD'

const {
  VERCEL,
  VERCEL_BRANCH_URL,
  VERCEL_FORCE_BUILD,
  VERCEL_PROJECT_ID,
  VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL,
} = process.env

function hasAllowedPrefix(value) {
  return typeof value === 'string' && value.startsWith(ALLOWED_HOST_PREFIX)
}

if (VERCEL !== '1') {
  console.log('Not running on Vercel, allowing build.')
  process.exit(1)
}

if (VERCEL_FORCE_BUILD === '1') {
  console.log(`${OVERRIDE_ENV}=1, allowing build.`)
  process.exit(1)
}

const allowBuild =
  VERCEL_PROJECT_ID === ALLOWED_PROJECT_ID ||
  hasAllowedPrefix(VERCEL_URL) ||
  hasAllowedPrefix(VERCEL_BRANCH_URL) ||
  hasAllowedPrefix(VERCEL_PROJECT_PRODUCTION_URL)

if (allowBuild) {
  console.log('Allowed Vercel project detected, continuing build.')
  process.exit(1)
}

console.log(
  [
    'Skipping Vercel build for non-maturahelp project.',
    `projectId=${VERCEL_PROJECT_ID || 'missing'}`,
    `url=${VERCEL_URL || 'missing'}`,
    `branchUrl=${VERCEL_BRANCH_URL || 'missing'}`,
    `productionUrl=${VERCEL_PROJECT_PRODUCTION_URL || 'missing'}`,
  ].join(' ')
)
process.exit(0)
