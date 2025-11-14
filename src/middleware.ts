import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas protegidas
  const protectedRoutes = ['/dashboard', '/custo-km', '/insights', '/historico', '/desempenho', '/giropro-plus']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se tentar acessar rota protegida sem sessão, redireciona pro login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se já estiver logado e tentar ir pro login, manda pra home
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
