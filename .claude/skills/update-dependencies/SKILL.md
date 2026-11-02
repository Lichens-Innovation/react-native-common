---
name: update-dependencies
description: Upgrade this repo's npm dependencies safely — align Expo SDK packages with `expo install`, dry-run ncu for the rest, apply minor/patch only, verify lint/typecheck/tests/build/CVE scan, report the run. Use when the user asks to update dependencies, upgrade packages, bump deps, check for outdated packages, or run ncu.
---

Upgrades every minor/patch-bumpable dependency in one pass, skips majors, then proves the upgrade didn't break anything before reporting. Never bump a major in this flow — log it for a separate, deliberate pass instead.

This is an Expo library: many packages are pinned by the Expo SDK, not by "latest on npm". Those go through `expo install`, everything else through ncu.

## Supported Expo SDK

The supported SDK is the major of the `expo` devDependency (e.g. `58.0.22` → SDK 58), and the `expo` peer floor (`>=58.0.0`) declares it to consumers. This flow stays inside that SDK; moving to a new SDK is its own project (`expo:expo-upgrade` skill).

The SDK's official versions live in `node_modules/expo/bundledNativeModules.json` (`expo install --check` compares against the latest patch of the same SDK). It covers more than the `expo-*` family: `react`, `react-dom`, `react-native`, `react-native-web`, most native `react-native-*` modules, `@react-native-community/*` (datetimepicker, slider, netinfo…), `@sentry/react-native`, and others. Look a package up there before treating it as ncu-managed:

```bash
node -e 'const b=require("./node_modules/expo/bundledNativeModules.json");for(const p of process.argv.slice(1))console.log(p,b[p]??"(not SDK-managed)")' <pkg>...
```

- Exact pin (`9.2.1`) or tilde (`~5.10.1`): SDK-managed. ncu would push it past that range (e.g. `5.10.1 → 5.11.0`) even on a "safe" minor.
- Absent (e.g. `react-native-mmkv`, `react-native-zeroconf`, third-party `expo-speech-recognition`): ncu-managed, normal minor/patch rules. Keep third-party `expo-*` on `expo install` anyway, it picks the SDK-matching release.

## 1. Classify

```bash
bunx expo install --check
bunx npm-check-updates
```

Build four sets:

- **SDK upgrade**: `expo install --check` entries whose expected version is higher than installed.
- **SDK ahead**: `--check` entries whose expected version is lower than installed (e.g. `react` `19.3.1` vs `19.3.0`, `@babel/core` 8 vs `^7`). Leave as is and report; downgrading is the user's call. `@babel/core` stays on 8 regardless.
- **Safe**: ncu entries not in `bundledNativeModules.json` (nor `expo`/`expo-*`) whose leftmost version segment is unchanged. Covers `0.x` patches (`0.17.6 → 0.17.7`); a `0.x` minor counts as major.
- **Major**: remaining ncu entries whose leftmost segment changed. Skip.

Every SDK-managed package (in `bundledNativeModules.json`, or `expo`/`expo-*`) is excluded from ncu, aligned or not.

If ncu lists `bun` (the `packageManager` field), treat it as a major: CI reads it via `bun-version-file`, so it ships separately.

Done when: every listed package is sorted into one of the four sets.

## 2. Apply

```bash
bunx expo install <sdk-upgrade-pkgs...>
bunx npm-check-updates -u -x '/^(expo|expo-.*|<other-sdk-managed-and-major-pkgs>)$/'
bun install
```

Excluding up front keeps this idempotent — rerunning after a partial failure is safe.

- Never run `expo install --fix`: it also downgrades the **SDK ahead** set. Name the upgrade packages explicitly.
- `expo install` creates an `app.json` listing config plugins. This library has no app config, so delete it.
- `expo install` may write `^`/`~` ranges. `.npmrc` sets `save-exact=true` and `lint:package` enforces exact versions (only `@babel/core` is exempt), so strip any range it added before continuing.
- `@lichens-innovation/ts-common` must end at the latest published version — this repo often adopts new ts-common APIs right after they ship.
- ncu does not touch `peerDependencies` by default; leave them. Peer floors (`>=`) only move when this repo's code starts requiring a newer API, which is a feature change, not an upgrade.

Done when: `bun install` exits 0 and `git diff package.json` shows no range prefix except on `@babel/core`.

## 3. Verify

