import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Browser, type Page } from '@playwright/test';
import type * as PdfJs from 'pdfjs-dist';

const webDir = join(__dirname, '..');
const testPages = readdirSync(webDir)
  .filter((file) => /^test\d+\.html$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));

const fontkit = readFileSync(
  join(
    __dirname,
    '../../../node_modules/@cantoo/fontkit/dist/fontkit.umd.min.js',
  ),
);

// 72 dpi keeps the committed baselines small while still showing layout,
// colors and text clearly.
const renderScale = 1;

// Some pages load documents with hundreds of pages. Snapshot only the first
// few; the total page count is checked separately.
const maxSnapshotPages = 10;

/** Runs a test page and returns the PDF it would show in its iframe. */
async function generatePdf(
  page: Page,
  file: string,
): Promise<{ pdf: Buffer; errors: string[] }> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  // Serve fontkit locally instead of from unpkg.
  await page.route('https://unpkg.com/@cantoo/fontkit/**', (route) =>
    route.fulfill({ body: fontkit, contentType: 'text/javascript' }),
  );

  // Make pages that use the current date or Math.random reproducible.
  await page.clock.setFixedTime(new Date('2024-01-01T00:00:00Z'));
  await page.addInitScript(() => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) % 2 ** 32;
      return seed / 2 ** 32;
    };
  });

  await page.goto(`/apps/web/${file}`);
  await page.getByRole('button', { name: 'Run Test' }).click();

  // Pages finish by pointing the iframe at the PDF, as a blob: or data: URL.
  // Stop early if the page throws instead.
  const pageError = page
    .waitForEvent('pageerror', { timeout: 0 })
    .then((error) => {
      throw error;
    });
  await Promise.race([
    page.waitForFunction(
      () => document.querySelector('iframe')?.getAttribute('src'),
      undefined,
      {
        polling: 100,
        timeout: 0,
      },
    ),
    pageError,
  ]);
  pageError.catch(() => {});

  const base64 = await page.evaluate(async () => {
    const src = document.querySelector('iframe')?.getAttribute('src') ?? '';
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  });

  return { pdf: Buffer.from(base64, 'base64'), errors };
}

/**
 * Renders a PDF to PNGs with pdf.js. Uses a fresh context, because pdf.js's
 * font loading hangs under the frozen clock used while generating the PDF.
 */
async function renderPdf(
  browser: Browser,
  baseURL: string,
  pdf: Buffer,
): Promise<{ numPages: number; pages: Buffer[] }> {
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    // Any same-origin page works; it only needs to be able to import pdf.js.
    await page.route('/__render', (route) =>
      route.fulfill({
        body: '<!doctype html><html><body></body></html>',
        contentType: 'text/html',
      }),
    );
    await page.goto('/__render');

    const result = await page.evaluate(
      async ({ data, scale, maxPages }) => {
        const pdfjsPath = '/node_modules/pdfjs-dist/build/pdf.min.mjs';
        const pdfjs = (await import(
          /* @vite-ignore */ pdfjsPath
        )) as typeof PdfJs;
        pdfjs.GlobalWorkerOptions.workerSrc =
          '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

        const doc = await pdfjs.getDocument({
          data: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
          standardFontDataUrl: '/node_modules/pdfjs-dist/standard_fonts/',
          cMapUrl: '/node_modules/pdfjs-dist/cmaps/',
          cMapPacked: true,
        }).promise;

        const pages: string[] = [];
        for (let i = 1; i <= Math.min(doc.numPages, maxPages); i++) {
          const pdfPage = await doc.getPage(i);
          const viewport = pdfPage.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await pdfPage.render({
            canvas,
            viewport,
            // Draw annotation appearance streams (form fields etc.) too.
            annotationMode: pdfjs.AnnotationMode.ENABLE,
          }).promise;
          pages.push(canvas.toDataURL('image/png').split(',')[1] ?? '');
          pdfPage.cleanup();
        }
        return { numPages: doc.numPages, pages };
      },
      {
        data: pdf.toString('base64'),
        scale: renderScale,
        maxPages: maxSnapshotPages,
      },
    );

    return {
      numPages: result.numPages,
      pages: result.pages.map((png) => Buffer.from(png, 'base64')),
    };
  } finally {
    await context.close();
  }
}

for (const file of testPages) {
  const name = file.replace('.html', '');

  test(name, async ({ page, browser, baseURL }, testInfo) => {
    const { pdf, errors } = await generatePdf(page, file);

    // Keep the PDF in the report so failures can be opened in a real viewer.
    await testInfo.attach(`${name}.pdf`, {
      body: pdf,
      contentType: 'application/pdf',
    });
    expect(errors, 'page errors').toEqual([]);

    const { numPages, pages } = await renderPdf(browser, baseURL ?? '', pdf);
    expect(`${numPages}\n`).toMatchSnapshot([name, 'page-count.txt']);
    for (const [index, png] of pages.entries()) {
      expect.soft(png).toMatchSnapshot([name, `page-${index + 1}.png`]);
    }
  });
}
