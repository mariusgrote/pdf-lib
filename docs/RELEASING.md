# Release Process

This document describes how to release `@mariusgrote/pdf-lib`. The vendored
`upng` and `standard-fonts` packages ship inside it as subpath exports.

Releases are git tags and GitHub Releases only. The package is not published to
npm (`package.json` is marked `private`).

> **Note:** the repository contains Cantoo's old `v*` tags. Do not push them to
> GitHub (`git push --tags`) — push only the new release tag.

## Checklist (each release)

1. `git checkout main && git pull`
2. Update `CHANGELOG.md` (move `[Unreleased]` notes under the new version) and
   commit it.
3. Run the full check (formatting, lint and typecheck, tests, build, smoke test):
   ```bash
   pnpm release:check
   ```
4. Bump the version. This edits `package.json`, commits `X.Y.Z`, and creates
   tag `vX.Y.Z`:
   ```bash
   npm version patch   # or minor / major
   ```
5. Push the commit and the tag:
   ```bash
   git push origin main vX.Y.Z
   ```
6. Create the GitHub Release from the changelog notes:
   ```bash
   gh release create vX.Y.Z --title vX.Y.Z --notes "..."
   ```
