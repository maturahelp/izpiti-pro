import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const expectedEmail = 'support@maturahelp.com'
const disallowedEmailPatterns = [
  /maturahelpbg@gmail\.com/,
  /support@izpitipro\.bg/,
  /support@maturahelp\.bg/,
]
const filesToCheck = [
  'lib/legal-consent.ts',
  'app/(student)/dashboard/help/page.tsx',
  'app/(student)/dashboard/subscription/page.tsx',
  'app/(admin)/admin/settings/page.tsx',
  'landing-source.html',
]

test('official support email is consistent across remaining legal contact surfaces', () => {
  for (const relativePath of filesToCheck) {
    const fileContent = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    for (const pattern of disallowedEmailPatterns) {
      assert.doesNotMatch(fileContent, pattern)
    }
    const hasExpectedLiteral = fileContent.includes(expectedEmail)
    const hasSharedConstant = fileContent.includes('LEGAL_SUPPORT_EMAIL')
    assert.ok(
      hasExpectedLiteral || hasSharedConstant,
      `${relativePath} should use the official email directly or via LEGAL_SUPPORT_EMAIL`,
    )
  }
})
