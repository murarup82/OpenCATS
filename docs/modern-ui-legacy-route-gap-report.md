# Modern UI Legacy Comparison Report

Generated: 2026-03-03T07:52:33.311Z

## Summary

- Legacy handleRequest actions discovered: 222
- Native explicit modern coverage: 137
- Native default fallback coverage: 0
- Bridge coverage (explicit + fallback): 85
- Bridge explicit route mapping: 85
- Bridge wildcard fallback mapping: 0
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
| graphs | 5 | 5 | 0 | 0 | 0 |
| home | 22 | 22 | 0 | 0 | 0 |
| import | 15 | 3 | 0 | 12 | 0 |
| joborders | 24 | 24 | 0 | 0 | 0 |
| kpis | 1 | 1 | 0 | 0 | 0 |
| lists | 8 | 8 | 0 | 0 | 0 |
| login | 7 | 7 | 0 | 0 | 0 |
| logs | 1 | 1 | 0 | 0 | 0 |
| reports | 11 | 11 | 0 | 0 | 0 |
| rss | 1 | 1 | 0 | 0 | 0 |
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
| attachments | getAttachment | bridge-explicit | attachments.getattachment | ModuleBridgePage |
| calendar | addEvent | native-explicit | calendar.addevent | CalendarPage |
| calendar | deleteEvent | native-explicit | calendar.deleteevent | EntityUtilityActionPage |
| calendar | dynamicData | native-explicit | calendar.dynamicdata | EntityUtilityActionPage |
| calendar | editEvent | native-explicit | calendar.editevent | CalendarPage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | native-explicit | candidates.addactivitychangestatus | EntityUtilityActionPage |
| candidates | addCandidateTags | native-explicit | candidates.addcandidatetags | EntityUtilityActionPage |
| candidates | addDuplicates | native-explicit | candidates.addduplicates | EntityUtilityActionPage |
| candidates | addEditImage | native-explicit | candidates.addeditimage | EntityUtilityActionPage |
| candidates | addProfileComment | native-explicit | candidates.addprofilecomment | EntityUtilityActionPage |
| candidates | addToPipeline | native-explicit | candidates.addtopipeline | EntityUtilityActionPage |
| candidates | administrativeHideShow | native-explicit | candidates.administrativehideshow | EntityUtilityActionPage |
| candidates | considerForJobSearch | native-explicit | candidates.considerforjobsearch | CandidateAssignActionPage |
| candidates | createAttachment | native-explicit-guarded | candidates.createattachment | CandidatesShowPage |
| candidates | delete | native-explicit-guarded | candidates.delete | EntityDeleteActionPage |
| candidates | deleteAttachment | native-explicit | candidates.deleteattachment | EntityUtilityActionPage |
| candidates | deleteMessageThread | native-explicit | candidates.deletemessagethread | EntityUtilityActionPage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | native-explicit | candidates.emailcandidates | EntityUtilityActionPage |
| candidates | linkDuplicate | native-explicit | candidates.linkduplicate | EntityUtilityActionPage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | native-explicit | candidates.merge | EntityUtilityActionPage |
| candidates | mergeInfo | native-explicit | candidates.mergeinfo | EntityUtilityActionPage |
| candidates | postMessage | native-explicit | candidates.postmessage | EntityUtilityActionPage |
| candidates | removeDuplicity | native-explicit | candidates.removeduplicity | EntityUtilityActionPage |
| candidates | removeFromPipeline | native-explicit | candidates.removefrompipeline | EntityUtilityActionPage |
| candidates | saveSources | native-explicit | candidates.savesources | EntityUtilityActionPage |
| candidates | search | native-explicit | candidates.search | CandidatesListPage |
| candidates | show | native-explicit-guarded | candidates.show | CandidatesShowPage |
| candidates | show_questionnaire | native-explicit-guarded | candidates.show_questionnaire | CandidateQuestionnaireActionPage |
| candidates | viewResume | native-explicit-guarded | candidates.viewresume | CandidateResumeActionPage |
| companies | add | native-explicit | companies.add | CompaniesAddPage |
| companies | createAttachment | native-explicit-guarded | companies.createattachment | CompaniesShowPage |
| companies | delete | native-explicit-guarded | companies.delete | EntityDeleteActionPage |
| companies | deleteAttachment | native-explicit | companies.deleteattachment | EntityUtilityActionPage |
| companies | edit | native-explicit-guarded | companies.edit | CompaniesEditPage |
| companies | internalPostings | native-explicit | companies.internalpostings | CompaniesInternalPostingsActionPage |
| companies | listByView | native-explicit | companies.listbyview | CompaniesListPage |
| companies | search | native-explicit | companies.search | CompaniesListPage |
| companies | show | native-explicit-guarded | companies.show | CompaniesShowPage |
| contacts | add | native-explicit | contacts.add | ContactsAddPage |
| contacts | addActivityScheduleEvent | native-explicit-guarded | contacts.addactivityscheduleevent | ContactActivityActionPage |
| contacts | delete | native-explicit-guarded | contacts.delete | EntityDeleteActionPage |
| contacts | downloadVCard | native-explicit-guarded | contacts.downloadvcard | ContactVCardActionPage |
| contacts | edit | native-explicit-guarded | contacts.edit | ContactsEditPage |
| contacts | listByView | native-explicit | contacts.listbyview | ContactsListPage |
| contacts | search | native-explicit | contacts.search | ContactsListPage |
| contacts | show | native-explicit-guarded | contacts.show | ContactsShowPage |
| contacts | showColdCallList | native-explicit | contacts.showcoldcalllist | ContactsColdCallListPage |
| dashboard | my | native-explicit | dashboard.my | DashboardMyPage |
| dashboard | setPipelineStatus | native-explicit | dashboard.setpipelinestatus | DashboardMyPage |
| export | export | bridge-explicit | export.export | ModuleBridgePage |
| export | exportByDataGrid | bridge-explicit | export.exportbydatagrid | ModuleBridgePage |
| gdpr | export | bridge-explicit | gdpr.export | ModuleBridgePage |
| gdpr | requests | bridge-explicit | gdpr.requests | ModuleBridgePage |
| graphs | generic | native-explicit | graphs.generic | GraphsActionPage |
| graphs | genericPie | native-explicit | graphs.genericpie | GraphsActionPage |
| graphs | jobOrderReportGraph | native-explicit | graphs.joborderreportgraph | GraphsActionPage |
| graphs | testGraph | native-explicit | graphs.testgraph | GraphsActionPage |
| graphs | wordVerify | native-explicit | graphs.wordverify | GraphsActionPage |
| home | addPersonalItem | native-explicit | home.addpersonalitem | HomeActionPage |
| home | addSavedSearch | native-explicit | home.addsavedsearch | HomeActionPage |
| home | appendPersonalNote | native-explicit | home.appendpersonalnote | HomeActionPage |
| home | archiveInboxThread | native-explicit | home.archiveinboxthread | HomeActionPage |
| home | createInboxNote | native-explicit | home.createinboxnote | HomeActionPage |
| home | createInboxTodo | native-explicit | home.createinboxtodo | HomeActionPage |
| home | deleteInboxThread | native-explicit | home.deleteinboxthread | HomeActionPage |
| home | deletePersonalItem | native-explicit | home.deletepersonalitem | HomeActionPage |
| home | deleteSavedSearch | native-explicit | home.deletesavedsearch | HomeActionPage |
| home | home | native-explicit | home.home | HomePage |
| home | inbox | native-explicit | home.inbox | HomeInboxPage |
| home | movePersonalNoteToTodo | native-explicit | home.movepersonalnotetotodo | HomeActionPage |
| home | myNotes | native-explicit | home.mynotes | HomeMyNotesPage |
| home | postInboxMessage | native-explicit | home.postinboxmessage | HomeActionPage |
| home | quickSearch | native-explicit | home.quicksearch | HomeActionPage |
| home | sendPersonalNote | native-explicit | home.sendpersonalnote | HomeActionPage |
| home | setPersonalNoteArchived | native-explicit | home.setpersonalnotearchived | HomeActionPage |
| home | setPersonalTodoStatus | native-explicit | home.setpersonaltodostatus | HomeActionPage |
| home | submitFeedback | native-explicit | home.submitfeedback | HomeActionPage |
| home | togglePersonalTodo | native-explicit | home.togglepersonaltodo | HomeActionPage |
| home | updatePersonalNote | native-explicit | home.updatepersonalnote | HomeActionPage |
| home | updatePersonalTodo | native-explicit | home.updatepersonaltodo | HomeActionPage |
| import | commit | native-explicit | import.commit | LegacyRedirectPage |
| import | deleteBulkResumes | bridge-explicit | import.deletebulkresumes | ModuleBridgePage |
| import | import | native-explicit | import.import | LegacyRedirectPage |
| import | importBulkResumes | bridge-explicit | import.importbulkresumes | ModuleBridgePage |
| import | importSelectType | bridge-explicit | import.importselecttype | ModuleBridgePage |
| import | importUploadFile | native-explicit | import.importuploadfile | LegacyRedirectPage |
| import | importUploadResume | bridge-explicit | import.importuploadresume | ModuleBridgePage |
| import | massImport | bridge-explicit | import.massimport | ModuleBridgePage |
| import | massImportDocument | bridge-explicit | import.massimportdocument | ModuleBridgePage |
| import | massImportEdit | bridge-explicit | import.massimportedit | ModuleBridgePage |
| import | revert | bridge-explicit | import.revert | ModuleBridgePage |
| import | showMassImport | bridge-explicit | import.showmassimport | ModuleBridgePage |
| import | viewerrors | bridge-explicit | import.viewerrors | ModuleBridgePage |
| import | viewpending | bridge-explicit | import.viewpending | ModuleBridgePage |
| import | whatIsBulkResumes | bridge-explicit | import.whatisbulkresumes | ModuleBridgePage |
| joborders | add | native-explicit | joborders.add | JobOrdersAddPage |
| joborders | addActivityChangeStatus | native-explicit | joborders.addactivitychangestatus | EntityUtilityActionPage |
| joborders | addCandidateModal | native-explicit-guarded | joborders.addcandidatemodal | CandidatesAddPage |
| joborders | addJobOrderPopup | native-explicit | joborders.addjoborderpopup | JobOrderAddActionPage |
| joborders | addProfileComment | native-explicit | joborders.addprofilecomment | EntityUtilityActionPage |
| joborders | addToPipeline | native-explicit | joborders.addtopipeline | EntityUtilityActionPage |
| joborders | administrativeHideShow | native-explicit | joborders.administrativehideshow | EntityUtilityActionPage |
| joborders | companyContext | native-explicit-guarded | joborders.companycontext | JobOrderCompanyContextActionPage |
| joborders | considerCandidateSearch | native-explicit | joborders.considercandidatesearch | JobOrderAssignActionPage |
| joborders | createAttachment | native-explicit-guarded | joborders.createattachment | JobOrdersShowPage |
| joborders | delete | native-explicit-guarded | joborders.delete | EntityDeleteActionPage |
| joborders | deleteAttachment | native-explicit | joborders.deleteattachment | EntityUtilityActionPage |
| joborders | deleteMessageThread | native-explicit | joborders.deletemessagethread | EntityUtilityActionPage |
| joborders | edit | native-explicit-guarded | joborders.edit | JobOrdersEditPage |
| joborders | editHiringPlan | native-explicit | joborders.edithiringplan | EntityUtilityActionPage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineStatusDetails | native-explicit-guarded | joborders.pipelinestatusdetails | PipelineStatusActionPage |
| joborders | pipelineStatusEditDate | native-explicit-guarded | joborders.pipelinestatuseditdate | PipelineStatusActionPage |
| joborders | postMessage | native-explicit | joborders.postmessage | EntityUtilityActionPage |
| joborders | recruiterAllocation | native-explicit | joborders.recruiterallocation | JobOrdersRecruiterAllocationPage |
| joborders | removeFromPipeline | native-explicit | joborders.removefrompipeline | EntityUtilityActionPage |
| joborders | search | native-explicit | joborders.search | JobOrdersListPage |
| joborders | setMonitoredJobOrder | native-explicit-guarded | joborders.setmonitoredjoborder | JobOrderMonitorActionPage |
| joborders | show | native-explicit-guarded | joborders.show | JobOrdersShowPage |
| kpis | details | native-explicit | kpis.details | KpisDetailsPage |
| lists | addToListFromDatagridModal | native-explicit | lists.addtolistfromdatagridmodal | ListsActionPage |
| lists | deleteStaticList | native-explicit | lists.deletestaticlist | EntityUtilityActionPage |
| lists | listByView | native-explicit | lists.listbyview | ListsManagePage |
| lists | quickActionAddToListModal | native-explicit | lists.quickactionaddtolistmodal | ListsActionPage |
| lists | removeFromListDatagrid | native-explicit | lists.removefromlistdatagrid | EntityUtilityActionPage |
| lists | saveListAccess | native-explicit | lists.savelistaccess | EntityUtilityActionPage |
| lists | show | native-explicit-guarded | lists.show | ListsDetailPage |
| lists | showList | native-explicit-guarded | lists.showlist | ListsDetailPage |
| login | attemptLogin | native-explicit | login.attemptlogin | LegacyRedirectPage |
| login | forgotPassword | native-explicit | login.forgotpassword | LegacyRedirectPage |
| login | googleCallback | native-explicit | login.googlecallback | LegacyRedirectPage |
| login | googleStart | native-explicit | login.googlestart | LegacyRedirectPage |
| login | noCookiesModal | native-explicit | login.nocookiesmodal | LegacyRedirectPage |
| login | requestAccess | native-explicit | login.requestaccess | LegacyRedirectPage |
| login | showLoginForm | native-explicit | login.showloginform | LegacyRedirectPage |
| logs | view | native-explicit | logs.view | LogsPage |
| reports | customerDashboard | native-explicit | reports.customerdashboard | ReportsCustomerDashboardPage |
| reports | customerDashboardDetails | native-explicit | reports.customerdashboarddetails | ReportsActionPage |
| reports | customizeEEOReport | native-explicit | reports.customizeeeoreport | ReportsActionPage |
| reports | customizeJobOrderReport | native-explicit | reports.customizejoborderreport | ReportsActionPage |
| reports | generateEEOReportPreview | native-explicit | reports.generateeeoreportpreview | ReportsActionPage |
| reports | generateJobOrderReportPDF | native-explicit | reports.generatejoborderreportpdf | ReportsActionPage |
| reports | graphView | native-explicit | reports.graphview | ReportsGraphViewPage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | native-explicit | reports.showhirereport | ReportsActionPage |
| reports | showPlacementReport | native-explicit | reports.showplacementreport | ReportsActionPage |
| reports | showSubmissionReport | native-explicit | reports.showsubmissionreport | ReportsActionPage |
| rss | jobOrders | native-explicit | rss.joborders | LegacyRedirectPage |
| settings | addEmailTemplate | bridge-explicit | settings.addemailtemplate | ModuleBridgePage |
| settings | addUser | bridge-explicit | settings.adduser | ModuleBridgePage |
| settings | administration | bridge-explicit | settings.administration | ModuleBridgePage |
| settings | ajax_tags_add | bridge-explicit | settings.ajax_tags_add | ModuleBridgePage |
| settings | ajax_tags_del | bridge-explicit | settings.ajax_tags_del | ModuleBridgePage |
| settings | ajax_tags_upd | bridge-explicit | settings.ajax_tags_upd | ModuleBridgePage |
| settings | ajax_wizardAddUser | bridge-explicit | settings.ajax_wizardadduser | ModuleBridgePage |
| settings | ajax_wizardCheckKey | bridge-explicit | settings.ajax_wizardcheckkey | ModuleBridgePage |
| settings | ajax_wizardDeleteUser | bridge-explicit | settings.ajax_wizarddeleteuser | ModuleBridgePage |
| settings | ajax_wizardEmail | bridge-explicit | settings.ajax_wizardemail | ModuleBridgePage |
| settings | ajax_wizardFirstTimeSetup | bridge-explicit | settings.ajax_wizardfirsttimesetup | ModuleBridgePage |
| settings | ajax_wizardImport | bridge-explicit | settings.ajax_wizardimport | ModuleBridgePage |
| settings | ajax_wizardLicense | bridge-explicit | settings.ajax_wizardlicense | ModuleBridgePage |
| settings | ajax_wizardLocalization | bridge-explicit | settings.ajax_wizardlocalization | ModuleBridgePage |
| settings | ajax_wizardPassword | bridge-explicit | settings.ajax_wizardpassword | ModuleBridgePage |
| settings | ajax_wizardSiteName | bridge-explicit | settings.ajax_wizardsitename | ModuleBridgePage |
| settings | ajax_wizardWebsite | bridge-explicit | settings.ajax_wizardwebsite | ModuleBridgePage |
| settings | aspLocalization | bridge-explicit | settings.asplocalization | ModuleBridgePage |
| settings | careerPortalQuestionnaire | bridge-explicit | settings.careerportalquestionnaire | ModuleBridgePage |
| settings | careerPortalQuestionnairePreview | bridge-explicit | settings.careerportalquestionnairepreview | ModuleBridgePage |
| settings | careerPortalQuestionnaireUpdate | bridge-explicit | settings.careerportalquestionnaireupdate | ModuleBridgePage |
| settings | careerPortalSettings | bridge-explicit | settings.careerportalsettings | ModuleBridgePage |
| settings | careerPortalTemplateEdit | bridge-explicit | settings.careerportaltemplateedit | ModuleBridgePage |
| settings | changePassword | bridge-explicit | settings.changepassword | ModuleBridgePage |
| settings | createBackup | bridge-explicit | settings.createbackup | ModuleBridgePage |
| settings | customizeCalendar | bridge-explicit | settings.customizecalendar | ModuleBridgePage |
| settings | customizeExtraFields | bridge-explicit | settings.customizeextrafields | ModuleBridgePage |
| settings | deleteBackup | bridge-explicit | settings.deletebackup | ModuleBridgePage |
| settings | deleteEmailTemplate | bridge-explicit | settings.deleteemailtemplate | ModuleBridgePage |
| settings | deleteUser | bridge-explicit | settings.deleteuser | ModuleBridgePage |
| settings | editUser | bridge-explicit | settings.edituser | ModuleBridgePage |
| settings | eeo | bridge-explicit | settings.eeo | ModuleBridgePage |
| settings | emailSettings | bridge-explicit | settings.emailsettings | ModuleBridgePage |
| settings | emailTemplates | bridge-explicit | settings.emailtemplates | ModuleBridgePage |
| settings | feedbackSettings | bridge-explicit | settings.feedbacksettings | ModuleBridgePage |
| settings | forceEmail | bridge-explicit | settings.forceemail | ModuleBridgePage |
| settings | gdprSettings | bridge-explicit | settings.gdprsettings | ModuleBridgePage |
| settings | getFirefoxModal | bridge-explicit | settings.getfirefoxmodal | ModuleBridgePage |
| settings | googleOIDCSettings | bridge-explicit | settings.googleoidcsettings | ModuleBridgePage |
| settings | loginActivity | bridge-explicit | settings.loginactivity | ModuleBridgePage |
| settings | manageUsers | bridge-explicit | settings.manageusers | ModuleBridgePage |
| settings | myProfile | bridge-explicit | settings.myprofile | ModuleBridgePage |
| settings | newInstallFinished | bridge-explicit | settings.newinstallfinished | ModuleBridgePage |
| settings | newInstallPassword | bridge-explicit | settings.newinstallpassword | ModuleBridgePage |
| settings | newSiteName | bridge-explicit | settings.newsitename | ModuleBridgePage |
| settings | onCareerPortalTweak | bridge-explicit | settings.oncareerportaltweak | ModuleBridgePage |
| settings | previewPage | bridge-explicit | settings.previewpage | ModuleBridgePage |
| settings | previewPageTop | bridge-explicit | settings.previewpagetop | ModuleBridgePage |
| settings | professional | bridge-explicit | settings.professional | ModuleBridgePage |
| settings | rejectionReasons | bridge-explicit | settings.rejectionreasons | ModuleBridgePage |
| settings | reports | bridge-explicit | settings.reports | ModuleBridgePage |
| settings | rolePagePermissions | bridge-explicit | settings.rolepagepermissions | ModuleBridgePage |
| settings | schemaMigrations | bridge-explicit | settings.schemamigrations | ModuleBridgePage |
| settings | showUser | bridge-explicit | settings.showuser | ModuleBridgePage |
| settings | tags | bridge-explicit | settings.tags | ModuleBridgePage |
| settings | talentFitFlowSettings | bridge-explicit | settings.talentfitflowsettings | ModuleBridgePage |
| settings | upgradeSiteName | bridge-explicit | settings.upgradesitename | ModuleBridgePage |
| settings | viewItemHistory | bridge-explicit | settings.viewitemhistory | ModuleBridgePage |
| toolbar | attemptLogin | bridge-explicit | toolbar.attemptlogin | ModuleBridgePage |
| toolbar | authenticate | bridge-explicit | toolbar.authenticate | ModuleBridgePage |
| toolbar | checkEmailIsInSystem | bridge-explicit | toolbar.checkemailisinsystem | ModuleBridgePage |
| toolbar | getJavaScriptLib | bridge-explicit | toolbar.getjavascriptlib | ModuleBridgePage |
| toolbar | getLicenseKey | bridge-explicit | toolbar.getlicensekey | ModuleBridgePage |
| toolbar | getRemoteVersion | bridge-explicit | toolbar.getremoteversion | ModuleBridgePage |
| toolbar | install | bridge-explicit | toolbar.install | ModuleBridgePage |
| toolbar | storeMonsterResumeText | bridge-explicit | toolbar.storemonsterresumetext | ModuleBridgePage |
| wizard | ajax_getPage | bridge-explicit | wizard.ajax_getpage | ModuleBridgePage |
| xml | jobOrders | bridge-explicit | xml.joborders | ModuleBridgePage |
