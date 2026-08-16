import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
  }
}

export interface AuthPluginOptions {
  secret: string;
}

export default fp<AuthPluginOptions>(async (fastify: FastifyInstance, opts: AuthPluginOptions) => {
  await fastify.register(jwt, {
    secret: opts.secret,
    sign: { expiresIn: '1h' },
    cookie: { cookieName: 'resume_builder_token', signed: false },
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      if (request.cookies?.resume_builder_token) {
        await request.jwtVerify({ onlyCookie: true });
      } else {
        await request.jwtVerify();
      }
      request.userId = (request.user as { id: string }).id;
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorateRequest('userId', '');
});
