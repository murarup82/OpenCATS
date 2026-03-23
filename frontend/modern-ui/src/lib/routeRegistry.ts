import type { ComponentType } from 'react';
import type { UIModeBootstrap } from '../types';
import { DashboardMyPage } from '../pages/DashboardMyPage';
import { HomePage } from '../pages/HomePage';
import { HomeInboxPage } from '../pages/HomeInboxPage';
import { HomeMyNotesPage } from '../pages/HomeMyNotesPage';
import { HomeQuickSearchPage } from '../pages/HomeQuickSearchPage';
import { ImportLauncherPage } from '../pages/ImportLauncherPage';
import { KpisPage } from '../pages/KpisPage';
import { KpisDetailsPage } from '../pages/KpisDetailsPage';
import { CandidatesListPage } from '../pages/CandidatesListPage';
import { CandidateResumeActionPage } from '../pages/CandidateResumeActionPage';
import { CandidateQuestionnaireActionPage } from '../pages/CandidateQuestionnaireActionPage';
import { CandidatesShowPage } from '../pages/CandidatesShowPage';
import { CandidatesAddPage } from '../pages/CandidatesAddPage';
import { CandidatesEditPage } from '../pages/CandidatesEditPage';
import { JobOrdersAddPage } from '../pages/JobOrdersAddPage';
import { JobOrdersEditPage } from '../pages/JobOrdersEditPage';
import { JobOrdersListPage } from '../pages/JobOrdersListPage';
import { JobOrdersPipelineMatrixPage } from '../pages/JobOrdersPipelineMatrixPage';
import { JobOrdersRecruiterAllocationPage } from '../pages/JobOrdersRecruiterAllocationPage';
import { JobOrdersShowPage } from '../pages/JobOrdersShowPage';
import { CompaniesListPage } from '../pages/CompaniesListPage';
import { CompaniesShowPage } from '../pages/CompaniesShowPage';
import { CompaniesAddPage } from '../pages/CompaniesAddPage';
import { CompaniesEditPage } from '../pages/CompaniesEditPage';
import { CompaniesInternalPostingsActionPage } from '../pages/CompaniesInternalPostingsActionPage';
import { ContactsListPage } from '../pages/ContactsListPage';
import { ContactActivityActionPage } from '../pages/ContactActivityActionPage';
import { ContactsColdCallListPage } from '../pages/ContactsColdCallListPage';
import { ContactVCardActionPage } from '../pages/ContactVCardActionPage';
import { ContactsShowPage } from '../pages/ContactsShowPage';
import { ContactsAddPage } from '../pages/ContactsAddPage';
import { ContactsEditPage } from '../pages/ContactsEditPage';
import { ActivityListPage } from '../pages/ActivityListPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ListsManagePage } from '../pages/ListsManagePage';
import { ListsDetailPage } from '../pages/ListsDetailPage';
import { ListsActionPage } from '../pages/ListsActionPage';
import { ReportsLauncherPage } from '../pages/ReportsLauncherPage';
import { ReportsCustomerDashboardPage } from '../pages/ReportsCustomerDashboardPage';
import { ReportsGraphViewPage } from '../pages/ReportsGraphViewPage';
import { ReportsJobOrderPdfActionPage } from '../pages/ReportsJobOrderPdfActionPage';
import { SourcingPage } from '../pages/SourcingPage';
import { QueuePage } from '../pages/QueuePage';
import { GraphsPage } from '../pages/GraphsPage';
import { GraphsWorkspaceActionPage } from '../pages/GraphsWorkspaceActionPage';
import { LogsPage } from '../pages/LogsPage';
import { LoginPage } from '../pages/LoginPage';
import { LoginLegacyActionPage } from '../pages/LoginLegacyActionPage';
import { LegacyDownloadForwardActionPage } from '../pages/LegacyDownloadForwardActionPage';
import { UtilityEndpointForwardActionPage } from '../pages/UtilityEndpointForwardActionPage';
import { ImportWorkflowActionPage } from '../pages/ImportWorkflowActionPage';
import { OperationsWorkspaceActionPage } from '../pages/OperationsWorkspaceActionPage';
import { ReportsWorkflowActionPage } from '../pages/ReportsWorkflowActionPage';
import { SettingsAdminWorkspaceActionPage } from '../pages/SettingsAdminWorkspaceActionPage';
import { SettingsMyProfilePage } from '../pages/SettingsMyProfilePage';
import { SettingsTagsActionPage } from '../pages/SettingsTagsActionPage';
import { SettingsWizardActionPage } from '../pages/SettingsWizardActionPage';
import { GdprRequestsPage } from '../pages/GdprRequestsPage';
import { RssJobOrdersPage } from '../pages/RssJobOrdersPage';
import { CandidatesWorkspaceActionPage } from '../pages/CandidatesWorkspaceActionPage';
import { CandidateAssignActionPage } from '../pages/CandidateAssignActionPage';
import { JobOrderAssignActionPage } from '../pages/JobOrderAssignActionPage';
import { PipelineStatusActionPage } from '../pages/PipelineStatusActionPage';
import { JobOrderCompanyContextActionPage } from '../pages/JobOrderCompanyContextActionPage';
import { JobOrderAddActionPage } from '../pages/JobOrderAddActionPage';
import { JobOrderMonitorActionPage } from '../pages/JobOrderMonitorActionPage';
import { EntityDeleteActionPage } from '../pages/EntityDeleteActionPage';
import { ModuleBridgePage } from '../pages/ModuleBridgePage';
import { hasPositiveIntegerQueryParam, parseRequestQueryParams } from './routeGuards';

