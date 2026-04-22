import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseEnv } from '@/lib/supabase/env'

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('redirectTo', request.nextUrl.pathname)
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

  if (pathname.startsWith('/admin')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.search = ''
        return NextResponse.redirect(url)
      }
    } catch (err) {
      console.error('[middleware] profiles role lookup failed', err)
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
