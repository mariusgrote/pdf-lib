# Release Process

This document describes how to release `@mariusgrote/pdf-lib`. The vendored
`upng` and `standard-fonts` packages ship inside it as subpath exports.

Releases are git tags and GitHub Releases only. The package is not published to
npm (`package.json` is marked `private`).

> **Note:** the repository contains Cantoo's old `v*` tags. Do not push them to
> GitHub (`git push --tags`) — push only the new release tag.

## Checklist (each release)

1. `git checkout main && git pull`
2. Update `CHANGELOG.md` (move `[Unreleased]` notes under the new version)
3. Optional local checks / integration apps if the change is risky
4. Run `pnpm release` — this runs `release:prep` (lint, typecheck, tests, build,
   smoke test), then `release-it` bumps `package.json`, commits
   `Release X.Y.Z`, creates tag `vX.Y.Z`, and opens a GitHub Release.
5. Push the commit and tag:
   ```bash
   git push origin main vX.Y.Z
   ```
6. Edit the [GitHub release notes](https://github.com/mariusgrote/pdf-lib/releases)
   if needed.
