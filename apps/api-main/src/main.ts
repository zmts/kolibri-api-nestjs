import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppEnv } from '@libs/config';
import type { AllConfig } from '@libs/config';
import { ApiResponseInterceptor, validationExceptionFactory } from '@libs/core';

import { AppModule } from './app.module.js';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<AllConfig>>(ConfigService);
  const port = configService.getOrThrow('app.port', { infer: true });
  const env = configService.getOrThrow('app.env', { infer: true });

  app.enableCors({
    origin: env === AppEnv.Prod ? configService.get('app.frontendUrl', { infer: true }) || false : true,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}/api`);
}

bootstrap().catch((error: unknown) => {
  logger.error('Application startup failed', error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
