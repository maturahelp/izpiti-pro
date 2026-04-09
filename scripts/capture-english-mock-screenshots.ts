import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

type Manifest = {
  port: number
  screenshots: Array<{
    id: string
    label: string
  }>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'english-mock-review', 'screenshots')

function encodeExamRoute(id: string): string {
  return `/english-mock/${encodeURIComponent(id)}`
}

async function loadManifest(): Promise<Manifest> {
  const manifestPath = path.join(__dirname, 'english-mock-review-manifest.json')
  const raw = await fs.readFile(manifestPath, 'utf8')
  return JSON.parse(raw) as Manifest
}

async function main(): Promise<void> {
  const manifest = await loadManifest()
  const browser = await chromium.launch()

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    const page = await browser.newPage({ viewport: { width: 1500, height: 2200 } })

    for (const shot of manifest.screenshots) {
      const url = `http://127.0.0.1:${manifest.port}${encodeExamRoute(shot.id)}`
      await page.goto(url, { waitUntil: 'networkidle' })

      if (await page.getByText('Exam Not Found').count()) {
        throw new Error(`Smoke route failed for ${shot.id}: exam page resolved to not found.`)
      }

      const passageVisible = await page.locator('article p').count()
      const interactiveVisible = await page.locator('textarea, input[type=\"radio\"]').count()
      if (passageVisible === 0 || interactiveVisible === 0) {
        throw new Error(`Smoke route failed for ${shot.id}: expected visible passage and interactive inputs.`)
      }

      const target = path.join(OUTPUT_DIR, `${shot.label}.png`)
      await page.screenshot({ path: target, fullPage: true })
      console.log(`Screenshot saved: ${path.relative(ROOT, target)}`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
