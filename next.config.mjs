module.exports = {
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
  