import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the warning
  turbopack: {},
  webpack: (config) => {
    // Fix for react-pdf
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
