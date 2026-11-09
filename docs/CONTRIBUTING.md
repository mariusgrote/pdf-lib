# Contributing to `pdf-lib`

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

`pdf-lib` is a JavaScript library designed to create and modify PDF files in any JavaScript environment. Contributions are welcomed and appreciated! Please read through this document to learn how to setup and run the project on your machine. If you have any questions or run into trouble, please [create a discussion](https://github.com/mariusgrote/pdf-lib/discussions).

### Table Of Contents

- [PR Requirements](#pull-request-requirements)
- [Adding Dependencies](#adding-dependencies)
- [Understanding PDFs](#understanding-pdfs)
- [Local Setup and Prerequisites](#local-setup-and-prerequisites)
- [Running the Unit Tests](#running-the-unit-tests)
- [Running the Integration Tests](#running-the-integration-tests)
- [Compiling the Project](#compiling-the-project)
- [Running the Linter](#running-the-linter)
- [Running the Type Checker](#running-the-type-checker)
- [Debugging Tips](#debugging-tips)

## Pull Request Requirements

All PRs must:

- Work in Node and browser environments.
- Be explicitly tested in Node and multiple browsers.
- Work on **new** PDF files.
- Work on all types of **existing** PDF files.
- Be fully unit tested.
- Be fully integration tested.
- Have doc comments for new public APIs.

It is recommended to read the PR template before you get underway with your changes.

## Adding Dependencies

We try to avoid adding new dependencies to `pdf-lib` as they tend to have a high maintenance cost. However, new dependencies are sometimes necessary. If you're thinking about creating a PR that adds a new dependency, you should write a [proposal](https://github.com/mariusgrote/pdf-lib/issues/new) first.

If it's possible to build your PR without introducing new dependencies, then that's what you should do. But if you _really, truly_ think you need to introduce a new dependency, it will need to meet the following requirements:

- It must be well tested.
- It must be well documented.
- It must be actively supported.
- It must have a small bundle size.
- It must work in Node and the browser.

## Understanding PDFs

Most contributions will require you to understand the structure of PDF files. You might be able to find some articles online explaining this, but they're generally pretty sparse. PDFs are a rather niche area in open source programming 🙂.

The [PDF specification](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf) is an invaluable reference and a great way to get started. It can be a bit dense sometimes and you certainly don't need to read all of it. But the first few sections related to PDF syntax and object structure will be useful to most contributors.

All contributors are advised to read the following sections:

| Section Title                     | Page Numbers | Summary                                        |
| --------------------------------- | ------------ | ---------------------------------------------- |
| Introduction                      | Pages 7-8    | File format history and purpose                |
| 7.1 General                       | Page 19      | Overview of PDF file syntax                    |
| 7.2 Lexical Conventions           | Pages 19-21  | The characters used to express PDF objects     |
| 7.3 Objects                       | Pages 13-30  | The types of objects used in PDF files         |
| 7.5 File Structure                | Pages 38-63  | How PDF files are structured                   |
| 7.8 Content Streams and Resources | Pages 89-92  | How visual content is represented in PDF files |

## Local Setup And Prerequisites

You can develop `pdf-lib` on Windows, Mac, or Linux machines. While most of the original code was developed on Macs, care has been taken to ensure that all scripts and commands needed for development are platform independent. (If you find anything that doesn't work on your machine/platform, please [create an issue](https://github.com/mariusgrote/pdf-lib/issues/new) or submit a PR!)

In order to work on `pdf-lib`, please ensure you have installed the following:

- **Node.js** provides the runtime needed to run this project. ([Installation instructions](https://nodejs.org/en/download/) - need v22 or later).
- **pnpm** is the package manager used for this project ([installation instructions](https://pnpm.io/installation), version 12 or later). CI uses pnpm 12.4.1. New dependency versions are only resolved once they are seven days old (`minimumReleaseAge` in `pnpm-workspace.yaml`).
- **Git** is the SCM used for this project. ([Installation instructions](https://git-scm.com/downloads) - need `2.17.2` or greater)

Next you'll need to clone the project:

```
git clone https://github.com/mariusgrote/pdf-lib.git
cd pdf-lib
```

After cloning the project, you'll need to install the dependencies. All dependencies are managed within the `package.json` file. This means all you have to do is run:

```
pnpm install
```

If you don't see any errors or warnings, then everything should have worked correctly. The next thing you'll want to do is [run the unit tests](#running-the-unit-tests) to verify that everything is is good shape.

## Running the Unit Tests

We use [Vitest](https://vitest.dev/) to write unit tests for `pdf-lib`. All unit tests are kept in the [`tests`](./tests) directory. They run against the TypeScript sources, so no build is needed first.

To run the unit tests, execute the following:

```
pnpm test
```

This should output something like:

```
$ vitest run
 Test Files  77 passed (77)
      Tests  904 passed | 1 skipped (905)
   Duration  27.10s
```

Use `pnpm testw` to re-run tests on change, and `pnpm testc` for a coverage report.

Hopefully you see that all the tests passed! But if you see errors or warnings, then something must be wrong with your setup. Please ensure you've following the installation steps outlined in the [local setup and prerequisites section](#local-setup-and-prerequisites). If you still can't get the tests running after following these steps, then please [create an issue](https://github.com/mariusgrote/pdf-lib/issues/new) explaining the problem you're having.

## Running the Integration Tests

In addition to unit tests, we maintain integration tests for Node and the browser. All integration tests are kept in the [`apps/`](./apps) directory. The goal of these tests is to ensure the project as a whole works correctly, whereas the unit tests ensure individual classes and functions work correctly. The integration tests take longer to run than the unit tests. They also require manual inspection of the PDFs they create to make sure nothing is broken, whereas the unit tests are entirely automatic (they pass/fail without human input).

> **Make sure to [compile the code](#compiling-the-project) before running these tests**

There are integration tests for Node and the browser:

- To run the tests for Node:
  ```
  pnpm apps:node
  # Follow the prompts in your terminal
  ```
- To run the tests for the browser:
  ```
  pnpm apps:web
  # Open http://localhost:8080/apps/web/test1.html in your browser
  ```

## Compiling the Project

For most development, manual compilation isn't necessary. The unit tests are usually all you need to test your code changes. But manual compilation _is_ necessary prior to running the integration tests or cutting a release.

`pnpm build` runs [tsdown](https://tsdown.dev) (configured in `tsdown.config.mts`) and writes everything to `dist/`:

- **`index.mjs`, `upng.mjs`, `standard-fonts.mjs`** and their `.d.mts` type declarations - the npm package entry points, ESM-only.
- **`pdf-lib.js` / `pdf-lib.min.js`** - self-contained UMD bundles that set the global `PDFLib`.
- **`pdf-lib.esm.mjs` / `pdf-lib.esm.min.mjs`** - self-contained ESM bundles for browsers.

`pnpm test:smoke` loads all of them, and `pnpm apps:build` compiles the Node integration apps against the generated type declarations.

To compile the project, execute the following:

```
pnpm build
```

## Running the Linter

We use two tools to keep `pdf-lib`'s source code clean, tidy, and consistent:

- [**oxlint**](https://oxc.rs/docs/guide/usage/linter) for linting
- [**oxfmt**](https://oxc.rs/docs/guide/usage/formatter) for formatting

It is recommended that you set up your editor to run them for you (for example with the Oxc extension). However, this is not required. They can be run from the command line as well:

```
pnpm fmt        # format all files
pnpm fmt:check  # check formatting without writing
pnpm lint       # lint
pnpm lint:fix   # lint and apply automatic fixes
```

Not all lint errors can be fixed automatically. You will have to manually fix those that can't.

## Running the Type Checker

`pdf-lib` is written in TypeScript. All source code must be correctly typed for the project to compile.

`pnpm lint` also type-checks `src/`, `tests/` and `apps/` (oxlint's `typeCheck` option, which uses TypeScript 7). Vitest strips types without checking them, so run `pnpm lint` before you push. No build is needed: the apps import `@mariusgrote/pdf-lib`, which `apps/node/tsconfig.json` resolves to `src/` through the `@mariusgrote/source` export condition. At runtime, and in `pnpm apps:build`, the same import resolves to the built package.

## Debugging Tips

Oftentimes when dealing with object offsets and cross references tables/streams, you'll have to deal with byte offsets within a file. The following command can be used (on Linux and Mac machines) to view a given number of bytes at a particular offset:

```bash
cat foo.pdf | tail -c +OFFSET | head -c NUM_BYTES
```

For example, to view the first 100 bytes following the offset 560477 (aka the byte range 560477-560577), you can run:

```bash
cat foo.pdf | tail -c +560477 | head -c 100
```

You can also pipe to `hexdump` to view the raw bytes:

```bash
cat foo.pdf | tail -c +OFFSET | head -c NUM_BYTES | hexdump -e '6/1 " %02X" "\n"'
```
