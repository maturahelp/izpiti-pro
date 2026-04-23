import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { hasActivePremium, requiresActiveSubscription } from '@/lib/subscription-access'
import { getSupabaseEnv } from '@/lib/supabase/env'

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('redirectTo', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

function redirectToDashboard(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'
  url.search = ''
  return NextResponse.redirect(url)
}

function redirectToSubscription(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard/subscription'
  url.search = ''
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const env = getSupabaseEnv()

  if (!env) {
    return redirectToLogin(request)
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  let user: { id: string } | null = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error('[middleware] supabase.auth.getUser() failed', err)
    return redirectToLogin(request)
  }

  if (!user) {
    return redirectToLogin(request)
  }

  let profile:
    | {
        role: string | null
        plan: string | null
        is_active: boolean | null
        plan_expires_at: string | null
      }
    | null = null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, plan, is_active, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[middleware] profiles lookup failed', error)
    }

    profile = data
  } catch (err) {
    console.error('[middleware] profiles lookup failed', err)
  }

  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      return redirectToDashboard(request)
    }
  }

  if (pathname.startsWith('/dashboard') && requiresActiveSubscription(pathname)) {
    if (!hasActivePremium(profile)) {
      return redirectToSubscription(request)
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
