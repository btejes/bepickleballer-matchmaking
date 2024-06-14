import { authMiddleware } from './middlewares/auth-middleware';
import { cacheControlMiddleware } from './middlewares/cache-control-middleware';

export async function middleware(request) {
  // Apply cache control middleware first
  let response = cacheControlMiddleware(request);

  // Apply auth middleware
  response = await authMiddleware(request) || response;

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};
