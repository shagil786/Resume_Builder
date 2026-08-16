import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';

export interface StorageClientConfig {
  accountName: string;
  accountKey: string;
  defaultContainer?: string;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface BlobProperties {
  name: string;
  container: string;
  size: number;
  contentType: string;
  createdAt: Date;
  lastModified: Date;
  metadata: Record<string, string>;
  url: string;
}

export function createBlobStorageClient(config: StorageClientConfig, logger?: Logger) {
  const log = logger ?? new ConsoleLogger('blob-storage');
  const baseUrl = `https://${config.accountName}.blob.core.windows.net`;

  async function buildAuthHeaders(verb: string, url: string, contentLength: string, contentType: string): Promise<HeadersInit> {
    const now = new Date().toUTCString();
    const stringToSign = `${verb}\n\n\n${contentLength}\n\n${contentType}\n\n\n\n\n\n\nx-ms-date:${now}\nx-ms-version:2024-08-04\n/${config.accountName}${new URL(url).pathname}`;

    const key = Uint8Array.from(atob(config.accountKey), c => c.charCodeAt(0));
    const cryptoKey = crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = crypto.subtle.sign('HMAC', await cryptoKey, new TextEncoder().encode(stringToSign));
    const encoded = btoa(String.fromCharCode(...new Uint8Array(await signature)));

    return {
      'x-ms-date': now,
      'x-ms-version': '2024-08-04',
      Authorization: `SharedKey ${config.accountName}:${encoded}`,
    };
  }

  return {
    async upload(container: string, blobName: string, data: ArrayBuffer, options?: UploadOptions): Promise<string> {
      const url = `${baseUrl}/${container}/${encodeURIComponent(blobName)}`;
      const contentType = options?.contentType ?? 'application/octet-stream';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': contentType,
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': '2024-08-04',
          ...(options?.metadata ? Object.fromEntries(
            Object.entries(options.metadata!).map(([k, v]) => [`x-ms-meta-${k}`, v])
          ) : {}),
        },
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Blob upload error: ${response.status} ${errorText}`);
      }

      log.info('Blob uploaded', { container, blobName, size: data.byteLength });
      return url;
    },

    async download(container: string, blobName: string): Promise<{ data: ArrayBuffer; properties: BlobProperties }> {
      const url = `${baseUrl}/${container}/${encodeURIComponent(blobName)}`;

      const response = await fetch(url, {
        headers: {
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': '2024-08-04',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Blob download error: ${response.status} ${errorText}`);
      }

      const data = await response.arrayBuffer();
      const properties: BlobProperties = {
        name: blobName,
        container,
        size: data.byteLength,
        contentType: response.headers.get('Content-Type') ?? 'application/octet-stream',
        createdAt: new Date(response.headers.get('x-ms-creation-time') ?? Date.now()),
        lastModified: new Date(response.headers.get('Last-Modified') ?? Date.now()),
        metadata: {},
        url,
      };

      return { data, properties };
    },

    async delete(container: string, blobName: string): Promise<boolean> {
      const url = `${baseUrl}/${container}/${encodeURIComponent(blobName)}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': '2024-08-04',
        },
      });

      const deleted = response.ok || response.status === 404;
      if (deleted) {
        log.info('Blob deleted', { container, blobName });
      }
      return deleted;
    },

    async list(container: string, prefix?: string): Promise<BlobProperties[]> {
      const url = `${baseUrl}/${container}?restype=container&comp=list${prefix ? `&prefix=${encodeURIComponent(prefix)}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': '2024-08-04',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Blob list error: ${response.status} ${errorText}`);
      }

      const xml = await response.text();
      const blobs = parseBlobListXml(xml);
      return blobs.map(b => ({
        ...b,
        url: `${baseUrl}/${container}/${encodeURIComponent(b.name)}`,
      }));
    },

    async generateSasUrl(container: string, blobName: string, expiryMinutes: number = 60): Promise<string> {
      const blobUrl = `${baseUrl}/${container}/${encodeURIComponent(blobName)}`;
      const now = new Date();
      const expiry = new Date(now.getTime() + expiryMinutes * 60 * 1000);

      const stringToSign = `r\n${now.toISOString().replace(/\.\d{3}Z/, 'Z')}\n${expiry.toISOString().replace(/\.\d{3}Z/, 'Z')}\n/blob/${config.accountName}/${container}/${encodeURIComponent(blobName)}\n\n\n\n\n\n\n\n\n\n\n\n\nx-ms-version:2024-08-04`;

      const key = Uint8Array.from(atob(config.accountKey), c => c.charCodeAt(0));
      const cryptoKey = crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = crypto.subtle.sign('HMAC', await cryptoKey, new TextEncoder().encode(stringToSign));
      const encoded = encodeURIComponent(btoa(String.fromCharCode(...new Uint8Array(await signature))));

      const sasParams = `sv=2024-08-04&se=${encodeURIComponent(expiry.toISOString())}&sr=b&sp=r&sig=${encoded}`;
      return `${blobUrl}?${sasParams}`;
    },

    async ensureContainer(container: string): Promise<void> {
      const url = `${baseUrl}/${container}?restype=container`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': '2024-08-04',
        },
      });

      if (!response.ok && response.status !== 409) {
        const errorText = await response.text();
        throw new Error(`Container creation error: ${response.status} ${errorText}`);
      }

      log.info('Container ensured', { container });
    },
  };
}

function parseBlobListXml(xml: string): { name: string; size: number; contentType: string; createdAt: Date; lastModified: Date; metadata: Record<string, string> }[] {
  const blobs: { name: string; size: number; contentType: string; createdAt: Date; lastModified: Date; metadata: Record<string, string> }[] = [];
  const blobRegex = /<Blob>([\s\S]*?)<\/Blob>/g;
  let match: RegExpExecArray | null;

  while ((match = blobRegex.exec(xml)) !== null) {
    const content = match[1];
    const name = extractXmlValue(content, 'Name');
    const size = parseInt(extractXmlValue(content, 'Content-Length') || '0', 10);
    const contentType = extractXmlValue(content, 'Content-Type');
    const lastModified = new Date(extractXmlValue(content, 'Last-Modified') || Date.now());
    const createdAt = new Date(extractXmlValue(content, 'Creation-Time') || lastModified.toISOString());

    blobs.push({ name, size, contentType, createdAt, lastModified, metadata: {} });
  }

  return blobs;
}

function extractXmlValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
  return match ? match[1] : '';
}
