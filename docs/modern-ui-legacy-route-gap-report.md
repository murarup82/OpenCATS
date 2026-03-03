# Modern UI Legacy Comparison Report

Generated: 2026-03-03T16:13:50.837Z

## Summary

- Legacy handleRequest actions discovered: 222
- Native explicit modern coverage: 222
- Native default fallback coverage: 0
- Bridge coverage (explicit + fallback): 0
- Bridge explicit route mapping: 0
- Bridge wildcard fallback mapping: 0
- Legacy unresolved: 0

## Module Coverage

| Module | Legacy Actions | Native Explicit | Native Default Fallback | Bridge | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| activity | 2 | 2 | 0 | 0 | 0 |
| attachments | 1 | 1 | 0 | 0 | 0 |
| calendar | 5 | 5 | 0 | 0 | 0 |
| candidates | 27 | 27 | 0 | 0 | 0 |
| companies | 9 | 9 | 0 | 0 | 0 |
| contacts | 9 | 9 | 0 | 0 | 0 |
| dashboard | 2 | 2 | 0 | 0 | 0 |
| export | 2 | 2 | 0 | 0 | 0 |
| gdpr | 2 | 2 | 0 | 0 | 0 |
| graphs | 5 | 5 | 0 | 0 | 0 |
| home | 22 | 22 | 0 | 0 | 0 |
| import | 15 | 15 | 0 | 0 | 0 |
| joborders | 24 | 24 | 0 | 0 | 0 |
| kpis | 1 | 1 | 0 | 0 | 0 |
| lists | 8 | 8 | 0 | 0 | 0 |
| login | 7 | 7 | 0 | 0 | 0 |
| logs | 1 | 1 | 0 | 0 | 0 |
| reports | 11 | 11 | 0 | 0 | 0 |
| rss | 1 | 1 | 0 | 0 | 0 |
| settings | 58 | 58 | 0 | 0 | 0 |
| toolbar | 8 | 8 | 0 | 0 | 0 |
| wizard | 1 | 1 | 0 | 0 | 0 |
| xml | 1 | 1 | 0 | 0 | 0 |

## In-Scope Missing or Fallback Actions

These are legacy actions for modernized modules that are not mapped as explicit native routes.

- None.
## Full Action Matrix

