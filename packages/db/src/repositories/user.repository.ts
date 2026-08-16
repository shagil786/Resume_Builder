import { eq } from 'drizzle-orm';
import type { DB, TX } from './types';
import { users } from '../schema';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(data: { email: string; name: string; passwordHash: string }): Promise<UserRecord>;
  touchLastLogin(id: string): Promise<void>;
}

export function createUserRepository(db: DB | TX): IUserRepository {
  const toUser = (row: typeof users.$inferSelect): UserRecord => ({
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
  });

  return {
    async findByEmail(email) {
      const row = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return row[0] ? toUser(row[0]) : null;
    },
    async findById(id) {
      const row = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return row[0] ? toUser(row[0]) : null;
    },
    async create(data) {
      const [row] = await db.insert(users).values(data).returning();
      return toUser(row);
    },
    async touchLastLogin(id) {
      await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, id));
    },
  };
}
