import { chromium } from 'playwright';
import type { Browser } from 'playwright';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  }
  return browser;
}

export async function shutdownBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export interface PdfOptions {
  format?: 'Letter' | 'A4';
  margin?: { top: string; bottom: string; left: string; right: string };
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

export class PdfRenderEngine {
  async render(html: string, options?: PdfOptions): Promise<Buffer> {
    const b = await getBrowser();
    const page = await b.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle' });
      const pdf = await page.pdf({
        format: options?.format ?? 'Letter',
        margin: options?.margin ?? { top: '0.4in', bottom: '0.4in', left: '0.5in', right: '0.5in' },
        printBackground: options?.printBackground ?? true,
        preferCSSPageSize: options?.preferCSSPageSize ?? true,
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
