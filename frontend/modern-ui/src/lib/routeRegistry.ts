import type { ComponentType } from 'react';
import type { UIModeBootstrap } from '../types';
import { DashboardMyPage } from '../pages/DashboardMyPage';
import { HomePage } from '../pages/HomePage';
import { HomeInboxPage } from '../pages/HomeInboxPage';
import { HomeMyNotesPage } from '../pages/HomeMyNotesPage';
import { HomeActionPage } from '../pages/HomeActionPage';
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
import { LegacyRedirectPage } from '../pages/LegacyRedirectPage';
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
  'candidates.addactivitychangestatus': EntityUtilityActionPage,
  'candidates.addcandidatetags': EntityUtilityActionPage,
  'candidates.addduplicates': EntityUtilityActionPage,
  'candidates.addeditimage': EntityUtilityActionPage,
  'candidates.addprofilecomment': EntityUtilityActionPage,
  'candidates.addtopipeline': EntityUtilityActionPage,
  'candidates.administrativehideshow': EntityUtilityActionPage,
  'candidates.deleteattachment': EntityUtilityActionPage,
  'candidates.deletemessagethread': EntityUtilityActionPage,
  'candidates.emailcandidates': EntityUtilityActionPage,
  'candidates.linkduplicate': EntityUtilityActionPage,
  'candidates.merge': EntityUtilityActionPage,
  'candidates.mergeinfo': EntityUtilityActionPage,
  'candidates.postmessage': EntityUtilityActionPage,
  'candidates.removeduplicity': EntityUtilityActionPage,
  'candidates.removefrompipeline': EntityUtilityActionPage,
  'candidates.savesources': EntityUtilityActionPage,
  'candidates.savedlists': EntityUtilityActionPage,
  'companies.delete': EntityDeleteActionPage,
  'companies.deleteattachment': EntityUtilityActionPage,
  'contacts.delete': EntityDeleteActionPage,
  'joborders.delete': EntityDeleteActionPage,
  'joborders.addactivitychangestatus': EntityUtilityActionPage,
  'joborders.addprofilecomment': EntityUtilityActionPage,
  'joborders.addtopipeline': EntityUtilityActionPage,
  'joborders.administrativehideshow': EntityUtilityActionPage,
  'joborders.deleteattachment': EntityUtilityActionPage,
  'joborders.deletemessagethread': EntityUtilityActionPage,
  'joborders.edithiringplan': EntityUtilityActionPage,
  'joborders.postmessage': EntityUtilityActionPage,
  'joborders.removefrompipeline': EntityUtilityActionPage,
  'joborders.setcandidatejoborder': EntityUtilityActionPage,
  'lists.deletestaticlist': EntityUtilityActionPage,
  'lists.removefromlistdatagrid': EntityUtilityActionPage,
  'lists.savelistaccess': EntityUtilityActionPage,
  'reports.customerdashboarddetails': ReportsActionPage,
  'reports.customizeeeoreport': ReportsActionPage,
  'reports.customizejoborderreport': ReportsActionPage,
  'reports.generateeeoreportpreview': ReportsActionPage,
  'reports.generatejoborderreportpdf': ReportsActionPage,
  'reports.showhirereport': ReportsActionPage,
  'reports.showplacementreport': ReportsActionPage,
  'reports.showsubmissionreport': ReportsActionPage,
  'home.addpersonalitem': HomeActionPage,
  'home.addsavedsearch': HomeActionPage,
  'home.appendpersonalnote': HomeActionPage,
  'home.archiveinboxthread': HomeActionPage,
  'home.createinboxnote': HomeActionPage,
  'home.createinboxtodo': HomeActionPage,
  'home.deleteinboxthread': HomeActionPage,
  'home.deletepersonalitem': HomeActionPage,
  'home.deletesavedsearch': HomeActionPage,
  'home.movepersonalnotetotodo': HomeActionPage,
  'home.postinboxmessage': HomeActionPage,
  'home.quicksearch': HomeActionPage,
  'home.sendpersonalnote': HomeActionPage,
  'home.setpersonalnotearchived': HomeActionPage,
  'home.setpersonaltodostatus': HomeActionPage,
  'home.submitfeedback': HomeActionPage,
  'home.togglepersonaltodo': HomeActionPage,
  'home.updatepersonalnote': HomeActionPage,
  'home.updatepersonaltodo': HomeActionPage,
  'import.commit': LegacyRedirectPage,
  'import.import': LegacyRedirectPage,
  'import.importuploadfile': LegacyRedirectPage,
  'login.attemptlogin': LegacyRedirectPage,
  'login.forgotpassword': LegacyRedirectPage,
  'login.googlecallback': LegacyRedirectPage,
  'login.googlestart': LegacyRedirectPage,
  'login.nocookiesmodal': LegacyRedirectPage,
  'login.requestaccess': LegacyRedirectPage,
  'login.showloginform': LegacyRedirectPage,
  'rss.joborders': LegacyRedirectPage,
  'attachments.getattachment': ModuleBridgePage,
  'export.export': ModuleBridgePage,
  'export.exportbydatagrid': ModuleBridgePage,
  'gdpr.export': ModuleBridgePage,
  'gdpr.requests': ModuleBridgePage,
  'graphs.generic': GraphsActionPage,
  'graphs.genericpie': GraphsActionPage,
  'graphs.joborderreportgraph': GraphsActionPage,
  'graphs.testgraph': GraphsActionPage,
  'graphs.wordverify': GraphsActionPage,
  'import.deletebulkresumes': ModuleBridgePage,
  'import.importbulkresumes': ModuleBridgePage,
  'import.importselecttype': ModuleBridgePage,
  'import.importuploadresume': ModuleBridgePage,
  'import.massimport': ModuleBridgePage,
  'import.massimportdocument': ModuleBridgePage,
  'import.massimportedit': ModuleBridgePage,
  'import.revert': ModuleBridgePage,
  'import.showmassimport': ModuleBridgePage,
  'import.viewerrors': ModuleBridgePage,
  'import.viewpending': ModuleBridgePage,
  'import.whatisbulkresumes': ModuleBridgePage,
  'settings.addemailtemplate': ModuleBridgePage,
  'settings.adduser': ModuleBridgePage,
  'settings.administration': ModuleBridgePage,
  'settings.ajax_tags_add': ModuleBridgePage,
  'settings.ajax_tags_del': ModuleBridgePage,
  'settings.ajax_tags_upd': ModuleBridgePage,
  'settings.ajax_wizardadduser': ModuleBridgePage,
  'settings.ajax_wizardcheckkey': ModuleBridgePage,
  'settings.ajax_wizarddeleteuser': ModuleBridgePage,
  'settings.ajax_wizardemail': ModuleBridgePage,
  'settings.ajax_wizardfirsttimesetup': ModuleBridgePage,
  'settings.ajax_wizardimport': ModuleBridgePage,
  'settings.ajax_wizardlicense': ModuleBridgePage,
  'settings.ajax_wizardlocalization': ModuleBridgePage,
  'settings.ajax_wizardpassword': ModuleBridgePage,
  'settings.ajax_wizardsitename': ModuleBridgePage,
  'settings.ajax_wizardwebsite': ModuleBridgePage,
  'settings.asplocalization': ModuleBridgePage,
  'settings.careerportalquestionnaire': ModuleBridgePage,
  'settings.careerportalquestionnairepreview': ModuleBridgePage,
  'settings.careerportalquestionnaireupdate': ModuleBridgePage,
  'settings.careerportalsettings': ModuleBridgePage,
  'settings.careerportaltemplateedit': ModuleBridgePage,
  'settings.changepassword': ModuleBridgePage,
  'settings.createbackup': ModuleBridgePage,
  'settings.customizecalendar': ModuleBridgePage,
  'settings.customizeextrafields': ModuleBridgePage,
  'settings.deletebackup': ModuleBridgePage,
  'settings.deleteemailtemplate': ModuleBridgePage,
  'settings.deleteuser': ModuleBridgePage,
  'settings.edituser': ModuleBridgePage,
  'settings.eeo': ModuleBridgePage,
  'settings.emailsettings': ModuleBridgePage,
  'settings.emailtemplates': ModuleBridgePage,
  'settings.feedbacksettings': ModuleBridgePage,
  'settings.forceemail': ModuleBridgePage,
  'settings.gdprsettings': ModuleBridgePage,
  'settings.getfirefoxmodal': ModuleBridgePage,
  'settings.googleoidcsettings': ModuleBridgePage,
  'settings.loginactivity': ModuleBridgePage,
  'settings.manageusers': ModuleBridgePage,
  'settings.myprofile': ModuleBridgePage,
  'settings.newinstallfinished': ModuleBridgePage,
  'settings.newinstallpassword': ModuleBridgePage,
  'settings.newsitename': ModuleBridgePage,
  'settings.oncareerportaltweak': ModuleBridgePage,
  'settings.previewpage': ModuleBridgePage,
  'settings.previewpagetop': ModuleBridgePage,
  'settings.professional': ModuleBridgePage,
  'settings.rejectionreasons': ModuleBridgePage,
  'settings.reports': ModuleBridgePage,
  'settings.rolepagepermissions': ModuleBridgePage,
  'settings.schemamigrations': ModuleBridgePage,
  'settings.showuser': ModuleBridgePage,
  'settings.tags': ModuleBridgePage,
  'settings.talentfitflowsettings': ModuleBridgePage,
  'settings.upgradesitename': ModuleBridgePage,
  'settings.viewitemhistory': ModuleBridgePage,
  'toolbar.attemptlogin': ModuleBridgePage,
  'toolbar.authenticate': ModuleBridgePage,
  'toolbar.checkemailisinsystem': ModuleBridgePage,
  'toolbar.getjavascriptlib': ModuleBridgePage,
  'toolbar.getlicensekey': ModuleBridgePage,
  'toolbar.getremoteversion': ModuleBridgePage,
  'toolbar.install': ModuleBridgePage,
  'toolbar.storemonsterresumetext': ModuleBridgePage,
  'wizard.ajax_getpage': ModuleBridgePage,
  'xml.joborders': ModuleBridgePage
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
  'candidates.viewresume': ['attachmentID'],
  'candidates.show_questionnaire': ['candidateID'],
  'joborders.show': ['jobOrderID'],
  'joborders.edit': ['jobOrderID'],
  'joborders.delete': ['jobOrderID'],
  'joborders.createattachment': ['jobOrderID'],
  'joborders.addcandidatemodal': ['jobOrderID'],
  'joborders.setmonitoredjoborder': ['jobOrderID'],
  'joborders.companycontext': ['companyID'],
  'joborders.pipelinestatusdetails': ['pipelineID'],
  'joborders.pipelinestatuseditdate': ['pipelineID'],
  'companies.show': ['companyID'],
  'companies.edit': ['companyID'],
  'companies.delete': ['companyID'],
  'companies.createattachment': ['companyID'],
  'contacts.show': ['contactID'],
  'contacts.edit': ['contactID'],
  'contacts.delete': ['contactID'],
  'contacts.addactivityscheduleevent': ['contactID'],
  'contacts.downloadvcard': ['contactID'],
  'lists.show': ['savedListID'],
  'lists.showlist': ['savedListID']
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