| Module | Action | Classification | Resolved Route | Component |
| --- | --- | --- | --- | --- |
| activity | listByViewDataGrid | native-explicit | activity.listbyviewdatagrid | ActivityListPage |
| activity | viewByDate | native-explicit | activity.viewbydate | ActivityListPage |
| attachments | getAttachment | native-explicit | attachments.getattachment | EntityUtilityActionPage |
| calendar | addEvent | native-explicit | calendar.addevent | CalendarPage |
| calendar | deleteEvent | native-explicit | calendar.deleteevent | EntityUtilityActionPage |
| calendar | dynamicData | native-explicit | calendar.dynamicdata | EntityUtilityActionPage |
| calendar | editEvent | native-explicit | calendar.editevent | CalendarPage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | native-explicit-guarded | candidates.addactivitychangestatus | CandidatesShowPage |
| candidates | addCandidateTags | native-explicit-guarded | candidates.addcandidatetags | CandidatesShowPage |
| candidates | addDuplicates | native-explicit-guarded | candidates.addduplicates | EntityUtilityActionPage |
| candidates | addEditImage | native-explicit-guarded | candidates.addeditimage | EntityUtilityActionPage |
| candidates | addProfileComment | native-explicit-guarded | candidates.addprofilecomment | CandidatesShowPage |
| candidates | addToPipeline | native-explicit-guarded | candidates.addtopipeline | CandidatesShowPage |
| candidates | administrativeHideShow | native-explicit-guarded | candidates.administrativehideshow | CandidatesShowPage |
| candidates | considerForJobSearch | native-explicit-guarded | candidates.considerforjobsearch | CandidateAssignActionPage |
| candidates | createAttachment | native-explicit-guarded | candidates.createattachment | CandidatesShowPage |
| candidates | delete | native-explicit-guarded | candidates.delete | EntityDeleteActionPage |
| candidates | deleteAttachment | native-explicit-guarded | candidates.deleteattachment | CandidatesShowPage |
| candidates | deleteMessageThread | native-explicit-guarded | candidates.deletemessagethread | CandidatesShowPage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | native-explicit | candidates.emailcandidates | EntityUtilityActionPage |
| candidates | linkDuplicate | native-explicit-guarded | candidates.linkduplicate | EntityUtilityActionPage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | native-explicit-guarded | candidates.merge | EntityUtilityActionPage |
| candidates | mergeInfo | native-explicit | candidates.mergeinfo | EntityUtilityActionPage |
| candidates | postMessage | native-explicit-guarded | candidates.postmessage | CandidatesShowPage |
| candidates | removeDuplicity | native-explicit-guarded | candidates.removeduplicity | EntityUtilityActionPage |
| candidates | removeFromPipeline | native-explicit-guarded | candidates.removefrompipeline | CandidatesShowPage |
| candidates | saveSources | native-explicit | candidates.savesources | EntityUtilityActionPage |
| candidates | search | native-explicit | candidates.search | CandidatesListPage |
| candidates | show | native-explicit-guarded | candidates.show | CandidatesShowPage |
| candidates | show_questionnaire | native-explicit-guarded | candidates.show_questionnaire | CandidateQuestionnaireActionPage |
| candidates | viewResume | native-explicit-guarded | candidates.viewresume | CandidateResumeActionPage |
| companies | add | native-explicit | companies.add | CompaniesAddPage |
| companies | createAttachment | native-explicit-guarded | companies.createattachment | CompaniesShowPage |
| companies | delete | native-explicit-guarded | companies.delete | EntityDeleteActionPage |
| companies | deleteAttachment | native-explicit-guarded | companies.deleteattachment | CompaniesShowPage |
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
| export | export | native-explicit | export.export | EntityUtilityActionPage |
| export | exportByDataGrid | native-explicit | export.exportbydatagrid | EntityUtilityActionPage |
| gdpr | export | native-explicit | gdpr.export | EntityUtilityActionPage |
| gdpr | requests | native-explicit | gdpr.requests | EntityUtilityActionPage |
| graphs | generic | native-explicit | graphs.generic | GraphsActionPage |
| graphs | genericPie | native-explicit | graphs.genericpie | GraphsActionPage |
| graphs | jobOrderReportGraph | native-explicit | graphs.joborderreportgraph | GraphsActionPage |
| graphs | testGraph | native-explicit | graphs.testgraph | GraphsActionPage |
| graphs | wordVerify | native-explicit | graphs.wordverify | GraphsActionPage |
| home | addPersonalItem | native-explicit | home.addpersonalitem | HomeMyNotesPage |
| home | addSavedSearch | native-explicit | home.addsavedsearch | HomePage |
| home | appendPersonalNote | native-explicit | home.appendpersonalnote | HomeMyNotesPage |
| home | archiveInboxThread | native-explicit | home.archiveinboxthread | HomeInboxPage |
| home | createInboxNote | native-explicit | home.createinboxnote | HomeInboxPage |
| home | createInboxTodo | native-explicit | home.createinboxtodo | HomeInboxPage |
| home | deleteInboxThread | native-explicit | home.deleteinboxthread | HomeInboxPage |
| home | deletePersonalItem | native-explicit | home.deletepersonalitem | HomeMyNotesPage |
| home | deleteSavedSearch | native-explicit | home.deletesavedsearch | HomePage |
| home | home | native-explicit | home.home | HomePage |
| home | inbox | native-explicit | home.inbox | HomeInboxPage |
| home | movePersonalNoteToTodo | native-explicit | home.movepersonalnotetotodo | HomeMyNotesPage |
| home | myNotes | native-explicit | home.mynotes | HomeMyNotesPage |
| home | postInboxMessage | native-explicit | home.postinboxmessage | HomeInboxPage |
| home | quickSearch | native-explicit | home.quicksearch | HomeQuickSearchPage |
| home | sendPersonalNote | native-explicit | home.sendpersonalnote | HomeMyNotesPage |
| home | setPersonalNoteArchived | native-explicit | home.setpersonalnotearchived | HomeMyNotesPage |
| home | setPersonalTodoStatus | native-explicit | home.setpersonaltodostatus | HomeMyNotesPage |
| home | submitFeedback | native-explicit | home.submitfeedback | HomePage |
| home | togglePersonalTodo | native-explicit | home.togglepersonaltodo | HomeMyNotesPage |
| home | updatePersonalNote | native-explicit | home.updatepersonalnote | HomeMyNotesPage |
| home | updatePersonalTodo | native-explicit | home.updatepersonaltodo | HomeMyNotesPage |
| import | commit | native-explicit | import.commit | LegacyRedirectPage |
| import | deleteBulkResumes | native-explicit | import.deletebulkresumes | EntityUtilityActionPage |
| import | import | native-explicit | import.import | LegacyRedirectPage |
| import | importBulkResumes | native-explicit | import.importbulkresumes | EntityUtilityActionPage |
| import | importSelectType | native-explicit | import.importselecttype | EntityUtilityActionPage |
| import | importUploadFile | native-explicit | import.importuploadfile | LegacyRedirectPage |
| import | importUploadResume | native-explicit | import.importuploadresume | EntityUtilityActionPage |
| import | massImport | native-explicit | import.massimport | EntityUtilityActionPage |
| import | massImportDocument | native-explicit | import.massimportdocument | EntityUtilityActionPage |
| import | massImportEdit | native-explicit | import.massimportedit | EntityUtilityActionPage |
| import | revert | native-explicit | import.revert | EntityUtilityActionPage |
| import | showMassImport | native-explicit | import.showmassimport | EntityUtilityActionPage |
| import | viewerrors | native-explicit | import.viewerrors | EntityUtilityActionPage |
| import | viewpending | native-explicit | import.viewpending | EntityUtilityActionPage |
| import | whatIsBulkResumes | native-explicit | import.whatisbulkresumes | EntityUtilityActionPage |
| joborders | add | native-explicit | joborders.add | JobOrdersAddPage |
| joborders | addActivityChangeStatus | native-explicit-guarded | joborders.addactivitychangestatus | JobOrdersShowPage |
| joborders | addCandidateModal | native-explicit-guarded | joborders.addcandidatemodal | CandidatesAddPage |
| joborders | addJobOrderPopup | native-explicit | joborders.addjoborderpopup | JobOrderAddActionPage |
| joborders | addProfileComment | native-explicit-guarded | joborders.addprofilecomment | JobOrdersShowPage |
| joborders | addToPipeline | native-explicit-guarded | joborders.addtopipeline | JobOrdersShowPage |
| joborders | administrativeHideShow | native-explicit-guarded | joborders.administrativehideshow | JobOrdersShowPage |
| joborders | companyContext | native-explicit-guarded | joborders.companycontext | JobOrderCompanyContextActionPage |
| joborders | considerCandidateSearch | native-explicit-guarded | joborders.considercandidatesearch | JobOrderAssignActionPage |
| joborders | createAttachment | native-explicit-guarded | joborders.createattachment | JobOrdersShowPage |
| joborders | delete | native-explicit-guarded | joborders.delete | EntityDeleteActionPage |
| joborders | deleteAttachment | native-explicit-guarded | joborders.deleteattachment | JobOrdersShowPage |
| joborders | deleteMessageThread | native-explicit-guarded | joborders.deletemessagethread | JobOrdersShowPage |
| joborders | edit | native-explicit-guarded | joborders.edit | JobOrdersEditPage |
| joborders | editHiringPlan | native-explicit-guarded | joborders.edithiringplan | EntityUtilityActionPage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineStatusDetails | native-explicit-guarded | joborders.pipelinestatusdetails | PipelineStatusActionPage |
| joborders | pipelineStatusEditDate | native-explicit-guarded | joborders.pipelinestatuseditdate | PipelineStatusActionPage |
| joborders | postMessage | native-explicit-guarded | joborders.postmessage | JobOrdersShowPage |
| joborders | recruiterAllocation | native-explicit | joborders.recruiterallocation | JobOrdersRecruiterAllocationPage |
| joborders | removeFromPipeline | native-explicit-guarded | joborders.removefrompipeline | JobOrdersShowPage |
| joborders | search | native-explicit | joborders.search | JobOrdersListPage |
| joborders | setMonitoredJobOrder | native-explicit-guarded | joborders.setmonitoredjoborder | JobOrderMonitorActionPage |
| joborders | show | native-explicit-guarded | joborders.show | JobOrdersShowPage |
| kpis | details | native-explicit | kpis.details | KpisDetailsPage |
| lists | addToListFromDatagridModal | native-explicit-guarded | lists.addtolistfromdatagridmodal | ListsActionPage |
| lists | deleteStaticList | native-explicit-guarded | lists.deletestaticlist | ListsDetailPage |
| lists | listByView | native-explicit | lists.listbyview | ListsManagePage |
| lists | quickActionAddToListModal | native-explicit-guarded | lists.quickactionaddtolistmodal | ListsActionPage |
| lists | removeFromListDatagrid | native-explicit-guarded | lists.removefromlistdatagrid | ListsDetailPage |
| lists | saveListAccess | native-explicit-guarded | lists.savelistaccess | ListsDetailPage |
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
| reports | customerDashboardDetails | native-explicit | reports.customerdashboarddetails | ReportsCustomerDashboardPage |
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
| settings | addEmailTemplate | native-explicit | settings.addemailtemplate | EntityUtilityActionPage |
| settings | addUser | native-explicit | settings.adduser | EntityUtilityActionPage |
| settings | administration | native-explicit | settings.administration | EntityUtilityActionPage |
| settings | ajax_tags_add | native-explicit | settings.ajax_tags_add | EntityUtilityActionPage |
| settings | ajax_tags_del | native-explicit | settings.ajax_tags_del | EntityUtilityActionPage |
| settings | ajax_tags_upd | native-explicit | settings.ajax_tags_upd | EntityUtilityActionPage |
| settings | ajax_wizardAddUser | native-explicit | settings.ajax_wizardadduser | EntityUtilityActionPage |
| settings | ajax_wizardCheckKey | native-explicit | settings.ajax_wizardcheckkey | EntityUtilityActionPage |
| settings | ajax_wizardDeleteUser | native-explicit | settings.ajax_wizarddeleteuser | EntityUtilityActionPage |
| settings | ajax_wizardEmail | native-explicit | settings.ajax_wizardemail | EntityUtilityActionPage |
| settings | ajax_wizardFirstTimeSetup | native-explicit | settings.ajax_wizardfirsttimesetup | EntityUtilityActionPage |
| settings | ajax_wizardImport | native-explicit | settings.ajax_wizardimport | EntityUtilityActionPage |
| settings | ajax_wizardLicense | native-explicit | settings.ajax_wizardlicense | EntityUtilityActionPage |
| settings | ajax_wizardLocalization | native-explicit | settings.ajax_wizardlocalization | EntityUtilityActionPage |
| settings | ajax_wizardPassword | native-explicit | settings.ajax_wizardpassword | EntityUtilityActionPage |
| settings | ajax_wizardSiteName | native-explicit | settings.ajax_wizardsitename | EntityUtilityActionPage |
| settings | ajax_wizardWebsite | native-explicit | settings.ajax_wizardwebsite | EntityUtilityActionPage |
| settings | aspLocalization | native-explicit | settings.asplocalization | EntityUtilityActionPage |
| settings | careerPortalQuestionnaire | native-explicit | settings.careerportalquestionnaire | EntityUtilityActionPage |
| settings | careerPortalQuestionnairePreview | native-explicit | settings.careerportalquestionnairepreview | EntityUtilityActionPage |
| settings | careerPortalQuestionnaireUpdate | native-explicit | settings.careerportalquestionnaireupdate | EntityUtilityActionPage |
| settings | careerPortalSettings | native-explicit | settings.careerportalsettings | EntityUtilityActionPage |
| settings | careerPortalTemplateEdit | native-explicit | settings.careerportaltemplateedit | EntityUtilityActionPage |
| settings | changePassword | native-explicit | settings.changepassword | EntityUtilityActionPage |
| settings | createBackup | native-explicit | settings.createbackup | EntityUtilityActionPage |
| settings | customizeCalendar | native-explicit | settings.customizecalendar | EntityUtilityActionPage |
| settings | customizeExtraFields | native-explicit | settings.customizeextrafields | EntityUtilityActionPage |
| settings | deleteBackup | native-explicit | settings.deletebackup | EntityUtilityActionPage |
| settings | deleteEmailTemplate | native-explicit | settings.deleteemailtemplate | EntityUtilityActionPage |
| settings | deleteUser | native-explicit | settings.deleteuser | EntityUtilityActionPage |
| settings | editUser | native-explicit | settings.edituser | EntityUtilityActionPage |
| settings | eeo | native-explicit | settings.eeo | EntityUtilityActionPage |
| settings | emailSettings | native-explicit | settings.emailsettings | EntityUtilityActionPage |
| settings | emailTemplates | native-explicit | settings.emailtemplates | EntityUtilityActionPage |
| settings | feedbackSettings | native-explicit | settings.feedbacksettings | EntityUtilityActionPage |
| settings | forceEmail | native-explicit | settings.forceemail | EntityUtilityActionPage |
| settings | gdprSettings | native-explicit | settings.gdprsettings | EntityUtilityActionPage |
| settings | getFirefoxModal | native-explicit | settings.getfirefoxmodal | EntityUtilityActionPage |
| settings | googleOIDCSettings | native-explicit | settings.googleoidcsettings | EntityUtilityActionPage |
| settings | loginActivity | native-explicit | settings.loginactivity | EntityUtilityActionPage |
| settings | manageUsers | native-explicit | settings.manageusers | EntityUtilityActionPage |
| settings | myProfile | native-explicit | settings.myprofile | EntityUtilityActionPage |
| settings | newInstallFinished | native-explicit | settings.newinstallfinished | EntityUtilityActionPage |
| settings | newInstallPassword | native-explicit | settings.newinstallpassword | EntityUtilityActionPage |
| settings | newSiteName | native-explicit | settings.newsitename | EntityUtilityActionPage |
| settings | onCareerPortalTweak | native-explicit | settings.oncareerportaltweak | EntityUtilityActionPage |
| settings | previewPage | native-explicit | settings.previewpage | EntityUtilityActionPage |
| settings | previewPageTop | native-explicit | settings.previewpagetop | EntityUtilityActionPage |
| settings | professional | native-explicit | settings.professional | EntityUtilityActionPage |
| settings | rejectionReasons | native-explicit | settings.rejectionreasons | EntityUtilityActionPage |
| settings | reports | native-explicit | settings.reports | EntityUtilityActionPage |
| settings | rolePagePermissions | native-explicit | settings.rolepagepermissions | EntityUtilityActionPage |
| settings | schemaMigrations | native-explicit | settings.schemamigrations | EntityUtilityActionPage |
| settings | showUser | native-explicit | settings.showuser | EntityUtilityActionPage |
| settings | tags | native-explicit | settings.tags | EntityUtilityActionPage |
| settings | talentFitFlowSettings | native-explicit | settings.talentfitflowsettings | EntityUtilityActionPage |
| settings | upgradeSiteName | native-explicit | settings.upgradesitename | EntityUtilityActionPage |
| settings | viewItemHistory | native-explicit | settings.viewitemhistory | EntityUtilityActionPage |
| toolbar | attemptLogin | native-explicit | toolbar.attemptlogin | EntityUtilityActionPage |
| toolbar | authenticate | native-explicit | toolbar.authenticate | EntityUtilityActionPage |
| toolbar | checkEmailIsInSystem | native-explicit | toolbar.checkemailisinsystem | EntityUtilityActionPage |
| toolbar | getJavaScriptLib | native-explicit | toolbar.getjavascriptlib | EntityUtilityActionPage |
| toolbar | getLicenseKey | native-explicit | toolbar.getlicensekey | EntityUtilityActionPage |
| toolbar | getRemoteVersion | native-explicit | toolbar.getremoteversion | EntityUtilityActionPage |
| toolbar | install | native-explicit | toolbar.install | EntityUtilityActionPage |
| toolbar | storeMonsterResumeText | native-explicit | toolbar.storemonsterresumetext | EntityUtilityActionPage |
| wizard | ajax_getPage | native-explicit | wizard.ajax_getpage | EntityUtilityActionPage |
| xml | jobOrders | native-explicit | xml.joborders | EntityUtilityActionPage |
