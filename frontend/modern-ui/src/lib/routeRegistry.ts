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
import { ReportsActionPage } from '../pages/ReportsActionPage';
import { SourcingPage } from '../pages/SourcingPage';
import { QueuePage } from '../pages/QueuePage';
import { GraphsPage } from '../pages/GraphsPage';
import { GraphsActionPage } from '../pages/GraphsActionPage';
import { LogsPage } from '../pages/LogsPage';
import { LoginLegacyActionPage } from '../pages/LoginLegacyActionPage';
import { LoginPage } from '../pages/LoginPage';
import { RssJobOrdersPage } from '../pages/RssJobOrdersPage';
import { CandidateAssignActionPage } from '../pages/CandidateAssignActionPage';
import { JobOrderAssignActionPage } from '../pages/JobOrderAssignActionPage';
import { PipelineStatusActionPage } from '../pages/PipelineStatusActionPage';
import { JobOrderCompanyContextActionPage } from '../pages/JobOrderCompanyContextActionPage';
import { JobOrderAddActionPage } from '../pages/JobOrderAddActionPage';
import { JobOrderMonitorActionPage } from '../pages/JobOrderMonitorActionPage';
import { EntityDeleteActionPage } from '../pages/EntityDeleteActionPage';
import { EntityUtilityActionPage } from '../pages/EntityUtilityActionPage';
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
  'calendar.deleteevent': EntityUtilityActionPage,
  'calendar.dynamicdata': EntityUtilityActionPage,
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
  'joborders.setmonitoredjoborder': JobOrderMonitorActionPage,
  'joborders.pipelinestatusdetails': PipelineStatusActionPage,
  'joborders.pipelinestatuseditdate': PipelineStatusActionPage,
  'lists.quickactionaddtolistmodal': ListsActionPage,
  'lists.addtolistfromdatagridmodal': ListsActionPage,
  'candidates.delete': EntityDeleteActionPage,
  'candidates.addactivitychangestatus': CandidatesShowPage,
  'candidates.addcandidatetags': CandidatesShowPage,
  'candidates.addduplicates': EntityUtilityActionPage,
  'candidates.addeditimage': EntityUtilityActionPage,
  'candidates.addprofilecomment': CandidatesShowPage,
  'candidates.addtopipeline': CandidatesShowPage,
  'candidates.administrativehideshow': CandidatesShowPage,
  'candidates.deleteattachment': CandidatesShowPage,
  'candidates.deletemessagethread': CandidatesShowPage,
  'candidates.emailcandidates': EntityUtilityActionPage,
  'candidates.linkduplicate': EntityUtilityActionPage,
  'candidates.merge': EntityUtilityActionPage,
  'candidates.mergeinfo': EntityUtilityActionPage,
  'candidates.postmessage': CandidatesShowPage,
  'candidates.removeduplicity': EntityUtilityActionPage,
  'candidates.removefrompipeline': CandidatesShowPage,
  'candidates.savesources': EntityUtilityActionPage,
  'candidates.savedlists': EntityUtilityActionPage,
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
  'joborders.edithiringplan': EntityUtilityActionPage,
  'joborders.postmessage': JobOrdersShowPage,
  'joborders.removefrompipeline': JobOrdersShowPage,
  'joborders.setcandidatejoborder': EntityUtilityActionPage,
  'lists.deletestaticlist': ListsDetailPage,
  'lists.removefromlistdatagrid': ListsDetailPage,
  'lists.savelistaccess': ListsDetailPage,
  'reports.customerdashboarddetails': ReportsCustomerDashboardPage,
  'reports.customizeeeoreport': ReportsActionPage,
  'reports.customizejoborderreport': ReportsActionPage,
  'reports.generateeeoreportpreview': ReportsActionPage,
  'reports.generatejoborderreportpdf': ReportsActionPage,
  'reports.showhirereport': ReportsActionPage,
  'reports.showplacementreport': ReportsActionPage,
  'reports.showsubmissionreport': ReportsActionPage,
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
  'login.googlestart': LoginLegacyActionPage,
  'login.nocookiesmodal': LoginPage,
  'login.requestaccess': LoginPage,
  'login.showloginform': LoginPage,
  'rss.joborders': RssJobOrdersPage,
  'attachments.getattachment': EntityUtilityActionPage,
  'export.export': EntityUtilityActionPage,
  'export.exportbydatagrid': EntityUtilityActionPage,
  'gdpr.export': EntityUtilityActionPage,
  'gdpr.requests': EntityUtilityActionPage,
  'graphs.generic': GraphsActionPage,
  'graphs.genericpie': GraphsActionPage,
  'graphs.joborderreportgraph': GraphsActionPage,
  'graphs.testgraph': GraphsActionPage,
  'graphs.wordverify': GraphsActionPage,
  'import.deletebulkresumes': EntityUtilityActionPage,
  'import.importbulkresumes': EntityUtilityActionPage,
  'import.importselecttype': EntityUtilityActionPage,
  'import.importuploadresume': EntityUtilityActionPage,
  'import.massimport': EntityUtilityActionPage,
  'import.massimportdocument': EntityUtilityActionPage,
  'import.massimportedit': EntityUtilityActionPage,
  'import.revert': EntityUtilityActionPage,
  'import.showmassimport': EntityUtilityActionPage,
  'import.viewerrors': EntityUtilityActionPage,
  'import.viewpending': EntityUtilityActionPage,
  'import.whatisbulkresumes': EntityUtilityActionPage,
  'settings.addemailtemplate': EntityUtilityActionPage,
  'settings.adduser': EntityUtilityActionPage,
  'settings.administration': EntityUtilityActionPage,
  'settings.ajax_tags_add': EntityUtilityActionPage,
  'settings.ajax_tags_del': EntityUtilityActionPage,
  'settings.ajax_tags_upd': EntityUtilityActionPage,
  'settings.ajax_wizardadduser': EntityUtilityActionPage,
  'settings.ajax_wizardcheckkey': EntityUtilityActionPage,
  'settings.ajax_wizarddeleteuser': EntityUtilityActionPage,
  'settings.ajax_wizardemail': EntityUtilityActionPage,
  'settings.ajax_wizardfirsttimesetup': EntityUtilityActionPage,
  'settings.ajax_wizardimport': EntityUtilityActionPage,
  'settings.ajax_wizardlicense': EntityUtilityActionPage,
  'settings.ajax_wizardlocalization': EntityUtilityActionPage,
  'settings.ajax_wizardpassword': EntityUtilityActionPage,
  'settings.ajax_wizardsitename': EntityUtilityActionPage,
  'settings.ajax_wizardwebsite': EntityUtilityActionPage,
  'settings.asplocalization': EntityUtilityActionPage,
  'settings.careerportalquestionnaire': EntityUtilityActionPage,
  'settings.careerportalquestionnairepreview': EntityUtilityActionPage,
  'settings.careerportalquestionnaireupdate': EntityUtilityActionPage,
  'settings.careerportalsettings': EntityUtilityActionPage,
  'settings.careerportaltemplateedit': EntityUtilityActionPage,
  'settings.changepassword': EntityUtilityActionPage,
  'settings.createbackup': EntityUtilityActionPage,
  'settings.customizecalendar': EntityUtilityActionPage,
  'settings.customizeextrafields': EntityUtilityActionPage,
  'settings.deletebackup': EntityUtilityActionPage,
  'settings.deleteemailtemplate': EntityUtilityActionPage,
  'settings.deleteuser': EntityUtilityActionPage,
  'settings.edituser': EntityUtilityActionPage,
  'settings.eeo': EntityUtilityActionPage,
  'settings.emailsettings': EntityUtilityActionPage,
  'settings.emailtemplates': EntityUtilityActionPage,
  'settings.feedbacksettings': EntityUtilityActionPage,
  'settings.forceemail': EntityUtilityActionPage,
  'settings.gdprsettings': EntityUtilityActionPage,
  'settings.getfirefoxmodal': EntityUtilityActionPage,
  'settings.googleoidcsettings': EntityUtilityActionPage,
  'settings.loginactivity': EntityUtilityActionPage,
  'settings.manageusers': EntityUtilityActionPage,
  'settings.myprofile': EntityUtilityActionPage,
  'settings.newinstallfinished': EntityUtilityActionPage,
  'settings.newinstallpassword': EntityUtilityActionPage,
  'settings.newsitename': EntityUtilityActionPage,
  'settings.oncareerportaltweak': EntityUtilityActionPage,
  'settings.previewpage': EntityUtilityActionPage,
  'settings.previewpagetop': EntityUtilityActionPage,
  'settings.professional': EntityUtilityActionPage,
  'settings.rejectionreasons': EntityUtilityActionPage,
  'settings.reports': EntityUtilityActionPage,
  'settings.rolepagepermissions': EntityUtilityActionPage,
  'settings.schemamigrations': EntityUtilityActionPage,
  'settings.showuser': EntityUtilityActionPage,
  'settings.tags': EntityUtilityActionPage,
  'settings.talentfitflowsettings': EntityUtilityActionPage,
  'settings.upgradesitename': EntityUtilityActionPage,
  'settings.viewitemhistory': EntityUtilityActionPage,
  'toolbar.attemptlogin': EntityUtilityActionPage,
  'toolbar.authenticate': EntityUtilityActionPage,
  'toolbar.checkemailisinsystem': EntityUtilityActionPage,
  'toolbar.getjavascriptlib': EntityUtilityActionPage,
  'toolbar.getlicensekey': EntityUtilityActionPage,
  'toolbar.getremoteversion': EntityUtilityActionPage,
  'toolbar.install': EntityUtilityActionPage,
  'toolbar.storemonsterresumetext': EntityUtilityActionPage,
  'wizard.ajax_getpage': EntityUtilityActionPage,
  'xml.joborders': EntityUtilityActionPage
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

