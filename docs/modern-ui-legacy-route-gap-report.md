# Modern UI Legacy Comparison Report

Generated: 2026-03-02T04:07:16.751Z

## Summary

- Legacy handleRequest actions discovered: 219
- Native explicit modern coverage: 27
- Native default fallback coverage: 0
- Bridge coverage (explicit + fallback): 192
- Bridge explicit route mapping: 68
- Bridge wildcard fallback mapping: 124
- Legacy unresolved: 0

## Module Coverage

| Module | Legacy Actions | Native Explicit | Native Default Fallback | Bridge | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| activity | 2 | 2 | 0 | 0 | 0 |
| attachments | 1 | 0 | 0 | 1 | 0 |
| calendar | 5 | 1 | 0 | 4 | 0 |
| candidates | 27 | 5 | 0 | 22 | 0 |
| companies | 9 | 5 | 0 | 4 | 0 |
| contacts | 9 | 5 | 0 | 4 | 0 |
| dashboard | 2 | 2 | 0 | 0 | 0 |
| export | 2 | 0 | 0 | 2 | 0 |
| gdpr | 2 | 0 | 0 | 2 | 0 |
| graphs | 5 | 0 | 0 | 5 | 0 |
| home | 22 | 0 | 0 | 22 | 0 |
| import | 15 | 0 | 0 | 15 | 0 |
| joborders | 23 | 5 | 0 | 18 | 0 |
| kpis | 1 | 0 | 0 | 1 | 0 |
| lists | 7 | 1 | 0 | 6 | 0 |
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
| addEvent | bridge-explicit | calendar.addevent | ModuleBridgePage |
| deleteEvent | bridge-explicit | calendar.deleteevent | ModuleBridgePage |
| dynamicData | bridge-explicit | calendar.dynamicdata | ModuleBridgePage |
| editEvent | bridge-explicit | calendar.editevent | ModuleBridgePage |

### candidates

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addActivityChangeStatus | bridge-explicit | candidates.addactivitychangestatus | ModuleBridgePage |
| addCandidateTags | bridge-explicit | candidates.addcandidatetags | ModuleBridgePage |
| addDuplicates | bridge-explicit | candidates.addduplicates | ModuleBridgePage |
| addEditImage | bridge-explicit | candidates.addeditimage | ModuleBridgePage |
| addProfileComment | bridge-explicit | candidates.addprofilecomment | ModuleBridgePage |
| addToPipeline | bridge-explicit | candidates.addtopipeline | ModuleBridgePage |
| administrativeHideShow | bridge-explicit | candidates.administrativehideshow | ModuleBridgePage |
| considerForJobSearch | bridge-explicit | candidates.considerforjobsearch | ModuleBridgePage |
| createAttachment | bridge-explicit | candidates.createattachment | ModuleBridgePage |
| delete | bridge-explicit | candidates.delete | ModuleBridgePage |
| deleteAttachment | bridge-explicit | candidates.deleteattachment | ModuleBridgePage |
| deleteMessageThread | bridge-explicit | candidates.deletemessagethread | ModuleBridgePage |
| emailCandidates | bridge-explicit | candidates.emailcandidates | ModuleBridgePage |
| linkDuplicate | bridge-explicit | candidates.linkduplicate | ModuleBridgePage |
| merge | bridge-explicit | candidates.merge | ModuleBridgePage |
| mergeInfo | bridge-explicit | candidates.mergeinfo | ModuleBridgePage |
| postMessage | bridge-explicit | candidates.postmessage | ModuleBridgePage |
| removeDuplicity | bridge-explicit | candidates.removeduplicity | ModuleBridgePage |
| removeFromPipeline | bridge-explicit | candidates.removefrompipeline | ModuleBridgePage |
| saveSources | bridge-explicit | candidates.savesources | ModuleBridgePage |
| show_questionnaire | bridge-explicit | candidates.show_questionnaire | ModuleBridgePage |
| viewResume | bridge-explicit | candidates.viewresume | ModuleBridgePage |

### companies

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| createAttachment | bridge-explicit | companies.createattachment | ModuleBridgePage |
| delete | bridge-explicit | companies.delete | ModuleBridgePage |
| deleteAttachment | bridge-explicit | companies.deleteattachment | ModuleBridgePage |
| internalPostings | bridge-explicit | companies.internalpostings | ModuleBridgePage |

### contacts

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addActivityScheduleEvent | bridge-explicit | contacts.addactivityscheduleevent | ModuleBridgePage |
| delete | bridge-explicit | contacts.delete | ModuleBridgePage |
| downloadVCard | bridge-explicit | contacts.downloadvcard | ModuleBridgePage |
| showColdCallList | bridge-explicit | contacts.showcoldcalllist | ModuleBridgePage |

