import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { DB, TX } from './repositories/types';
import * as schema from './schema';

export type { DB, TX };

export interface DBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
  connectionTimeoutMs?: number;
  idleTimeoutMs?: number;
}

export function createConnection(config: DBConfig): DB {
  const client = postgres({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    ssl: config.ssl ?? false,
    max: config.poolSize ?? 10,
    connect_timeout: config.connectionTimeoutMs ? config.connectionTimeoutMs / 1000 : 10,
    idle_timeout: config.idleTimeoutMs ? config.idleTimeoutMs / 1000 : 30,
  });
  return drizzle(client, { schema });
}
