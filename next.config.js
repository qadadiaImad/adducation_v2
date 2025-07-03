/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: 'export',
  trailingSlash: true,
  
  // Disable features that don't work with static export
  images: {
    unoptimized: true,
  },
  
  // Enable SWC minification
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    forceSwcTransforms: false,
  },
  
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://m4o0sko4wscoc4g8kw880sok.37.27.220.218.sslip.io',
  },
}

module.exports = nextConfig