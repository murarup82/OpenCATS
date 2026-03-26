# Modern UI Route Coverage Matrix

Generated: 2026-03-26T05:31:52.203Z

This report classifies routeRegistry mappings into true native UI routes, intentional legacy-forward endpoints/wrappers, and bridge fallbacks.

## Summary

- Total route mappings: **251**
- True native UI mappings: **140**
- Intentional legacy-forward mappings: **110**
- Bridge mappings: **1**
- True native UI coverage (mapping-level): **55.8%**

## Module Summary

- `*`: native-ui=0, legacy-forward=0, bridge=1
- `activity`: native-ui=3, legacy-forward=0, bridge=0
- `attachments`: native-ui=0, legacy-forward=1, bridge=0
- `calendar`: native-ui=5, legacy-forward=1, bridge=0
- `candidates`: native-ui=22, legacy-forward=9, bridge=0
- `companies`: native-ui=11, legacy-forward=0, bridge=0
- `contacts`: native-ui=11, legacy-forward=0, bridge=0
- `dashboard`: native-ui=3, legacy-forward=0, bridge=0
- `export`: native-ui=0, legacy-forward=2, bridge=0
- `gdpr`: native-ui=1, legacy-forward=1, bridge=0
- `graphs`: native-ui=1, legacy-forward=5, bridge=0
- `home`: native-ui=23, legacy-forward=0, bridge=0
- `import`: native-ui=3, legacy-forward=12, bridge=0
- `joborders`: native-ui=28, legacy-forward=2, bridge=0
- `kpis`: native-ui=2, legacy-forward=0, bridge=0
- `lists`: native-ui=9, legacy-forward=0, bridge=0
- `login`: native-ui=5, legacy-forward=4, bridge=0
- `logs`: native-ui=3, legacy-forward=0, bridge=0
- `queue`: native-ui=1, legacy-forward=0, bridge=0
- `reports`: native-ui=6, legacy-forward=6, bridge=0
- `rss`: native-ui=1, legacy-forward=0, bridge=0
- `settings`: native-ui=1, legacy-forward=57, bridge=0
- `sourcing`: native-ui=1, legacy-forward=0, bridge=0
- `toolbar`: native-ui=0, legacy-forward=8, bridge=0
- `wizard`: native-ui=0, legacy-forward=1, bridge=0
- `xml`: native-ui=0, legacy-forward=1, bridge=0

## Intentional Legacy-Forward Routes

