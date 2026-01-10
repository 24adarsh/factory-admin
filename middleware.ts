import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (login, API, health checks)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin/login') ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Protect /admin routes - require admin cookie
  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin')?.value;

    if (!adminCookie || adminCookie !== 'true') {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    // Protect admin routes
    '/admin/:path*',
    // But allow login page
    '!/admin/login',
  ],
};
