/** @type {import('next').NextConfig} */
const apiServerUrl = process.env.API_SERVER_URL || 'http://81.71.157.222:3001'

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiServerUrl}/api/:path*` },
      { source: '/healthz', destination: `${apiServerUrl}/healthz` },
    ]
  },
}

export default nextConfig
