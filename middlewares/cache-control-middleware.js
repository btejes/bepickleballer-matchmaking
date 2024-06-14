import { NextResponse } from 'next/server';

export function cacheControlMiddleware(request) {
  console.log("\nEntered cache middleware file\n");
  const response = NextResponse.next();

  // Set cache-control headers to disable caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  // Log headers to verify
  console.log('Cache-Control Headers Set:', {
    'Cache-Control': response.headers.get('Cache-Control'),
    'Pragma': response.headers.get('Pragma'),
    'Expires': response.headers.get('Expires'),
    'Surrogate-Control': response.headers.get('Surrogate-Control'),
  });

  return response;
}

export const config = {
  matcher: '/:path*', // Apply this middleware to all routes
};
