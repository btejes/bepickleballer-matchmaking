// middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log(`Middleware activated. Request Path: ${pathname}`);

  // Allow all /api/ routes without JWT authentication
  if (pathname.startsWith('/api/')) {
    console.log('Path is an API route. Proceeding without authentication.');
    return NextResponse.next();
  }

  // Read JWT token from cookies for protected routes
  const token = cookies().get('token')?.value;
  
  console.log(`JWT Token: ${token}`);

  if (!token) {
    console.log('No JWT Token found. Redirecting to root.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    request.user = payload;
    console.log('Token Verified:', payload);
    return NextResponse.next();
  } catch (error) {
    console.log('JWT Verification Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/profile', '/homepage', '/matches', '/local-play'],
};
