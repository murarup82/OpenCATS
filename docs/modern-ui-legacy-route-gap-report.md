# Modern UI Legacy Comparison Report

Generated: 2026-03-23T05:07:28.032Z

## Summary

- Legacy handleRequest actions discovered: 228
- Native explicit modern coverage: 228
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
| candidates | 29 | 29 | 0 | 0 | 0 |
| companies | 9 | 9 | 0 | 0 | 0 |
| contacts | 9 | 9 | 0 | 0 | 0 |
| dashboard | 2 | 2 | 0 | 0 | 0 |
| export | 2 | 2 | 0 | 0 | 0 |
| gdpr | 2 | 2 | 0 | 0 | 0 |
| graphs | 5 | 5 | 0 | 0 | 0 |
| home | 22 | 22 | 0 | 0 | 0 |
| import | 15 | 15 | 0 | 0 | 0 |
| joborders | 27 | 27 | 0 | 0 | 0 |
| kpis | 1 | 1 | 0 | 0 | 0 |
| lists | 8 | 8 | 0 | 0 | 0 |
| login | 8 | 8 | 0 | 0 | 0 |
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
| attachments | getAttachment | native-explicit | attachments.getattachment | LegacyUtilityForwardActionPage |
| calendar | addEvent | native-explicit | calendar.addevent | CalendarPage |
| calendar | deleteEvent | native-explicit | calendar.deleteevent | CalendarPage |
| calendar | dynamicData | native-explicit | calendar.dynamicdata | LegacyUtilityForwardActionPage |
| calendar | editEvent | native-explicit | calendar.editevent | CalendarPage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | native-explicit-guarded | candidates.addactivitychangestatus | CandidatesShowPage |
| candidates | addCandidateTags | native-explicit-guarded | candidates.addcandidatetags | CandidatesShowPage |
| candidates | addDuplicates | native-explicit-guarded | candidates.addduplicates | LegacyActionWorkspacePage |
| candidates | addEditImage | native-explicit-guarded | candidates.addeditimage | LegacyActionWorkspacePage |
| candidates | addProfileComment | native-explicit-guarded | candidates.addprofilecomment | CandidatesShowPage |
| candidates | addToPipeline | native-explicit-guarded | candidates.addtopipeline | CandidatesShowPage |
| candidates | administrativeHideShow | native-explicit-guarded | candidates.administrativehideshow | CandidatesShowPage |
| candidates | considerForJobSearch | native-explicit-guarded | candidates.considerforjobsearch | CandidateAssignActionPage |
| candidates | createAttachment | native-explicit-guarded | candidates.createattachment | CandidatesShowPage |
| candidates | delete | native-explicit-guarded | candidates.delete | EntityDeleteActionPage |
| candidates | deleteAttachment | native-explicit-guarded | candidates.deleteattachment | CandidatesShowPage |
| candidates | deleteMessageThread | native-explicit-guarded | candidates.deletemessagethread | CandidatesShowPage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | native-explicit | candidates.emailcandidates | LegacyActionWorkspacePage |
| candidates | googleDriveDeleteAttachmentFile | native-explicit-guarded | candidates.googledrivedeleteattachmentfile | CandidatesShowPage |
| candidates | googleDriveUploadAttachment | native-explicit-guarded | candidates.googledriveuploadattachment | CandidatesShowPage |
| candidates | linkDuplicate | native-explicit-guarded | candidates.linkduplicate | LegacyActionWorkspacePage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | native-explicit-guarded | candidates.merge | LegacyActionWorkspacePage |
| candidates | mergeInfo | native-explicit | candidates.mergeinfo | LegacyActionWorkspacePage |
| candidates | postMessage | native-explicit-guarded | candidates.postmessage | CandidatesShowPage |
| candidates | removeDuplicity | native-explicit-guarded | candidates.removeduplicity | LegacyActionWorkspacePage |
| candidates | removeFromPipeline | native-explicit-guarded | candidates.removefrompipeline | CandidatesShowPage |
| candidates | saveSources | native-explicit | candidates.savesources | LegacyActionWorkspacePage |
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
| export | export | native-explicit | export.export | LegacyUtilityForwardActionPage |
| export | exportByDataGrid | native-explicit | export.exportbydatagrid | LegacyUtilityForwardActionPage |
| gdpr | export | native-explicit | gdpr.export | LegacyUtilityForwardActionPage |
| gdpr | requests | native-explicit | gdpr.requests | LegacyActionWorkspacePage |
| graphs | generic | native-explicit | graphs.generic | LegacyActionWorkspacePage |
| graphs | genericPie | native-explicit | graphs.genericpie | LegacyActionWorkspacePage |
| graphs | jobOrderReportGraph | native-explicit | graphs.joborderreportgraph | LegacyActionWorkspacePage |
| graphs | testGraph | native-explicit | graphs.testgraph | LegacyActionWorkspacePage |
| graphs | wordVerify | native-explicit | graphs.wordverify | LegacyActionWorkspacePage |
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
| import | commit | native-explicit | import.commit | ImportLauncherPage |
| import | deleteBulkResumes | native-explicit | import.deletebulkresumes | LegacyActionWorkspacePage |
| import | import | native-explicit | import.import | ImportLauncherPage |
| import | importBulkResumes | native-explicit | import.importbulkresumes | LegacyActionWorkspacePage |
| import | importSelectType | native-explicit | import.importselecttype | LegacyActionWorkspacePage |
| import | importUploadFile | native-explicit | import.importuploadfile | ImportLauncherPage |
| import | importUploadResume | native-explicit | import.importuploadresume | LegacyActionWorkspacePage |
| import | massImport | native-explicit | import.massimport | LegacyActionWorkspacePage |
| import | massImportDocument | native-explicit | import.massimportdocument | LegacyActionWorkspacePage |
| import | massImportEdit | native-explicit | import.massimportedit | LegacyActionWorkspacePage |
| import | revert | native-explicit | import.revert | LegacyActionWorkspacePage |
| import | showMassImport | native-explicit | import.showmassimport | LegacyActionWorkspacePage |
| import | viewerrors | native-explicit | import.viewerrors | LegacyActionWorkspacePage |
| import | viewpending | native-explicit | import.viewpending | LegacyActionWorkspacePage |
| import | whatIsBulkResumes | native-explicit | import.whatisbulkresumes | LegacyActionWorkspacePage |
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
| joborders | editHiringPlan | native-explicit-guarded | joborders.edithiringplan | LegacyActionWorkspacePage |
| joborders | listByView | native-explicit | joborders.listbyview | JobOrdersListPage |
| joborders | pipelineMatrix | native-explicit | joborders.pipelinematrix | JobOrdersPipelineMatrixPage |
| joborders | pipelineMatrixDeleteView | native-explicit | joborders.pipelinematrixdeleteview | JobOrdersPipelineMatrixPage |
| joborders | pipelineMatrixSaveView | native-explicit | joborders.pipelinematrixsaveview | JobOrdersPipelineMatrixPage |
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
| login | attemptLogin | native-explicit | login.attemptlogin | LoginLegacyActionPage |
| login | forgotPassword | native-explicit | login.forgotpassword | LoginPage |
| login | googleCallback | native-explicit | login.googlecallback | LoginLegacyActionPage |
| login | googleDriveStart | native-explicit | login.googledrivestart | LoginLegacyActionPage |
| login | googleStart | native-explicit | login.googlestart | LoginLegacyActionPage |
| login | noCookiesModal | native-explicit | login.nocookiesmodal | LoginPage |
| login | requestAccess | native-explicit | login.requestaccess | LoginPage |
| login | showLoginForm | native-explicit | login.showloginform | LoginPage |
| logs | view | native-explicit | logs.view | LogsPage |
| reports | customerDashboard | native-explicit | reports.customerdashboard | ReportsCustomerDashboardPage |
| reports | customerDashboardDetails | native-explicit | reports.customerdashboarddetails | ReportsCustomerDashboardPage |
| reports | customizeEEOReport | native-explicit | reports.customizeeeoreport | LegacyActionWorkspacePage |
| reports | customizeJobOrderReport | native-explicit | reports.customizejoborderreport | LegacyActionWorkspacePage |
| reports | generateEEOReportPreview | native-explicit | reports.generateeeoreportpreview | LegacyActionWorkspacePage |
| reports | generateJobOrderReportPDF | native-explicit | reports.generatejoborderreportpdf | LegacyActionWorkspacePage |
| reports | graphView | native-explicit | reports.graphview | ReportsGraphViewPage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | native-explicit | reports.showhirereport | LegacyActionWorkspacePage |
| reports | showPlacementReport | native-explicit | reports.showplacementreport | LegacyActionWorkspacePage |
| reports | showSubmissionReport | native-explicit | reports.showsubmissionreport | LegacyActionWorkspacePage |
| rss | jobOrders | native-explicit | rss.joborders | RssJobOrdersPage |
| settings | addEmailTemplate | native-explicit | settings.addemailtemplate | LegacyActionWorkspacePage |
| settings | addUser | native-explicit | settings.adduser | LegacyActionWorkspacePage |
| settings | administration | native-explicit | settings.administration | LegacyActionWorkspacePage |
| settings | ajax_tags_add | native-explicit | settings.ajax_tags_add | LegacyUtilityForwardActionPage |
| settings | ajax_tags_del | native-explicit | settings.ajax_tags_del | LegacyUtilityForwardActionPage |
| settings | ajax_tags_upd | native-explicit | settings.ajax_tags_upd | LegacyUtilityForwardActionPage |
| settings | ajax_wizardAddUser | native-explicit | settings.ajax_wizardadduser | LegacyUtilityForwardActionPage |
| settings | ajax_wizardCheckKey | native-explicit | settings.ajax_wizardcheckkey | LegacyUtilityForwardActionPage |
| settings | ajax_wizardDeleteUser | native-explicit | settings.ajax_wizarddeleteuser | LegacyUtilityForwardActionPage |
| settings | ajax_wizardEmail | native-explicit | settings.ajax_wizardemail | LegacyUtilityForwardActionPage |
| settings | ajax_wizardFirstTimeSetup | native-explicit | settings.ajax_wizardfirsttimesetup | LegacyUtilityForwardActionPage |
| settings | ajax_wizardImport | native-explicit | settings.ajax_wizardimport | LegacyUtilityForwardActionPage |
| settings | ajax_wizardLicense | native-explicit | settings.ajax_wizardlicense | LegacyUtilityForwardActionPage |
| settings | ajax_wizardLocalization | native-explicit | settings.ajax_wizardlocalization | LegacyUtilityForwardActionPage |
| settings | ajax_wizardPassword | native-explicit | settings.ajax_wizardpassword | LegacyUtilityForwardActionPage |
| settings | ajax_wizardSiteName | native-explicit | settings.ajax_wizardsitename | LegacyUtilityForwardActionPage |
| settings | ajax_wizardWebsite | native-explicit | settings.ajax_wizardwebsite | LegacyUtilityForwardActionPage |
| settings | aspLocalization | native-explicit | settings.asplocalization | LegacyActionWorkspacePage |
| settings | careerPortalQuestionnaire | native-explicit | settings.careerportalquestionnaire | LegacyActionWorkspacePage |
| settings | careerPortalQuestionnairePreview | native-explicit | settings.careerportalquestionnairepreview | LegacyActionWorkspacePage |
| settings | careerPortalQuestionnaireUpdate | native-explicit | settings.careerportalquestionnaireupdate | LegacyActionWorkspacePage |
| settings | careerPortalSettings | native-explicit | settings.careerportalsettings | LegacyActionWorkspacePage |
| settings | careerPortalTemplateEdit | native-explicit | settings.careerportaltemplateedit | LegacyActionWorkspacePage |
| settings | changePassword | native-explicit | settings.changepassword | LegacyActionWorkspacePage |
| settings | createBackup | native-explicit | settings.createbackup | LegacyActionWorkspacePage |
| settings | customizeCalendar | native-explicit | settings.customizecalendar | LegacyActionWorkspacePage |
| settings | customizeExtraFields | native-explicit | settings.customizeextrafields | LegacyActionWorkspacePage |
| settings | deleteBackup | native-explicit | settings.deletebackup | LegacyActionWorkspacePage |
| settings | deleteEmailTemplate | native-explicit | settings.deleteemailtemplate | LegacyActionWorkspacePage |
| settings | deleteUser | native-explicit | settings.deleteuser | LegacyActionWorkspacePage |
| settings | editUser | native-explicit | settings.edituser | LegacyActionWorkspacePage |
| settings | eeo | native-explicit | settings.eeo | LegacyActionWorkspacePage |
| settings | emailSettings | native-explicit | settings.emailsettings | LegacyActionWorkspacePage |
| settings | emailTemplates | native-explicit | settings.emailtemplates | LegacyActionWorkspacePage |
| settings | feedbackSettings | native-explicit | settings.feedbacksettings | LegacyActionWorkspacePage |
| settings | forceEmail | native-explicit | settings.forceemail | LegacyActionWorkspacePage |
| settings | gdprSettings | native-explicit | settings.gdprsettings | LegacyActionWorkspacePage |
| settings | getFirefoxModal | native-explicit | settings.getfirefoxmodal | LegacyActionWorkspacePage |
| settings | googleOIDCSettings | native-explicit | settings.googleoidcsettings | LegacyActionWorkspacePage |
| settings | loginActivity | native-explicit | settings.loginactivity | LegacyActionWorkspacePage |
| settings | manageUsers | native-explicit | settings.manageusers | LegacyActionWorkspacePage |
| settings | myProfile | native-explicit | settings.myprofile | LegacyActionWorkspacePage |
| settings | newInstallFinished | native-explicit | settings.newinstallfinished | LegacyActionWorkspacePage |
| settings | newInstallPassword | native-explicit | settings.newinstallpassword | LegacyActionWorkspacePage |
| settings | newSiteName | native-explicit | settings.newsitename | LegacyActionWorkspacePage |
| settings | onCareerPortalTweak | native-explicit | settings.oncareerportaltweak | LegacyActionWorkspacePage |
| settings | previewPage | native-explicit | settings.previewpage | LegacyActionWorkspacePage |
| settings | previewPageTop | native-explicit | settings.previewpagetop | LegacyActionWorkspacePage |
| settings | professional | native-explicit | settings.professional | LegacyActionWorkspacePage |
| settings | rejectionReasons | native-explicit | settings.rejectionreasons | LegacyActionWorkspacePage |
| settings | reports | native-explicit | settings.reports | LegacyActionWorkspacePage |
| settings | rolePagePermissions | native-explicit | settings.rolepagepermissions | LegacyActionWorkspacePage |
| settings | schemaMigrations | native-explicit | settings.schemamigrations | LegacyActionWorkspacePage |
| settings | showUser | native-explicit | settings.showuser | LegacyActionWorkspacePage |
| settings | tags | native-explicit | settings.tags | LegacyActionWorkspacePage |
| settings | talentFitFlowSettings | native-explicit | settings.talentfitflowsettings | LegacyActionWorkspacePage |
| settings | upgradeSiteName | native-explicit | settings.upgradesitename | LegacyActionWorkspacePage |
| settings | viewItemHistory | native-explicit | settings.viewitemhistory | LegacyActionWorkspacePage |
| toolbar | attemptLogin | native-explicit | toolbar.attemptlogin | LegacyUtilityForwardActionPage |
| toolbar | authenticate | native-explicit | toolbar.authenticate | LegacyUtilityForwardActionPage |
| toolbar | checkEmailIsInSystem | native-explicit | toolbar.checkemailisinsystem | LegacyUtilityForwardActionPage |
| toolbar | getJavaScriptLib | native-explicit | toolbar.getjavascriptlib | LegacyUtilityForwardActionPage |
| toolbar | getLicenseKey | native-explicit | toolbar.getlicensekey | LegacyUtilityForwardActionPage |
| toolbar | getRemoteVersion | native-explicit | toolbar.getremoteversion | LegacyUtilityForwardActionPage |
| toolbar | install | native-explicit | toolbar.install | LegacyActionWorkspacePage |
| toolbar | storeMonsterResumeText | native-explicit | toolbar.storemonsterresumetext | LegacyUtilityForwardActionPage |
| wizard | ajax_getPage | native-explicit | wizard.ajax_getpage | LegacyUtilityForwardActionPage |
| xml | jobOrders | native-explicit | xml.joborders | LegacyUtilityForwardActionPage |
