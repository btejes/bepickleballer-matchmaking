// next.config.js
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
};

module.exports = nextConfig;
