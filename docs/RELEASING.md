# Release Process

This document describes how to release `@mariusgrote/pdf-lib`. The vendored
`upng` and `standard-fonts` packages ship inside it as subpath exports.

Releases are git tags and GitHub Releases only. The package is not published to
npm (`package.json` is marked `private`).

> **Note:** the repository contains Cantoo's old `v*` tags. Do not push them to
> GitHub (`git push --tags`) — push only the new release tag.

## Release notes

There is no `CHANGELOG.md`. Release notes are generated from the titles of the
pull requests merged since the previous release, grouped by label as configured
in [`.github/release.yml`](../.github/release.yml):

| Label                | Section          |
| -------------------- | ---------------- |
| `breaking`           | Breaking changes |
| `enhancement`        | New features     |
| `bug`                | Bug fixes        |
| `documentation`      | Documentation    |
| `tooling`            | Tooling and CI   |
| `dependencies`       | Dependencies     |
| `skip-release-notes` | Left out         |

Label pull requests before merging them, and give them titles that make sense
in the release notes. Changes up to 2.11.0 are in
[Cantoo's changelog](https://github.com/cantoo-scribe/pdf-lib/blob/master/CHANGELOG.md).

## Checklist (each release)

`main` only accepts changes through pull requests, so the version bump is a pull
request too.

1. Bump the version on a branch and open a pull request:
   ```bash
   git checkout main && git pull
   git checkout -b release/vX.Y.Z
   npm version patch --no-git-tag-version   # or minor / major
   git commit -am "Release vX.Y.Z"
   gh pr create --title "Release vX.Y.Z" --label skip-release-notes --body ""
   ```
2. Once CI passes, squash-merge it.
3. Run the full check on the merged `main`:
   ```bash
   git checkout main && git pull
   pnpm release:check
   ```
4. Create the tag and the GitHub Release from `main`, with generated notes:
   ```bash
   gh release create vX.Y.Z --target main --title vX.Y.Z --generate-notes
   ```
   Review the notes on the release page and edit them if needed.
