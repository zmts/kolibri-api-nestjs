import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import packageJson from '#package-json' with { type: 'json' };
import { AppEnv } from '@libs/config';
import type { AllConfig } from '@libs/config';

import { StatusService } from '../status.service';

describe('StatusService', () => {
  let config: AllConfig;
  let service: StatusService;

  beforeEach(() => {
    config = {
      app: { appName: 'kolibri-test', env: AppEnv.Dev, port: 3000 },
    };
    const configService = new ConfigService<AllConfig>(config);
    service = new StatusService(configService);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-02T03:04:05.678Z'));
    vi.spyOn(process, 'uptime').mockReturnValue(12.9);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the public status fields, configured name, package version and UTC time', () => {
    expect(service.getStatus()).toEqual({
      appName: 'kolibri-test',
      version: packageJson.version,
      env: AppEnv.Dev,
      uptime: 12,
      timestamp: '2026-01-02T03:04:05.678Z',
    });
  });

  it.each(Object.values(AppEnv))('reports the configured environment: %s', env => {
    config.app.env = env;

    expect(service.getStatus().env).toBe(env);
  });

  it.each([
    [0, 0],
    [0.999, 0],
    [1, 1],
    [59.999, 59],
  ])('reports uptime %s as %s whole seconds', (uptime, expectedSeconds) => {
    vi.mocked(process.uptime).mockReturnValue(uptime);

    expect(service.getStatus().uptime).toBe(expectedSeconds);
  });

  it('refreshes configuration, uptime and timestamp on each call', () => {
    const first = service.getStatus();

    config.app.appName = 'renamed-app';
    config.app.env = AppEnv.Prod;
    vi.mocked(process.uptime).mockReturnValue(13.1);
    vi.setSystemTime(new Date('2026-01-02T03:04:06.678Z'));

    const second = service.getStatus();

    expect(first.appName).toBe('kolibri-test');
    expect(first.uptime).toBe(12);
    expect(first.timestamp).toBe('2026-01-02T03:04:05.678Z');
    expect(second).toEqual({
      appName: 'renamed-app',
      version: packageJson.version,
      env: AppEnv.Prod,
      uptime: 13,
      timestamp: '2026-01-02T03:04:06.678Z',
    });
  });
});
