# Modern UI Legacy Comparison Report

Generated: 2026-03-03T05:18:20.122Z

## Summary

- Legacy handleRequest actions discovered: 222
- Native explicit modern coverage: 102
- Native default fallback coverage: 0
- Bridge coverage (explicit + fallback): 120
- Bridge explicit route mapping: 0
- Bridge wildcard fallback mapping: 120
- Legacy unresolved: 0

## Module Coverage

| Module | Legacy Actions | Native Explicit | Native Default Fallback | Bridge | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| activity | 2 | 2 | 0 | 0 | 0 |
| attachments | 1 | 0 | 0 | 1 | 0 |
| calendar | 5 | 5 | 0 | 0 | 0 |
| candidates | 27 | 27 | 0 | 0 | 0 |
| companies | 9 | 9 | 0 | 0 | 0 |
| contacts | 9 | 9 | 0 | 0 | 0 |
| dashboard | 2 | 2 | 0 | 0 | 0 |
| export | 2 | 0 | 0 | 2 | 0 |
| gdpr | 2 | 0 | 0 | 2 | 0 |
| graphs | 5 | 0 | 0 | 5 | 0 |
| home | 22 | 3 | 0 | 19 | 0 |
| import | 15 | 0 | 0 | 15 | 0 |
| joborders | 24 | 24 | 0 | 0 | 0 |
| kpis | 1 | 1 | 0 | 0 | 0 |
| lists | 8 | 8 | 0 | 0 | 0 |
| login | 7 | 0 | 0 | 7 | 0 |
| logs | 1 | 1 | 0 | 0 | 0 |
| reports | 11 | 11 | 0 | 0 | 0 |
| rss | 1 | 0 | 0 | 1 | 0 |
| settings | 58 | 0 | 0 | 58 | 0 |
| toolbar | 8 | 0 | 0 | 8 | 0 |
| wizard | 1 | 0 | 0 | 1 | 0 |
| xml | 1 | 0 | 0 | 1 | 0 |

## In-Scope Missing or Fallback Actions

These are legacy actions for modernized modules that are not mapped as explicit native routes.

- None.
## Full Action Matrix

