import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const publicRoutes = ['/welcome', '/auth', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if token exists (simple check, no verification)
  const token = req.cookies.get('authToken')?.value;
  
  if (!token) {
    console.log('No auth token found, redirecting to welcome');
    return NextResponse.redirect(new URL('/welcome', req.url));
  }

  // Let the client-side handle token verification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};