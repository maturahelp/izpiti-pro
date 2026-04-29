import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = path.resolve(import.meta.dirname, '..')
const landingHtml = fs.readFileSync(path.join(repoRoot, 'landing-source.html'), 'utf8')
const publicRoot = path.join(repoRoot, 'public')

const coverSrcs = [
  '/nvo_pdfs/NVO TITLE OK IMAGES/JPEG/под игото представлението.webp',
  '/nvo_pdfs/DZI TITLE OK IMAGES/JPEG/Трудът и творчеството/Ветрената мелница.webp',
  '/nvo_pdfs/DZI TITLE OK IMAGES/JPEG/Родното и чуждото/Балкански синдром.webp',
  '/nvo_pdfs/NVO TITLE OK IMAGES/JPEG/Gemini_Generated_Image_4zmu6h4zmu6h4zmu.webp',
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

test('landing book covers use optimized webp assets', () => {
  for (const src of coverSrcs) {
    assert.match(landingHtml, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.ok(fs.existsSync(resolvePublicAsset(src)), `${src} should exist in public assets`)
  }
})

test('landing book covers stay within the size budget', () => {
  for (const src of coverSrcs) {
    const assetPath = resolvePublicAsset(src)
    const assetBuffer = fs.readFileSync(assetPath)
    const { width, height } = readWebpDimensions(assetBuffer)
    const longestEdge = Math.max(width, height)
    const stats = fs.statSync(assetPath)

    assert.ok(
      longestEdge >= 512 && longestEdge <= 800,
      `${src} should be resized to a 512-800px longest edge, got ${width}x${height}`,
    )
    assert.ok(stats.size <= 160 * 1024, `${src} should stay under 160KB, got ${stats.size} bytes`)
  }
})
