# upng (`@mariusgrote/pdf-lib/upng`)

PNG / APNG encoder and decoder based on [photopea/UPNG.js](https://github.com/photopea/UPNG.js) via [`@pdf-lib/upng`](https://github.com/Hopding/upng) (the library Hopding wired into pdf-lib in [PR #361](https://github.com/Hopding/pdf-lib/pull/361)), vendored for [`@mariusgrote/pdf-lib`](https://github.com/mariusgrote/pdf-lib) (originally vendored by [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib)).

## Benefits vs original UPNG / `@pdf-lib/upng`

|             | photopea/UPNG.js & `@pdf-lib/upng`              | `@mariusgrote/pdf-lib/upng`                                                     |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Compression | `pako`                                          | **[`fflate`](https://www.npmjs.com/package/fflate)**                            |
| Packaging   | Separate npm package                            | Subpath export of `@mariusgrote/pdf-lib`                                        |
| Source      | One monolithic `UPNG.js`                        | **Modular TypeScript** (`decode`, `encode`, `quantize`, `framize`, `filter`, …) |
| Encode      | Full UPNG (`quantize`, `framize`, lossy `cnum`) | **Same** feature set, ported from photopea's current sources                    |
| Types       | `@pdf-lib/upng` ships `.d.ts`                   | Same public surface, types generated from the sources                           |

The encoder keeps photopea's KD-tree + k-means quantization, APNG `framize`, and lossy palette encode when `cnum` &lt; number of colors.

## API

```ts
import UPNG from '@mariusgrote/pdf-lib/upng';

const img = UPNG.decode(/* ArrayBuffer */);
const rgba = UPNG.toRGBA8(img)[0]; // ArrayBuffer of RGBA8 pixels

const png = UPNG.encode([rgba], width, height, 0); // 0 = lossless / auto
const pngQ = UPNG.encode([rgba], width, height, 256); // quantize to ≤256 colors
const q = UPNG.quantize(rgba, 64);
const pngLL = UPNG.encodeLL([samples], width, height, 3, 1, 8);
```

`UPNG.compress` (also a named export) gives finer control over framing,
palette and dithering:

```ts
// [onlyBlend, evenCrd, forbidPrev, minBits, forbidPlte, dither]
const nimg = UPNG.compress([rgba], width, height, 64, [
  false,
  false,
  false,
  0,
  false,
  true,
]);
```

Also available via `@mariusgrote/pdf-lib/upng` when pdf-lib is installed.
