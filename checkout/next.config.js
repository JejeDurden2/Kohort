/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './**/node_modules/@swc/core-linux-x64-gnu',
        './**/node_modules/@swc/core-linux-x64-musl',
        './**/node_modules/esbuild/linux',
      ],
    },
  },
  outputFileTracing: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://www.kohortpay.com',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
