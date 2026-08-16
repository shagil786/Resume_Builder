import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply) {
  const statusCode = 'statusCode' in error ? (error as FastifyError).statusCode ?? 500 : 500;
  const code = 'code' in error ? (error as FastifyError).code : 'INTERNAL_ERROR';
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : error.message;

  reply.status(statusCode).send({
    error: {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
}