| Module | Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- | --- |
| activity | listByViewDataGrid | native-explicit | activity.listbyviewdatagrid | ActivityListPage |
| activity | viewByDate | native-explicit | activity.viewbydate | ActivityListPage |
| attachments | getAttachment | bridge-global-fallback | *.* | ModuleBridgePage |
| calendar | addEvent | native-explicit | calendar.addevent | CalendarPage |
| calendar | deleteEvent | native-explicit | calendar.deleteevent | ActionCompatPage |
| calendar | dynamicData | native-explicit | calendar.dynamicdata | ActionCompatPage |
| calendar | editEvent | native-explicit | calendar.editevent | CalendarPage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | native-explicit | candidates.addactivitychangestatus | ActionCompatPage |
| candidates | addCandidateTags | native-explicit | candidates.addcandidatetags | ActionCompatPage |
| candidates | addDuplicates | native-explicit | candidates.addduplicates | ActionCompatPage |
| candidates | addEditImage | native-explicit | candidates.addeditimage | ActionCompatPage |
| candidates | addProfileComment | native-explicit | candidates.addprofilecomment | ActionCompatPage |
| candidates | addToPipeline | native-explicit | candidates.addtopipeline | ActionCompatPage |
| candidates | administrativeHideShow | native-explicit | candidates.administrativehideshow | ActionCompatPage |
| candidates | considerForJobSearch | native-explicit | candidates.considerforjobsearch | CandidateAssignActionPage |
| candidates | createAttachment | native-explicit-guarded | candidates.createattachment | CandidatesShowPage |
| candidates | delete | native-explicit | candidates.delete | ActionCompatPage |
| candidates | deleteAttachment | native-explicit | candidates.deleteattachment | ActionCompatPage |
| candidates | deleteMessageThread | native-explicit | candidates.deletemessagethread | ActionCompatPage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | native-explicit | candidates.emailcandidates | ActionCompatPage |
| candidates | linkDuplicate | native-explicit | candidates.linkduplicate | ActionCompatPage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | native-explicit | candidates.merge | ActionCompatPage |
| candidates | mergeInfo | native-explicit | candidates.mergeinfo | ActionCompatPage |
| candidates | postMessage | native-explicit | candidates.postmessage | ActionCompatPage |
| candidates | removeDuplicity | native-explicit | candidates.removeduplicity | ActionCompatPage |
| candidates | removeFromPipeline | native-explicit | candidates.removefrompipeline | ActionCompatPage |
| candidates | saveSources | native-explicit | candidates.savesources | ActionCompatPage |
| candidates | search | native-explicit | candidates.search | CandidatesListPage |
| candidates | show | native-explicit-guarded | candidates.show | CandidatesShowPage |
| candidates | show_questionnaire | native-explicit | candidates.show_questionnaire | ActionCompatPage |
| candidates | viewResume | native-explicit | candidates.viewresume | ActionCompatPage |
| companies | add | native-explicit | companies.add | CompaniesAddPage |
| companies | createAttachment | native-explicit-guarded | companies.createattachment | CompaniesShowPage |
| companies | delete | native-explicit | companies.delete | ActionCompatPage |
| companies | deleteAttachment | native-explicit | companies.deleteattachment | ActionCompatPage |
| companies | edit | native-explicit-guarded | companies.edit | CompaniesEditPage |
| companies | internalPostings | native-explicit | companies.internalpostings | ActionCompatPage |
| companies | listByView | native-explicit | companies.listbyview | CompaniesListPage |
| companies | search | native-explicit | companies.search | CompaniesListPage |
| companies | show | native-explicit-guarded | companies.show | CompaniesShowPage |
| contacts | add | native-explicit | contacts.add | ContactsAddPage |
| contacts | addActivityScheduleEvent | native-explicit | contacts.addactivityscheduleevent | ActionCompatPage |
| contacts | delete | native-explicit | contacts.delete | ActionCompatPage |
| contacts | downloadVCard | native-explicit | contacts.downloadvcard | ActionCompatPage |
| contacts | edit | native-explicit-guarded | contacts.edit | ContactsEditPage |
| contacts | listByView | native-explicit | contacts.listbyview | ContactsListPage |
| contacts | search | native-explicit | contacts.search | ContactsListPage |
| contacts | show | native-explicit-guarded | contacts.show | ContactsShowPage |
| contacts | showColdCallList | native-explicit | contacts.showcoldcalllist | ActionCompatPage |
| dashboard | my | native-explicit | dashboard.my | DashboardMyPage |
| dashboard | setPipelineStatus | native-explicit | dashboard.setpipelinestatus | DashboardMyPage |
| export | export | bridge-global-fallback | *.* | ModuleBridgePage |
| export | exportByDataGrid | bridge-global-fallback | *.* | ModuleBridgePage |
| gdpr | export | bridge-global-fallback | *.* | ModuleBridgePage |
| gdpr | requests | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | generic | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | genericPie | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | jobOrderReportGraph | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | testGraph | bridge-global-fallback | *.* | ModuleBridgePage |
| graphs | wordVerify | bridge-global-fallback | *.* | ModuleBridgePage |
| home | addPersonalItem | bridge-global-fallback | *.* | ModuleBridgePage |
| home | addSavedSearch | bridge-global-fallback | *.* | ModuleBridgePage |
| home | appendPersonalNote | bridge-global-fallback | *.* | ModuleBridgePage |
| home | archiveInboxThread | bridge-global-fallback | *.* | ModuleBridgePage |
| home | createInboxNote | bridge-global-fallback | *.* | ModuleBridgePage |
| home | createInboxTodo | bridge-global-fallback | *.* | ModuleBridgePage |
| home | deleteInboxThread | bridge-global-fallback | *.* | ModuleBridgePage |
| home | deletePersonalItem | bridge-global-fallback | *.* | ModuleBridgePage |
| home | deleteSavedSearch | bridge-global-fallback | *.* | ModuleBridgePage |
| home | home | native-explicit | home.home | HomePage |
| home | inbox | native-explicit | home.inbox | HomeInboxPage |
| home | movePersonalNoteToTodo | bridge-global-fallback | *.* | ModuleBridgePage |
| home | myNotes | native-explicit | home.mynotes | HomeMyNotesPage |
| home | postInboxMessage | bridge-global-fallback | *.* | ModuleBridgePage |
| home | quickSearch | bridge-global-fallback | *.* | ModuleBridgePage |
| home | sendPersonalNote | bridge-global-fallback | *.* | ModuleBridgePage |
| home | setPersonalNoteArchived | bridge-global-fallback | *.* | ModuleBridgePage |
| home | setPersonalTodoStatus | bridge-global-fallback | *.* | ModuleBridgePage |
| home | submitFeedback | bridge-global-fallback | *.* | ModuleBridgePage |
| home | togglePersonalTodo | bridge-global-fallback | *.* | ModuleBridgePage |
| home | updatePersonalNote | bridge-global-fallback | *.* | ModuleBridgePage |
| home | updatePersonalTodo | bridge-global-fallback | *.* | ModuleBridgePage |
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
| joborders | add | native-explicit | joborders.add | JobOrdersAddPage |
| joborders | addActivityChangeStatus | native-explicit | joborders.addactivitychangestatus | ActionCompatPage |
| joborders | addCandidateModal | native-explicit-guarded | joborders.addcandidatemodal | CandidatesAddPage |
| joborders | addJobOrderPopup | native-explicit | joborders.addjoborderpopup | ActionCompatPage |
| joborders | addProfileComment | native-explicit | joborders.addprofilecomment | ActionCompatPage |
| joborders | addToPipeline | native-explicit | joborders.addtopipeline | ActionCompatPage |
| joborders | administrativeHideShow | native-explicit | joborders.administrativehideshow | ActionCompatPage |
| joborders | companyContext | native-explicit-guarded | joborders.companycontext | JobOrderCompanyContextActionPage |
| joborders | considerCandidateSearch | native-explicit | joborders.considercandidatesearch | JobOrderAssignActionPage |
| joborders | createAttachment | native-explicit-guarded | joborders.createattachment | JobOrdersShowPage |
| joborders | delete | native-explicit | joborders.delete | ActionCompatPage |
| joborders | deleteAttachment | native-explicit | joborders.deleteattachment | ActionCompatPage |
| joborders | deleteMessageThread | native-explicit | joborders.deletemessagethread | ActionCompatPage |
| joborders | edit | native-explicit-guarded | joborders.edit | JobOrdersEditPage |
| joborders | editHiringPlan | native-explicit | joborders.edithiringplan | ActionCompatPage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineStatusDetails | native-explicit-guarded | joborders.pipelinestatusdetails | PipelineStatusActionPage |
| joborders | pipelineStatusEditDate | native-explicit-guarded | joborders.pipelinestatuseditdate | PipelineStatusActionPage |
| joborders | postMessage | native-explicit | joborders.postmessage | ActionCompatPage |
| joborders | recruiterAllocation | native-explicit | joborders.recruiterallocation | ActionCompatPage |
| joborders | removeFromPipeline | native-explicit | joborders.removefrompipeline | ActionCompatPage |
| joborders | search | native-explicit | joborders.search | JobOrdersListPage |
| joborders | setMonitoredJobOrder | native-explicit | joborders.setmonitoredjoborder | ActionCompatPage |
| joborders | show | native-explicit-guarded | joborders.show | JobOrdersShowPage |
| kpis | details | native-explicit | kpis.details | KpisDetailsPage |
| lists | addToListFromDatagridModal | native-explicit | lists.addtolistfromdatagridmodal | ListsActionPage |
| lists | deleteStaticList | native-explicit | lists.deletestaticlist | ActionCompatPage |
| lists | listByView | native-explicit | lists.listbyview | ListsManagePage |
| lists | quickActionAddToListModal | native-explicit | lists.quickactionaddtolistmodal | ListsActionPage |
| lists | removeFromListDatagrid | native-explicit | lists.removefromlistdatagrid | ActionCompatPage |
| lists | saveListAccess | native-explicit | lists.savelistaccess | ActionCompatPage |
| lists | show | native-explicit-guarded | lists.show | ListsDetailPage |
| lists | showList | native-explicit-guarded | lists.showlist | ListsDetailPage |
| login | attemptLogin | bridge-global-fallback | *.* | ModuleBridgePage |
| login | forgotPassword | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleCallback | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleStart | bridge-global-fallback | *.* | ModuleBridgePage |
| login | noCookiesModal | bridge-global-fallback | *.* | ModuleBridgePage |
| login | requestAccess | bridge-global-fallback | *.* | ModuleBridgePage |
| login | showLoginForm | bridge-global-fallback | *.* | ModuleBridgePage |
| logs | view | native-explicit | logs.view | LogsPage |
| reports | customerDashboard | native-explicit | reports.customerdashboard | ReportsCustomerDashboardPage |
| reports | customerDashboardDetails | native-explicit | reports.customerdashboarddetails | ActionCompatPage |
| reports | customizeEEOReport | native-explicit | reports.customizeeeoreport | ActionCompatPage |
| reports | customizeJobOrderReport | native-explicit | reports.customizejoborderreport | ActionCompatPage |
| reports | generateEEOReportPreview | native-explicit | reports.generateeeoreportpreview | ActionCompatPage |
| reports | generateJobOrderReportPDF | native-explicit | reports.generatejoborderreportpdf | ActionCompatPage |
| reports | graphView | native-explicit | reports.graphview | ReportsGraphViewPage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | native-explicit | reports.showhirereport | ActionCompatPage |
| reports | showPlacementReport | native-explicit | reports.showplacementreport | ActionCompatPage |
| reports | showSubmissionReport | native-explicit | reports.showsubmissionreport | ActionCompatPage |
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
