import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    // Several tests parse multi-megabyte PDFs; files run in parallel, so allow
    // headroom on busy machines and CI runners.
    testTimeout: 30_000,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/packages/*/scripts/**'],
      reporter: ['html'],
    },
  },
});
