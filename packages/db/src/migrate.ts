import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { DBConfig } from './connection';

export async function runMigrations(config: DBConfig): Promise<void> {
  const migrationClient = postgres({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    ssl: config.ssl ?? false,
    max: 1,
  });

  const db = drizzle(migrationClient);
  await migrate(db, { migrationsFolder: new URL('./migrations', import.meta.url).pathname });
  await migrationClient.end();
}
