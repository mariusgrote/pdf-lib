## `@mariusgrote/pdf-lib`

A fork of [`pdf-lib`](https://github.com/Hopding/pdf-lib), based on [Cantoo's fork](https://github.com/cantoo-scribe/pdf-lib) (`@cantoo/pdf-lib`) 2.11.0. It keeps the original API.

This fork is not published to npm. See [Installation](#installation) for how to build it and use it locally.

**Credit.** `pdf-lib` was created by [Andrew Dillon (@Hopding)](https://github.com/Hopding). Most of the improvements listed below were made by [Cantoo](https://cantoo.fr) and the contributors to their fork. This fork builds on their work under the same MIT license.

**How this fork differs from `@cantoo/pdf-lib`**

- The published `package.json` has no install-time scripts (no `prepare`).
- ESM-only package, built with [tsdown](https://tsdown.dev). `require()` still works on Node 22.12+, which can load ES modules.
- CI loads the built package in Node through its `exports` (`import` and `require()`), plus the browser bundles.
- Uses pnpm instead of Yarn.

See the [release notes](https://github.com/mariusgrote/pdf-lib/releases), [CONTRIBUTING](docs/CONTRIBUTING.md) and [SECURITY](SECURITY.md). Changes up to 2.11.0 are in [Cantoo's changelog](https://github.com/cantoo-scribe/pdf-lib/blob/master/CHANGELOG.md).

### Benefits vs original `pdf-lib` (mostly from Cantoo's fork)

**Drawing & content**

- **Full SVG drawing** (`page.drawSvg` / `embedSvg`) — not just `drawSvgPath`: shapes, text, transforms, viewBox cropping, blend modes, rounded rects, CSS colors via [`culori`](https://culorijs.org/)
- **`PDFPage.extractContents()`** — pull typed assets (text, images, approximate vector graphics as SVG) out of page content streams
- **`characterSpacing`** on `drawText`

**Documents & save**

- **Incremental updates** (`forIncrementalUpdate`, `save({ useObjectStreams… })`, `commit()`) — append changes without rewriting the whole file (signing / multi-increment workflows)
- **PDF header preserved** on save (writers no longer always force `%PDF-1.7`)
- **Recover truncated PDFs** instead of failing hard on a broken trailer object
- More robust parsing (hex-string whitespace, object streams on older PDFs, HTML closing tags spanning lines, case-insensitive PDF names, …)

**Forms & scripts**

- **XFA helpers** — `preserveXFA`, read/modify XFA JavaScript, signature-field discovery (static / government-style XFA)
- Extract / work with **document-level JavaScript**
- **`PDFForm.flatten()`** also flattens orphaned widget annotations not listed in `AcroForm.Fields`
- **Attachments** — add, extract (including unsaved), and detach embedded files; name trees kept in PDF lexical order

**Standards & e-invoicing**

- **`convertToPDFA()`** — PDF/A-1/2/3 structural pieces (OutputIntent + sRGB ICC, `/ID`, XMP synced with Info)
- **`embedFacturX()`** — Factur-X / ZUGFeRD PDF/A-3 hybrid invoices

**Security & crypto**

- **`PDFDocument.encrypt()`** — AES-256 revision 6 by default; AES-128 / RC4 via `algorithm` (RC4 needs `allowWeakCryptography`)
- Decrypt PDFs whose crypt filters are **indirect objects**
- No `crypto-js`: in-tree AES/RC4/MD5/SHA-256 + Web Crypto `getRandomValues`

**Fonts & layers**

- First-class **[`@cantoo/fontkit`](https://www.npmjs.com/package/@cantoo/fontkit)** support (types, default export, UMD); still compatible with upstream `fontkit` / `@pdf-lib/fontkit`
- **`postscriptName`** to pick a face from `.ttc` / `.dfont` collections
- **Optional content (PDF layers)** — `getOptionalContentGroups()` / `setOptionalContentGroupVisibility()`

**Packaging & deps**

- Vendored **[`upng`](./src/packages/upng)** and **[`standard-fonts`](./src/packages/standard-fonts)** (as `@mariusgrote/pdf-lib/upng` and `@mariusgrote/pdf-lib/standard-fonts`)
- Compression via **[`fflate`](https://www.npmjs.com/package/fflate)** instead of `pako` (modular TS UPNG with Photopea `quantize` / `framize` / lossy `cnum`)
- Lighter color parsing with **`culori`**; `html-entities` as a peer (pulled in by the HTML/SVG parser)

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Encryption](#encryption)
- [Fonts and Unicode](#fonts-and-unicode)
- [Limitations](#limitations)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation

`@mariusgrote/pdf-lib` is not published to npm. (`pdf-lib` on npm is the original Hopding package, and `@cantoo/pdf-lib` is Cantoo's fork.) Build it from a clone and add the local folder to your project:

```bash
git clone https://github.com/mariusgrote/pdf-lib.git
cd pdf-lib
pnpm install
pnpm build

# in your project
pnpm add ../pdf-lib
```

The vendored PNG and standard-font packages are available as subpath exports:

```js
import UPNG from '@mariusgrote/pdf-lib/upng';
import { FontNames } from '@mariusgrote/pdf-lib/standard-fonts';
```

The package is ESM-only. On Node 22.12 and later, `require('@mariusgrote/pdf-lib')` also works, because Node can `require()` ES modules.

`pnpm build` also writes self-contained browser bundles to `dist/`: UMD (`pdf-lib.js`, `pdf-lib.min.js`) and ESM (`pdf-lib.esm.mjs`, `pdf-lib.esm.min.mjs`). Load a UMD bundle with a `<script>` tag and use the global `PDFLib` (for example `PDFLib.PDFDocument`).

### Fontkit

Custom fonts need a fontkit instance. Install [`@cantoo/fontkit`](https://www.npmjs.com/package/@cantoo/fontkit) and register it before embedding a font. Upstream [`fontkit`](https://www.npmjs.com/package/fontkit) and [`@pdf-lib/fontkit`](https://www.npmjs.com/package/@pdf-lib/fontkit) also work (use `import * as fontkit from 'fontkit'` for upstream `fontkit` under Node ESM).

```bash
pnpm add @cantoo/fontkit
```

<!-- prettier-ignore -->
```js
import { PDFDocument } from '@mariusgrote/pdf-lib'
import fontkit from '@cantoo/fontkit'

const pdfDoc = await PDFDocument.create()
pdfDoc.registerFontkit(fontkit)
```

## Usage

`pdfBytes` in these examples is a `Uint8Array`. Write it to a file in Node, download it in the browser, or show it in an `<iframe>`. Input bytes can be a `Uint8Array` or `ArrayBuffer` (from `fs.readFile()` in Node or `fetch().then(res => res.arrayBuffer())` in the browser).

More examples: the [original pdf-lib README](https://github.com/Hopding/pdf-lib#usage-examples) (the API is the same) and the integration tests in [`apps/node/tests`](apps/node/tests) and [`apps/web`](apps/web).

### Create a document

<!-- prettier-ignore -->
```js
import { PDFDocument, StandardFonts, rgb } from '@mariusgrote/pdf-lib'

const pdfDoc = await PDFDocument.create()
const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)

const page = pdfDoc.addPage()
const { height } = page.getSize()
page.drawText('Creating PDFs in JavaScript is awesome!', {
  x: 50,
  y: height - 120,
  size: 30,
  font,
  color: rgb(0, 0.53, 0.71),
})

const pdfBytes = await pdfDoc.save()
```

### Modify a document

<!-- prettier-ignore -->
```js
import { degrees, PDFDocument, rgb, StandardFonts } from '@mariusgrote/pdf-lib'

const pdfDoc = await PDFDocument.load(existingPdfBytes)
const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

const [firstPage] = pdfDoc.getPages()
const { height } = firstPage.getSize()
firstPage.drawText('This text was added with JavaScript!', {
  x: 5,
  y: height / 2 + 300,
  size: 50,
  font,
  color: rgb(0.95, 0.1, 0.1),
  rotate: degrees(-45),
})

const pdfBytes = await pdfDoc.save()
```

### Fill a form

<!-- prettier-ignore -->
```js
import { PDFDocument } from '@mariusgrote/pdf-lib'

const pdfDoc = await PDFDocument.load(formPdfBytes)
const form = pdfDoc.getForm()

form.getTextField('Name').setText('Jane Doe')
form.getCheckBox('Subscribe').check()
form.getDropdown('Country').select('Germany')

// Optional: turn the fields into static page content
form.flatten()

const pdfBytes = await pdfDoc.save()
```

### Embed a font and measure text

<!-- prettier-ignore -->
```js
import { PDFDocument, rgb } from '@mariusgrote/pdf-lib'
import fontkit from '@cantoo/fontkit'

const pdfDoc = await PDFDocument.create()
pdfDoc.registerFontkit(fontkit)
const font = await pdfDoc.embedFont(fontBytes)

const page = pdfDoc.addPage()
const text = 'This is text in an embedded font!'
const size = 35
const width = font.widthOfTextAtSize(text, size)
const height = font.heightAtSize(size)

page.drawText(text, { x: 40, y: 450, size, font, color: rgb(0, 0.53, 0.71) })
page.drawRectangle({
  x: 40,
  y: 450,
  width,
  height,
  borderColor: rgb(1, 0, 0),
  borderWidth: 1.5,
})

const pdfBytes = await pdfDoc.save()
```

### Incremental update

Load with `forIncrementalUpdate` and `save()` appends only the changes to the original bytes. This is what PDF signing workflows need.

<!-- prettier-ignore -->
```js
import { PDFDocument } from '@mariusgrote/pdf-lib'

const pdfDoc = await PDFDocument.load(existingPdfBytes, { forIncrementalUpdate: true })
pdfDoc.getPages()[0].drawText('Incremental saving is also awesome!', { x: 50, y: 120 })

// Original bytes plus the new increment
const pdfBytes = await pdfDoc.save()

// Or rewrite the whole file instead
const rewrittenBytes = await pdfDoc.save({ rewrite: true })
```

### Draw SVG

```js
import { PDFDocument, rgb } from '@mariusgrote/pdf-lib';

// SVG of a square inside a square
const svg = `<svg width="100" height="100">
  <rect y="0" x="0" width="100" height="100" fill="none" stroke="black"/>
  <rect y="25" x="25" width="50" height="50" fill="black"/>
</svg>`;
const svg2 =
  '<svg><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="/></svg>';

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create();

// Add a blank page to the document
const page = pdfDoc.addPage();

// drawSvg can accept the svg as a string, as long as there are no images in it
page.moveTo(100, 10);
page.drawSvg(svg);

// If the svg has images, or if you don't know if it does, you should call embedSVG first
page.moveTo(200, 10);
const pdfSvg = await pdfDoc.embedSvg(svg2);
page.drawSvg(pdfSvg);

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save();
```

### Create PDF/A Documents

Convert a document to PDF/A by calling `convertToPDFA()`. This adds the
structural pieces PDF/A requires (document `/ID`, OutputIntent with an embedded
sRGB ICC profile, uncompressed XMP metadata with `pdfaid`, and the appropriate
PDF header version). It does **not** rewrite arbitrary content to make it
compliant — in particular, drawn text must use an **embedded** font (the 14
standard fonts are not PDF/A compliant). Validate the result with a tool such as
[veraPDF](https://verapdf.org/).

<!-- prettier-ignore -->
```js
import { PDFDocument } from '@mariusgrote/pdf-lib'
import fontkit from '@cantoo/fontkit'

const fontBytes = ... // e.g. fs.readFileSync('Roboto-Regular.ttf')

const pdfDoc = await PDFDocument.create()
pdfDoc.registerFontkit(fontkit)

const font = await pdfDoc.embedFont(fontBytes)
const page = pdfDoc.addPage()
page.drawText('Hello PDF/A', { x: 50, y: 700, size: 24, font })

pdfDoc.setTitle('Archival document')
pdfDoc.setAuthor('ACME GmbH')

// '1B' | '2B' | '2U' | '3B' | '3U' — defaults to '3B'
pdfDoc.convertToPDFA({ conformance: '3B' })

const pdfBytes = await pdfDoc.save()
```

After conversion, pdf-lib keeps the Info dictionary and XMP metadata in sync on
`save()`, while preserving any _strictly foreign_ XMP `rdf:Description` blocks
(for example Factur-X schemas passed via `extensions`). Descriptions that mix
owned namespaces (`dc` / `xmp` / `pdf` / `pdfaid`) with custom ones are not
preserved — re-supply them via `extensions` or `embedFacturX()`. Loading an
existing PDF/A file does not enable that sync by itself: call `convertToPDFA()`
(or `embedFacturX()`) again if you change Info fields and need them mirrored.

### Embed Factur-X / ZUGFeRD Invoices

`embedFacturX()` wraps a human-readable PDF and a machine-readable Factur-X /
ZUGFeRD XML into a PDF/A-3 hybrid invoice: it ensures PDF/A-3 (converting to 3B
if needed, or keeping an existing 3U/3B level), writes the required `fx:` XMP
properties (plus the PDF/A extension schema), and attaches the XML with an
associated-file relationship.

It does **not** generate or validate the Cross Industry Invoice XML — pass a
complete `factur-x.xml` from your invoicing stack.

<!-- prettier-ignore -->
```js
import { PDFDocument, embedFacturX } from '@mariusgrote/pdf-lib'
import fontkit from '@cantoo/fontkit'

const fontBytes = ...
const invoiceXmlBytes = ... // Factur-X / ZUGFeRD XML (Uint8Array)

const pdfDoc = await PDFDocument.create()
pdfDoc.registerFontkit(fontkit)

const font = await pdfDoc.embedFont(fontBytes)
const page = pdfDoc.addPage()
page.drawText('Invoice 2026-0001', { x: 50, y: 700, size: 18, font })
// ... draw the rest of the human-readable invoice with the embedded font ...

pdfDoc.setTitle('Invoice 2026-0001')
pdfDoc.setAuthor('ACME GmbH')

await embedFacturX(pdfDoc, invoiceXmlBytes, {
  // MINIMUM | BASIC WL | BASIC | EN 16931 | EXTENDED | XRECHNUNG
  conformanceLevel: 'EN 16931',
})

const pdfBytes = await pdfDoc.save()
```

## Encryption

**`pdf-lib` does support encrypted documents.**

If you do not have a password yet, you can load the document without decrypting it to check whether it is encrypted:

```js
// Load without decrypting (encrypted content will not be readable):
const doc = await PDFDocument.load(content, { ignoreEncryption: true });
const isEncrypted = doc.isEncrypted;
// If isEncrypted is true, ask the user for the password.
```

To decrypt and load the document, pass the password. `ignoreEncryption` is not required:

```js
// Load and decrypt an encrypted document:
const doc = await PDFDocument.load(content, { password: 'The password' });
```

An empty password is valid for some PDFs. Pass it explicitly — do not omit the option or treat `''` as "no password":

```js
const doc = await PDFDocument.load(content, { password: '' });
```

If the password is wrong, `PDFDocument.load` throws an error.

To encrypt a document, call `encrypt()` before saving. The default cipher is
**AES-256** (ISO 32000-2 revision 6). The document's PDF version is not used to
pick the algorithm — pass `algorithm` if you must target an older viewer.
RC4 is refused unless you also set `allowWeakCryptography: true`:

```js
const doc = await PDFDocument.create();
doc.addPage().drawText('Hello!');

doc.encrypt({
  userPassword: 'user-pw',
  ownerPassword: 'owner-pw',
  permissions: { printing: 'highResolution' },
  // algorithm: 'AES-128', // optional; default is 'AES-256'
});

const bytes = await doc.save();
```

> **Requirement:** `encrypt()` needs the Web Crypto API
> (`crypto.getRandomValues`) to generate secure random keys, salts, and IVs.
> That is available in modern browsers, **Node >= 18**, Deno, and Bun. On older
> Node versions, or in React Native without a polyfill such as
> [`react-native-get-random-values`](https://www.npmjs.com/package/react-native-get-random-values),
> `encrypt()` throws. No other part of `pdf-lib` requires it — loading,
> decrypting, and saving unencrypted documents all work without it.

## Fonts and Unicode

- The 14 standard PDF fonts (Times, Helvetica, Courier, Symbol, ZapfDingbats) need no embedding, but they only support [WinAnsi](https://en.wikipedia.org/wiki/Windows-1252) characters. Drawing other characters with them throws an error.
- For anything else (accents outside WinAnsi, CJK, emoji, …) embed a font that contains those glyphs, using [fontkit](#fontkit).
- Custom fonts are embedded whole by default. Pass `{ subset: true }` to `embedFont` to embed only the glyphs you use and keep the file small. Don't subset fonts that form fields use, since users may type characters that were left out.
- Use `postscriptName` to pick a face from a `.ttc` / `.dfont` collection.

## Limitations

- `PDFPage.extractContents()` returns text, images and approximate vector graphics from a page, but there is no API to edit or remove existing page text outside form fields.
- `pdf-lib` cannot render HTML or CSS into a PDF. Use a browser-based tool such as [Puppeteer](https://github.com/puppeteer/puppeteer) for that.
- `convertToPDFA()` and `embedFacturX()` add the **structural** PDF/A (and Factur-X XMP / attachment) pieces, but they do **not** rewrite page content for compliance (fonts, transparency, JavaScript, …). `embedFacturX()` also does **not** generate or validate the invoice XML. Always validate archival / e-invoice output with dedicated tools (e.g. veraPDF, Mustang).

## Documentation

The original API reference at [pdf-lib.js.org/docs/api](https://pdf-lib.js.org/docs/api/) covers everything that came from `pdf-lib`. Features added in the forks are documented in the TypeScript doc comments in [`src/`](src/) and listed in the [release notes](https://github.com/mariusgrote/pdf-lib/releases) (up to 2.11.0, in [Cantoo's changelog](https://github.com/cantoo-scribe/pdf-lib/blob/master/CHANGELOG.md)).

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup, tests and linting, and [RELEASING.md](docs/RELEASING.md) for the release steps.

`pdf-lib` was built with help from [`pdfkit`](https://github.com/devongovett/pdfkit), [`pdf.js`](https://github.com/mozilla/pdf.js) (stream decoders) and [`pdfbox`](https://pdfbox.apache.org/) (forms).

## License

[MIT](LICENSE.md)
