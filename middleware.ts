import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/welcome', req.url));
  }

  try {
    // Validate token with API
    const response = await axios.get(`${req.nextUrl.origin}/api/auth/tokenverify`, {
      headers: { Cookie: `authToken=${token}` },
      cache: 'no-store',
    });
    if (!response.data.userId) {
      return NextResponse.redirect(new URL('/welcome', req.url));
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.redirect(new URL('/welcome', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/classes', '/examination', '/class/:path*'],
};