### joborders

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addActivityChangeStatus | bridge-explicit | joborders.addactivitychangestatus | ModuleBridgePage |
| addCandidateModal | bridge-explicit | joborders.addcandidatemodal | ModuleBridgePage |
| addJobOrderPopup | bridge-explicit | joborders.addjoborderpopup | ModuleBridgePage |
| addProfileComment | bridge-explicit | joborders.addprofilecomment | ModuleBridgePage |
| addToPipeline | bridge-explicit | joborders.addtopipeline | ModuleBridgePage |
| administrativeHideShow | bridge-explicit | joborders.administrativehideshow | ModuleBridgePage |
| considerCandidateSearch | bridge-explicit | joborders.considercandidatesearch | ModuleBridgePage |
| createAttachment | bridge-explicit | joborders.createattachment | ModuleBridgePage |
| delete | bridge-explicit | joborders.delete | ModuleBridgePage |
| deleteAttachment | bridge-explicit | joborders.deleteattachment | ModuleBridgePage |
| deleteMessageThread | bridge-explicit | joborders.deletemessagethread | ModuleBridgePage |
| editHiringPlan | bridge-explicit | joborders.edithiringplan | ModuleBridgePage |
| pipelineStatusDetails | bridge-explicit | joborders.pipelinestatusdetails | ModuleBridgePage |
| pipelineStatusEditDate | bridge-explicit | joborders.pipelinestatuseditdate | ModuleBridgePage |
| postMessage | bridge-explicit | joborders.postmessage | ModuleBridgePage |
| recruiterAllocation | bridge-explicit | joborders.recruiterallocation | ModuleBridgePage |
| removeFromPipeline | bridge-explicit | joborders.removefrompipeline | ModuleBridgePage |
| setMonitoredJobOrder | bridge-explicit | joborders.setmonitoredjoborder | ModuleBridgePage |

### lists

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| addToListFromDatagridModal | bridge-explicit | lists.addtolistfromdatagridmodal | ModuleBridgePage |
| deleteStaticList | bridge-explicit | lists.deletestaticlist | ModuleBridgePage |
| quickActionAddToListModal | bridge-explicit | lists.quickactionaddtolistmodal | ModuleBridgePage |
| removeFromListDatagrid | bridge-explicit | lists.removefromlistdatagrid | ModuleBridgePage |
| saveListAccess | bridge-explicit | lists.savelistaccess | ModuleBridgePage |
| showList | bridge-explicit | lists.showlist | ModuleBridgePage |

### reports

| Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- |
| customerDashboard | bridge-explicit | reports.customerdashboard | ModuleBridgePage |
| customerDashboardDetails | bridge-explicit | reports.customerdashboarddetails | ModuleBridgePage |
| customizeEEOReport | bridge-explicit | reports.customizeeeoreport | ModuleBridgePage |
| customizeJobOrderReport | bridge-explicit | reports.customizejoborderreport | ModuleBridgePage |
| generateEEOReportPreview | bridge-explicit | reports.generateeeoreportpreview | ModuleBridgePage |
| generateJobOrderReportPDF | bridge-explicit | reports.generatejoborderreportpdf | ModuleBridgePage |
| graphView | bridge-explicit | reports.graphview | ModuleBridgePage |
| showHireReport | bridge-explicit | reports.showhirereport | ModuleBridgePage |
| showPlacementReport | bridge-explicit | reports.showplacementreport | ModuleBridgePage |
| showSubmissionReport | bridge-explicit | reports.showsubmissionreport | ModuleBridgePage |

## Full Action Matrix

