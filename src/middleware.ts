import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Cria cliente do supabase com req/res corretos (IMPORTANTE)
  const supabase = createMiddlewareClient({ req, res })

  // Checa sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedRoutes = [
    '/dashboard',
    '/custo-km',
    '/insights',
    '/historico',
    '/desempenho',
    '/giropro-plus'
  ]

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Se não logado e tentando acessar rota protegida
  if (isProtected && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
