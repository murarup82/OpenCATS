# Modern UI Smoke Fixture Coverage Report

Generated: 2026-03-03T05:09:41.841Z

## Summary

- Endpoint checks discovered: 16
- Endpoint checks with replay fixtures: 3
- Endpoint checks without replay fixtures: 13
- Fixture entries: 5
- Orphan fixtures (missing source check): 0

## Module Coverage

| Module | Endpoint Checks | Covered By Fixtures | Coverage |
| --- | ---: | ---: | ---: |
| activity | 1 | 0 | 0% |
| calendar | 1 | 0 | 0% |
| candidates | 4 | 1 | 25% |
| companies | 2 | 0 | 0% |
| contacts | 2 | 0 | 0% |
| dashboard | 1 | 1 | 100% |
| joborders | 3 | 1 | 33% |
| lists | 1 | 0 | 0% |
| reports | 1 | 0 | 0% |

## Covered Endpoint Checks

| Endpoint Check | Fixture IDs |
| --- | --- |
| candidates.show | candidates.addComment.safeInvalid, candidates.postMessage.safeInvalid |
| dashboard.my | dashboard.setPipelineStatus.safeInvalid |
| joborders.show | joborders.addComment.safeInvalid, joborders.postMessage.safeInvalid |

## Uncovered Endpoint Checks

- activity.listByViewDataGrid
- calendar.showCalendar
- candidates.add
- candidates.edit
- candidates.listByView
- companies.listByView
- companies.show
- contacts.listByView
- contacts.show
- joborders.listByView
- joborders.pipelineStatusDetails
- lists.listByView
- reports.reports

## Orphan Fixtures

- None.
