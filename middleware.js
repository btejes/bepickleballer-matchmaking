// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Log for debugging
  console.log(`Middleware activated. Request Path: ${pathname}`);

  // Skip middleware for non-protected routes (e.g., the initial sign-in page)
  if (pathname.startsWith('/matchmaking/api/') || pathname === '/matchmaking') {
    console.log('Path is an API route or sign-in page. Proceeding without authentication.');
    return NextResponse.next();
  }

  // Extract JWT token from cookies
  const token = request.cookies.get('token')?.value;

  console.log(`JWT Token: ${token}`);

  if (!token) {
    console.log('No JWT Token found. Redirecting to sign-in page.');
    return NextResponse.redirect(new URL('/matchmaking', request.url));
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    console.log('Token Verified:', payload);

    // Attach user information to the request for downstream use (if needed)
    request.user = payload;

    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.log('JWT Verification Error:', error);
    return NextResponse.redirect(new URL('/matchmaking', request.url));
  }
}

export const config = {
  matcher: [
    '/matchmaking/profile',
    '/matchmaking/homepage',
    '/matchmaking/matches',
    '/matchmaking/local-play',
    '/matchmaking/api/(.*)'
  ],
};
