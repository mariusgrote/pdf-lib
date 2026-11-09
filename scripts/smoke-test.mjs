// Loads the built package the way consumers do (Node ESM and CommonJS) and
// checks that package.json has no install-time scripts.
// Run after `pnpm build`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

async function makePdf(lib) {
  const doc = await lib.PDFDocument.create();
  const font = await doc.embedFont(lib.StandardFonts.Helvetica);
  doc.addPage().drawText('smoke test', { font });
  const bytes = await doc.save();
  const reloaded = await lib.PDFDocument.load(bytes);
  if (reloaded.getPageCount() !== 1) throw new Error('Expected one page');
}

const esm = await import(pathToFileURL(path.join(root, 'es/index.js')).href);
await makePdf(esm);
console.log('ESM build loads in Node');

await makePdf(require(path.join(root, 'cjs/index.js')));
console.log('CommonJS build loads in Node');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const lifecycle = ['preinstall', 'install', 'postinstall', 'prepare'];
const found = lifecycle.filter((name) => pkg.scripts?.[name]);
if (found.length) {
  throw new Error(`package.json has install-time scripts: ${found.join(', ')}`);
}
console.log('No install-time scripts');
