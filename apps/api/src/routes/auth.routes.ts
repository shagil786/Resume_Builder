import type { FastifyInstance } from 'fastify';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { DB, IUserRepository, UserRecord } from '@resume-builder/db';
import { createUserRepository } from '@resume-builder/db';

type MemoryUser = UserRecord;
const users = new Map<string, MemoryUser>();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export async function authRoutes(app: FastifyInstance, db?: DB) {
  const repository: IUserRepository | undefined = db ? createUserRepository(db) : undefined;

  async function findByEmail(email: string) {
    return repository?.findByEmail(email) ?? users.get(email) ?? null;
  }

  async function findById(id: string) {
    return repository?.findById(id) ?? Array.from(users.values()).find(user => user.id === id) ?? null;
  }

  app.post<{ Body: { email: string; password: string; name: string } }>(
    '/auth/register',
    async (request, reply) => {
      const { email, password, name } = request.body;
      if (!email || !password || !name) {
        reply.status(400).send({ error: 'Email, password, and name are required' });
        return;
      }
      if (await findByEmail(email)) {
        reply.status(409).send({ error: 'User already exists' });
        return;
      }
      const passwordHash = hashPassword(password);
      const user = repository
        ? await repository.create({ email, name, passwordHash })
        : (() => { const value = { id: email, email, name, passwordHash }; users.set(email, value); return value; })();
      const token = await reply.jwtSign({ id: user.id, email: user.email, name: user.name });
      reply.status(201).send({ token, user: { email, name } });
    }
  );

  app.post<{ Body: { email: string; password: string } }>(
    '/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      const user = await findByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }
      await repository?.touchLastLogin(user.id);
      const token = await reply.jwtSign({ id: user.id, email: user.email, name: user.name });
      reply.send({ token, user: { email: user.email, name: user.name } });
    }
  );

  app.get(
    '/auth/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const user = await findById(request.userId);
      if (!user) { reply.status(404).send({ error: 'User not found' }); return; }
      reply.send({ email: user.email, name: user.name });
    }
  );
}
