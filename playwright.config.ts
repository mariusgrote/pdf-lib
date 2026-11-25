import { defineConfig, devices } from '@playwright/test';

const port = 5174;

// Visual regression tests for the browser integration pages in apps/web.
// Each page's PDF is rendered with pdf.js and compared against the PNGs in
// apps/web/visual/__snapshots__. Requires `pnpm build` first.
export default defineConfig({
  testDir: 'apps/web/visual',
  // No per-platform suffix: baselines are always rendered on Linux (in CI or
  // via scripts/visual-docker.mjs), because text anti-aliasing differs
  // between operating systems.
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  fullyParallel: true,
  // test2 draws on every page of a 200+ page document.
  timeout: 180_000,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  expect: {
    toMatchSnapshot: {
      // Tight on purpose: a 3pt shift of one shape must still fail.
      threshold: 0.2,
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    // The test pages' CSP doesn't allow loading pdf.js.
    bypassCSP: true,
  },
  webServer: {
    command: `pnpm exec vite --port ${port} --strictPort`,
    url: `http://localhost:${port}/apps/web/test1.html`,
    reuseExistingServer: !process.env.CI,
  },
});
