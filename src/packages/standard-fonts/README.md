# @mariusgrote/standard-fonts

Metrics and encodings for the 14 standard PDF fonts. Fork of [chbrown/afm](https://github.com/chbrown/afm) (via [@pdf-lib/standard-fonts](https://github.com/Hopding/standard-fonts)), vendored for [`@mariusgrote/pdf-lib`](https://github.com/mariusgrote/pdf-lib) (originally vendored by [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib)).

## Benefits vs original `afm` / `@pdf-lib/standard-fonts`

| | `afm` | `@pdf-lib/standard-fonts` | `@mariusgrote/standard-fonts` |
| --- | --- | --- | --- |
| Unicode → WinAnsi / Symbol / ZapfDingbats | ❌ | ✅ | ✅ |
| Compressed metrics in the package | ❌ (raw AFM-derived) | ✅ (pako) | ✅ (**[`fflate`](https://www.npmjs.com/package/fflate)**) |
| Runtime inflate | — | `pako` | **`fflate`** (`unzlibSync`) |
| Packaging | Standalone | Standalone | Also **`@mariusgrote/pdf-lib/standard-fonts`** (vendored under `src/packages/`) |
| Metric regen tooling | Make / ad-hoc | `Makefile.js` + `ts-node` / `shelljs` / `mz` | **`pnpm standard-fonts:metrics`** (Node `fs/promises` + `Buffer`, esbuild runner) |

Compared to stock `afm`, you get encodings plus small compressed JSON metrics suitable for browsers. Compared to `@pdf-lib/standard-fonts`, you drop `pako`, align with `@mariusgrote/pdf-lib` / `@cantoo/fontkit`, and get a maintenance path that does not depend on legacy Make/`ts-node` scripts.

## Usage

```js
import { Font, FontNames, Encodings } from '@mariusgrote/standard-fonts';

const glyph = Encodings.Symbol.encodeUnicodeCodePoint('∑'.charCodeAt(0));
const font = Font.load(FontNames.Symbol);
const width = font.getWidthOfGlyph(glyph.name);
```

Also available via `@mariusgrote/pdf-lib/standard-fonts` when pdf-lib is installed (no extra dependency).

## Regenerating metrics

From the pdf-lib repo root (after editing AFM or encoding source files):

```bash
pnpm standard-fonts:metrics
```

Or separately: `pnpm standard-fonts:afm` / `pnpm standard-fonts:encodings`.
