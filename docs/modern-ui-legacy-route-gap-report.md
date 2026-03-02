# Modern UI Legacy Comparison Report

Generated: 2026-03-02T03:57:04.527Z

## Summary

- Legacy handleRequest actions discovered: 223
- Native explicit modern coverage: 18
- Native default fallback coverage: 1
- Bridge fallback coverage: 204
- Legacy unresolved: 0

## Module Coverage

| Module | Legacy Actions | Native Explicit | Native Default Fallback | Bridge | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| activity | 2 | 2 | 0 | 0 | 0 |
| attachments | 1 | 0 | 0 | 1 | 0 |
| calendar | 5 | 1 | 0 | 4 | 0 |
| candidates | 28 | 4 | 0 | 24 | 0 |
| companies | 9 | 2 | 0 | 7 | 0 |
| contacts | 9 | 2 | 0 | 7 | 0 |
| dashboard | 2 | 1 | 1 | 0 | 0 |
| export | 2 | 0 | 0 | 2 | 0 |
| gdpr | 2 | 0 | 0 | 2 | 0 |
| graphs | 5 | 0 | 0 | 5 | 0 |
| home | 23 | 0 | 0 | 23 | 0 |
| import | 15 | 0 | 0 | 15 | 0 |
| joborders | 24 | 4 | 0 | 20 | 0 |
| kpis | 1 | 0 | 0 | 1 | 0 |
| lists | 8 | 1 | 0 | 7 | 0 |
| login | 7 | 0 | 0 | 7 | 0 |
| reports | 11 | 1 | 0 | 10 | 0 |
| rss | 1 | 0 | 0 | 1 | 0 |
| settings | 58 | 0 | 0 | 58 | 0 |
| toolbar | 8 | 0 | 0 | 8 | 0 |
| wizard | 1 | 0 | 0 | 1 | 0 |
| xml | 1 | 0 | 0 | 1 | 0 |

## In-Scope Missing or Fallback Actions

These are legacy actions for modernized modules that are not mapped as explicit native routes.

### calendar

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |
| deleteEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |
| dynamicData | bridge-module-fallback | calendar.* | ModuleBridgePage |
| editEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |

### candidates

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addActivityChangeStatus | bridge-module-fallback | candidates.* | ModuleBridgePage |
| addCandidateTags | bridge-module-fallback | candidates.* | ModuleBridgePage |
| addDuplicates | bridge-module-fallback | candidates.* | ModuleBridgePage |
| addEditImage | bridge-module-fallback | candidates.* | ModuleBridgePage |
| addProfileComment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| addToPipeline | bridge-module-fallback | candidates.* | ModuleBridgePage |
| administrativeHideShow | bridge-module-fallback | candidates.* | ModuleBridgePage |
| considerForJobSearch | bridge-module-fallback | candidates.* | ModuleBridgePage |
| createAttachment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| delete | bridge-module-fallback | candidates.* | ModuleBridgePage |
| deleteAttachment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| deleteMessageThread | bridge-module-fallback | candidates.* | ModuleBridgePage |
| emailCandidates | bridge-module-fallback | candidates.* | ModuleBridgePage |
| linkDuplicate | bridge-module-fallback | candidates.* | ModuleBridgePage |
| merge | bridge-module-fallback | candidates.* | ModuleBridgePage |
| mergeInfo | bridge-module-fallback | candidates.* | ModuleBridgePage |
| postMessage | bridge-module-fallback | candidates.* | ModuleBridgePage |
| removeDuplicity | bridge-module-fallback | candidates.* | ModuleBridgePage |
| removeFromPipeline | bridge-module-fallback | candidates.* | ModuleBridgePage |
| savedLists | bridge-module-fallback | candidates.* | ModuleBridgePage |
| saveSources | bridge-module-fallback | candidates.* | ModuleBridgePage |
| search | bridge-module-fallback | candidates.* | ModuleBridgePage |
| show_questionnaire | bridge-module-fallback | candidates.* | ModuleBridgePage |
| viewResume | bridge-module-fallback | candidates.* | ModuleBridgePage |

### companies

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| add | bridge-module-fallback | companies.* | ModuleBridgePage |
| createAttachment | bridge-module-fallback | companies.* | ModuleBridgePage |
| delete | bridge-module-fallback | companies.* | ModuleBridgePage |
| deleteAttachment | bridge-module-fallback | companies.* | ModuleBridgePage |
| edit | bridge-module-fallback | companies.* | ModuleBridgePage |
| internalPostings | bridge-module-fallback | companies.* | ModuleBridgePage |
| search | bridge-module-fallback | companies.* | ModuleBridgePage |

