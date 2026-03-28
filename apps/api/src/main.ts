import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import type { Env } from './common/config/env.schema';
import { setupSwagger } from './common/config/swagger.setup';
import { setupValidationPipe } from './common/config/validation.pipe.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = app.get(ConfigService<Env>);
  const port = config.get('API_PORT', { infer: true }) ?? 3001;
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  setupValidationPipe(app, nodeEnv === 'production');

  if (nodeEnv !== 'production') {
    setupSwagger(app);
    Logger.log(`Documentation: http://localhost:${port}/docs`);
  }

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`API v1 status: http://localhost:${port}/api/v1/health`);
}
bootstrap();
