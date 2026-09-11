#!/usr/bin/env node
// Claude Code "Stop" hook: when a session leaves code changes that are not
// reflected in CHANGELOG.md, ask Claude to add an entry before finishing.
// Never blocks on its own failure — any error exits 0 silently.
// Wired up in .claude/settings.json; documented in docs/ops/monitoring.md.

import { execSync } from 'node:child_process'

const IGNORED = [/^CHANGELOG\.md$/, /^docs\//, /^\.claude\//, /\.md$/, /^package-lock\.json$/]

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

try {
  const input = await new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch {
        resolve({})
      }
    })
    process.stdin.on('error', () => resolve({}))
    setTimeout(() => resolve({}), 1500)
  })

  // Second pass after we already asked once — let the session end.
  if (input.stop_hook_active) process.exit(0)

  const changed = new Set()

  // Uncommitted changes (staged, unstaged, untracked).
  for (const line of git('status --porcelain --untracked-files=all').split('\n')) {
    if (!line.trim()) continue
    changed.add(line.slice(3).trim().replace(/^.* -> /, ''))
  }

  // Commits on this branch that are not on origin/main yet.
  try {
    const branch = git('branch --show-current')
    if (branch && branch !== 'main') {
      for (const f of git('diff --name-only origin/main...HEAD').split('\n')) {
        if (f.trim()) changed.add(f.trim())
      }
    }
  } catch {
    // no origin/main locally — ignore
  }

  const files = [...changed]
  const changelogTouched = files.includes('CHANGELOG.md')
  const significant = files.filter((f) => !IGNORED.some((re) => re.test(f)))

  if (significant.length === 0 || changelogTouched) process.exit(0)

  const today = new Date().toISOString().slice(0, 10)
  const list = significant.slice(0, 12).join(', ') + (significant.length > 12 ? ', …' : '')
  const reason =
    `CHANGELOG.md has no entry for this session's changes (${significant.length} files: ${list}). ` +
    `Add one bullet per meaningful change under a "## ${today}" heading at the top of CHANGELOG.md ` +
    `(create the heading if missing), format: "- type(scope): what — why (author)". ` +
    `Keep it short. If the changes are truly trivial, add a single "chore" line. Then finish.`

  process.stdout.write(JSON.stringify({ decision: 'block', reason }))
  process.exit(0)
} catch {
  process.exit(0)
}
