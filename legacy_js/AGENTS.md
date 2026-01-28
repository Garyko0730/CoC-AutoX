# Agent Guide

This repository is a small JavaScript automation bot for the Auto.js/AutoX
runtime on Android. It relies on Auto.js globals like `floaty`, `sleep`,
`images`, `threads`, and `shell`, so it will not run under plain Node.js.

## Repository layout

- `main.js` is the entry script and state machine.
- `combat.js` contains tap/swipe combat routines and gesture helpers.
- `ocr_util.js` handles OCR capture, parsing, and image helpers.
- `config.js` stores thresholds and strategy choices.

## Build, lint, and test

There is no package.json or build tooling in this repo. There are also no unit
tests. Treat this as a runtime script deployed and executed on-device.

### Run (manual)

- **Auto.js/AutoX UI**: Load `main.js` in Auto.js and run it.
- **ADB upload**: Copy the folder to device storage, then run the script from
  Auto.js with file permissions granted.

### Lint

- No lint config found. If you introduce linting, document it here and make it
  runnable without extra IDE plugins.

### Tests

- No automated tests present.
- **Single test**: Not applicable (no test runner configured).

## Runtime assumptions

- Android device with root access (the script requests `su` in `main.js`).
- Auto.js/AutoX runtime with OCR engine available (`paddleOCR`, `$ocr`, or `ocr`).
- Screen resolution independence is handled with ratio-based coordinates.
- Floating window permissions are granted for the UI overlay.

## Code style guidelines

### General formatting

- Use 2-space indentation.
- Include semicolons.
- Prefer `const` for bindings that do not change, `let` otherwise.
- Keep braces on the same line as the control statement.
- Use blank lines to separate logical blocks in long functions.
- Keep lines reasonably short; wrap long expressions for readability.

### Imports and modules

- Use CommonJS (`require`, `module.exports`).
- Keep relative imports explicit (`./config`).
- Group imports at the top of the file without blank lines unless logical groups
  are introduced.
- Do not introduce ES module syntax unless the runtime is upgraded.

### Naming conventions

- Functions and variables: `camelCase`.
- Constants and enums: `UPPER_SNAKE_CASE` (see `STATE`, `STATE_TIMEOUTS`).
- Booleans should read like predicates: `isRunning`, `hasReturnButton`.
- Avoid abbreviations unless they are domain standard (e.g., `ocr`, `img`).

### Control flow and state

- Keep state transitions centralized (see `setState` in `main.js`).
- When adding new states, update the `STATE` map and `STATE_TIMEOUTS` together.
- Prefer early returns/guards for missing OCR data or capture failures.
- Avoid deeply nested conditionals; split into helper functions when possible.

### Error handling

- Wrap device/ocr/shell calls in `try/catch` when failures are expected.
- Always recover to a safe state on errors (see `main.js` catch block).
- Return `null` or `false` consistently when data is unavailable; callers should
  guard against these values before acting.
- Log or surface errors to the floating window only when it helps recovery.

### Types and data validation

- This codebase is plain JavaScript; keep data shapes obvious and consistent.
- Validate OCR results before parsing (e.g., empty text -> early return).
- Parse numbers defensively; treat missing data as zero or `null` depending on
  context.

### UI overlay and logging

- Keep floating window updates short and user focused.
- Avoid excessive log spam inside tight loops.
- Update UI text only when state changes or on errors.

### Localization

- Keep user-visible strings concise and consistent in language choice.
- Preserve existing language usage when editing nearby UI labels.

### Auto.js/AutoX specifics

- Use ratio-based coordinates (`x`/`y` between 0 and 1) and convert with device
  width/height to support multiple resolutions.
- When using `shell`, pass `true` for root where required and normalize results
  to handle different return types.
- Avoid blocking the UI thread for too long; short `sleep` intervals are preferred
  between repeated actions.
- Keep thread usage limited and documented (see `scheduleWardenSkill`).

### OCR and image handling

- Always recycle/clamp images when possible to avoid memory leaks.
- Ensure OCR region scaling uses `device.width`/`device.height` with fallbacks.
- Normalize OCR outputs into `{ text, confidence }` before matching.
- Keep OCR region constants in one place and avoid duplicating them.

### Combat and input routines

- Keep tap/swipe helpers (`tapRatio`, `multiPointSwipe`) reusable and centralized.
- Randomize tap offsets lightly to avoid detection (`randOffset`).
- Keep strategy logic inside `deployByStrategy` and avoid scattering strategy
  constants across the codebase.
- Use small delays after input actions to allow UI transitions.

### Configuration

- All user-tunable values should live in `config.js`.
- Avoid hard-coding thresholds in business logic.
- When adding config keys, include short inline comments for intent.

### Comments and documentation

- Comments should explain non-obvious intent, not restate code.
- Use TODOs only when there is a clear follow-up task.
- Keep docstrings short and in English to support tooling.

## Suggested workflow for changes

1. Update config/logic in `config.js` and `combat.js`.
2. Validate OCR region tweaks in `ocr_util.js` with on-device screenshots.
3. Run `main.js` in Auto.js and monitor the floating window for state updates.
4. Re-test on multiple screen sizes if coordinate math changes.

## Notes for agentic tools

- Do not introduce Node.js-only APIs or dependencies.
- Prefer incremental changes; avoid broad refactors in a small repo.
- Keep behavior deterministic except for intentional random offsets.
- No Cursor or Copilot instruction files were found in this repository.
