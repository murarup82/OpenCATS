# Smoke Fixture Maintenance Guide

This guide describes how to safely extend mutation replay fixtures used by `npm run smoke:endpoints`.

## Fixture File

- Path: `frontend/modern-ui/scripts/fixtures/mutation-safe-replays.json`
- Consumer: `frontend/modern-ui/scripts/smoke-modern-endpoints.mjs`

## Safety Rules

1. Prefer invalid or neutral IDs (`0`) to avoid mutating real entities.
2. Use action URLs/tokens extracted from source modern payloads (`sourceCheckID`) instead of hardcoding sensitive endpoints.
3. Validate response shape only (`success` boolean), not business success.
4. Keep probes idempotent and low-impact.

## Adding a Fixture

Required fields:

- `id`: unique fixture identifier.
- `sourceCheckID`: endpoint check that provides the payload containing action URL/token.
- `method`: usually `POST`.
- `endpointPath`: dot-path to action URL inside source payload.
- `body`: form fields to submit.
- `expectsBooleanField`: response field expected to be boolean (normally `success`).

Optional fields:

- `tokenPath`: dot-path to security token inside source payload.
- `tokenField`: form field name where token should be injected.

## Example

```json
{
  "id": "joborders.postMessage.safeInvalid",
  "sourceCheckID": "joborders.show",
  "method": "POST",
  "endpointPath": "actions.postMessageURL",
  "tokenPath": "messages.securityToken",
  "tokenField": "securityToken",
  "body": {
    "format": "modern-json",
    "jobOrderID": "0",
    "messageBody": "smoke replay probe"
  },
  "expectsBooleanField": "success"
}
```

## Validation After Changes

1. Run `npm run smoke:endpoints` locally (or in target env with `OPENCATS_BASE_URL`).
2. Confirm new fixture appears as `OK` or expected `SKIP`.
3. Update `docs/modern-ui-autopipeline.md` completed queue entry if this is part of migration slices.
