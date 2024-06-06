/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NODE_ENV === 'production' ? '/matchmaking' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/matchmaking' : '',
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }
      return config;
    },
  };
  
  export default nextConfig;
  