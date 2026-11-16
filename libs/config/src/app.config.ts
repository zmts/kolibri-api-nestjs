import { registerAs } from '@nestjs/config';

import { AppEnv } from './config.type.js';
import type { AppConfig } from './config.type.js';

export default registerAs<AppConfig>('app', () => {
  const env = process.env.NODE_ENV ?? AppEnv.Dev;
  const port = Number(process.env.APP_PORT ?? process.env.PORT ?? 3000);

  if (!Object.values(AppEnv).includes(env as AppEnv)) {
    throw new Error('NODE_ENV must be development, stage or production');
  }

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('APP_PORT must be an integer between 0 and 65535');
  }

  return {
    appName: process.env.APP_NAME || 'api',
    env: env as AppEnv,
    port,
    frontendUrl: process.env.FRONTEND_URL,
  };
});
