import * as z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  REDIS_PORT: z.coerce.number().default(6379),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.url(),
  WEB_PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_API_URL: z.url(),
  JWT_ACCESS: z.string().min(32),
  JWT_REFRESH: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;
