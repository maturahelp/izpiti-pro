import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
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

function redirectToSelectClass(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard/select-class'
  url.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
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
        class: string | null
      }
    | null = null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, plan, is_active, plan_expires_at, class')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[middleware] profiles lookup failed', error)
    }

    profile = data
  } catch (err) {
    console.error('[middleware] profiles lookup failed', err)
  }

  // Lazy-flip за изтекли one-time планове (и recurring, чиито webhook не е
  // дошъл): когато plan_expires_at е в миналото, но row-ът още е
  // is_active=true, го сваляме веднъж. За recurring следващият успешен
  // invoice webhook ще го върне обратно.
  if (
    profile?.plan === 'premium' &&
    profile.is_active === true &&
    profile.plan_expires_at
  ) {
    const expires = new Date(profile.plan_expires_at)
    if (!Number.isNaN(expires.getTime()) && expires <= new Date()) {
      try {
        const admin = createAdminClient()
        await admin
          .from('profiles')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      } catch (err) {
        console.error('[middleware] lazy-flip is_active failed', err)
      }
      profile.is_active = false
    }
  }

  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      return redirectToDashboard(request)
    }
  }

  // Force class selection for accounts that don't have one yet (legacy users
  // and any signup that bypassed the trigger). Skip the select-class page
  // itself so we don't loop. Admins are exempt.
  if (
    pathname.startsWith('/dashboard') &&
    pathname !== '/dashboard/select-class' &&
    profile?.role !== 'admin' &&
    profile?.class !== '7' &&
    profile?.class !== '12'
  ) {
    return redirectToSelectClass(request)
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
