// middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function authMiddleware(request) {
  const { pathname } = request.nextUrl;

  console.log(`Middleware activated. Request Path: ${pathname}`);
  console.log("\nRequest URL:", request.url, "\n");

  // Log all cookies
  console.log('All cookies:', cookies().getAll());

  // Read JWT token from cookies for protected routes
  const token = cookies().get('token')?.value;

  console.log(`JWT Token: ${token}`);

  if (!token) {
    console.log('No JWT Token found. Redirecting to root.');
    // Uncomment the next line if you want to redirect to the login page when no token is found
    // return NextResponse.redirect(new URL('/matchmaking', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    request.user = payload;
    console.log('Token Verified:', payload);

    const response = NextResponse.next();
    return response;
  } catch (error) {
    console.log('JWT Verification Error:', error);
    // Uncomment the next line if you want to redirect to the login page on token verification failure
    // return NextResponse.redirect(new URL('/matchmaking', request.url));
  }

  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: ['/profile', '/homepage', '/matches', '/local-play'],
};
