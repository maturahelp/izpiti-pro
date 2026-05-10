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
  false,
  'CSS ConfettiBurst is not part of the original deployment confetti and must not be used'
)

assert.equal(
  existsSync(join(root, 'components/ui/confetti.tsx')),
  true,
  'original deployment Lottie Confetti component must exist'
)

for (const page of quizPages) {
  const source = readFileSync(join(root, page), 'utf8')

  assert.match(source, /fireCelebrationConfetti/, `${page} must use the shared celebration confetti helper`)
  assert.match(source, /Confetti isActive=\{showLottieConfetti\}/, `${page} must render the full-screen finish confetti`)
  assert.doesNotMatch(source, /ConfettiBurst/, `${page} must not use the later CSS burst overlay`)
  assert.doesNotMatch(source, /import confetti from 'canvas-confetti'/, `${page} must not use direct canvas-confetti imports`)
}

const helper = readFileSync(join(root, 'lib/fireCelebrationConfetti.ts'), 'utf8')
assert.match(helper, /import\('canvas-confetti'\)/, 'celebration helper must load canvas-confetti at click time')
assert.match(helper, /particleCount:\s*4/, 'celebration helper must keep the original deployment first burst size')
assert.match(helper, /particleCount:\s*3/, 'celebration helper must keep the original deployment second burst size')
assert.match(helper, /spread:\s*60/, 'celebration helper must keep the original deployment first spread')
assert.match(helper, /spread:\s*80/, 'celebration helper must keep the original deployment second spread')
assert.doesNotMatch(helper, /zIndex:/, 'original deployment helper did not override canvas z-index')
assert.doesNotMatch(helper, /colors\s*=/, 'original deployment helper did not override canvas colors')
