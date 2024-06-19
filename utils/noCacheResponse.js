// utils/noCacheResponse.js
export function noCacheResponse(body, { status = 200 } = {}) {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json',
      },
    });
  }
  