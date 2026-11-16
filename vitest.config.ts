import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['apps/**/__tests__/**/*.spec.ts', 'libs/**/__tests__/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
  },
});
