import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')
const publicRoot = path.join(repoRoot, 'public')

const iconSrcs = [
  '/nvo_pdfs/LANDING PAGE/landing page 3 page icons/Gemini_Generated_Image_53y53k53y53k53y5.webp',
  '/nvo_pdfs/LANDING PAGE/landing page 3 page icons/Gemini_Generated_Image_1zqjw41zqjw41zqj.webp',
  '/nvo_pdfs/LANDING PAGE/landing page 3 page icons/Gemini_Generated_Image_q54f0wq54f0wq54f.webp',
]

function readWebpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Unsupported image container')
  }

  const chunkType = buffer.toString('ascii', 12, 16)

  if (chunkType === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    }
  }

  if (chunkType === 'VP8L') {
    const bits = buffer.readUInt32LE(21)
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >> 14) & 0x3fff),
    }
  }

  if (chunkType === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    }
  }

  throw new Error(`Unsupported WebP chunk type: ${chunkType}`)
}

function resolvePublicAsset(src) {
  return path.join(publicRoot, src.replace(/^\/+/, ''))
}

test('landing page 3 icons use optimized webp assets', () => {
  for (const src of iconSrcs) {
    assert.match(landingHtml, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.ok(fs.existsSync(resolvePublicAsset(src)), `${src} should exist in public assets`)
  }
})

test('landing page 3 icons are resized and lightweight', () => {
  for (const src of iconSrcs) {
    const assetPath = resolvePublicAsset(src)
    const assetBuffer = fs.readFileSync(assetPath)
    const { width, height } = readWebpDimensions(assetBuffer)
    const longestEdge = Math.max(width, height)
    const stats = fs.statSync(assetPath)

    assert.ok(
      longestEdge >= 256 && longestEdge <= 400,
      `${src} should be resized to a 256-400px longest edge, got ${width}x${height}`,
    )
    assert.ok(stats.size <= 100 * 1024, `${src} should stay under 100KB, got ${stats.size} bytes`)
  }
})
