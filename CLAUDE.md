# CLAUDE.md — 2fkinawesome (Solana D-App in development)

## SESSION INIT — RUN THIS FIRST

Before responding to anything, in this order:

1. Read `C:\Users\puddi\Projects\fusional-knowledge-base\00-CURRENT-STATUS\STATUS.md`
2. Read `C:\Users\puddi\Projects\fusional-knowledge-base\00-CURRENT-STATUS\PRIORITIES.md`
3. Read `C:\Users\puddi\Projects\fusional-knowledge-base\05-RECALL\SOLVED-ISSUES.md`
4. State runtime: "Running as: <model> on <platform>, tools available: <summary>"

---

## RECALL PROTOCOL (mandatory, visible)

Before debugging ANY error or unexpected behavior:
1. State "Recall check: searching SOLVED-ISSUES for <error fingerprint>"
2. Check the registry (loaded in session init)
3. State outcome: "Match: SI-XXX — applying documented fix" OR "No match — proceeding with new diagnosis"

The Recall check is VISIBLE OUTPUT. If the line is not in the response, the check did not happen.

---

## AUTO-LOG PROTOCOL (mandatory, ambient)

While working on any task, monitor for these AUTO-LOG TRIGGERS:

1. **Wrong assumption corrected** — agent stated/assumed X, evidence showed Y, time was wasted
2. **Path/config drift discovered** — documented value doesn't match reality on disk/runtime
3. **Command failed and root cause identified** — error + fix found, would re-bite future sessions
4. **Protocol violation caught** — Recall check skipped, runtime not declared, etc.
5. **Cross-system surprise** — case sensitivity, line endings, branch divergence, version mismatch
6. **"Why isn't this working" → resolution** — anything that took >2 minutes to diagnose
7. **Repeated pattern** — same kind of mistake hitting twice = systemic, log it

When a trigger fires:
1. State: "Auto-log trigger: <which trigger> — drafting SI-XXX"
2. Read `C:\Users\puddi\Projects\fusional-knowledge-base\05-RECALL\SOLVED-ISSUES.md` to find highest existing SI number
3. Append the new entry IMMEDIATELY (do not defer to end of session)
4. Insert before "## TEMPLATE — copy this for new entries" using filesystem tools
5. Confirm: "Logged SI-XXX: <title>"
6. Continue the original task

Do NOT ask permission to log. Do NOT batch logs. Do NOT skip when "not sure if it's worth logging" — log it; entries can be merged or deleted later.

Format (strict):
```
## SI-XXX: <one-line title>
**Symptoms:** <what you saw>
**Root cause:** <what was actually wrong>
**Fix:** <exact steps that worked>
**Verified:** YYYY-MM | **Source:** <session/task context>
**Tags:** <comma-separated>
```

---

## CRITICAL FAILURE MODES TO AVOID

Already logged in SOLVED-ISSUES.md — do not repeat:

- **SI-007**: Don't assume runtime/access mode — verify with environment check
- **SI-008**: Recall check must be VISIBLE OUTPUT, not internal step
- **SI-009**: Don't conflate distinct products in handoff prompts
- **SI-010**: Don't trust documented paths blindly — verify against filesystem
- **SI-011**: Don't `git --amend` after pushing — causes T3610 divergence

---

## REPO CONTEXT — 2fkinawesome

This is a **React Native / Expo TypeScript app** being adapted into a **Solana D-App** for the Solana D-App Store.

### Stack (from package.json — verify before assuming)
- React Native via Expo
- TypeScript
- Target: Solana Mobile Stack (SMS) + dApp Store deployment

### Key files
- `App.tsx` — root component
- `index.ts` — entry point
- `app.json` — Expo configuration
- `src/` — source code
- `assets/` — images, fonts, etc.

### Build/run commands (verify these against package.json scripts)
- `npm install` — install dependencies
- `npx expo start` — start dev server
- `npx expo run:android` — build + run Android
- `npx expo run:ios` — build + run iOS

### Solana D-App Store specifics
- Will need Solana Mobile SDK integration
- Wallet adapter for Solana wallets (Phantom, Solflare, etc.)
- Mobile Wallet Adapter (MWA) protocol for transactions
- Deployment target: Solana dApp Store (not Google Play / App Store directly)

---

## DEBUG WORKFLOW

When debugging in this repo:

1. **Recall check first** (mandatory) — search SOLVED-ISSUES for the error
2. **Verify environment** — `npm --version`, `node --version`, expo CLI version
3. **Check package.json** before assuming dependencies — versions matter for React Native
4. **Read actual error output** — don't pattern-match to remembered React Native errors; React Native error messages have changed across versions
5. **Test on device or simulator** — Expo Go has limitations vs. dev build
6. **Log every non-trivial fix** as SI-XXX — Solana D-App debugging is fresh territory; entries here are gold for the dev.to article

---

## WORKING RULE

If repo/runtime facts conflict with docs, trust verified code/runtime facts. Call out the mismatch and update the knowledge base during the same task — that's a SI-XXX entry.

This repo is the real-world test case for FusionAL Recall. Every debug session here generates registry data that proves the product. Treat it as both the application AND the validation test.