export type ModernRouteComponentProps = {
  bootstrap: UIModeBootstrap;
};

export type ModernRouteComponent = ComponentType<ModernRouteComponentProps>;
export type ModernRouteResolutionType = 'native' | 'bridge' | 'legacy';
export type ModernRouteResolution = {
  component: ModernRouteComponent | null;
  matchedRouteKey: string;
  resolutionType: ModernRouteResolutionType;
};

const explicitNativeActionRoutes: Record<string, ModernRouteComponent> = {
  'dashboard.setpipelinestatus': DashboardMyPage,
  'calendar.addevent': CalendarPage,
  'calendar.editevent': CalendarPage,
  'calendar.deleteevent': CalendarPage,
  'calendar.dynamicdata': UtilityEndpointForwardActionPage,
  'candidates.createattachment': CandidatesShowPage,
  'joborders.createattachment': JobOrdersShowPage,
  'joborders.addcandidatemodal': CandidatesAddPage,
  'companies.createattachment': CompaniesShowPage,
  'lists.show': ListsDetailPage,
  'lists.showlist': ListsDetailPage,
  'candidates.search': CandidatesListPage,
  'candidates.viewresume': CandidateResumeActionPage,
  'candidates.show_questionnaire': CandidateQuestionnaireActionPage,
  'joborders.search': JobOrdersListPage,
  'companies.search': CompaniesListPage,
  'companies.internalpostings': CompaniesInternalPostingsActionPage,
  'contacts.search': ContactsListPage,
  'contacts.addactivityscheduleevent': ContactActivityActionPage,
  'contacts.showcoldcalllist': ContactsColdCallListPage,
  'contacts.downloadvcard': ContactVCardActionPage,
  'candidates.considerforjobsearch': CandidateAssignActionPage,
  'joborders.considercandidatesearch': JobOrderAssignActionPage,
  'joborders.companycontext': JobOrderCompanyContextActionPage,
  'joborders.addjoborderpopup': JobOrderAddActionPage,
  'joborders.recruiterallocation': JobOrdersRecruiterAllocationPage,
  'joborders.pipelinematrix': JobOrdersPipelineMatrixPage,
  'joborders.setmonitoredjoborder': JobOrderMonitorActionPage,
  'joborders.pipelinestatusdetails': PipelineStatusActionPage,
  'joborders.pipelinestatuseditdate': PipelineStatusActionPage,
  'lists.quickactionaddtolistmodal': ListsActionPage,
  'lists.addtolistfromdatagridmodal': ListsActionPage,
  'candidates.delete': EntityDeleteActionPage,
  'candidates.addactivitychangestatus': CandidatesShowPage,
  'candidates.addcandidatetags': CandidatesShowPage,
  'candidates.addduplicates': CandidatesWorkspaceActionPage,
  'candidates.addeditimage': CandidatesWorkspaceActionPage,
  'candidates.addprofilecomment': CandidatesShowPage,
  'candidates.addtopipeline': CandidatesShowPage,
  'candidates.administrativehideshow': CandidatesShowPage,
  'candidates.deleteattachment': CandidatesShowPage,
  'candidates.deletemessagethread': CandidatesShowPage,
  'candidates.emailcandidates': CandidatesWorkspaceActionPage,
  'candidates.googledrivedeleteattachmentfile': CandidatesShowPage,
  'candidates.googledriveuploadattachment': CandidatesShowPage,
  'candidates.linkduplicate': CandidatesWorkspaceActionPage,
  'candidates.merge': CandidatesWorkspaceActionPage,
  'candidates.mergeinfo': CandidatesWorkspaceActionPage,
  'candidates.postmessage': CandidatesShowPage,
  'candidates.removeduplicity': CandidatesWorkspaceActionPage,
  'candidates.removefrompipeline': CandidatesShowPage,
  'candidates.savesources': CandidatesWorkspaceActionPage,
  'candidates.savedlists': CandidatesWorkspaceActionPage,
  'companies.delete': EntityDeleteActionPage,
  'companies.deleteattachment': CompaniesShowPage,
  'contacts.delete': EntityDeleteActionPage,
  'joborders.delete': EntityDeleteActionPage,
  'joborders.addactivitychangestatus': JobOrdersShowPage,
  'joborders.addprofilecomment': JobOrdersShowPage,
  'joborders.addtopipeline': JobOrdersShowPage,
  'joborders.administrativehideshow': JobOrdersShowPage,
  'joborders.deleteattachment': JobOrdersShowPage,
  'joborders.deletemessagethread': JobOrdersShowPage,
  'joborders.edithiringplan': OperationsWorkspaceActionPage,
  'joborders.pipelinematrixdeleteview': JobOrdersPipelineMatrixPage,
  'joborders.pipelinematrixsaveview': JobOrdersPipelineMatrixPage,
  'joborders.postmessage': JobOrdersShowPage,
  'joborders.removefrompipeline': JobOrdersShowPage,
  'joborders.setcandidatejoborder': OperationsWorkspaceActionPage,
  'lists.deletestaticlist': ListsDetailPage,
  'lists.removefromlistdatagrid': ListsDetailPage,
  'lists.savelistaccess': ListsDetailPage,
  'reports.customerdashboarddetails': ReportsCustomerDashboardPage,
  'reports.customizeeeoreport': ReportsWorkflowActionPage,
  'reports.customizejoborderreport': ReportsWorkflowActionPage,
  'reports.generateeeoreportpreview': ReportsWorkflowActionPage,
  'reports.generatejoborderreportpdf': ReportsJobOrderPdfActionPage,
  'reports.showhirereport': ReportsWorkflowActionPage,
  'reports.showplacementreport': ReportsWorkflowActionPage,
  'reports.showsubmissionreport': ReportsWorkflowActionPage,
  'home.addpersonalitem': HomeMyNotesPage,
  'home.addsavedsearch': HomePage,
  'home.appendpersonalnote': HomeMyNotesPage,
  'home.archiveinboxthread': HomeInboxPage,
  'home.createinboxnote': HomeInboxPage,
  'home.createinboxtodo': HomeInboxPage,
  'home.deleteinboxthread': HomeInboxPage,
  'home.deletepersonalitem': HomeMyNotesPage,
  'home.deletesavedsearch': HomePage,
  'home.movepersonalnotetotodo': HomeMyNotesPage,
  'home.postinboxmessage': HomeInboxPage,
  'home.quicksearch': HomeQuickSearchPage,
  'home.sendpersonalnote': HomeMyNotesPage,
  'home.setpersonalnotearchived': HomeMyNotesPage,
  'home.setpersonaltodostatus': HomeMyNotesPage,
  'home.submitfeedback': HomePage,
  'home.togglepersonaltodo': HomeMyNotesPage,
  'home.updatepersonalnote': HomeMyNotesPage,
  'home.updatepersonaltodo': HomeMyNotesPage,
  'import.commit': ImportLauncherPage,
  'import.import': ImportLauncherPage,
  'import.importuploadfile': ImportLauncherPage,
  'login.attemptlogin': LoginLegacyActionPage,
  'login.forgotpassword': LoginPage,
  'login.googlecallback': LoginLegacyActionPage,
  'login.googledrivestart': LoginLegacyActionPage,
  'login.googlestart': LoginLegacyActionPage,
  'login.nocookiesmodal': LoginPage,
  'login.requestaccess': LoginPage,
  'login.showloginform': LoginPage,
  'rss.joborders': RssJobOrdersPage,
  'attachments.getattachment': LegacyDownloadForwardActionPage,
  'export.export': LegacyDownloadForwardActionPage,
  'export.exportbydatagrid': LegacyDownloadForwardActionPage,
  'gdpr.export': LegacyDownloadForwardActionPage,
  'gdpr.requests': GdprRequestsPage,
  'graphs.generic': GraphsWorkspaceActionPage,
  'graphs.genericpie': GraphsWorkspaceActionPage,
  'graphs.joborderreportgraph': GraphsWorkspaceActionPage,
  'graphs.testgraph': GraphsWorkspaceActionPage,
  'graphs.wordverify': GraphsWorkspaceActionPage,
  'import.deletebulkresumes': ImportWorkflowActionPage,
  'import.importbulkresumes': ImportWorkflowActionPage,
  'import.importselecttype': ImportWorkflowActionPage,
  'import.importuploadresume': ImportWorkflowActionPage,
  'import.massimport': ImportWorkflowActionPage,
  'import.massimportdocument': ImportWorkflowActionPage,
  'import.massimportedit': ImportWorkflowActionPage,
  'import.revert': ImportWorkflowActionPage,
  'import.showmassimport': ImportWorkflowActionPage,
  'import.viewerrors': ImportWorkflowActionPage,
  'import.viewpending': ImportWorkflowActionPage,
  'import.whatisbulkresumes': ImportWorkflowActionPage,
  'settings.addemailtemplate': SettingsAdminWorkspaceActionPage,
  'settings.adduser': SettingsAdminWorkspaceActionPage,
  'settings.administration': SettingsAdminWorkspaceActionPage,
  'settings.ajax_tags_add': SettingsTagsActionPage,
  'settings.ajax_tags_del': SettingsTagsActionPage,
  'settings.ajax_tags_upd': SettingsTagsActionPage,
  'settings.ajax_wizardadduser': SettingsWizardActionPage,
  'settings.ajax_wizardcheckkey': SettingsWizardActionPage,
  'settings.ajax_wizarddeleteuser': SettingsWizardActionPage,
  'settings.ajax_wizardemail': SettingsWizardActionPage,
  'settings.ajax_wizardfirsttimesetup': SettingsWizardActionPage,
  'settings.ajax_wizardimport': SettingsWizardActionPage,
  'settings.ajax_wizardlicense': SettingsWizardActionPage,
  'settings.ajax_wizardlocalization': SettingsWizardActionPage,
  'settings.ajax_wizardpassword': SettingsWizardActionPage,
  'settings.ajax_wizardsitename': SettingsWizardActionPage,
  'settings.ajax_wizardwebsite': SettingsWizardActionPage,
  'settings.asplocalization': SettingsAdminWorkspaceActionPage,
  'settings.careerportalquestionnaire': SettingsAdminWorkspaceActionPage,
  'settings.careerportalquestionnairepreview': SettingsAdminWorkspaceActionPage,
  'settings.careerportalquestionnaireupdate': SettingsAdminWorkspaceActionPage,
  'settings.careerportalsettings': SettingsAdminWorkspaceActionPage,
  'settings.careerportaltemplateedit': SettingsAdminWorkspaceActionPage,
  'settings.changepassword': SettingsAdminWorkspaceActionPage,
  'settings.createbackup': SettingsAdminWorkspaceActionPage,
  'settings.customizecalendar': SettingsAdminWorkspaceActionPage,
  'settings.customizeextrafields': SettingsAdminWorkspaceActionPage,
  'settings.deletebackup': SettingsAdminWorkspaceActionPage,
  'settings.deleteemailtemplate': SettingsAdminWorkspaceActionPage,
  'settings.deleteuser': SettingsAdminWorkspaceActionPage,
  'settings.edituser': SettingsAdminWorkspaceActionPage,
  'settings.eeo': SettingsAdminWorkspaceActionPage,
  'settings.emailsettings': SettingsAdminWorkspaceActionPage,
  'settings.emailtemplates': SettingsAdminWorkspaceActionPage,
  'settings.feedbacksettings': SettingsAdminWorkspaceActionPage,
  'settings.forceemail': SettingsAdminWorkspaceActionPage,
  'settings.gdprsettings': SettingsAdminWorkspaceActionPage,
  'settings.getfirefoxmodal': OperationsWorkspaceActionPage,
  'settings.googleoidcsettings': SettingsAdminWorkspaceActionPage,
  'settings.loginactivity': SettingsAdminWorkspaceActionPage,
  'settings.manageusers': SettingsAdminWorkspaceActionPage,
  'settings.myprofile': SettingsMyProfilePage,
  'settings.newinstallfinished': SettingsAdminWorkspaceActionPage,
  'settings.newinstallpassword': SettingsAdminWorkspaceActionPage,
  'settings.newsitename': SettingsAdminWorkspaceActionPage,
  'settings.oncareerportaltweak': SettingsAdminWorkspaceActionPage,
  'settings.previewpage': OperationsWorkspaceActionPage,
  'settings.previewpagetop': OperationsWorkspaceActionPage,
  'settings.professional': SettingsAdminWorkspaceActionPage,
  'settings.rejectionreasons': SettingsAdminWorkspaceActionPage,
  'settings.reports': SettingsAdminWorkspaceActionPage,
  'settings.rolepagepermissions': SettingsAdminWorkspaceActionPage,
  'settings.schemamigrations': SettingsAdminWorkspaceActionPage,
  'settings.showuser': SettingsAdminWorkspaceActionPage,
  'settings.tags': SettingsAdminWorkspaceActionPage,
  'settings.talentfitflowsettings': SettingsAdminWorkspaceActionPage,
  'settings.upgradesitename': SettingsAdminWorkspaceActionPage,
  'settings.viewitemhistory': SettingsAdminWorkspaceActionPage,
  'toolbar.attemptlogin': LoginLegacyActionPage,
  'toolbar.authenticate': LoginLegacyActionPage,
  'toolbar.checkemailisinsystem': UtilityEndpointForwardActionPage,
  'toolbar.getjavascriptlib': UtilityEndpointForwardActionPage,
  'toolbar.getlicensekey': UtilityEndpointForwardActionPage,
  'toolbar.getremoteversion': UtilityEndpointForwardActionPage,
  'toolbar.install': OperationsWorkspaceActionPage,
  'toolbar.storemonsterresumetext': UtilityEndpointForwardActionPage,
  'wizard.ajax_getpage': UtilityEndpointForwardActionPage,
  'xml.joborders': LegacyDownloadForwardActionPage
};

