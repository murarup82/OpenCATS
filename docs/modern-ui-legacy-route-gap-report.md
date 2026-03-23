# Modern UI Legacy Comparison Report

Generated: 2026-03-23T11:16:50.494Z

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
| attachments | getAttachment | native-explicit | attachments.getattachment | LegacyDownloadForwardActionPage |
| calendar | addEvent | native-explicit | calendar.addevent | CalendarPage |
| calendar | deleteEvent | native-explicit | calendar.deleteevent | CalendarPage |
| calendar | dynamicData | native-explicit | calendar.dynamicdata | UtilityEndpointForwardActionPage |
| calendar | editEvent | native-explicit | calendar.editevent | CalendarPage |
| calendar | showCalendar | native-explicit | calendar.showcalendar | CalendarPage |
| candidates | add | native-explicit | candidates.add | CandidatesAddPage |
| candidates | addActivityChangeStatus | native-explicit-guarded | candidates.addactivitychangestatus | CandidatesShowPage |
| candidates | addCandidateTags | native-explicit-guarded | candidates.addcandidatetags | CandidatesShowPage |
| candidates | addDuplicates | native-explicit-guarded | candidates.addduplicates | CandidatesWorkspaceActionPage |
| candidates | addEditImage | native-explicit-guarded | candidates.addeditimage | CandidatesWorkspaceActionPage |
| candidates | addProfileComment | native-explicit-guarded | candidates.addprofilecomment | CandidatesShowPage |
| candidates | addToPipeline | native-explicit-guarded | candidates.addtopipeline | CandidatesShowPage |
| candidates | administrativeHideShow | native-explicit-guarded | candidates.administrativehideshow | CandidatesShowPage |
| candidates | considerForJobSearch | native-explicit-guarded | candidates.considerforjobsearch | CandidateAssignActionPage |
| candidates | createAttachment | native-explicit-guarded | candidates.createattachment | CandidatesShowPage |
| candidates | delete | native-explicit-guarded | candidates.delete | EntityDeleteActionPage |
| candidates | deleteAttachment | native-explicit-guarded | candidates.deleteattachment | CandidatesShowPage |
| candidates | deleteMessageThread | native-explicit-guarded | candidates.deletemessagethread | CandidatesShowPage |
| candidates | edit | native-explicit-guarded | candidates.edit | CandidatesEditPage |
| candidates | emailCandidates | native-explicit | candidates.emailcandidates | CandidatesWorkspaceActionPage |
| candidates | googleDriveDeleteAttachmentFile | native-explicit-guarded | candidates.googledrivedeleteattachmentfile | CandidatesShowPage |
| candidates | googleDriveUploadAttachment | native-explicit-guarded | candidates.googledriveuploadattachment | CandidatesShowPage |
| candidates | linkDuplicate | native-explicit-guarded | candidates.linkduplicate | CandidatesWorkspaceActionPage |
| candidates | listByView | native-explicit | candidates.listbyview | CandidatesListPage |
| candidates | merge | native-explicit-guarded | candidates.merge | CandidatesWorkspaceActionPage |
| candidates | mergeInfo | native-explicit | candidates.mergeinfo | CandidatesWorkspaceActionPage |
| candidates | postMessage | native-explicit-guarded | candidates.postmessage | CandidatesShowPage |
| candidates | removeDuplicity | native-explicit-guarded | candidates.removeduplicity | CandidatesWorkspaceActionPage |
| candidates | removeFromPipeline | native-explicit-guarded | candidates.removefrompipeline | CandidatesShowPage |
| candidates | saveSources | native-explicit | candidates.savesources | CandidatesWorkspaceActionPage |
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
| export | export | native-explicit | export.export | LegacyDownloadForwardActionPage |
| export | exportByDataGrid | native-explicit | export.exportbydatagrid | LegacyDownloadForwardActionPage |
| gdpr | export | native-explicit | gdpr.export | LegacyDownloadForwardActionPage |
| gdpr | requests | native-explicit | gdpr.requests | OperationsWorkspaceActionPage |
| graphs | generic | native-explicit | graphs.generic | GraphsWorkspaceActionPage |
| graphs | genericPie | native-explicit | graphs.genericpie | GraphsWorkspaceActionPage |
| graphs | jobOrderReportGraph | native-explicit | graphs.joborderreportgraph | GraphsWorkspaceActionPage |
| graphs | testGraph | native-explicit | graphs.testgraph | GraphsWorkspaceActionPage |
| graphs | wordVerify | native-explicit | graphs.wordverify | GraphsWorkspaceActionPage |
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
| import | deleteBulkResumes | native-explicit | import.deletebulkresumes | ImportWorkflowActionPage |
| import | import | native-explicit | import.import | ImportLauncherPage |
| import | importBulkResumes | native-explicit | import.importbulkresumes | ImportWorkflowActionPage |
| import | importSelectType | native-explicit | import.importselecttype | ImportWorkflowActionPage |
| import | importUploadFile | native-explicit | import.importuploadfile | ImportLauncherPage |
| import | importUploadResume | native-explicit | import.importuploadresume | ImportWorkflowActionPage |
| import | massImport | native-explicit | import.massimport | ImportWorkflowActionPage |
| import | massImportDocument | native-explicit | import.massimportdocument | ImportWorkflowActionPage |
| import | massImportEdit | native-explicit | import.massimportedit | ImportWorkflowActionPage |
| import | revert | native-explicit | import.revert | ImportWorkflowActionPage |
| import | showMassImport | native-explicit | import.showmassimport | ImportWorkflowActionPage |
| import | viewerrors | native-explicit | import.viewerrors | ImportWorkflowActionPage |
| import | viewpending | native-explicit | import.viewpending | ImportWorkflowActionPage |
| import | whatIsBulkResumes | native-explicit | import.whatisbulkresumes | ImportWorkflowActionPage |
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
| joborders | editHiringPlan | native-explicit-guarded | joborders.edithiringplan | OperationsWorkspaceActionPage |
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
| reports | customizeEEOReport | native-explicit | reports.customizeeeoreport | ReportsWorkflowActionPage |
| reports | customizeJobOrderReport | native-explicit | reports.customizejoborderreport | ReportsWorkflowActionPage |
| reports | generateEEOReportPreview | native-explicit | reports.generateeeoreportpreview | ReportsWorkflowActionPage |
| reports | generateJobOrderReportPDF | native-explicit | reports.generatejoborderreportpdf | ReportsWorkflowActionPage |
| reports | graphView | native-explicit | reports.graphview | ReportsGraphViewPage |
| reports | reports | native-explicit | reports.reports | ReportsLauncherPage |
| reports | showHireReport | native-explicit | reports.showhirereport | ReportsWorkflowActionPage |
| reports | showPlacementReport | native-explicit | reports.showplacementreport | ReportsWorkflowActionPage |
| reports | showSubmissionReport | native-explicit | reports.showsubmissionreport | ReportsWorkflowActionPage |
| rss | jobOrders | native-explicit | rss.joborders | RssJobOrdersPage |
| settings | addEmailTemplate | native-explicit | settings.addemailtemplate | SettingsAdminWorkspaceActionPage |
| settings | addUser | native-explicit | settings.adduser | SettingsAdminWorkspaceActionPage |
| settings | administration | native-explicit | settings.administration | SettingsAdminWorkspaceActionPage |
| settings | ajax_tags_add | native-explicit | settings.ajax_tags_add | SettingsTagsActionPage |
| settings | ajax_tags_del | native-explicit | settings.ajax_tags_del | SettingsTagsActionPage |
| settings | ajax_tags_upd | native-explicit | settings.ajax_tags_upd | SettingsTagsActionPage |
| settings | ajax_wizardAddUser | native-explicit | settings.ajax_wizardadduser | SettingsWizardActionPage |
| settings | ajax_wizardCheckKey | native-explicit | settings.ajax_wizardcheckkey | SettingsWizardActionPage |
| settings | ajax_wizardDeleteUser | native-explicit | settings.ajax_wizarddeleteuser | SettingsWizardActionPage |
| settings | ajax_wizardEmail | native-explicit | settings.ajax_wizardemail | SettingsWizardActionPage |
| settings | ajax_wizardFirstTimeSetup | native-explicit | settings.ajax_wizardfirsttimesetup | SettingsWizardActionPage |
| settings | ajax_wizardImport | native-explicit | settings.ajax_wizardimport | SettingsWizardActionPage |
| settings | ajax_wizardLicense | native-explicit | settings.ajax_wizardlicense | SettingsWizardActionPage |
| settings | ajax_wizardLocalization | native-explicit | settings.ajax_wizardlocalization | SettingsWizardActionPage |
| settings | ajax_wizardPassword | native-explicit | settings.ajax_wizardpassword | SettingsWizardActionPage |
| settings | ajax_wizardSiteName | native-explicit | settings.ajax_wizardsitename | SettingsWizardActionPage |
| settings | ajax_wizardWebsite | native-explicit | settings.ajax_wizardwebsite | SettingsWizardActionPage |
| settings | aspLocalization | native-explicit | settings.asplocalization | SettingsAdminWorkspaceActionPage |
| settings | careerPortalQuestionnaire | native-explicit | settings.careerportalquestionnaire | SettingsAdminWorkspaceActionPage |
| settings | careerPortalQuestionnairePreview | native-explicit | settings.careerportalquestionnairepreview | SettingsAdminWorkspaceActionPage |
| settings | careerPortalQuestionnaireUpdate | native-explicit | settings.careerportalquestionnaireupdate | SettingsAdminWorkspaceActionPage |
| settings | careerPortalSettings | native-explicit | settings.careerportalsettings | SettingsAdminWorkspaceActionPage |
| settings | careerPortalTemplateEdit | native-explicit | settings.careerportaltemplateedit | SettingsAdminWorkspaceActionPage |
| settings | changePassword | native-explicit | settings.changepassword | SettingsAdminWorkspaceActionPage |
| settings | createBackup | native-explicit | settings.createbackup | SettingsAdminWorkspaceActionPage |
| settings | customizeCalendar | native-explicit | settings.customizecalendar | SettingsAdminWorkspaceActionPage |
| settings | customizeExtraFields | native-explicit | settings.customizeextrafields | SettingsAdminWorkspaceActionPage |
| settings | deleteBackup | native-explicit | settings.deletebackup | SettingsAdminWorkspaceActionPage |
| settings | deleteEmailTemplate | native-explicit | settings.deleteemailtemplate | SettingsAdminWorkspaceActionPage |
| settings | deleteUser | native-explicit | settings.deleteuser | SettingsAdminWorkspaceActionPage |
| settings | editUser | native-explicit | settings.edituser | SettingsAdminWorkspaceActionPage |
| settings | eeo | native-explicit | settings.eeo | SettingsAdminWorkspaceActionPage |
| settings | emailSettings | native-explicit | settings.emailsettings | SettingsAdminWorkspaceActionPage |
| settings | emailTemplates | native-explicit | settings.emailtemplates | SettingsAdminWorkspaceActionPage |
| settings | feedbackSettings | native-explicit | settings.feedbacksettings | SettingsAdminWorkspaceActionPage |
| settings | forceEmail | native-explicit | settings.forceemail | SettingsAdminWorkspaceActionPage |
| settings | gdprSettings | native-explicit | settings.gdprsettings | SettingsAdminWorkspaceActionPage |
| settings | getFirefoxModal | native-explicit | settings.getfirefoxmodal | OperationsWorkspaceActionPage |
| settings | googleOIDCSettings | native-explicit | settings.googleoidcsettings | SettingsAdminWorkspaceActionPage |
| settings | loginActivity | native-explicit | settings.loginactivity | SettingsAdminWorkspaceActionPage |
| settings | manageUsers | native-explicit | settings.manageusers | SettingsAdminWorkspaceActionPage |
| settings | myProfile | native-explicit | settings.myprofile | SettingsAdminWorkspaceActionPage |
| settings | newInstallFinished | native-explicit | settings.newinstallfinished | SettingsAdminWorkspaceActionPage |
| settings | newInstallPassword | native-explicit | settings.newinstallpassword | SettingsAdminWorkspaceActionPage |
| settings | newSiteName | native-explicit | settings.newsitename | SettingsAdminWorkspaceActionPage |
| settings | onCareerPortalTweak | native-explicit | settings.oncareerportaltweak | SettingsAdminWorkspaceActionPage |
| settings | previewPage | native-explicit | settings.previewpage | OperationsWorkspaceActionPage |
| settings | previewPageTop | native-explicit | settings.previewpagetop | OperationsWorkspaceActionPage |
| settings | professional | native-explicit | settings.professional | SettingsAdminWorkspaceActionPage |
| settings | rejectionReasons | native-explicit | settings.rejectionreasons | SettingsAdminWorkspaceActionPage |
| settings | reports | native-explicit | settings.reports | SettingsAdminWorkspaceActionPage |
| settings | rolePagePermissions | native-explicit | settings.rolepagepermissions | SettingsAdminWorkspaceActionPage |
| settings | schemaMigrations | native-explicit | settings.schemamigrations | SettingsAdminWorkspaceActionPage |
| settings | showUser | native-explicit | settings.showuser | SettingsAdminWorkspaceActionPage |
| settings | tags | native-explicit | settings.tags | SettingsAdminWorkspaceActionPage |
| settings | talentFitFlowSettings | native-explicit | settings.talentfitflowsettings | SettingsAdminWorkspaceActionPage |
| settings | upgradeSiteName | native-explicit | settings.upgradesitename | SettingsAdminWorkspaceActionPage |
| settings | viewItemHistory | native-explicit | settings.viewitemhistory | SettingsAdminWorkspaceActionPage |
| toolbar | attemptLogin | native-explicit | toolbar.attemptlogin | LoginLegacyActionPage |
| toolbar | authenticate | native-explicit | toolbar.authenticate | LoginLegacyActionPage |
| toolbar | checkEmailIsInSystem | native-explicit | toolbar.checkemailisinsystem | UtilityEndpointForwardActionPage |
| toolbar | getJavaScriptLib | native-explicit | toolbar.getjavascriptlib | UtilityEndpointForwardActionPage |
| toolbar | getLicenseKey | native-explicit | toolbar.getlicensekey | UtilityEndpointForwardActionPage |
| toolbar | getRemoteVersion | native-explicit | toolbar.getremoteversion | UtilityEndpointForwardActionPage |
| toolbar | install | native-explicit | toolbar.install | OperationsWorkspaceActionPage |
| toolbar | storeMonsterResumeText | native-explicit | toolbar.storemonsterresumetext | UtilityEndpointForwardActionPage |
| wizard | ajax_getPage | native-explicit | wizard.ajax_getpage | UtilityEndpointForwardActionPage |
| xml | jobOrders | native-explicit | xml.joborders | LegacyDownloadForwardActionPage |
