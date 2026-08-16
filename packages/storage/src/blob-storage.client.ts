import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
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
  const credential = new StorageSharedKeyCredential(config.accountName, config.accountKey);
  const service = new BlobServiceClient(`https://${config.accountName}.blob.core.windows.net`, credential);

  function blobClient(container: string, blobName: string) {
    return service.getContainerClient(container).getBlockBlobClient(blobName);
  }

  function toProperties(container: string, blobName: string, properties: {
    contentLength?: number;
    contentType?: string;
    createdOn?: Date;
    lastModified?: Date;
    metadata?: Record<string, string>;
  }, url: string): BlobProperties {
    return {
      name: blobName,
      container,
      size: properties.contentLength ?? 0,
      contentType: properties.contentType ?? 'application/octet-stream',
      createdAt: properties.createdOn ?? properties.lastModified ?? new Date(),
      lastModified: properties.lastModified ?? new Date(),
      metadata: properties.metadata ?? {},
      url,
    };
  }

  return {
    async upload(container: string, blobName: string, data: ArrayBuffer, options?: UploadOptions): Promise<string> {
      const client = blobClient(container, blobName);
      await client.uploadData(new Uint8Array(data), {
        blobHTTPHeaders: { blobContentType: options?.contentType ?? 'application/octet-stream' },
        metadata: options?.metadata,
      });
      log.info('Blob uploaded', { container, blobName, size: data.byteLength });
      return client.url;
    },

    async download(container: string, blobName: string): Promise<{ data: ArrayBuffer; properties: BlobProperties }> {
      const client = blobClient(container, blobName);
      const [data, properties] = await Promise.all([client.downloadToBuffer(), client.getProperties()]);
      return {
        data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
        properties: toProperties(container, blobName, properties, client.url),
      };
    },

    async delete(container: string, blobName: string): Promise<boolean> {
      const deleted = (await blobClient(container, blobName).deleteIfExists()).succeeded;
      if (deleted) log.info('Blob deleted', { container, blobName });
      return deleted;
    },

    async list(container: string, prefix?: string): Promise<BlobProperties[]> {
      const client = service.getContainerClient(container);
      const result: BlobProperties[] = [];
      for await (const blob of client.listBlobsFlat({ prefix, includeMetadata: true })) {
        result.push(toProperties(container, blob.name, blob.properties, client.getBlobClient(blob.name).url));
      }
      return result;
    },

    async generateSasUrl(container: string, blobName: string, expiryMinutes: number = 60): Promise<string> {
      if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0 || expiryMinutes > 24 * 60) {
        throw new Error('SAS expiry must be between 1 and 1440 minutes');
      }
      const now = new Date();
      const sas = generateBlobSASQueryParameters({
        containerName: container,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(now.getTime() - 5 * 60 * 1000),
        expiresOn: new Date(now.getTime() + expiryMinutes * 60 * 1000),
        protocol: SASProtocol.Https,
        version: '2024-08-04',
      }, credential).toString();
      return `${blobClient(container, blobName).url}?${sas}`;
    },

    async ensureContainer(container: string): Promise<void> {
      await service.getContainerClient(container).createIfNotExists();
      log.info('Container ensured', { container });
    },
  };
}