const registry: Record<string, ModernRouteComponent> = {
  'dashboard.my': DashboardMyPage,
  'dashboard.(default)': DashboardMyPage,
  'candidates.listbyview': CandidatesListPage,
  'candidates.show': CandidatesShowPage,
  'candidates.add': CandidatesAddPage,
  'candidates.edit': CandidatesEditPage,
  'joborders.listbyview': JobOrdersListPage,
  'joborders.list': JobOrdersListPage,
  'joborders.(default)': JobOrdersListPage,
  'joborders.show': JobOrdersShowPage,
  'joborders.add': JobOrdersAddPage,
  'joborders.edit': JobOrdersEditPage,
  'companies.listbyview': CompaniesListPage,
  'companies.list': CompaniesListPage,
  'companies.add': CompaniesAddPage,
  'companies.edit': CompaniesEditPage,
  'companies.show': CompaniesShowPage,
  'companies.(default)': CompaniesListPage,
  'contacts.listbyview': ContactsListPage,
  'contacts.list': ContactsListPage,
  'contacts.add': ContactsAddPage,
  'contacts.edit': ContactsEditPage,
  'contacts.show': ContactsShowPage,
  'contacts.(default)': ContactsListPage,
  'activity.listbyviewdatagrid': ActivityListPage,
  'activity.viewbydate': ActivityListPage,
  'activity.(default)': ActivityListPage,
  'calendar.showcalendar': CalendarPage,
  'calendar.(default)': CalendarPage,
  'lists.listbyview': ListsManagePage,
  'lists.show': ListsDetailPage,
  'lists.showlist': ListsDetailPage,
  'lists.(default)': ListsManagePage,
  'reports.reports': ReportsLauncherPage,
  'reports.customerdashboard': ReportsCustomerDashboardPage,
  'reports.graphview': ReportsGraphViewPage,
  'reports.(default)': ReportsLauncherPage,
  'sourcing.(default)': SourcingPage,
  'queue.(default)': QueuePage,
  'graphs.(default)': GraphsPage,
  'home.home': HomePage,
  'home.inbox': HomeInboxPage,
  'home.mynotes': HomeMyNotesPage,
  'home.(default)': HomePage,
  'login.(default)': LoginPage,
  'kpis.details': KpisDetailsPage,
  'kpis.(default)': KpisPage,
  'logs.view': LogsPage,
  'logs.(default)': LogsPage,
  ...explicitNativeActionRoutes,
  'logs.*': LogsPage,
  '*.*': ModuleBridgePage,
  'candidates.(default)': CandidatesListPage
};

