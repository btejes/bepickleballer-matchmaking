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

export default nextConfig;
