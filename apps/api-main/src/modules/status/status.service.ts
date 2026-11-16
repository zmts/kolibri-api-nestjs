import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import packageJson from '@package-json' with { type: 'json' };

import type { AllConfig } from '@libs/config';

import type { StatusInfo } from './types/status-info.type.js';

@Injectable()
export class StatusService {
  constructor(private readonly configService: ConfigService<AllConfig>) {}

  getStatus(): StatusInfo {
    return {
      appName: this.configService.getOrThrow('app.appName', { infer: true }),
      version: packageJson.version,
      env: this.configService.getOrThrow('app.env', { infer: true }),
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
