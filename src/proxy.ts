import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión — no agregar lógica entre createServerClient y getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas que nunca requieren autenticación
  const isPublicRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/invite/')

  // Si está autenticado y va a una ruta pública → dashboard
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si no está autenticado y va a una ruta protegida → login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar organización SOLO para rutas que lo necesitan:
  // /onboarding necesita el check siempre, las demás rutas protegidas
  // solo lo necesitan si no hay cookie indicando que ya tiene org.
  // Usamos una cookie ligera para evitar el RPC en cada navegación.
  if (user && !isPublicRoute) {
    const hasOrgCookie = request.cookies.get('has_org')?.value === '1'

    // Si va a onboarding o no tiene la cookie de org, verificar con RPC
    if (pathname === '/onboarding' || !hasOrgCookie) {
      const { data: orgId } = await supabase.rpc('get_my_org_id')

      if (orgId) {
        // Setear cookie para evitar RPC en futuras navegaciones
        supabaseResponse.cookies.set('has_org', '1', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60, // 1 hora — se revalida periódicamente
          path: '/',
        })
      }

      // Si no tiene organización → onboarding
      if (!orgId && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Si tiene organización y va a onboarding → dashboard
      if (orgId && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    // Si tiene la cookie has_org, saltear el RPC completamente
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
