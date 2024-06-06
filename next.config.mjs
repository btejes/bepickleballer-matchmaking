/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NODE_ENV === 'production' ? '/matchmaking' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/matchmaking' : '',
  };
  
  export default nextConfig;
  