---
name: update-dependencies
description: Upgrade this repo's npm dependencies safely — align Expo SDK packages with `expo install`, dry-run ncu for the rest, apply minor/patch only, verify lint/typecheck/tests/build/CVE scan, report the run. Use when the user asks to update dependencies, upgrade packages, bump deps, check for outdated packages, or run ncu.
---

Upgrades every minor/patch-bumpable dependency in one pass, skips majors, then proves the upgrade didn't break anything before reporting. Never bump a major in this flow — log it for a separate, deliberate pass instead.

This is an Expo library: `expo`, `expo-*`, `react`, `react-dom`, `react-native` and the native `react-native-*` modules are pinned by the Expo SDK, not by "latest on npm". Those go through `expo install`, everything else through ncu.

## 1. Classify

```bash
bunx expo install --check
bunx npm-check-updates
```

Build three sets:

- **SDK-managed**: every package `expo install --check` reports, plus every package of the same family (`expo`, `expo-*`, `react`, `react-dom`, `react-native`, `react-native-web`) even when already aligned. ncu must never touch these — it would push them past what the current SDK supports.
- **Safe**: remaining ncu entries whose leftmost version segment is unchanged (minor/patch).
- **Major**: remaining ncu entries whose leftmost segment changed. Skip.

If ncu lists `bun` (the `packageManager` field), treat it as a major: CI reads it via `bun-version-file`, so it ships separately.

Done when: every listed package is sorted into one of the three sets.

## 2. Apply

```bash
bunx expo install --fix
bunx npm-check-updates -u -x <comma-separated-sdk-managed-and-major-pkgs>
bun install
```

Excluding up front keeps this idempotent — rerunning after a partial failure is safe.

- `expo install --fix` may write `^`/`~` ranges. `.npmrc` sets `save-exact=true` and `lint:package` enforces exact versions (only `@babel/core` is exempt), so strip any range it added before continuing.
- `@lichens-innovation/ts-common` must end at the latest published version — this repo often adopts new ts-common APIs right after they ship.
- ncu does not touch `peerDependencies` by default; leave them. Peer floors (`>=`) only move when this repo's code starts requiring a newer API, which is a feature change, not an upgrade.

Done when: `bun install` exits 0 and `git diff package.json` shows no range prefix except on `@babel/core`.

## 3. Verify

Run in order, stopping on the first failure: `bun run lint`, `bun run lint:package`, `bun run typecheck`, `bun run test --run`, `bun run build`, `bun run security:check`.

Check each script's own exit code — the shell is zsh, so `PIPESTATUS` doesn't exist and piping into `tail` masks failures. Redirect to a file instead: `bun run <script> >/tmp/out.txt 2>&1; echo $?`. The RTK hook rewrites `tsc` output, so run it as `rtk proxy bun run typecheck`.

- `prettier` in the applied set → a `lint` failure from `prettier -c` on previously-clean files is expected on new rules. Run `bun run format:fix`, then confirm the diff only touches the files flagged — a wider diff means something else broke.
- `security:check` uses `--ratchet`: a new high CVE fails it. Report the advisory; fix only by bumping within minor/patch, never by editing the baseline in `.cve-lite/`.
- Any other failure: trivial fix (type signature, import path) → apply and continue. Real API break → stop, report, never downgrade unilaterally to route around it.

Done when: all six checks exit 0.

## 4. Report

Rank skipped majors by adoption risk:

- Lowest: tooling-only devDeps with no import in `src/` (commitlint, semantic-release plugins, husky, rimraf, cpx, npm-package-json-lint).
- Medium: build/lint/test toolchain (`eslint` + `eslint-config-universe` + `@typescript-eslint/*` move together, `tsup`, `vitest`/`vite`/`jsdom`, `@babel/*`).
- Highest: runtime `dependencies` imported across `src/` (`mobx` family, `react-hook-form`, `date-fns`/`date-fns-tz`, `immer`, `@legendapp/list`, `fast-xml-parser`), peer libraries whose API the components wrap (`@rjsf/*`, `@tanstack/react-query`, `i18next`/`react-i18next`, `react-native-paper`, `@gorhom/bottom-sheet`), `typescript` (must stay compatible with `@typescript-eslint/*` and Expo's `tsconfig.base`), and the Expo SDK itself — a new SDK is its own project (`expo:expo-upgrade` skill), and bumps the peer floors consumers must meet.

Grep `src/` for each major's import count to back the ranking.

Report to the user: what upgraded (SDK-aligned vs ncu), majors skipped with risk ranking, anything hit plus the fix applied, verification result.

Done when: the user has the summary.

## 5. Commit (only if the user asks)

Releases are cut by semantic-release on push to `main`, so the commit type decides whether a version ships. The pre-commit hook re-runs typecheck, `lint:package` and `security:check` when `package.json`/`bun.lock` are staged.

- `chore(deps): bump minor/patch deps` — only `devDependencies` changed. Most libraries here are devDeps + peers, so bumping them doesn't change what consumers install: no release.
- `fix(deps): ...` — a package in `dependencies` changed (e.g. `@lichens-innovation/ts-common`), so consumers should get a new version.
