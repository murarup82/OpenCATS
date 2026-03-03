# Modern UI Smoke Fixture Coverage Report

Generated: 2026-03-03T08:45:43.750Z

## Summary

- Endpoint checks discovered: 16
- Endpoint checks with replay fixtures: 5
- Endpoint checks without replay fixtures: 11
- Fixture entries: 7
- Orphan fixtures (missing source check): 0

## Module Coverage

| Module | Endpoint Checks | Covered By Fixtures | Coverage |
| --- | ---: | ---: | ---: |
| activity | 1 | 0 | 0% |
| calendar | 1 | 1 | 100% |
| candidates | 4 | 1 | 25% |
| companies | 2 | 0 | 0% |
| contacts | 2 | 0 | 0% |
| dashboard | 1 | 1 | 100% |
| joborders | 3 | 2 | 67% |
| lists | 1 | 0 | 0% |
| reports | 1 | 0 | 0% |

## Covered Endpoint Checks

| Endpoint Check | Fixture IDs |
| --- | --- |
| calendar.showCalendar | calendar.deleteEvent.safeInvalid |
| candidates.show | candidates.addComment.safeInvalid, candidates.postMessage.safeInvalid |
| dashboard.my | dashboard.setPipelineStatus.safeInvalid |
| joborders.pipelineStatusDetails | joborders.pipelineStatusEditDate.safeInvalid |
| joborders.show | joborders.addComment.safeInvalid, joborders.postMessage.safeInvalid |

## Uncovered Endpoint Checks

- activity.listByViewDataGrid
- candidates.add
- candidates.edit
- candidates.listByView
- companies.listByView
- companies.show
- contacts.listByView
- contacts.show
- joborders.listByView
- lists.listByView
- reports.reports

## Orphan Fixtures

- None.
