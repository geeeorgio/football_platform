import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import type { Env } from './common/config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env>);
  const port = config.get('API_PORT', { infer: true }) ?? 3001;

  await app.listen(port);
}
bootstrap();
