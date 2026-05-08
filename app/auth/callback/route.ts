import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (!code) {
    return NextResponse.redirect(new URL('/forgot-password?error=invalid_link', request.url))
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.redirect(new URL('/forgot-password?error=invalid_link', request.url))
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/forgot-password?error=invalid_link', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
