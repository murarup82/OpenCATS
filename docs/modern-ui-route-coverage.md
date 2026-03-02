# Modern UI Route Coverage Matrix

Generated: 2026-03-02T03:09:13.138Z

## Summary

- Total route mappings: **41**
- Native mappings: **30**
- Bridge mappings: **11**
- Native coverage (mapping-level): **73.2%**

## Module Summary

- `*`: native=0, bridge=1
- `activities`: native=0, bridge=1
- `activity`: native=3, bridge=1
- `calendar`: native=2, bridge=1
- `candidates`: native=5, bridge=1
- `companies`: native=4, bridge=1
- `contacts`: native=4, bridge=1
- `dashboard`: native=2, bridge=0
- `home`: native=0, bridge=1
- `joborders`: native=6, bridge=1
- `lists`: native=2, bridge=1
- `reports`: native=2, bridge=1

## Route Detail

| Route | Component | Coverage | Guarded Params |
| --- | --- | --- | --- |
| `*.*` | `ModuleBridgePage` | bridge | - |
| `activities.*` | `ModuleBridgePage` | bridge | - |
| `activity.(default)` | `ActivityListPage` | native | - |
| `activity.*` | `ModuleBridgePage` | bridge | - |
| `activity.listbyviewdatagrid` | `ActivityListPage` | native | - |
| `activity.viewbydate` | `ActivityListPage` | native | - |
| `calendar.(default)` | `CalendarPage` | native | - |
| `calendar.*` | `ModuleBridgePage` | bridge | - |
| `calendar.showcalendar` | `CalendarPage` | native | - |
| `candidates.(default)` | `CandidatesListPage` | native | - |
| `candidates.*` | `ModuleBridgePage` | bridge | - |
| `candidates.add` | `CandidatesAddPage` | native | - |
| `candidates.edit` | `CandidatesEditPage` | native | candidateID |
| `candidates.listbyview` | `CandidatesListPage` | native | - |
| `candidates.show` | `CandidatesShowPage` | native | candidateID |
| `companies.(default)` | `CompaniesListPage` | native | - |
| `companies.*` | `ModuleBridgePage` | bridge | - |
| `companies.list` | `CompaniesListPage` | native | - |
| `companies.listbyview` | `CompaniesListPage` | native | - |
| `companies.show` | `CompaniesShowPage` | native | companyID |
| `contacts.(default)` | `ContactsListPage` | native | - |
| `contacts.*` | `ModuleBridgePage` | bridge | - |
| `contacts.list` | `ContactsListPage` | native | - |
| `contacts.listbyview` | `ContactsListPage` | native | - |
| `contacts.show` | `ContactsShowPage` | native | contactID |
| `dashboard.(default)` | `DashboardMyPage` | native | - |
| `dashboard.my` | `DashboardMyPage` | native | - |
| `home.*` | `ModuleBridgePage` | bridge | - |
| `joborders.(default)` | `JobOrdersListPage` | native | - |
| `joborders.*` | `ModuleBridgePage` | bridge | - |
| `joborders.add` | `JobOrdersFormBridgePage` | native | - |
| `joborders.edit` | `JobOrdersFormBridgePage` | native | jobOrderID |
| `joborders.list` | `JobOrdersListPage` | native | - |
| `joborders.listbyview` | `JobOrdersListPage` | native | - |
| `joborders.show` | `JobOrdersShowPage` | native | jobOrderID |
| `lists.(default)` | `ListsManagePage` | native | - |
| `lists.*` | `ModuleBridgePage` | bridge | - |
| `lists.listbyview` | `ListsManagePage` | native | - |
| `reports.(default)` | `ReportsLauncherPage` | native | - |
| `reports.*` | `ModuleBridgePage` | bridge | - |
| `reports.reports` | `ReportsLauncherPage` | native | - |
