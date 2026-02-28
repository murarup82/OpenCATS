# Modern UI App (Scaffold)

This directory is the recommended home for the new React/Vue frontend source code.

## Integration contract

- Build output should be published to a same-origin static URL (example):
  - `public/modern-ui/app.bundle.js`
- The bundle should expose:
  - `window.OpenCATSModernApp.mount(rootElement, bootstrapPayload)`

`bootstrapPayload` includes:
- `targetModule`
- `targetAction`
- `indexName`
- `siteID`
- `userID`
- `fullName`
- `legacyURL`
- `modernURL`

## Example rollout flow

1. Build modern app from this folder.
2. Copy bundle to `public/modern-ui/app.bundle.js`.
3. Set `UI_SWITCH_MODERN_BUNDLE_URL='public/modern-ui/app.bundle.js'` in `config.ui.php`.
4. Enable route-level switch for selected modules/actions.

