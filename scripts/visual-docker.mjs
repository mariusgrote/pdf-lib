// Runs the apps/web visual regression tests inside the Playwright Linux image,
// so local results match CI. Text anti-aliasing differs between macOS,
// Windows and Linux, so the baselines are only valid on Linux.
//
// Usage: node scripts/visual-docker.mjs [playwright test args...]
//   e.g. node scripts/visual-docker.mjs --update-snapshots
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { version } = JSON.parse(
  readFileSync(require.resolve('@playwright/test/package.json'), 'utf8'),
);
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
// Keep in sync with the pnpm version in .github/workflows/ci.yml.
const pnpmVersion = '12.4.1';

// The repo is mounted read-write so new baselines and the report land on the
// host. node_modules and dist live in named volumes because the host's
// native binaries (e.g. for vite) don't run on Linux.
const script = [
  'set -e',
  `npm install --global --silent pnpm@${pnpmVersion} 2>/dev/null`,
  'pnpm install --frozen-lockfile --reporter=silent',
  'pnpm build >/dev/null',
  `pnpm exec playwright test ${args.map((a) => `'${a.replaceAll("'", "'\\''")}'`).join(' ')}`,
].join('\n');

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--platform=linux/amd64',
    '--ipc=host',
    // Write the HTML report but don't try to open a browser in the container.
    '-e',
    'PLAYWRIGHT_HTML_OPEN=never',
    '-e',
    'npm_config_store_dir=/pnpm-store',
    '-v',
    `${root}:/work`,
    '-v',
    'pdf-lib-visual-node-modules:/work/node_modules',
    '-v',
    'pdf-lib-visual-dist:/work/dist',
    '-v',
    'pdf-lib-visual-pnpm-store:/pnpm-store',
    '-w',
    '/work',
    image,
    'bash',
    '-c',
    script,
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
