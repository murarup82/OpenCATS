---
name: opencats-contract-guard-check
description: OpenCATS contract and guard validator for contractVersion/contractKey/modernPage correctness, guarded params, submit/legacy URL presence, and backend-compatible payload assumptions across TS and PHP.
---

# Goal
Diagnose and correct contract/guard mismatches without introducing compatibility regressions.

# Use this skill when
- A page fails modern contract checks, smoke tests, or runtime contract assertions.
- You suspect mismatches between frontend contract expectations and backend response metadata.
- You need to verify guard parameter requirements for show/edit/detail routes.

# Do not use this skill when
- The request is purely visual with no contract/route implications.
- You are implementing a new feature that intentionally changes contract semantics (unless explicitly coordinated).

# Critical invariants or preserve list
- `meta.contractVersion === 1`
- exact `meta.contractKey`
- correct `modernPage` handling
- presence of `actions.submitURL` and `actions.legacyURL` where expected
- guard param requirements remain intact
- backend-compatible payload/hidden token expectations stay stable

# Workflow
1. Identify affected route/page/handler.
2. Inspect frontend contract types, guard utilities, and page assumptions.
3. Inspect backend response generator in module handler.
4. Compare actual vs expected metadata and action URLs.
5. Flag mismatches by severity (compatibility-critical vs warning).
6. Propose the smallest safe correction order.

# Output format
- **Compatibility findings:** pass/fail by focus area.
- **Exact mismatch list:** expected vs actual values.
- **Impacted files:** TS and PHP touchpoints.
- **Proposed fix order:** minimal-risk sequence.
- **Regression checks to run:** targeted smoke/quality checks.
