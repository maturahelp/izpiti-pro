import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const routePath = join(root, 'app/(marketing)/brochure/page.tsx')
const componentPath = join(root, 'components/marketing/BrochurePage.tsx')

assert.equal(existsSync(routePath), true, 'expected /brochure App Router page to exist')
assert.equal(existsSync(componentPath), true, 'expected brochure experience component to exist')

const route = readFileSync(routePath, 'utf8')
const component = readFileSync(componentPath, 'utf8')

assert.match(route, /metadata/, 'brochure route should export SEO metadata')
assert.match(route, /alternates:\s*\{\s*canonical:\s*['"]\/brochure['"]/, 'brochure metadata should set canonical /brochure')
assert.match(component, /prefers-reduced-motion|useReducedMotion/, 'brochure should respect reduced motion')
assert.match(component, /brochurePages/, 'brochure should be organized as page-based brochure spreads')
assert.match(component, /goToPage/, 'brochure should support direct page navigation')
assert.match(component, /window\.location\.hash/, 'brochure should sync the current page with the URL hash')
assert.match(component, /aria-label="Предишна страница"/, 'brochure should include previous page control')
assert.match(component, /aria-label="Следваща страница"/, 'brochure should include next page control')
assert.match(component, /canvas-confetti/, 'practice question should trigger confetti when answered correctly')
assert.match(component, /Sequence%2002_1\.mp4|Sequence 02_1\.mp4/, 'video page should use the Sequence 02_1.mp4 brochure video')
assert.match(component, /FloatingShapes/, 'brochure should include subtle animated brand shapes')
assert.match(component, /whileHover/, 'brochure controls/cards should include tactile hover transitions')
assert.match(component, /staggerChildren/, 'brochure page content should use staggered entrance transitions')
assert.doesNotMatch(component, /from '@\/components\/marketing\/Header'/, 'brochure should not use the normal website header')
assert.doesNotMatch(component, /from '@\/components\/marketing\/Footer'/, 'brochure should not use the normal website footer')
assert.doesNotMatch(component, /from '@\/components\/marketing\/Pricing'/, 'brochure should not embed the website pricing section')

for (const requiredText of [
  'MaturaHelp',
  'Какво е MaturaHelp?',
  'Как учиш вътре?',
  'Видео уроци',
  'Практика и тестове',
  'AI помощник',
  'НВО и ДЗИ',
  'За ученици',
  'Започни подготовката си',
  'Download brochure PDF',
]) {
  assert.match(component, new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing required brochure copy: ${requiredText}`)
}