| Module | Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- | --- |
| activity | listByViewDataGrid | native-explicit | activity.listbyviewdatagrid | ActivityListPage |
| activity | viewByDate | native-explicit | activity.viewbydate | ActivityListPage |
| attachments | getAttachment | bridge-global-fallback | *.* | ModuleBridgePage |
| calendar | addEvent | bridge-explicit | calendar.addevent | ModuleBridgePage |
| calendar | deleteEvent | bridge-explicit | calendar.deleteevent | ModuleBridgePage |
| calendar | dynamicData | bridge-explicit | calendar.dynamicdata | ModuleBridgePage |
| calendar | editEvent | bridge-explicit | calendar.editevent | ModuleBridgePage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | bridge-explicit | candidates.addactivitychangestatus | ModuleBridgePage |
| candidates | addCandidateTags | bridge-explicit | candidates.addcandidatetags | ModuleBridgePage |
| candidates | addDuplicates | bridge-explicit | candidates.addduplicates | ModuleBridgePage |
| candidates | addEditImage | bridge-explicit | candidates.addeditimage | ModuleBridgePage |
| candidates | addProfileComment | bridge-explicit | candidates.addprofilecomment | ModuleBridgePage |
| candidates | addToPipeline | bridge-explicit | candidates.addtopipeline | ModuleBridgePage |
| candidates | administrativeHideShow | bridge-explicit | candidates.administrativehideshow | ModuleBridgePage |
| candidates | considerForJobSearch | bridge-explicit | candidates.considerforjobsearch | ModuleBridgePage |
| candidates | createAttachment | bridge-explicit | candidates.createattachment | ModuleBridgePage |
| candidates | delete | bridge-explicit | candidates.delete | ModuleBridgePage |
| candidates | deleteAttachment | bridge-explicit | candidates.deleteattachment | ModuleBridgePage |
| candidates | deleteMessageThread | bridge-explicit | candidates.deletemessagethread | ModuleBridgePage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | bridge-explicit | candidates.emailcandidates | ModuleBridgePage |
| candidates | linkDuplicate | bridge-explicit | candidates.linkduplicate | ModuleBridgePage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | bridge-explicit | candidates.merge | ModuleBridgePage |
| candidates | mergeInfo | bridge-explicit | candidates.mergeinfo | ModuleBridgePage |
| candidates | postMessage | bridge-explicit | candidates.postmessage | ModuleBridgePage |
| candidates | removeDuplicity | bridge-explicit | candidates.removeduplicity | ModuleBridgePage |
| candidates | removeFromPipeline | bridge-explicit | candidates.removefrompipeline | ModuleBridgePage |
| candidates | saveSources | bridge-explicit | candidates.savesources | ModuleBridgePage |
| candidates | search | native-explicit | candidates.search | CandidatesListPage |
| candidates | show | native-explicit-guarded | candidates.show | CandidatesShowPage |
| candidates | show_questionnaire | bridge-explicit | candidates.show_questionnaire | ModuleBridgePage |
| candidates | viewResume | bridge-explicit | candidates.viewresume | ModuleBridgePage |
| companies | add | native-explicit | companies.add | CompaniesFormBridgePage |
| companies | createAttachment | bridge-explicit | companies.createattachment | ModuleBridgePage |
| companies | delete | bridge-explicit | companies.delete | ModuleBridgePage |
| companies | deleteAttachment | bridge-explicit | companies.deleteattachment | ModuleBridgePage |
| companies | edit | native-explicit-guarded | companies.edit | CompaniesFormBridgePage |
| companies | internalPostings | bridge-explicit | companies.internalpostings | ModuleBridgePage |
| companies | listByView | native-explicit | companies.listbyview | CompaniesListPage |
| companies | search | native-explicit | companies.search | CompaniesListPage |
| companies | show | native-explicit-guarded | companies.show | CompaniesShowPage |
| contacts | add | native-explicit | contacts.add | ContactsFormBridgePage |
| contacts | addActivityScheduleEvent | bridge-explicit | contacts.addactivityscheduleevent | ModuleBridgePage |
| contacts | delete | bridge-explicit | contacts.delete | ModuleBridgePage |
| contacts | downloadVCard | bridge-explicit | contacts.downloadvcard | ModuleBridgePage |
| contacts | edit | native-explicit-guarded | contacts.edit | ContactsFormBridgePage |
| contacts | listByView | native-explicit | contacts.listbyview | ContactsListPage |
| contacts | search | native-explicit | contacts.search | ContactsListPage |
| contacts | show | native-explicit-guarded | contacts.show | ContactsShowPage |
| contacts | showColdCallList | bridge-explicit | contacts.showcoldcalllist | ModuleBridgePage |
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
| home | addPersonalItem | bridge-module-fallback | home.* | ModuleBridgePage |
| home | addSavedSearch | bridge-module-fallback | home.* | ModuleBridgePage |
| home | appendPersonalNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | archiveInboxThread | bridge-module-fallback | home.* | ModuleBridgePage |
| home | createInboxNote | bridge-module-fallback | home.* | ModuleBridgePage |
| home | createInboxTodo | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deleteInboxThread | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deletePersonalItem | bridge-module-fallback | home.* | ModuleBridgePage |
| home | deleteSavedSearch | bridge-module-fallback | home.* | ModuleBridgePage |
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
| joborders | addActivityChangeStatus | bridge-explicit | joborders.addactivitychangestatus | ModuleBridgePage |
| joborders | addCandidateModal | bridge-explicit | joborders.addcandidatemodal | ModuleBridgePage |
| joborders | addJobOrderPopup | bridge-explicit | joborders.addjoborderpopup | ModuleBridgePage |
| joborders | addProfileComment | bridge-explicit | joborders.addprofilecomment | ModuleBridgePage |
| joborders | addToPipeline | bridge-explicit | joborders.addtopipeline | ModuleBridgePage |
| joborders | administrativeHideShow | bridge-explicit | joborders.administrativehideshow | ModuleBridgePage |
| joborders | considerCandidateSearch | bridge-explicit | joborders.considercandidatesearch | ModuleBridgePage |
| joborders | createAttachment | bridge-explicit | joborders.createattachment | ModuleBridgePage |
| joborders | delete | bridge-explicit | joborders.delete | ModuleBridgePage |
| joborders | deleteAttachment | bridge-explicit | joborders.deleteattachment | ModuleBridgePage |
| joborders | deleteMessageThread | bridge-explicit | joborders.deletemessagethread | ModuleBridgePage |
| joborders | edit | native-explicit-guarded | joborders.edit | JobOrdersFormBridgePage |
| joborders | editHiringPlan | bridge-explicit | joborders.edithiringplan | ModuleBridgePage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineStatusDetails | bridge-explicit | joborders.pipelinestatusdetails | ModuleBridgePage |
| joborders | pipelineStatusEditDate | bridge-explicit | joborders.pipelinestatuseditdate | ModuleBridgePage |
| joborders | postMessage | bridge-explicit | joborders.postmessage | ModuleBridgePage |
| joborders | recruiterAllocation | bridge-explicit | joborders.recruiterallocation | ModuleBridgePage |
| joborders | removeFromPipeline | bridge-explicit | joborders.removefrompipeline | ModuleBridgePage |
| joborders | search | native-explicit | joborders.search | JobOrdersListPage |
| joborders | setMonitoredJobOrder | bridge-explicit | joborders.setmonitoredjoborder | ModuleBridgePage |
| joborders | show | native-explicit-guarded | joborders.show | JobOrdersShowPage |
| kpis | details | bridge-global-fallback | *.* | ModuleBridgePage |
| lists | addToListFromDatagridModal | bridge-explicit | lists.addtolistfromdatagridmodal | ModuleBridgePage |
| lists | deleteStaticList | bridge-explicit | lists.deletestaticlist | ModuleBridgePage |
| lists | listByView | native-explicit | lists.listbyview | ListsManagePage |
| lists | quickActionAddToListModal | bridge-explicit | lists.quickactionaddtolistmodal | ModuleBridgePage |
| lists | removeFromListDatagrid | bridge-explicit | lists.removefromlistdatagrid | ModuleBridgePage |
| lists | saveListAccess | bridge-explicit | lists.savelistaccess | ModuleBridgePage |
| lists | showList | bridge-explicit | lists.showlist | ModuleBridgePage |
| login | attemptLogin | bridge-global-fallback | *.* | ModuleBridgePage |
| login | forgotPassword | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleCallback | bridge-global-fallback | *.* | ModuleBridgePage |
| login | googleStart | bridge-global-fallback | *.* | ModuleBridgePage |
| login | noCookiesModal | bridge-global-fallback | *.* | ModuleBridgePage |
| login | requestAccess | bridge-global-fallback | *.* | ModuleBridgePage |
| login | showLoginForm | bridge-global-fallback | *.* | ModuleBridgePage |
| reports | customerDashboard | bridge-explicit | reports.customerdashboard | ModuleBridgePage |
| reports | customerDashboardDetails | bridge-explicit | reports.customerdashboarddetails | ModuleBridgePage |
| reports | customizeEEOReport | bridge-explicit | reports.customizeeeoreport | ModuleBridgePage |
| reports | customizeJobOrderReport | bridge-explicit | reports.customizejoborderreport | ModuleBridgePage |
| reports | generateEEOReportPreview | bridge-explicit | reports.generateeeoreportpreview | ModuleBridgePage |
| reports | generateJobOrderReportPDF | bridge-explicit | reports.generatejoborderreportpdf | ModuleBridgePage |
| reports | graphView | bridge-explicit | reports.graphview | ModuleBridgePage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | bridge-explicit | reports.showhirereport | ModuleBridgePage |
| reports | showPlacementReport | bridge-explicit | reports.showplacementreport | ModuleBridgePage |
| reports | showSubmissionReport | bridge-explicit | reports.showsubmissionreport | ModuleBridgePage |
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
