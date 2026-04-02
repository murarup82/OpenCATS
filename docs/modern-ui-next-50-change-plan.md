# Modern UI Next 50 Changes Plan

Generated: 2026-04-02T06:02:57.145Z

This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.

## Scope

Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.

## 50 Planned Changes

1. `joborders.purgefrompipeline` (`ModuleBridgePage`, `bridge`) -> Add explicit native route mapping and remove wildcard bridge resolution.
