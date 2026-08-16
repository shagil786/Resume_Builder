import type { FastifyInstance } from 'fastify';

const users = new Map<string, { email: string; password: string; name: string }>();

export async function authRoutes(app: FastifyInstance) {

  app.post<{ Body: { email: string; password: string; name: string } }>(
    '/auth/register',
    async (request, reply) => {
      const { email, password, name } = request.body;
      if (!email || !password || !name) {
        reply.status(400).send({ error: 'Email, password, and name are required' });
        return;
      }
      if (users.has(email)) {
        reply.status(409).send({ error: 'User already exists' });
        return;
      }
      users.set(email, { email, password, name });
      const token = await reply.jwtSign({ id: email, email, name });
      reply.status(201).send({ token, user: { email, name } });
    }
  );

  app.post<{ Body: { email: string; password: string } }>(
    '/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      const user = users.get(email);
      if (!user || user.password !== password) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }
      const token = await reply.jwtSign({ id: email, email, name: user.name });
      reply.send({ token, user: { email: user.email, name: user.name } });
    }
  );

  app.get(
    '/auth/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const user = users.get(request.userId);
      if (!user) { reply.status(404).send({ error: 'User not found' }); return; }
      reply.send({ email: user.email, name: user.name });
    }
  );
}
