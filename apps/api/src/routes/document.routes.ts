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
      let stage = 'profile lookup';
      let filename = 'resume';
      try {
        const profile = await profileService.getProfile(request.params.profileId);
        if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

        stage = 'multipart parsing';
        const file = await request.file();
        if (!file) { reply.status(400).send({ error: 'No file uploaded' }); return; }

        const buffer = await file.toBuffer();
        filename = file.filename.split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180) || 'resume';
        const extension = filename.toLowerCase().endsWith('.pdf') ? 'pdf' : filename.toLowerCase().endsWith('.docx') ? 'docx' : null;
        const bytes = new Uint8Array(buffer);
        const isPdf = bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
        const isDocx = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
        if (!extension || (extension === 'pdf' && !isPdf) || (extension === 'docx' && !isDocx)) {
          reply.status(415).send({ error: 'Only valid PDF or DOCX resumes are supported' });
          return;
        }

        stage = 'document persistence and processing';
        const result = await documentService.uploadDocument(
          request.params.profileId,
          filename,
          file.mimetype,
          buffer.buffer as ArrayBuffer
        );

        reply.status(201).send({
          documentId: result.document.id,
          filename: result.document.filename,
          status: result.document.status,
          factCount: result.processResult?.facts.length ?? 0,
        });
      } catch (error) {
        request.log.error({
          profileId: request.params.profileId,
          filename,
          stage,
          error: error instanceof Error ? error.message : 'Unknown upload error',
        }, 'Resume upload failed');
        reply.status(500).send({
          error: {
            code: 'RESUME_UPLOAD_FAILED',
            message: `Resume upload failed during ${stage}`,
            statusCode: 500,
            timestamp: new Date().toISOString(),
          },
        });
      }
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
