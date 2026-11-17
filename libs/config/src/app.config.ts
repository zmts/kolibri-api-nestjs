import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { AppEnv } from './config.type';
import type { AppConfig } from './config.type';
import { validateConfig } from './validate-config';

class AppConfigSchema implements AppConfig {
  @IsString()
  appName!: string;

  @IsEnum(AppEnv)
  env!: AppEnv;

  @IsInt()
  @Min(0)
  @Max(65535)
  port!: number;

  @IsOptional()
  @IsString()
  frontendUrl?: string;
}

export default registerAs<AppConfig>('app', () =>
  validateConfig(
    {
      appName: process.env.APP_NAME || 'api',
      env: process.env.NODE_ENV ?? AppEnv.Dev,
      port: Number(process.env.APP_PORT ?? process.env.PORT ?? 3000),
      frontendUrl: process.env.FRONTEND_URL,
    },
    AppConfigSchema,
  ),
);
