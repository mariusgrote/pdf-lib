// Loads the built package the way consumers do and checks that package.json
// has no install-time scripts. Run after `pnpm build`.
//
// Imports go through the package name, so they resolve via package.json
// `exports` exactly as they would for a dependent project.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await makePdf(await import('@mariusgrote/pdf-lib'));
console.log('ESM import works');

// Node 22.12+ can require() an ES module.
await makePdf(require('@mariusgrote/pdf-lib'));
console.log('require() works');

const upng = await import('@mariusgrote/pdf-lib/upng');
assert(typeof upng.default?.decode === 'function', 'upng: missing decode()');
const fonts = await import('@mariusgrote/pdf-lib/standard-fonts');
assert(fonts.Font?.load('Helvetica'), 'standard-fonts: cannot load Helvetica');
console.log('Subpath exports work');

for (const file of ['pdf-lib.js', 'pdf-lib.min.js']) {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(path.join(root, 'dist', file), 'utf8'), context);
  await makePdf(context.PDFLib);
}
for (const file of ['pdf-lib.esm.mjs', 'pdf-lib.esm.min.mjs']) {
  await makePdf(await import(pathToFileURL(path.join(root, 'dist', file))));
}
console.log('Browser bundles work');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const lifecycle = ['preinstall', 'install', 'postinstall', 'prepare'];
const found = lifecycle.filter((name) => pkg.scripts?.[name]);
if (found.length) {
  throw new Error(`package.json has install-time scripts: ${found.join(', ')}`);
}
console.log('No install-time scripts');
