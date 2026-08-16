import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
  }
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => Number.isNaN(part))) return true;
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] === 169 && parts[1] === 254 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || parts[0] === 192 && parts[1] === 168;
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error('Job URL is not valid'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Job URL must use http or https');
  if (parsed.username || parsed.password) throw new Error('Job URL credentials are not allowed');
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) throw new Error('Job URL host is not allowed');
  const addresses = isIP(hostname) ? [hostname] : (await lookup(hostname, { all: true })).map(result => result.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new Error('Job URL host is not publicly reachable');
  return parsed;
}

function htmlToText(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readLimited(response: Response): Promise<string> {
  if (response.body) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) throw new Error('Job posting is too large to analyze');
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_BYTES) throw new Error('Job posting is too large to analyze');
  return text;
}

export async function fetchJobDescription(rawUrl: string): Promise<string> {
  let url = rawUrl;
  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const safeUrl = await assertSafeUrl(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(safeUrl, { redirect: 'manual', signal: controller.signal, headers: { accept: 'text/html,text/plain;q=0.9' } });
    } catch {
      throw new Error('Unable to fetch the job posting');
    } finally { clearTimeout(timeout); }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || attempt === MAX_REDIRECTS) throw new Error('Job posting redirected too many times');
      url = new URL(location, safeUrl).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Job posting returned HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) throw new Error('Job posting must be an HTML or text page');
    const text = htmlToText(await readLimited(response));
    if (text.length < 40) throw new Error('Job posting did not contain enough readable text');
    return text;
  }
  throw new Error('Unable to fetch the job posting');
}
