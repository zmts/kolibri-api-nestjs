export enum AppEnv {
  Dev = 'development',
  Stage = 'stage',
  Prod = 'production',
}

export interface AppConfig {
  appName: string;
  env: AppEnv;
  port: number;
  frontendUrl?: string;
}

export type AllConfig = { app: AppConfig };