### contacts

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| add | bridge-module-fallback | contacts.* | ModuleBridgePage |
| addActivityScheduleEvent | bridge-module-fallback | contacts.* | ModuleBridgePage |
| delete | bridge-module-fallback | contacts.* | ModuleBridgePage |
| downloadVCard | bridge-module-fallback | contacts.* | ModuleBridgePage |
| edit | bridge-module-fallback | contacts.* | ModuleBridgePage |
| search | bridge-module-fallback | contacts.* | ModuleBridgePage |
| showColdCallList | bridge-module-fallback | contacts.* | ModuleBridgePage |

### dashboard

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| setPipelineStatus | native-default-fallback | dashboard.(default) | DashboardMyPage |

### joborders

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addActivityChangeStatus | bridge-module-fallback | joborders.* | ModuleBridgePage |
| addCandidateModal | bridge-module-fallback | joborders.* | ModuleBridgePage |
| addJobOrderPopup | bridge-module-fallback | joborders.* | ModuleBridgePage |
| addProfileComment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| addToPipeline | bridge-module-fallback | joborders.* | ModuleBridgePage |
| administrativeHideShow | bridge-module-fallback | joborders.* | ModuleBridgePage |
| considerCandidateSearch | bridge-module-fallback | joborders.* | ModuleBridgePage |
| createAttachment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| delete | bridge-module-fallback | joborders.* | ModuleBridgePage |
| deleteAttachment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| deleteMessageThread | bridge-module-fallback | joborders.* | ModuleBridgePage |
| editHiringPlan | bridge-module-fallback | joborders.* | ModuleBridgePage |
| pipelineStatusDetails | bridge-module-fallback | joborders.* | ModuleBridgePage |
| pipelineStatusEditDate | bridge-module-fallback | joborders.* | ModuleBridgePage |
| postMessage | bridge-module-fallback | joborders.* | ModuleBridgePage |
| recruiterAllocation | bridge-module-fallback | joborders.* | ModuleBridgePage |
| removeFromPipeline | bridge-module-fallback | joborders.* | ModuleBridgePage |
| search | bridge-module-fallback | joborders.* | ModuleBridgePage |
| setCandidateJobOrder | bridge-module-fallback | joborders.* | ModuleBridgePage |
| setMonitoredJobOrder | bridge-module-fallback | joborders.* | ModuleBridgePage |

### lists

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addToListFromDatagridModal | bridge-module-fallback | lists.* | ModuleBridgePage |
| deleteStaticList | bridge-module-fallback | lists.* | ModuleBridgePage |
| quickActionAddToListModal | bridge-module-fallback | lists.* | ModuleBridgePage |
| removeFromListDatagrid | bridge-module-fallback | lists.* | ModuleBridgePage |
| saveListAccess | bridge-module-fallback | lists.* | ModuleBridgePage |
| show | bridge-module-fallback | lists.* | ModuleBridgePage |
| showList | bridge-module-fallback | lists.* | ModuleBridgePage |

### reports

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| customerDashboard | bridge-module-fallback | reports.* | ModuleBridgePage |
| customerDashboardDetails | bridge-module-fallback | reports.* | ModuleBridgePage |
| customizeEEOReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| customizeJobOrderReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| generateEEOReportPreview | bridge-module-fallback | reports.* | ModuleBridgePage |
| generateJobOrderReportPDF | bridge-module-fallback | reports.* | ModuleBridgePage |
| graphView | bridge-module-fallback | reports.* | ModuleBridgePage |
| showHireReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| showPlacementReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| showSubmissionReport | bridge-module-fallback | reports.* | ModuleBridgePage |

## Full Action Matrix

