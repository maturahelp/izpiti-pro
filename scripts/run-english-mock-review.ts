import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'english-mock-review')
const JSON_REPORT = path.join(OUTPUT_DIR, 'validation-report.json')
const MARKDOWN_REPORT = path.join(OUTPUT_DIR, 'validation-summary.md')
const PORT = 3346

function runCommand(command: string, args: string[], label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, PORT: String(PORT) },
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${label} failed with exit code ${code ?? 'unknown'}.`))
    })
  })
}

async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for server at ${url}.`)
}

function startServer(): ChildProcess {
  return spawn(
    process.execPath,
    ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    }
  )
}

async function verifyAllRoutesResolve(): Promise<void> {
  const { officialEnglishMockExams } = await import('../lib/official-english-mock-data')
  const failures: string[] = []

  for (const exam of officialEnglishMockExams) {
    const response = await fetch(`http://127.0.0.1:${PORT}/english-mock/${encodeURIComponent(exam.id)}`)
    const html = await response.text()
    if (!response.ok || html.includes('Exam Not Found')) {
      failures.push(exam.id)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Route integrity check failed for exam ids: ${failures.join(', ')}`)
  }
}

async function printSummary(): Promise<void> {
  const [jsonReport, markdownReport] = await Promise.all([
    fs.readFile(JSON_REPORT, 'utf8'),
    fs.readFile(MARKDOWN_REPORT, 'utf8'),
  ])
  const parsed = JSON.parse(jsonReport) as {
    summary: { examsChecked: number; groupsChecked: number; issuesFound: number }
  }

  console.log('\nEnglish mock review finished.')
  console.log(`Validation report: ${path.relative(ROOT, JSON_REPORT)}`)
  console.log(`Validation summary: ${path.relative(ROOT, MARKDOWN_REPORT)}`)
  console.log(`Exams checked: ${parsed.summary.examsChecked}`)
  console.log(`Groups checked: ${parsed.summary.groupsChecked}`)
  console.log(`Issues found: ${parsed.summary.issuesFound}`)
  console.log('\nSummary preview:\n')
  console.log(markdownReport.slice(0, 1200))
}

async function main(): Promise<void> {
  await runCommand('npx', ['tsx', 'scripts/validate-english-mock-parser.ts'], 'parser validation')
  await runCommand('npm', ['run', 'build'], 'next build')

  const server = startServer()

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/english-mock`)
    await verifyAllRoutesResolve()
    await runCommand('npx', ['tsx', 'scripts/capture-english-mock-screenshots.ts'], 'visual smoke checks')
  } finally {
    server.kill('SIGTERM')
  }

  await printSummary()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