const guardedRouteParams: Record<string, string[]> = {
  'candidates.show': ['candidateID'],
  'candidates.edit': ['candidateID'],
  'candidates.delete': ['candidateID'],
  'candidates.createattachment': ['candidateID'],
  'candidates.considerforjobsearch': ['candidateID'],
  'candidates.addactivitychangestatus': ['candidateID'],
  'candidates.addcandidatetags': ['candidateID'],
  'candidates.addduplicates': ['candidateID', 'duplicateCandidateID'],
  'candidates.addeditimage': ['candidateID'],
  'candidates.addprofilecomment': ['candidateID'],
  'candidates.addtopipeline': ['candidateID'],
  'candidates.administrativehideshow': ['candidateID'],
  'candidates.deleteattachment': ['candidateID'],
  'candidates.deletemessagethread': ['candidateID'],
  'candidates.googledrivedeleteattachmentfile': ['candidateID'],
  'candidates.googledriveuploadattachment': ['candidateID'],
  'candidates.linkduplicate': ['candidateID'],
  'candidates.merge': ['oldCandidateID', 'newCandidateID'],
  'candidates.postmessage': ['candidateID'],
  'candidates.removeduplicity': ['oldCandidateID', 'newCandidateID'],
  'candidates.removefrompipeline': ['candidateID'],
  'candidates.viewresume': ['attachmentID'],
  'candidates.show_questionnaire': ['candidateID'],
  'joborders.show': ['jobOrderID'],
  'joborders.edit': ['jobOrderID'],
  'joborders.delete': ['jobOrderID'],
  'joborders.createattachment': ['jobOrderID'],
  'joborders.addactivitychangestatus': ['jobOrderID'],
  'joborders.addprofilecomment': ['jobOrderID'],
  'joborders.addtopipeline': ['jobOrderID'],
  'joborders.administrativehideshow': ['jobOrderID'],
  'joborders.deleteattachment': ['jobOrderID'],
  'joborders.deletemessagethread': ['jobOrderID'],
  'joborders.edithiringplan': ['jobOrderID'],
  'joborders.postmessage': ['jobOrderID'],
  'joborders.removefrompipeline': ['jobOrderID'],
  'joborders.setcandidatejoborder': ['jobOrderID'],
  'joborders.addcandidatemodal': ['jobOrderID'],
  'joborders.considercandidatesearch': ['jobOrderID'],
  'joborders.setmonitoredjoborder': ['jobOrderID'],
  'joborders.companycontext': ['companyID'],
  'joborders.pipelinestatusdetails': ['pipelineID'],
  'joborders.pipelinestatuseditdate': ['pipelineID'],
  'companies.show': ['companyID'],
  'companies.edit': ['companyID'],
  'companies.delete': ['companyID'],
  'companies.createattachment': ['companyID'],
  'companies.deleteattachment': ['companyID'],
  'contacts.show': ['contactID'],
  'contacts.edit': ['contactID'],
  'contacts.delete': ['contactID'],
  'contacts.addactivityscheduleevent': ['contactID'],
  'contacts.downloadvcard': ['contactID'],
  'lists.show': ['savedListID'],
  'lists.showlist': ['savedListID'],
  'lists.quickactionaddtolistmodal': ['dataItemType', 'dataItemID'],
  'lists.addtolistfromdatagridmodal': ['dataItemType'],
  'lists.deletestaticlist': ['savedListID'],
  'lists.removefromlistdatagrid': ['savedListID'],
  'lists.savelistaccess': ['savedListID']
};

