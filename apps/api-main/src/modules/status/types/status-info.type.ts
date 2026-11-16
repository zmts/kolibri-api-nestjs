import type { AppEnv } from '@libs/config';

export interface StatusInfo {
  appName: string;
  version: string;
  env: AppEnv;
  uptime: number;
  timestamp: string;
}
