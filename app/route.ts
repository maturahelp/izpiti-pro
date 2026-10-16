import { readFileSync } from 'fs'
import { join } from 'path'
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'zlib'
import { NextResponse } from 'next/server'

const LANDING_PATH = join(process.cwd(), 'landing-source.html')
const isProduction = process.env.NODE_ENV === 'production'

type Encoding = 'br' | 'gzip' | 'identity'

interface LandingPayload {
  body: Buffer
  encoding: Encoding
}

// The landing is a static ~200 KB file. In production it is read and compressed once per
// server instance (the Next server does not compress route-handler responses itself), so a
// request neither hits the filesystem nor re-compresses. In development it is re-read on
// every request so edits show up without a restart.
let cached: Record<Encoding, LandingPayload> | null = null

function buildPayloads(html: string): Record<Encoding, LandingPayload> {
  const raw = Buffer.from(html, 'utf-8')
  return {
    identity: { body: raw, encoding: 'identity' },
    gzip: { body: gzipSync(raw, { level: 9 }), encoding: 'gzip' },
    br: {
      body: brotliCompressSync(raw, {
        params: {
          [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
          [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length,
        },
      }),
      encoding: 'br',
    },
  }
}

function pickEncoding(acceptEncoding: string | null): Encoding {
  const accepted = (acceptEncoding ?? '').toLowerCase()
  if (/\bbr\b/.test(accepted)) return 'br'
  if (/\bgzip\b/.test(accepted)) return 'gzip'
  return 'identity'
}

export function GET(request: Request) {
  if (!isProduction) {
    return new NextResponse(readFileSync(LANDING_PATH, 'utf-8'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  if (cached === null) cached = buildPayloads(readFileSync(LANDING_PATH, 'utf-8'))
  const payload = cached[pickEncoding(request.headers.get('accept-encoding'))]

  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': String(payload.body.length),
    Vary: 'Accept-Encoding',
    // Let the CDN serve the page for an hour and refresh it in the background for a day,
    // so most visits never reach the serverless function. Deploys purge the CDN cache.
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }
  if (payload.encoding !== 'identity') headers['Content-Encoding'] = payload.encoding

  return new NextResponse(new Uint8Array(payload.body), { headers })
}
