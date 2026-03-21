import * as dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

// ESM modules don't have __dirname — reconstruct it from import.meta.url
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from root (two levels up from apps/api/)
dotenv.config({ path: join(__dirname, '../../.env') });

export default defineConfig({
  // Path to the Prisma schema file (relative to this config)
  schema: 'prisma/schema.prisma',

  // Directory where generated SQL migration files are stored
  migrations: {
    path: 'prisma/migrations', // Where to store the SQL history of DB
  },

  // Database connection settings used by the Prisma CLI
  datasource: {
    // DATABASE_URL is now available because dotenv.config() ran above
    url: process.env['DATABASE_URL'],
  },
});
