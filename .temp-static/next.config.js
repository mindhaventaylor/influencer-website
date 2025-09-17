/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Custom dist directory for static export
  distDir: 'out',
  // Skip API routes during static export
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;