Run in order, stopping on the first failure: `bun run lint`, `bun run lint:package`, `bun run typecheck`, `bun run test --run`, `bun run build`, `bun run security:check`.

Check each script's own exit code — the shell is zsh, so `PIPESTATUS` doesn't exist and piping into `tail` masks failures. Redirect to a file instead: `bun run <script> >/tmp/out.txt 2>&1; echo $?`. The RTK hook rewrites `tsc` output, so run it as `rtk proxy bun run typecheck`.

- `prettier` in the applied set → a `lint` failure from `prettier -c` on previously-clean files is expected on new rules. Run `bun run format:fix`, then confirm the diff only touches the files flagged — a wider diff means something else broke.
- `security:check` uses `--ratchet`: a new high CVE fails it. Report the advisory; fix only by bumping within minor/patch, never by adding it to `.cve-lite/baseline.json` to get a pass.
- Any other failure: trivial fix (type signature, import path) → apply and continue. Real API break → stop, report, never downgrade unilaterally to route around it.

Done when: all six checks exit 0.

## 3b. Shrink the CVE baseline

`--ratchet` only fails on findings above the baseline; it never prunes entries an upgrade fixed. Stale entries are dangerous: if a fixed advisory comes back later, it is already accepted and passes silently. After a green `security:check`, regenerate and compare:

```bash
cp .cve-lite/baseline.json /tmp/baseline.old.json
rm .cve-lite/baseline.json
bun run security:check >/tmp/out.txt 2>&1; echo $?   # exits 1 by design: the saving run still gates on --fail-on
node -e 'const k=f=>new Set(require(f).findings.map(x=>x.name+"@"+x.version+":"+x.advisoryIds.join(",")));const a=k("/tmp/baseline.old.json"),b=k(process.cwd()+"/.cve-lite/baseline.json");console.log("removed",[...a].filter(x=>!b.has(x)));console.log("added",[...b].filter(x=>!a.has(x)))'
```

- `added` empty → keep the new file: `bunx prettier --write .cve-lite/baseline.json`, rerun `bun run security:check` (must exit 0), and report the removed findings.
- `added` not empty → restore with `cp /tmp/baseline.old.json .cve-lite/baseline.json`. The baseline may only shrink in this flow; a new finding means step 3 should have failed, so investigate.
- `removed` empty → restore the old file too. Only `createdAt` changed, so the diff isn't worth it.

Done when: the baseline has no entries the scan no longer reports, and `security:check` exits 0.

## 4. Report

Rank skipped majors by adoption risk:

- Lowest: tooling-only devDeps with no import in `src/` (commitlint, semantic-release plugins, husky, rimraf, cpx, npm-package-json-lint).
- Medium: build/lint/test toolchain (`eslint` + `eslint-config-universe` + `@typescript-eslint/*` move together, `tsup`, `vitest`/`vite`/`jsdom`, `@babel/*`).
- Highest: runtime `dependencies` imported across `src/` (`mobx` family, `react-hook-form`, `date-fns`/`date-fns-tz`, `immer`, `@legendapp/list`, `fast-xml-parser`), peer libraries whose API the components wrap (`@rjsf/*`, `@tanstack/react-query`, `i18next`/`react-i18next`, `react-native-paper`, `@gorhom/bottom-sheet`), `typescript` (must stay compatible with `@typescript-eslint/*` and Expo's `tsconfig.base`), and the Expo SDK itself — a new SDK is its own project (`expo:expo-upgrade` skill), and bumps the peer floors consumers must meet.

Grep `src/` for each major's import count to back the ranking.

Report to the user: what upgraded (SDK-aligned vs ncu), SDK-ahead packages left in place (installed vs expected), majors skipped with risk ranking, CVE findings removed from the baseline, anything hit plus the fix applied, verification result.

Done when: the user has the summary.

## 5. Commit (only if the user asks)

Releases are cut by semantic-release on push to `main`, so the commit type decides whether a version ships. The pre-commit hook re-runs typecheck, `lint:package` and `security:check` when `package.json`/`bun.lock` are staged. Commit a shrunk `.cve-lite/baseline.json` in the same commit as the upgrade that fixed those findings.

- `chore(deps): bump minor/patch deps` — only `devDependencies` changed. Most libraries here are devDeps + peers, so bumping them doesn't change what consumers install: no release.
- `fix(deps): ...` — a package in `dependencies` changed (e.g. `@lichens-innovation/ts-common`), so consumers should get a new version.
