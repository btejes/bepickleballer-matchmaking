// next.config.mjs
const nextConfig = {
  basePath: '/matchmaking',
  assetPrefix: '/matchmaking/',
  async rewrites() {
    return [
      {
        source: '/matchmaking/:path*',
        destination: '/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Apply these headers to all routes
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['cdn.pixabay.com', 'bepickleballerbucket.s3.us-west-1.amazonaws.com'],
  },
};

export default nextConfig;
