const nextConfig = {
    basePath: '/matchmaking',
    assetPrefix: '/matchmaking',
  
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }
      return config;
    },
  };
  
  export default nextConfig;
  