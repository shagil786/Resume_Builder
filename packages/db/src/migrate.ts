import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
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
  const bundledMigrationsFolder = fileURLToPath(new URL('./migrations', import.meta.url));
  const migrationsFolder = [
    bundledMigrationsFolder,
    path.join(process.cwd(), 'dist', 'migrations'),
    path.join(process.cwd(), 'migrations'),
  ].find(existsSync) ?? bundledMigrationsFolder;
  try {
    if (!existsSync(migrationsFolder)) {
      const error = new Error('Migration files are not present in the deployment package');
      Object.assign(error, { code: 'MIGRATION_FILES_MISSING' });
      throw error;
    }
    await migrate(db, { migrationsFolder });
  } finally {
    await migrationClient.end();
  }
}
