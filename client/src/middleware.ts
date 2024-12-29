import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the request is for a protected route
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/settings');

    // If accessing a protected route without being authenticated
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If accessing auth page while authenticated
    if (req.nextUrl.pathname === '/auth' && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};