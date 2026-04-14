import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminProfile, USER_PROFILE_COLUMNS, type UserProfile } from '@/lib/profile'

function buildLoginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return url
}

async function getAccessContext(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, response }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(USER_PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    profile: (profile as UserProfile | null) ?? null,
    response,
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  const { user, profile, response } = await getAccessContext(request)

  if (!user) {
    return NextResponse.redirect(buildLoginRedirect(request))
  }

  if (isAdminRoute && !isAdminProfile(profile)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
