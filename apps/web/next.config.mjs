/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');
    return [
      { source: '/api/v1/:path*', destination: `${apiBase}/:path*` },
    ];
  },
};

export default nextConfig;
