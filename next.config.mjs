/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ['*'], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
      {
        protocol: "http", 
        hostname: "**", 
      }
    ],
  },
};

export default nextConfig;