function routeGuardPasses(routeKey: string, requestURI: string): boolean {
  const requiredParams = guardedRouteParams[routeKey];
  if (!requiredParams || requiredParams.length === 0) {
    return true;
  }

  const query = parseRequestQueryParams(requestURI);
  return requiredParams.every((paramName) => hasPositiveIntegerQueryParam(query, paramName));
}

export function resolveModernRoute(
  moduleName: string,
  actionName: string,
  requestURI = ''
): ModernRouteResolution {
  const moduleKey = (moduleName || '').toLowerCase();
  const actionKey = (actionName || '').toLowerCase();

  const explicitRouteKey = `${moduleKey}.${actionKey}`;
  const explicitComponent = registry[explicitRouteKey];
  if (explicitComponent) {
    if (routeGuardPasses(explicitRouteKey, requestURI)) {
      return {
        component: explicitComponent,
        matchedRouteKey: explicitRouteKey,
        resolutionType: explicitComponent === ModuleBridgePage ? 'bridge' : 'native'
      };
    }

    const guardedFallbacks = [`${moduleKey}.(default)`, `${moduleKey}.*`, '*.*'];
    for (const routeKey of guardedFallbacks) {
      const component = registry[routeKey];
      if (component && routeGuardPasses(routeKey, requestURI)) {
        return {
          component,
          matchedRouteKey: routeKey,
          resolutionType: component === ModuleBridgePage ? 'bridge' : 'native'
        };
      }
    }
  } else {
    const fallbackCandidates = actionKey
      ? [`${moduleKey}.*`, '*.*', `${moduleKey}.(default)`]
      : [`${moduleKey}.(default)`, `${moduleKey}.*`, '*.*'];

    for (const routeKey of fallbackCandidates) {
      const component = registry[routeKey];
      if (component && routeGuardPasses(routeKey, requestURI)) {
        return {
          component,
          matchedRouteKey: routeKey,
          resolutionType: component === ModuleBridgePage ? 'bridge' : 'native'
        };
      }
    }
  }

  return {
    component: null,
    matchedRouteKey: '(unresolved)',
    resolutionType: 'legacy'
  };
}

export function resolveModernRouteComponent(
  moduleName: string,
  actionName: string,
  requestURI = ''
): ModernRouteComponent | null {
  return resolveModernRoute(moduleName, actionName, requestURI).component;
}

