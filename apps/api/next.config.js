/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aether-link/core-logic', '@aether-link/db'],
  output: 'standalone',
  serverExternalPackages: ['postgres', 'bcryptjs'],
};

export default nextConfig;
