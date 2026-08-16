import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { DocumentService } from '../services/document.service.js';
import type { DocumentServiceConfig } from '../services/document.service.js';
import type { DB } from '@resume-builder/db';
import type { SearchSyncService } from '../services/search-sync.service.js';

export async function documentRoutes(
  app: FastifyInstance,
  profileService: ICandidateProfileService,
  docConfig: DocumentServiceConfig,
  db?: DB,
  searchSync?: SearchSyncService
) {
  const documentService = new DocumentService(docConfig, db, undefined, searchSync);

  app.post<{ Params: { profileId: string } }>(
    '/:profileId/documents',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      const file = await request.file();
      if (!file) { reply.status(400).send({ error: 'No file uploaded' }); return; }

      const buffer = await file.toBuffer();
      const result = await documentService.uploadDocument(
        request.params.profileId,
        file.filename,
        file.mimetype,
        buffer.buffer as ArrayBuffer
      );

      reply.status(201).send({
        documentId: result.document.id,
        filename: result.document.filename,
        status: result.document.status,
        factCount: result.processResult?.facts.length ?? 0,
      });
    }
  );

  app.get<{ Params: { profileId: string; documentId: string } }>(
    '/:profileId/documents/:documentId',
    async (request, reply) => {
      const document = await documentService.getDocument(request.params.profileId, request.params.documentId);
      if (!document) {
        reply.status(404).send({ error: 'Document not found' });
        return;
      }
      return document;
    }
  );
}
