import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import appConfig from '../app.config';
import { AppEnv } from '../config.type';

describe('appConfig', () => {
  beforeEach(() => {
    for (const key of ['APP_NAME', 'NODE_ENV', 'APP_PORT', 'PORT', 'FRONTEND_URL']) {
      vi.stubEnv(key, undefined);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the existing defaults', () => {
    expect(appConfig()).toEqual({
      appName: 'api',
      env: AppEnv.Dev,
      port: 3000,
      frontendUrl: undefined,
    });
  });

  it('returns validated environment values and prefers APP_PORT over PORT', () => {
    vi.stubEnv('APP_NAME', 'kolibri');
    vi.stubEnv('NODE_ENV', AppEnv.Prod);
    vi.stubEnv('APP_PORT', '4000');
    vi.stubEnv('PORT', '5000');
    vi.stubEnv('FRONTEND_URL', 'https://example.com');

    expect(appConfig()).toEqual({
      appName: 'kolibri',
      env: AppEnv.Prod,
      port: 4000,
      frontendUrl: 'https://example.com',
    });
  });

  it('uses PORT when APP_PORT is absent', () => {
    vi.stubEnv('PORT', '5000');

    expect(appConfig()).toMatchObject({ port: 5000 });
  });

  it.each([AppEnv.Dev, AppEnv.Stage, AppEnv.Prod])('accepts environment %s', env => {
    vi.stubEnv('NODE_ENV', env);

    expect(appConfig()).toMatchObject({ env });
  });

  it.each(['', 'test', 'invalid'])('rejects invalid environment %j', env => {
    vi.stubEnv('NODE_ENV', env);

    expect(() => appConfig()).toThrow(/env/);
  });

  it.each(['0', '65535'])('accepts port boundary %s', port => {
    vi.stubEnv('APP_PORT', port);

    expect(appConfig()).toMatchObject({ port: Number(port) });
  });

  it.each(['-1', '65536', '1.5', 'abc', 'Infinity'])('rejects invalid port %s', port => {
    vi.stubEnv('APP_PORT', port);

    expect(() => appConfig()).toThrow(/port/);
  });

  it('validates the fallback PORT too', () => {
    vi.stubEnv('PORT', 'invalid');

    expect(() => appConfig()).toThrow(/port/);
  });
});
