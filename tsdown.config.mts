import { defineConfig, type UserConfig } from 'tsdown';

// Browser bundles for <script> tags and CDNs: self-contained, with all
// dependencies inlined. `name` is the file name without extension.
const browser = (
  format: 'esm' | 'umd',
  name: string,
  minify: boolean,
): UserConfig => ({
  entry: { 'pdf-lib': 'src/index.ts' },
  format,
  platform: 'browser',
  target: 'es2020',
  globalName: 'PDFLib',
  minify,
  sourcemap: true,
  dts: false,
  clean: false,
  deps: { alwaysBundle: [/.*/], onlyBundle: false },
  outputOptions: {
    entryFileNames: format === 'esm' ? `${name}.mjs` : `${name}.js`,
  },
});

export default defineConfig([
  // The npm package: ESM with type declarations, one entry per export.
  {
    entry: {
      index: 'src/index.ts',
      upng: 'src/packages/upng/index.ts',
      'standard-fonts': 'src/packages/standard-fonts/index.ts',
    },
    format: 'esm',
    platform: 'neutral',
    target: 'es2020',
    sourcemap: true,
    dts: true,
    // Check package.json and the exported types as a consumer would see them.
    publint: { level: 'error' },
    attw: { profile: 'esm-only', level: 'error' },
  },
  browser('esm', 'pdf-lib.esm', false),
  browser('esm', 'pdf-lib.esm.min', true),
  browser('umd', 'pdf-lib', false),
  browser('umd', 'pdf-lib.min', true),
]);
