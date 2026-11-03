# SDK 58 verification and security boundaries

The candidate uses Expo 58.0.22's published native-module matrix: React 19.3.0,
React Native 0.88.1 and the corresponding Expo font/haptics/status modules,
screens and safe-area context. Three screens remove React Native's unsupported
`StatusBar.backgroundColor` property; their existing container backgrounds and
light-content bar style remain unchanged. TypeScript remains strict.

SDK 57 retained vulnerable build-tool dependencies. SDK 58 removes the Zod and
deepmerge findings but still declares old glob/minimatch dependencies. The scoped
overrides select patched glob >=14.0.2 within major 14 and minimatch >=11.0.1
within major 11. They are not justified by audit output alone: source review
identified the APIs used by Expo (globSync/sync/glob/globStream, and Minimatch
constructor/pattern/negate/match). Regression fixtures exercise those APIs and
actual Expo Android/iOS path and fingerprint-ignore consumers. Complete Expo
config evaluation, project fingerprinting and Android JS/Hermes bytecode exports
also passed. Keep these checks when updating the overrides; prefer upstream
constraints once Expo declares the patched versions directly.

Install with `npm ci --ignore-scripts`. No install-script allowlist was expanded;
the local npm `allow-scripts` setting stayed `esbuild`. Scripts-disabled installs
also avoided the EALLOWSCRIPTS failure encountered through Expo's install wrapper.
Do not disable the policy or accept arbitrary lifecycle scripts as a workaround.

Verification commands:

- `npm test` — actual build-tool consumer fixtures, no services or model calls.
- `npm run typecheck` — real strict app-source typecheck.
- `npx --no-install expo install --check` — actual SDK module compatibility.
- `EXPO_OFFLINE=1 npx --no-install expo export --platform android` — real bytecode
  export; use an output directory outside the source tree for local review.
- `npm audit --omit=dev` and `npm audit` — both must be clean; no advisory waiver
  or vulnerability reclassification is used for this candidate.

An Android export is not an APK/AAB, native compilation, emulator/device test,
wallet transaction or dApp Store delivery. Those outcomes were not exercised or
claimed, and no deployment was performed.
