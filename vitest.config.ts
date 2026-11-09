import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^src\//, replacement: `${src}/` },
      // The vendored packages' package.json files point at their built
      // dist/; test against the TypeScript sources instead.
      {
        find: /^.*\/packages\/(upng|standard-fonts)$/,
        replacement: `${src}/packages/$1/index.ts`,
      },
    ],
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    // Several tests parse multi-megabyte PDFs; files run in parallel, so allow
    // headroom on busy machines and CI runners.
    testTimeout: 30_000,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/packages/*/dist/**', 'src/packages/*/scripts/**'],
      reporter: ['html'],
    },
  },
});
