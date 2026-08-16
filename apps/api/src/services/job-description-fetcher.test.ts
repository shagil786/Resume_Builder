import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchJobDescription } from './job-description-fetcher.js';

describe('fetchJobDescription', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rejects localhost targets before making a request', async () => {
    await expect(fetchJobDescription('http://localhost:3000/job')).rejects.toThrow('not allowed');
  });

  it('extracts readable text from a public HTML response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      '<html><head><style>hidden</style></head><body><h1>Product Designer</h1><p>Lead research and accessible product improvements across our platform.</p></body></html>',
      { headers: { 'content-type': 'text/html' } },
    )));
    await expect(fetchJobDescription('https://1.1.1.1/jobs/design')).resolves.toContain('Lead research and accessible product improvements');
  });

  it('rejects unsupported content types', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('binary', { headers: { 'content-type': 'application/pdf' } })));
    await expect(fetchJobDescription('https://1.1.1.1/jobs/design')).rejects.toThrow('HTML or text');
  });
});
