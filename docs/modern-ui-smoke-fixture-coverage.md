# Modern UI Smoke Fixture Coverage Report

Generated: 2026-03-03T09:33:08.169Z

## Summary

- Endpoint checks discovered: 16
- Endpoint checks with replay fixtures: 16
- Endpoint checks without replay fixtures: 0
- Fixture entries: 18
- Orphan fixtures (missing source check): 0

## Module Coverage

| Module | Endpoint Checks | Covered By Fixtures | Coverage |
| --- | ---: | ---: | ---: |
| activity | 1 | 1 | 100% |
| calendar | 1 | 1 | 100% |
| candidates | 4 | 4 | 100% |
| companies | 2 | 2 | 100% |
| contacts | 2 | 2 | 100% |
| dashboard | 1 | 1 | 100% |
| joborders | 3 | 3 | 100% |
| lists | 1 | 1 | 100% |
| reports | 1 | 1 | 100% |

## Covered Endpoint Checks

| Endpoint Check | Fixture IDs |
| --- | --- |
| activity.listByViewDataGrid | activity.listByViewDataGrid.invalidModernPage |
| calendar.showCalendar | calendar.deleteEvent.safeInvalid |
| candidates.add | candidates.add.invalidModernPage |
| candidates.edit | candidates.edit.deleteAttachment.safeInvalid |
| candidates.listByView | candidates.listByView.invalidModernPage |
| candidates.show | candidates.addComment.safeInvalid, candidates.postMessage.safeInvalid |
| companies.listByView | companies.listByView.invalidModernPage |
| companies.show | companies.show.invalidModernPage |
| contacts.listByView | contacts.listByView.invalidModernPage |
| contacts.show | contacts.show.invalidModernPage |
| dashboard.my | dashboard.setPipelineStatus.safeInvalid |
| joborders.listByView | joborders.listByView.invalidModernPage |
| joborders.pipelineStatusDetails | joborders.pipelineStatusEditDate.safeInvalid |
| joborders.show | joborders.addComment.safeInvalid, joborders.postMessage.safeInvalid |
| lists.listByView | lists.listByView.invalidModernPage |
| reports.reports | reports.reports.invalidModernPage |

## Uncovered Endpoint Checks

- None.

## Orphan Fixtures

- None.