| Module | Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- | --- |
| activity | listByViewDataGrid | native-explicit | activity.listbyviewdatagrid | ActivityListPage |
| activity | viewByDate | native-explicit | activity.viewbydate | ActivityListPage |
| attachments | getAttachment | bridge-global-fallback | *.* | ModuleBridgePage |
| calendar | addEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |
| calendar | deleteEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |
| calendar | dynamicData | bridge-module-fallback | calendar.* | ModuleBridgePage |
| calendar | editEvent | bridge-module-fallback | calendar.* | ModuleBridgePage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | addCandidateTags | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | addDuplicates | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | addEditImage | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | addProfileComment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | addToPipeline | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | administrativeHideShow | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | considerForJobSearch | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | createAttachment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | delete | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | deleteAttachment | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | deleteMessageThread | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | linkDuplicate | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | mergeInfo | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | postMessage | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | removeDuplicity | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | removeFromPipeline | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | savedLists | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | saveSources | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | search | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | show | native-explicit-guarded | candidates.show | CandidatesShowPage |
| candidates | show_questionnaire | bridge-module-fallback | candidates.* | ModuleBridgePage |
| candidates | viewResume | bridge-module-fallback | candidates.* | ModuleBridgePage |
| companies | add | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | createAttachment | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | delete | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | deleteAttachment | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | edit | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | internalPostings | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | listByView | native-explicit | companies.listbyview | CompaniesListPage |
| companies | search | bridge-module-fallback | companies.* | ModuleBridgePage |
| companies | show | native-explicit-guarded | companies.show | CompaniesShowPage |
| contacts | add | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | addActivityScheduleEvent | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | delete | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | downloadVCard | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | edit | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | listByView | native-explicit | contacts.listbyview | ContactsListPage |
| contacts | search | bridge-module-fallback | contacts.* | ModuleBridgePage |
| contacts | show | native-explicit-guarded | contacts.show | ContactsShowPage |
| contacts | showColdCallList | bridge-module-fallback | contacts.* | ModuleBridgePage |
| dashboard | my | native-explicit | dashboard.my | DashboardMyPage |
| dashboard | setPipelineStatus | native-default-fallback | dashboard.(default) | DashboardMyPage |
| export | export | bridge-global-fallback | *.* | ModuleBridgePage |
| export | exportByDataGrid | bridge-global-fallback | *.* | ModuleBridgePage |
| gdpr | export | bridge-global-fallback | *.* | ModuleBridgePage |
| gdpr | requests | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | generic | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | genericPie | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | jobOrderReportGraph | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | testGraph | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | wordVerify | bridge-global-fallback | *.* | ModuleBridgePage |
| home | addPersonalItem | bridge-module-fallback | home.* | ModuleBridgePage |
| home | addSavedSearch | bridge-module-fallback | home.* | ModuleBridgePage |
| home | appendPersonalNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | archiveInboxThread | bridge-module-fallback | home.* | ModuleBridgePage |
| home | createInboxNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | createInboxTodo | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deleteInboxThread | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deletePersonalItem | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deleteSavedSearch | bridge-module-fallback | home.* | ModuleBridgePage |
| home | getAttachment | bridge-module-fallback | home.* | ModuleBridgePage |
| home | home | bridge-module-fallback | home.* | ModuleBridgePage |
| home | inbox | bridge-module-fallback | home.* | ModuleBridgePage |
| home | movePersonalNoteToTodo | bridge-module-fallback | home.* | ModuleBridgePage |
| home | myNotes | bridge-module-fallback | home.* | ModuleBridgePage |
| home | postInboxMessage | bridge-module-fallback | home.* | ModuleBridgePage |
| home | quickSearch | bridge-module-fallback | home.* | ModuleBridgePage |
| home | sendPersonalNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | setPersonalNoteArchived | bridge-module-fallback | home.* | ModuleBridgePage |
| home | setPersonalTodoStatus | bridge-module-fallback | home.* | ModuleBridgePage |
| home | submitFeedback | bridge-module-fallback | home.* | ModuleBridgePage |
| home | togglePersonalTodo | bridge-module-fallback | home.* | ModuleBridgePage |
| home | updatePersonalNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | updatePersonalTodo | bridge-module-fallback | home.* | ModuleBridgePage |
| import | commit | bridge-global-fallback | *.* | ModuleBridgePage |
| import | deleteBulkResumes | bridge-global-fallback | *.* | ModuleBridgePage |
| import | import | bridge-global-fallback | *.* | ModuleBridgePage |
| import | importBulkResumes | bridge-global-fallback | *.* | ModuleBridgePage |
| import | importSelectType | bridge-global-fallback | *.* | ModuleBridgePage |
| import | importUploadFile | bridge-global-fallback | *.* | ModuleBridgePage |
| import | importUploadResume | bridge-global-fallback | *.* | ModuleBridgePage |
| import | massImport | bridge-global-fallback | *.* | ModuleBridgePage |
| import | massImportDocument | bridge-global-fallback | *.* | ModuleBridgePage |
| import | massImportEdit | bridge-global-fallback | *.* | ModuleBridgePage |
| import | revert | bridge-global-fallback | *.* | ModuleBridgePage |
| import | showMassImport | bridge-global-fallback | *.* | ModuleBridgePage |
| import | viewerrors | bridge-global-fallback | *.* | ModuleBridgePage |
| import | viewpending | bridge-global-fallback | *.* | ModuleBridgePage |
| import | whatIsBulkResumes | bridge-global-fallback | *.* | ModuleBridgePage |
| joborders | add | native-explicit | joborders.add | JobOrdersFormBridgePage |
| joborders | addActivityChangeStatus | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | addCandidateModal | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | addJobOrderPopup | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | addProfileComment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | addToPipeline | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | administrativeHideShow | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | considerCandidateSearch | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | createAttachment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | delete | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | deleteAttachment | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | deleteMessageThread | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | edit | native-explicit-guarded | joborders.edit | JobOrdersFormBridgePage |
| joborders | editHiringPlan | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineStatusDetails | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | pipelineStatusEditDate | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | postMessage | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | recruiterAllocation | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | removeFromPipeline | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | search | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | setCandidateJobOrder | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | setMonitoredJobOrder | bridge-module-fallback | joborders.* | ModuleBridgePage |
| joborders | show | native-explicit-guarded | joborders.show | JobOrdersShowPage |
| kpis | details | bridge-global-fallback | *.* | ModuleBridgePage |
| lists | addToListFromDatagridModal | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | deleteStaticList | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | listByView | native-explicit | lists.listbyview | ListsManagePage |
| lists | quickActionAddToListModal | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | removeFromListDatagrid | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | saveListAccess | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | show | bridge-module-fallback | lists.* | ModuleBridgePage |
| lists | showList | bridge-module-fallback | lists.* | ModuleBridgePage |
| login | attemptLogin | bridge-global-fallback | *.* | ModuleBridgePage |
| login | forgotPassword | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleCallback | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleStart | bridge-global-fallback | *.* | ModuleBridgePage |
| login | noCookiesModal | bridge-global-fallback | *.* | ModuleBridgePage |
| login | requestAccess | bridge-global-fallback | *.* | ModuleBridgePage |
| login | showLoginForm | bridge-global-fallback | *.* | ModuleBridgePage |
| reports | customerDashboard | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | customerDashboardDetails | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | customizeEEOReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | customizeJobOrderReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | generateEEOReportPreview | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | generateJobOrderReportPDF | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | graphView | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | showPlacementReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| reports | showSubmissionReport | bridge-module-fallback | reports.* | ModuleBridgePage |
| rss | jobOrders | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | addEmailTemplate | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | addUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | administration | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_tags_add | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_tags_del | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_tags_upd | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardAddUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardCheckKey | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardDeleteUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardEmail | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardFirstTimeSetup | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardImport | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardLicense | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardLocalization | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardPassword | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardSiteName | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | ajax_wizardWebsite | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | aspLocalization | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | careerPortalQuestionnaire | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | careerPortalQuestionnairePreview | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | careerPortalQuestionnaireUpdate | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | careerPortalSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | careerPortalTemplateEdit | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | changePassword | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | createBackup | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | customizeCalendar | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | customizeExtraFields | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | deleteBackup | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | deleteEmailTemplate | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | deleteUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | editUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | eeo | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | emailSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | emailTemplates | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | feedbackSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | forceEmail | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | gdprSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | getFirefoxModal | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | googleOIDCSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | loginActivity | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | manageUsers | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | myProfile | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | newInstallFinished | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | newInstallPassword | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | newSiteName | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | onCareerPortalTweak | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | previewPage | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | previewPageTop | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | professional | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | rejectionReasons | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | reports | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | rolePagePermissions | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | schemaMigrations | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | showUser | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | tags | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | talentFitFlowSettings | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | upgradeSiteName | bridge-global-fallback | *.* | ModuleBridgePage |
| settings | viewItemHistory | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | attemptLogin | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | authenticate | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | checkEmailIsInSystem | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | getJavaScriptLib | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | getLicenseKey | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | getRemoteVersion | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | install | bridge-global-fallback | *.* | ModuleBridgePage |
| toolbar | storeMonsterResumeText | bridge-global-fallback | *.* | ModuleBridgePage |
| wizard | ajax_getPage | bridge-global-fallback | *.* | ModuleBridgePage |
| xml | jobOrders | bridge-global-fallback | *.* | ModuleBridgePage |
