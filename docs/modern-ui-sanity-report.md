# Modern UI Sanity Report

Started: 2026-03-02T03:34:39.077Z
Finished: 2026-03-02T03:34:47.506Z
Overall Required Status: **Pass**

## Summary

| Check | Status | Required | Exit Code |
| --- | --- | --- | --- |
| Frontend Build | Pass | Yes | 0 |
| Coverage Matrix | Pass | Yes | 0 |
| Route Smoke | Pass | No | 0 |
| Endpoint Smoke | Pass | No | 0 |

## Details

### Frontend Build (Pass)

Command: `npm run build`

**stdout**
```text
> opencats-modern-ui@0.1.0 build
> npm run clean:build && vite build --mode production


> opencats-modern-ui@0.1.0 clean:build
> node ./scripts/clean-build-output.mjs

[modern-ui] Cleaned build output directory: D:\Work\opencats\OpenCATS\public\modern-ui\build
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 90 modules transformed.
rendering chunks...
[2m../../public/modern-ui/build/[22m[32m.vite/manifest.json  [39m[1m[2m  0.20 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[35mstyle.css            [39m[1m[2m108.02 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[36mapp.bundle.js        [39m[1m[33m770.07 kB[39m[22m[2m │ map: 2,988.17 kB[22m
[32m✓ built in 4.86s[39m
```

**stderr**
`(no output)`

### Coverage Matrix (Pass)

Command: `npm run coverage:matrix`

**stdout**
```text
> opencats-modern-ui@0.1.0 coverage:matrix
> node ./scripts/generate-coverage-matrix.mjs

[modern-ui] Wrote route coverage matrix: D:\Work\opencats\OpenCATS\docs\modern-ui-route-coverage.md
```

**stderr**
`(no output)`

### Route Smoke (Pass)

Command: `npm run smoke:routes`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:routes
> node ./scripts/smoke-modern-routes.mjs

[modern-ui smoke] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP smoke checks.
```

**stderr**
`(no output)`

### Endpoint Smoke (Pass)

Command: `npm run smoke:endpoints`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:endpoints
> node ./scripts/smoke-modern-endpoints.mjs

[modern-ui endpoints] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP endpoint checks.
```

**stderr**
`(no output)`
