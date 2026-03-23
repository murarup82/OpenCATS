# Modern UI Route Coverage Matrix

Generated: 2026-03-23T09:53:14.197Z

## Summary

- Total route mappings: **52**
- Native mappings: **51**
- Bridge mappings: **1**
- Native coverage (mapping-level): **98.1%**

## Module Summary

- `*`: native=0, bridge=1
- `activity`: native=3, bridge=0
- `calendar`: native=2, bridge=0
- `candidates`: native=5, bridge=0
- `companies`: native=6, bridge=0
- `contacts`: native=6, bridge=0
- `dashboard`: native=2, bridge=0
- `graphs`: native=1, bridge=0
- `home`: native=4, bridge=0
- `joborders`: native=6, bridge=0
- `kpis`: native=2, bridge=0
- `lists`: native=4, bridge=0
- `login`: native=1, bridge=0
- `logs`: native=3, bridge=0
- `queue`: native=1, bridge=0
- `reports`: native=4, bridge=0
- `sourcing`: native=1, bridge=0

## Route Detail

| Route | Component | Coverage | Guarded Params |
| --- | --- | --- | --- |
| `*.*` | `ModuleBridgePage` | bridge | - |
| `activity.(default)` | `ActivityListPage` | native | - |
| `activity.listbyviewdatagrid` | `ActivityListPage` | native | - |
| `activity.viewbydate` | `ActivityListPage` | native | - |
| `calendar.(default)` | `CalendarPage` | native | - |
| `calendar.showcalendar` | `CalendarPage` | native | - |
| `candidates.(default)` | `CandidatesListPage` | native | - |
| `candidates.add` | `CandidatesAddPage` | native | - |
| `candidates.edit` | `CandidatesEditPage` | native | candidateID |
| `candidates.listbyview` | `CandidatesListPage` | native | - |
| `candidates.show` | `CandidatesShowPage` | native | candidateID |
| `companies.(default)` | `CompaniesListPage` | native | - |
| `companies.add` | `CompaniesAddPage` | native | - |
| `companies.edit` | `CompaniesEditPage` | native | companyID |
| `companies.list` | `CompaniesListPage` | native | - |
| `companies.listbyview` | `CompaniesListPage` | native | - |
| `companies.show` | `CompaniesShowPage` | native | companyID |
| `contacts.(default)` | `ContactsListPage` | native | - |
| `contacts.add` | `ContactsAddPage` | native | - |
| `contacts.edit` | `ContactsEditPage` | native | contactID |
| `contacts.list` | `ContactsListPage` | native | - |
| `contacts.listbyview` | `ContactsListPage` | native | - |
| `contacts.show` | `ContactsShowPage` | native | contactID |
| `dashboard.(default)` | `DashboardMyPage` | native | - |
| `dashboard.my` | `DashboardMyPage` | native | - |
| `graphs.(default)` | `GraphsPage` | native | - |
| `home.(default)` | `HomePage` | native | - |
| `home.home` | `HomePage` | native | - |
| `home.inbox` | `HomeInboxPage` | native | - |
| `home.mynotes` | `HomeMyNotesPage` | native | - |
| `joborders.(default)` | `JobOrdersListPage` | native | - |
| `joborders.add` | `JobOrdersAddPage` | native | - |
| `joborders.edit` | `JobOrdersEditPage` | native | jobOrderID |
| `joborders.list` | `JobOrdersListPage` | native | - |
| `joborders.listbyview` | `JobOrdersListPage` | native | - |
| `joborders.show` | `JobOrdersShowPage` | native | jobOrderID |
| `kpis.(default)` | `KpisPage` | native | - |
| `kpis.details` | `KpisDetailsPage` | native | - |
| `lists.(default)` | `ListsManagePage` | native | - |
| `lists.listbyview` | `ListsManagePage` | native | - |
| `lists.show` | `ListsDetailPage` | native | savedListID |
| `lists.showlist` | `ListsDetailPage` | native | savedListID |
| `login.(default)` | `LoginPage` | native | - |
| `logs.(default)` | `LogsPage` | native | - |
| `logs.*` | `LogsPage` | native | - |
| `logs.view` | `LogsPage` | native | - |
| `queue.(default)` | `QueuePage` | native | - |
| `reports.(default)` | `ReportsLauncherPage` | native | - |
| `reports.customerdashboard` | `ReportsCustomerDashboardPage` | native | - |
| `reports.graphview` | `ReportsGraphViewPage` | native | - |
| `reports.reports` | `ReportsLauncherPage` | native | - |
| `sourcing.(default)` | `SourcingPage` | native | - |
