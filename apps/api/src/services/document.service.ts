import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
import type { DB } from '@resume-builder/db';
import { createUnitOfWork } from '@resume-builder/db';
import { createBlobStorageClient } from '@resume-builder/storage';
import { createDocumentProcessor } from '@resume-builder/document-intelligence';
import type { ProcessDocumentOutput } from '@resume-builder/document-intelligence';
import type { SourceDocument } from '@resume-builder/domain';
import type { SearchSyncService } from './search-sync.service.js';

export interface BlobConfig {
  accountName: string;
  accountKey: string;
  container: string;
}

export interface DocIntelConfig {
  endpoint: string;
  apiKey: string;
}

export interface DocumentServiceConfig {
  blob?: BlobConfig;
  docIntel?: DocIntelConfig;
  blobContainer?: string;
}

export class DocumentService {
  private logger: Logger;

  constructor(
    private config: DocumentServiceConfig,
    private db?: DB,
    logger?: Logger,
    private searchSync?: SearchSyncService
  ) {
    this.logger = logger ?? new ConsoleLogger('document-service');
  }

  async getDocument(profileId: string, documentId: string): Promise<SourceDocument | null> {
    if (!this.db) return null;
    const document = await createUnitOfWork(this.db).sourceDocuments.findById(documentId);
    return document?.profileId === profileId ? document : null;
  }

  async uploadDocument(
    profileId: string,
    filename: string,
    mimeType: string,
    buffer: ArrayBuffer
  ): Promise<{ document: SourceDocument; processResult?: ProcessDocumentOutput }> {
    const uow = this.db ? createUnitOfWork(this.db) : null;
    const blobName = `${profileId}/${Date.now()}-${filename}`;

    let storagePath: string | undefined;
    let checksum: string | undefined;

    if (this.config.blob) {
      try {
        const client = createBlobStorageClient({
          accountName: this.config.blob.accountName,
          accountKey: this.config.blob.accountKey,
        });
        await client.ensureContainer(this.config.blobContainer ?? 'resumes');
        storagePath = await client.upload(this.config.blobContainer ?? 'resumes', blobName, buffer, {
          contentType: mimeType,
          metadata: { profileId, filename },
        });
        this.logger.info('Document uploaded to blob storage', { blobName });
      } catch (err) {
        this.logger.error('Blob upload failed, saving metadata only', { error: err });
      }
    } else {
      this.logger.warn('No blob storage configured — document not stored externally');
    }

    try {
      checksum = await sha256(buffer);
    } catch (error) {
      throw uploadStageError('checksum calculation', error);
    }

    const docData = {
      profileId,
      filename,
      mimetype: mimeType,
      size: buffer.byteLength,
      storagePath,
      checksum,
      status: 'PENDING_PROCESSING' as const,
    };

    let document: SourceDocument;
    if (uow) {
      try {
        document = await uow.sourceDocuments.create(docData);
      } catch (error) {
        throw uploadStageError('database document persistence', error);
      }
    } else {
      document = {
        id: `doc-${Date.now()}`,
        ...docData,
        uploadDate: new Date(),
        status: 'PENDING_PROCESSING',
      };
    }

    let processResult: ProcessDocumentOutput | undefined;
    if (this.config.docIntel) {
      let processingError: string | undefined;
      try {
        processResult = await this.processDocument(profileId, document.id, buffer, mimeType, filename);
        const storedFacts = [];
        if (uow) {
          await uow.sourceDocuments.updateStatus(document.id, 'PROCESSED');
          await uow.sourceDocuments.updateExtractedAt(document.id, processResult.extractedAt);
          for (const fact of processResult.facts) {
            storedFacts.push(await uow.candidateFacts.create({
              ...fact,
              profileId,
              sourceRef: filename,
            }));
          }
          await uow.factProvenance.createMany(
            storedFacts.map(f => ({
              factId: f.id,
              sourceId: filename,
              extractionMethod: 'PDF_PARSER',
              humanVerified: false,
              confidenceAtExtraction: f.confidence,
            }))
          );
        }
        await this.searchSync?.syncFacts(storedFacts.length > 0 ? storedFacts : processResult.facts, profileId);
        document = { ...document, status: 'PROCESSED', extractedAt: processResult.extractedAt };
        this.logger.info('Document processed and facts stored', { factCount: processResult.facts.length });
      } catch (err) {
        this.logger.error('Document processing failed', { error: err });
        processingError = safeProcessingError(err);
        document = { ...document, status: 'FAILED', processingError };
        if (uow) {
          try {
            await uow.sourceDocuments.updateStatus(document.id, 'FAILED');
            await uow.sourceDocuments.update(document.id, { processingError });
          } catch (statusError) {
            // Do not turn a recoverable processing failure into an HTTP 500.
            this.logger.error('Unable to persist failed document status', { error: statusError });
          }
        }
      }
    }

    return { document, processResult };
  }

  private async processDocument(
    profileId: string,
    _documentId: string,
    buffer: ArrayBuffer,
    mimeType: string,
    filename: string
  ): Promise<ProcessDocumentOutput> {
    const processor = createDocumentProcessor({
      documentIntelligence: {
        endpoint: this.config.docIntel!.endpoint,
        apiKey: this.config.docIntel!.apiKey,
      },
    }, this.logger);

    return processor.process({ buffer, mimeType, filename, profileId });
  }
}

function safeProcessingError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const status = message.match(/(?:API error|Polling failed): (\d{3})/)?.[1];
  if (status) return `Document Intelligence request failed (HTTP ${status})`;
  if (message.includes('Operation-Location')) return 'Document Intelligence did not return an operation location';
  if (message.includes('timed out')) return 'Document Intelligence processing timed out';
  if (message.includes('analysis failed')) return 'Document Intelligence analysis failed';
  return 'Document Intelligence processing failed';
}

function uploadStageError(stage: string, cause: unknown): Error & { uploadStage?: string } {
  const error = Object.assign(new Error(cause instanceof Error ? cause.message : 'Document upload failed'), { uploadStage: stage });
  error.name = 'DocumentUploadStageError';
  return error;
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
