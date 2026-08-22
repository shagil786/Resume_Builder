/** @type {import('next').NextConfig} */
const isStaticExport = process.env.BUILD_STATIC === 'true';

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : null;
  } catch {
    return null;
  }
})();
const connectSources = ["'self'", ...(apiOrigin ? [apiOrigin] : [])].join(' ');
const scriptSources = ["'self'", "'unsafe-inline'", ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])].join(' ');
const contentSecurityPolicy = [
  "default-src 'self'",
  `connect-src ${connectSources}`,
  `script-src ${scriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "frame-src 'self'",
  "child-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  // Static export mode for CDN hosts (Azure Static Web Apps). Local dev and
  // server builds keep the dev proxy so cookies stay first-party locally.
  ...(isStaticExport ? { output: 'export', trailingSlash: true } : {}),
  // Playwright uses 127.0.0.1 while Next serves the dev app on localhost.
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    if (isStaticExport) return [];
    return [{
      source: '/(.*)',
      headers: [
        ...securityHeaders,
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      ],
    }];
  },
  async rewrites() {
    if (isStaticExport) return [];
    const apiBase = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');
    return [
      { source: '/api/v1/:path*', destination: `${apiBase}/:path*` },
    ];
  },
};

export default nextConfig;
