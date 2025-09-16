/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg'],
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
