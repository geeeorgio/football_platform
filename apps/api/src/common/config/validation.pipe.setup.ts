import { INestApplication, ValidationPipe } from '@nestjs/common';

export function setupValidationPipe(app: INestApplication, isProduction: boolean): void {
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: isProduction,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
