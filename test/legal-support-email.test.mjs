import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const expectedEmail = 'maturahelpbg@gmail.com'
const legacyEmailPattern = new RegExp(['support', 'maturahelp.bg'].join('@').replace('.', '\\.'))
const filesToCheck = [
  'lib/legal-consent.ts',
  'app/(student)/dashboard/help/page.tsx',
  'app/(student)/dashboard/subscription/page.tsx',
  'landing-source.html',
]

test('official support email is consistent across remaining legal contact surfaces', () => {
  for (const relativePath of filesToCheck) {
    const fileContent = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    assert.doesNotMatch(fileContent, legacyEmailPattern)
    const hasExpectedLiteral = fileContent.includes(expectedEmail)
    const hasSharedConstant = fileContent.includes('LEGAL_SUPPORT_EMAIL')
    assert.ok(
      hasExpectedLiteral || hasSharedConstant,
      `${relativePath} should use the official email directly or via LEGAL_SUPPORT_EMAIL`,
    )
  }
})
