# Release v4.0.0 — Expo SDK 58

> Local instructions file. **Do not commit it** (always `git add` explicit paths below, never `git add -A`). Delete it once the release is done.

Branch: `chore/expo-sdk-58` (3 commits on top of `origin/main`):

- `feat!: support Expo SDK 58` — imports from `expo-router/react-navigation`, `InteractionManager` → `requestIdleCallback`, `absoluteFillObject` → `absoluteFill`, SDK 58 dev deps, TypeScript 6 tsconfig, `pretty-bytes` dependency
- `docs: document 4.x compatibility with Expo SDK 58` — README "Consume in a project"
- `build: enforce exact dependency versions` — exact pins, `save-exact`, `npm-package-json-lint` (pre-commit + CI), `.nvmrc`

Breaking: requires `expo` / `expo-router` >= 58, `react-native` >= 0.88, `react` >= 19.3; `@react-navigation/native` peer removed → major bump **3.20.0 → 4.0.0**.

Publishing is automated: `.github/workflows/create-release.yml` runs on every push to `main` and publishes to npmjs when `package.json` `version` differs from the latest `v*` tag (then tags `v4.0.0` and creates the GitHub Release).

---

## 1. Prerequisites

```bash
cd ~/git/lichens/react-native-common
nvm use                      # Node 24.21.0 from .nvmrc
gh auth status               # logged in, access to Lichens-Innovation
git fetch origin
git switch chore/expo-sdk-58
git log --oneline origin/main..HEAD   # expect the 3 commits above
```

The sibling `../ts-common` must be up to date (tsconfig maps `@lichens-innovation/ts-common` to its sources):

```bash
git -C ../ts-common pull --ff-only
```

## 2. Validate locally

```bash
yarn install --frozen-lockfile
yarn typecheck
yarn lint
yarn lint:package
yarn test --run
yarn build
```

All must pass. Sanity-check the bundle no longer references `@react-navigation`:

```bash
grep -c "@react-navigation" dist/index.js dist/index.d.ts   # expect 0 for both
grep -o "expo-router/react-navigation" dist/index.js | head -1
```

Optional — test inside the manufacture app before publishing:

```bash
yarn watch:for:manufacture   # copies dist/ into ../rinno-manufacture-app/node_modules
```

## 3. Bump the version

```bash
npm pkg set version=4.0.0
git diff package.json        # only "version" changed
git add package.json
git commit -m "chore: release v4.0.0"
```

The pre-commit hook runs `yarn typecheck` and `yarn lint:package`.

## 4. Optional: dry-run the package contents

```bash
npm pack --dry-run           # expect dist/index.js, dist/index.d.ts, dist/rjsf.*, README, LICENSE, package.json
```

## 5. Open the pull request

```bash
git push -u origin chore/expo-sdk-58
gh pr create --base main --title "feat!: support Expo SDK 58 (v4.0.0)" --body "$(cat <<'EOF'
## Changes Description

- Support Expo SDK 58 (React Native 0.88, React 19.3, TypeScript 6)
- Import navigation APIs from `expo-router/react-navigation` (expo-router 56+ vendors its own navigation; `@react-navigation/native` contexts no longer match)
- Replace APIs removed in React Native 0.88 (`InteractionManager`, `StyleSheet.absoluteFillObject`)
- Enforce exact dependency versions (`save-exact`, `npm-package-json-lint` in pre-commit and CI)
- README: 4.x compatibility table and upgrade guide
- Release v4.0.0

BREAKING CHANGE: requires expo >= 58, expo-router >= 58, react-native >= 0.88 and react >= 19.3. The `@react-navigation/native` peer dependency is removed.

## Checklist
- [x] code follows project guidelines.
- [x] tests have been added or updated (if applicable).
- [x] documentation has been updated (if applicable).
EOF
)"
```

## 6. Merge

Previous releases were squash-merged (e.g. #34). If you squash, keep `feat!:` in the title and the `BREAKING CHANGE:` line in the squash message.

```bash
gh pr merge --squash --delete-branch
```

## 7. Watch the release workflow

```bash
gh run list --workflow create-release.yml --limit 3
gh run watch                 # pick the run triggered by the merge
```

Expected in the logs: `Latest tag: v3.20.0`, `Version changed`, then build, `npm publish`, tag push, GitHub Release.

## 8. Verify

```bash
npm view @lichens-innovation/react-native-common version          # 4.0.0
npm view @lichens-innovation/react-native-common@4.0.0 peerDependencies | grep -E "expo-router|react-navigation"
git fetch --tags && git tag -l "v4.0.0"
gh release view v4.0.0
```

## 9. Cleanup

```bash
git switch main && git pull --ff-only
git branch -d chore/expo-sdk-58      # if not already deleted by the merge
rm RELEASE-4.0.0.md
```

If you keep the `mirror` remote (`RinnoVision/react-native-commun`) in sync: `git push mirror main --tags`.

## Next

Release `@RinnoVision/rinno-react-commun` 3.0.0 — see `~/git/lichens/rinno-react-commun/RELEASE-3.0.0.md` (it requires 4.0.0 to be published on npm first).

## If something goes wrong

- Workflow failed **before** `Publish to npm`: fix on a new branch, PR, merge — the workflow re-runs on push to `main` and nothing was published.
- Bad package **published**: do not unpublish; publish a `4.0.1` fix, and if needed `npm deprecate @lichens-innovation/react-native-common@4.0.0 "<reason>"`.
