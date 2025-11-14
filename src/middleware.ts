import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔥 Middleware baseado apenas em rotas públicas
// Não tenta validar sessão no servidor (porque o Supabase Free não mantém cookies)
export function middleware(req: NextRequest) {

  const protectedRoutes = [
    '/dashboard',
    '/custo-km',
    '/insights',
    '/historico',
    '/desempenho',
    '/giropro-plus'
  ];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // ❗ Se rota é protegida, deixamos o CLIENTE verificar a sessão
  // O client (layout.tsx) já salva e recupera a sessão via localStorage
  if (isProtected) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