| Route | Component | Guarded |
| --- | --- | --- |
| `attachments.getattachment` | `LegacyDownloadForwardActionPage` | no |
| `calendar.dynamicdata` | `UtilityEndpointForwardActionPage` | no |
| `candidates.addduplicates` | `CandidatesWorkspaceActionPage` | yes |
| `candidates.addeditimage` | `CandidatesWorkspaceActionPage` | yes |
| `candidates.emailcandidates` | `CandidatesWorkspaceActionPage` | no |
| `candidates.linkduplicate` | `CandidatesWorkspaceActionPage` | yes |
| `candidates.merge` | `CandidatesWorkspaceActionPage` | yes |
| `candidates.mergeinfo` | `CandidatesWorkspaceActionPage` | no |
| `candidates.removeduplicity` | `CandidatesWorkspaceActionPage` | yes |
| `candidates.savedlists` | `CandidatesWorkspaceActionPage` | no |
| `candidates.savesources` | `CandidatesWorkspaceActionPage` | no |
| `export.export` | `LegacyDownloadForwardActionPage` | no |
| `export.exportbydatagrid` | `LegacyDownloadForwardActionPage` | no |
| `gdpr.export` | `LegacyDownloadForwardActionPage` | no |
| `graphs.generic` | `GraphsWorkspaceActionPage` | no |
| `graphs.genericpie` | `GraphsWorkspaceActionPage` | no |
| `graphs.joborderreportgraph` | `GraphsWorkspaceActionPage` | no |
| `graphs.testgraph` | `GraphsWorkspaceActionPage` | no |
| `graphs.wordverify` | `GraphsWorkspaceActionPage` | no |
| `import.deletebulkresumes` | `ImportWorkflowActionPage` | no |
| `import.importbulkresumes` | `ImportWorkflowActionPage` | no |
| `import.importselecttype` | `ImportWorkflowActionPage` | no |
| `import.importuploadresume` | `ImportWorkflowActionPage` | no |
| `import.massimport` | `ImportWorkflowActionPage` | no |
| `import.massimportdocument` | `ImportWorkflowActionPage` | no |
| `import.massimportedit` | `ImportWorkflowActionPage` | no |
| `import.revert` | `ImportWorkflowActionPage` | no |
| `import.showmassimport` | `ImportWorkflowActionPage` | no |
| `import.viewerrors` | `ImportWorkflowActionPage` | no |
| `import.viewpending` | `ImportWorkflowActionPage` | no |
| `import.whatisbulkresumes` | `ImportWorkflowActionPage` | no |
| `joborders.edithiringplan` | `OperationsWorkspaceActionPage` | yes |
| `joborders.setcandidatejoborder` | `OperationsWorkspaceActionPage` | yes |
| `login.attemptlogin` | `LoginLegacyActionPage` | no |
| `login.googlecallback` | `LoginLegacyActionPage` | no |
| `login.googledrivestart` | `LoginLegacyActionPage` | no |
| `login.googlestart` | `LoginLegacyActionPage` | no |
| `reports.customizeeeoreport` | `ReportsWorkflowActionPage` | no |
| `reports.customizejoborderreport` | `ReportsWorkflowActionPage` | no |
| `reports.generateeeoreportpreview` | `ReportsWorkflowActionPage` | no |
| `reports.showhirereport` | `ReportsWorkflowActionPage` | no |
| `reports.showplacementreport` | `ReportsWorkflowActionPage` | no |
| `reports.showsubmissionreport` | `ReportsWorkflowActionPage` | no |
| `settings.addemailtemplate` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.adduser` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.administration` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.ajax_tags_add` | `SettingsTagsActionPage` | no |
| `settings.ajax_tags_del` | `SettingsTagsActionPage` | no |
| `settings.ajax_tags_upd` | `SettingsTagsActionPage` | no |
| `settings.ajax_wizardadduser` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardcheckkey` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizarddeleteuser` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardemail` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardfirsttimesetup` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardimport` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardlicense` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardlocalization` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardpassword` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardsitename` | `SettingsWizardActionPage` | no |
| `settings.ajax_wizardwebsite` | `SettingsWizardActionPage` | no |
| `settings.asplocalization` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.careerportalquestionnaire` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.careerportalquestionnairepreview` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.careerportalquestionnaireupdate` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.careerportalsettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.careerportaltemplateedit` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.changepassword` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.createbackup` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.customizecalendar` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.customizeextrafields` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.deletebackup` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.deleteemailtemplate` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.deleteuser` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.edituser` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.eeo` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.emailsettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.emailtemplates` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.feedbacksettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.forceemail` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.gdprsettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.getfirefoxmodal` | `OperationsWorkspaceActionPage` | no |
| `settings.googleoidcsettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.loginactivity` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.manageusers` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.newinstallfinished` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.newinstallpassword` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.newsitename` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.oncareerportaltweak` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.previewpage` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.previewpagetop` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.professional` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.rejectionreasons` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.reports` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.rolepagepermissions` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.schemamigrations` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.showuser` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.tags` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.talentfitflowsettings` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.upgradesitename` | `SettingsAdminWorkspaceActionPage` | no |
| `settings.viewitemhistory` | `SettingsAdminWorkspaceActionPage` | no |
| `toolbar.attemptlogin` | `LoginLegacyActionPage` | no |
| `toolbar.authenticate` | `LoginLegacyActionPage` | no |
| `toolbar.checkemailisinsystem` | `UtilityEndpointForwardActionPage` | no |
| `toolbar.getjavascriptlib` | `UtilityEndpointForwardActionPage` | no |
| `toolbar.getlicensekey` | `UtilityEndpointForwardActionPage` | no |
| `toolbar.getremoteversion` | `UtilityEndpointForwardActionPage` | no |
| `toolbar.install` | `OperationsWorkspaceActionPage` | no |
| `toolbar.storemonsterresumetext` | `UtilityEndpointForwardActionPage` | no |
| `wizard.ajax_getpage` | `UtilityEndpointForwardActionPage` | no |
| `xml.joborders` | `LegacyDownloadForwardActionPage` | no |

