/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aether-link/core-logic', '@aether-link/ui'],
  output: 'standalone',
};

export default nextConfig;
