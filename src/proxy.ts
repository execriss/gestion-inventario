import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/invite']
const AUTH_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the session token on every request
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect authenticated users away from login/register
  if (user && AUTH_ROUTES.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard routes from unauthenticated users
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/api/health')

  if (!user && !isPublic && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