## Bridge Routes

| Route | Component | Guarded |
| --- | --- | --- |
| `*.*` | `ModuleBridgePage` | no |

## Full Route Detail

| Route | Component | Coverage | Guarded Params |
| --- | --- | --- | --- |
| `*.*` | `ModuleBridgePage` | bridge | - |
| `activity.(default)` | `ActivityListPage` | native-ui | - |
| `activity.listbyviewdatagrid` | `ActivityListPage` | native-ui | - |
| `activity.viewbydate` | `ActivityListPage` | native-ui | - |
| `attachments.getattachment` | `LegacyDownloadForwardActionPage` | legacy-forward | - |
| `calendar.(default)` | `CalendarPage` | native-ui | - |
| `calendar.addevent` | `CalendarPage` | native-ui | - |
| `calendar.deleteevent` | `CalendarPage` | native-ui | - |
| `calendar.dynamicdata` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `calendar.editevent` | `CalendarPage` | native-ui | - |
| `calendar.showcalendar` | `CalendarPage` | native-ui | - |
| `candidates.(default)` | `CandidatesListPage` | native-ui | - |
| `candidates.add` | `CandidatesAddPage` | native-ui | - |
| `candidates.addactivitychangestatus` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.addcandidatetags` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.addduplicates` | `CandidatesWorkspaceActionPage` | legacy-forward | candidateID, duplicateCandidateID |
| `candidates.addeditimage` | `CandidatesWorkspaceActionPage` | legacy-forward | candidateID |
| `candidates.addprofilecomment` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.addtopipeline` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.administrativehideshow` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.considerforjobsearch` | `CandidateAssignActionPage` | native-ui | candidateID |
| `candidates.createattachment` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.delete` | `EntityDeleteActionPage` | native-ui | candidateID |
| `candidates.deleteattachment` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.deletemessagethread` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.edit` | `CandidatesEditPage` | native-ui | candidateID |
| `candidates.emailcandidates` | `CandidatesWorkspaceActionPage` | legacy-forward | - |
| `candidates.googledrivedeleteattachmentfile` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.googledriveuploadattachment` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.linkduplicate` | `CandidatesWorkspaceActionPage` | legacy-forward | candidateID |
| `candidates.listbyview` | `CandidatesListPage` | native-ui | - |
| `candidates.merge` | `CandidatesWorkspaceActionPage` | legacy-forward | oldCandidateID, newCandidateID |
| `candidates.mergeinfo` | `CandidatesWorkspaceActionPage` | legacy-forward | - |
| `candidates.postmessage` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.removeduplicity` | `CandidatesWorkspaceActionPage` | legacy-forward | oldCandidateID, newCandidateID |
| `candidates.removefrompipeline` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.savedlists` | `CandidatesWorkspaceActionPage` | legacy-forward | - |
| `candidates.savesources` | `CandidatesWorkspaceActionPage` | legacy-forward | - |
| `candidates.search` | `CandidatesListPage` | native-ui | - |
| `candidates.show` | `CandidatesShowPage` | native-ui | candidateID |
| `candidates.show_questionnaire` | `CandidateQuestionnaireActionPage` | native-ui | candidateID |
| `candidates.viewresume` | `CandidateResumeActionPage` | native-ui | attachmentID |
| `companies.(default)` | `CompaniesListPage` | native-ui | - |
| `companies.add` | `CompaniesAddPage` | native-ui | - |
| `companies.createattachment` | `CompaniesShowPage` | native-ui | companyID |
| `companies.delete` | `EntityDeleteActionPage` | native-ui | companyID |
| `companies.deleteattachment` | `CompaniesShowPage` | native-ui | companyID |
| `companies.edit` | `CompaniesEditPage` | native-ui | companyID |
| `companies.internalpostings` | `CompaniesInternalPostingsActionPage` | native-ui | - |
| `companies.list` | `CompaniesListPage` | native-ui | - |
| `companies.listbyview` | `CompaniesListPage` | native-ui | - |
| `companies.search` | `CompaniesListPage` | native-ui | - |
| `companies.show` | `CompaniesShowPage` | native-ui | companyID |
| `contacts.(default)` | `ContactsListPage` | native-ui | - |
| `contacts.add` | `ContactsAddPage` | native-ui | - |
| `contacts.addactivityscheduleevent` | `ContactActivityActionPage` | native-ui | contactID |
| `contacts.delete` | `EntityDeleteActionPage` | native-ui | contactID |
| `contacts.downloadvcard` | `ContactVCardActionPage` | native-ui | contactID |
| `contacts.edit` | `ContactsEditPage` | native-ui | contactID |
| `contacts.list` | `ContactsListPage` | native-ui | - |
| `contacts.listbyview` | `ContactsListPage` | native-ui | - |
| `contacts.search` | `ContactsListPage` | native-ui | - |
| `contacts.show` | `ContactsShowPage` | native-ui | contactID |
| `contacts.showcoldcalllist` | `ContactsColdCallListPage` | native-ui | - |
| `dashboard.(default)` | `DashboardMyPage` | native-ui | - |
| `dashboard.my` | `DashboardMyPage` | native-ui | - |
| `dashboard.setpipelinestatus` | `DashboardMyPage` | native-ui | - |
| `export.export` | `LegacyDownloadForwardActionPage` | legacy-forward | - |
| `export.exportbydatagrid` | `LegacyDownloadForwardActionPage` | legacy-forward | - |
| `gdpr.export` | `LegacyDownloadForwardActionPage` | legacy-forward | - |
| `gdpr.requests` | `GdprRequestsPage` | native-ui | - |
| `graphs.(default)` | `GraphsPage` | native-ui | - |
| `graphs.generic` | `GraphsWorkspaceActionPage` | legacy-forward | - |
| `graphs.genericpie` | `GraphsWorkspaceActionPage` | legacy-forward | - |
| `graphs.joborderreportgraph` | `GraphsWorkspaceActionPage` | legacy-forward | - |
| `graphs.testgraph` | `GraphsWorkspaceActionPage` | legacy-forward | - |
| `graphs.wordverify` | `GraphsWorkspaceActionPage` | legacy-forward | - |
| `home.(default)` | `HomePage` | native-ui | - |
| `home.addpersonalitem` | `HomeMyNotesPage` | native-ui | - |
| `home.addsavedsearch` | `HomePage` | native-ui | - |
| `home.appendpersonalnote` | `HomeMyNotesPage` | native-ui | - |
| `home.archiveinboxthread` | `HomeInboxPage` | native-ui | - |
| `home.createinboxnote` | `HomeInboxPage` | native-ui | - |
| `home.createinboxtodo` | `HomeInboxPage` | native-ui | - |
| `home.deleteinboxthread` | `HomeInboxPage` | native-ui | - |
| `home.deletepersonalitem` | `HomeMyNotesPage` | native-ui | - |
| `home.deletesavedsearch` | `HomePage` | native-ui | - |
| `home.home` | `HomePage` | native-ui | - |
| `home.inbox` | `HomeInboxPage` | native-ui | - |
| `home.movepersonalnotetotodo` | `HomeMyNotesPage` | native-ui | - |
| `home.mynotes` | `HomeMyNotesPage` | native-ui | - |
| `home.postinboxmessage` | `HomeInboxPage` | native-ui | - |
| `home.quicksearch` | `HomeQuickSearchPage` | native-ui | - |
| `home.sendpersonalnote` | `HomeMyNotesPage` | native-ui | - |
| `home.setpersonalnotearchived` | `HomeMyNotesPage` | native-ui | - |
| `home.setpersonaltodostatus` | `HomeMyNotesPage` | native-ui | - |
| `home.submitfeedback` | `HomePage` | native-ui | - |
| `home.togglepersonaltodo` | `HomeMyNotesPage` | native-ui | - |
| `home.updatepersonalnote` | `HomeMyNotesPage` | native-ui | - |
| `home.updatepersonaltodo` | `HomeMyNotesPage` | native-ui | - |
| `import.commit` | `ImportLauncherPage` | native-ui | - |
| `import.deletebulkresumes` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.import` | `ImportLauncherPage` | native-ui | - |
| `import.importbulkresumes` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.importselecttype` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.importuploadfile` | `ImportLauncherPage` | native-ui | - |
| `import.importuploadresume` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.massimport` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.massimportdocument` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.massimportedit` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.revert` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.showmassimport` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.viewerrors` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.viewpending` | `ImportWorkflowActionPage` | legacy-forward | - |
| `import.whatisbulkresumes` | `ImportWorkflowActionPage` | legacy-forward | - |
| `joborders.(default)` | `JobOrdersListPage` | native-ui | - |
| `joborders.add` | `JobOrdersAddPage` | native-ui | - |
| `joborders.addactivitychangestatus` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.addcandidatemodal` | `CandidatesAddPage` | native-ui | jobOrderID |
| `joborders.addjoborderpopup` | `JobOrderAddActionPage` | native-ui | - |
| `joborders.addprofilecomment` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.addtopipeline` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.administrativehideshow` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.companycontext` | `JobOrderCompanyContextActionPage` | native-ui | companyID |
| `joborders.considercandidatesearch` | `JobOrderAssignActionPage` | native-ui | jobOrderID |
| `joborders.createattachment` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.delete` | `EntityDeleteActionPage` | native-ui | jobOrderID |
| `joborders.deleteattachment` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.deletemessagethread` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.edit` | `JobOrdersEditPage` | native-ui | jobOrderID |
| `joborders.edithiringplan` | `OperationsWorkspaceActionPage` | legacy-forward | jobOrderID |
| `joborders.list` | `JobOrdersListPage` | native-ui | - |
| `joborders.listbyview` | `JobOrdersListPage` | native-ui | - |
| `joborders.pipelinematrix` | `JobOrdersPipelineMatrixPage` | native-ui | - |
| `joborders.pipelinematrixdeleteview` | `JobOrdersPipelineMatrixPage` | native-ui | - |
| `joborders.pipelinematrixsaveview` | `JobOrdersPipelineMatrixPage` | native-ui | - |
| `joborders.pipelinestatusdetails` | `PipelineStatusActionPage` | native-ui | pipelineID |
| `joborders.pipelinestatuseditdate` | `PipelineStatusActionPage` | native-ui | pipelineID |
| `joborders.postmessage` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.recruiterallocation` | `JobOrdersRecruiterAllocationPage` | native-ui | - |
| `joborders.removefrompipeline` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `joborders.search` | `JobOrdersListPage` | native-ui | - |
| `joborders.setcandidatejoborder` | `OperationsWorkspaceActionPage` | legacy-forward | jobOrderID |
| `joborders.setmonitoredjoborder` | `JobOrderMonitorActionPage` | native-ui | jobOrderID |
| `joborders.show` | `JobOrdersShowPage` | native-ui | jobOrderID |
| `kpis.(default)` | `KpisPage` | native-ui | - |
| `kpis.details` | `KpisDetailsPage` | native-ui | - |
| `lists.(default)` | `ListsManagePage` | native-ui | - |
| `lists.addtolistfromdatagridmodal` | `ListsActionPage` | native-ui | dataItemType |
| `lists.deletestaticlist` | `ListsDetailPage` | native-ui | savedListID |
| `lists.listbyview` | `ListsManagePage` | native-ui | - |
| `lists.quickactionaddtolistmodal` | `ListsActionPage` | native-ui | dataItemType, dataItemID |
| `lists.removefromlistdatagrid` | `ListsDetailPage` | native-ui | savedListID |
| `lists.savelistaccess` | `ListsDetailPage` | native-ui | savedListID |
| `lists.show` | `ListsDetailPage` | native-ui | savedListID |
| `lists.showlist` | `ListsDetailPage` | native-ui | savedListID |
| `login.(default)` | `LoginPage` | native-ui | - |
| `login.attemptlogin` | `LoginLegacyActionPage` | legacy-forward | - |
| `login.forgotpassword` | `LoginPage` | native-ui | - |
| `login.googlecallback` | `LoginLegacyActionPage` | legacy-forward | - |
| `login.googledrivestart` | `LoginLegacyActionPage` | legacy-forward | - |
| `login.googlestart` | `LoginLegacyActionPage` | legacy-forward | - |
| `login.nocookiesmodal` | `LoginPage` | native-ui | - |
| `login.requestaccess` | `LoginPage` | native-ui | - |
| `login.showloginform` | `LoginPage` | native-ui | - |
| `logs.(default)` | `LogsPage` | native-ui | - |
| `logs.*` | `LogsPage` | native-ui | - |
| `logs.view` | `LogsPage` | native-ui | - |
| `queue.(default)` | `QueuePage` | native-ui | - |
| `reports.(default)` | `ReportsLauncherPage` | native-ui | - |
| `reports.customerdashboard` | `ReportsCustomerDashboardPage` | native-ui | - |
| `reports.customerdashboarddetails` | `ReportsCustomerDashboardPage` | native-ui | - |
| `reports.customizeeeoreport` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `reports.customizejoborderreport` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `reports.generateeeoreportpreview` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `reports.generatejoborderreportpdf` | `ReportsJobOrderPdfActionPage` | native-ui | - |
| `reports.graphview` | `ReportsGraphViewPage` | native-ui | - |
| `reports.reports` | `ReportsLauncherPage` | native-ui | - |
| `reports.showhirereport` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `reports.showplacementreport` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `reports.showsubmissionreport` | `ReportsWorkflowActionPage` | legacy-forward | - |
| `rss.joborders` | `RssJobOrdersPage` | native-ui | - |
| `settings.addemailtemplate` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.adduser` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.administration` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.ajax_tags_add` | `SettingsTagsActionPage` | legacy-forward | - |
| `settings.ajax_tags_del` | `SettingsTagsActionPage` | legacy-forward | - |
| `settings.ajax_tags_upd` | `SettingsTagsActionPage` | legacy-forward | - |
| `settings.ajax_wizardadduser` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardcheckkey` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizarddeleteuser` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardemail` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardfirsttimesetup` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardimport` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardlicense` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardlocalization` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardpassword` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardsitename` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.ajax_wizardwebsite` | `SettingsWizardActionPage` | legacy-forward | - |
| `settings.asplocalization` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.careerportalquestionnaire` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.careerportalquestionnairepreview` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.careerportalquestionnaireupdate` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.careerportalsettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.careerportaltemplateedit` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.changepassword` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.createbackup` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.customizecalendar` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.customizeextrafields` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.deletebackup` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.deleteemailtemplate` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.deleteuser` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.edituser` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.eeo` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.emailsettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.emailtemplates` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.feedbacksettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.forceemail` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.gdprsettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.getfirefoxmodal` | `OperationsWorkspaceActionPage` | legacy-forward | - |
| `settings.googleoidcsettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.loginactivity` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.manageusers` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.myprofile` | `SettingsMyProfilePage` | native-ui | - |
| `settings.newinstallfinished` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.newinstallpassword` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.newsitename` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.oncareerportaltweak` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.previewpage` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.previewpagetop` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.professional` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.rejectionreasons` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.reports` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.rolepagepermissions` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.schemamigrations` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.showuser` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.tags` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.talentfitflowsettings` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.upgradesitename` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `settings.viewitemhistory` | `SettingsAdminWorkspaceActionPage` | legacy-forward | - |
| `sourcing.(default)` | `SourcingPage` | native-ui | - |
| `toolbar.attemptlogin` | `LoginLegacyActionPage` | legacy-forward | - |
| `toolbar.authenticate` | `LoginLegacyActionPage` | legacy-forward | - |
| `toolbar.checkemailisinsystem` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `toolbar.getjavascriptlib` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `toolbar.getlicensekey` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `toolbar.getremoteversion` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `toolbar.install` | `OperationsWorkspaceActionPage` | legacy-forward | - |
| `toolbar.storemonsterresumetext` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `wizard.ajax_getpage` | `UtilityEndpointForwardActionPage` | legacy-forward | - |
| `xml.joborders` | `LegacyDownloadForwardActionPage` | legacy-forward | - |
