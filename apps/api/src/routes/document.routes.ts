import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { DocumentService } from '../services/document.service.js';
import type { DocumentServiceConfig } from '../services/document.service.js';

export async function documentRoutes(
  app: FastifyInstance,
  profileService: ICandidateProfileService,
  docConfig: DocumentServiceConfig
) {
  const documentService = new DocumentService(docConfig);

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
        buffer.buffer
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
      reply.status(501).send({ error: 'Document retrieval requires database' });
    }
  );
}
