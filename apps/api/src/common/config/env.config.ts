import * as z from 'zod';

import { envSchema } from './env.schema';

export const validate = (config: Record<string, unknown>) => {
  const res = envSchema.safeParse(config);

  if (!res.success) {
    const prettyErr = z.prettifyError(res.error);

    throw new Error(`Config validation error: \n ${prettyErr}`);
  }

  return res.data;
};
