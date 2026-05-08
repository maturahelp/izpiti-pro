import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const quizPages = [
  'app/(student)/dashboard/literature-exercise/[workId]/page.tsx',
  'app/(student)/dashboard/materials/curriculum-topic/[id]/page.tsx',
  'app/(student)/dashboard/materials/math-7-topics/page.tsx',
  'app/(student)/dashboard/materials/rule/[id]/page.tsx',
]

assert.equal(
  existsSync(join(root, 'components/shared/ConfettiBurst.tsx')),
  true,
  'shared ConfettiBurst overlay must exist for visible quiz answer feedback'
)

for (const page of quizPages) {
  const source = readFileSync(join(root, page), 'utf8')

  assert.match(source, /ConfettiBurst/, `${page} must render the visible CSS confetti burst`)
  assert.match(source, /burstKey/, `${page} must keep a burst key so repeated correct answers re-trigger`)
  assert.match(source, /setConfettiKey\(\(k\) => k \+ 1\)/, `${page} must re-trigger the burst on correct answers`)
  assert.match(source, /fireCelebrationConfetti/, `${page} must use the shared celebration confetti helper`)
  assert.match(source, /Confetti isActive=\{showLottieConfetti\}/, `${page} must render the full-screen finish confetti`)
  assert.doesNotMatch(source, /import confetti from 'canvas-confetti'/, `${page} must not use direct canvas-confetti imports`)
}

const helper = readFileSync(join(root, 'lib/fireCelebrationConfetti.ts'), 'utf8')
assert.match(helper, /import\('canvas-confetti'\)/, 'celebration helper must load canvas-confetti on the client')
assert.match(helper, /zIndex:\s*2147483647/, 'celebration helper must render above dashboard chrome')
