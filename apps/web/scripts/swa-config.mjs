/**
 * Generates staticwebapp.config.json into ./out after `next build` in
 * static-export mode. Server headers can't exist on pure static hosting,
 * so the CSP (including the live API origin) ships via SWA's config.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : null;
  } catch {
    return null;
  }
})();

const connectSources = ["'self'", ...(apiOrigin ? [apiOrigin] : [])].join(' ');
const contentSecurityPolicy = [
  "default-src 'self'",
  `connect-src ${connectSources}`,
  "script-src 'self' 'unsafe-inline'",
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

const config = {
  responseHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': contentSecurityPolicy,
  },
  navigationFallback: {
    rewrite: '/404.html',
    exclude: ['/_next/*', '/icon.svg', '/staticwebapp.config.json'],
  },
};

mkdirSync('./out', { recursive: true });
writeFileSync('./out/staticwebapp.config.json', JSON.stringify(config, null, 2));
console.log('Wrote out/staticwebapp.config.json (connect-src:', connectSources + ')');
