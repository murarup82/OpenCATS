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
import { LogsPage } from '../pages/LogsPage';
import { LegacyRedirectPage } from '../pages/LegacyRedirectPage';
import { CandidateAssignActionPage } from '../pages/CandidateAssignActionPage';
import { JobOrderAssignActionPage } from '../pages/JobOrderAssignActionPage';
import { PipelineStatusActionPage } from '../pages/PipelineStatusActionPage';
import { JobOrderCompanyContextActionPage } from '../pages/JobOrderCompanyContextActionPage';
import { JobOrderAddActionPage } from '../pages/JobOrderAddActionPage';
import { JobOrderMonitorActionPage } from '../pages/JobOrderMonitorActionPage';
import { EntityDeleteActionPage } from '../pages/EntityDeleteActionPage';
import { ModuleBridgePage } from '../pages/ModuleBridgePage';
import { ActionCompatPage } from '../pages/ActionCompatPage';
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

function buildExplicitBridgeRoutes(
  moduleActionMap: Record<string, string[]>,
  component: ModernRouteComponent = ModuleBridgePage
): Record<string, ModernRouteComponent> {
  const routes: Record<string, ModernRouteComponent> = {};
  for (const [moduleName, actions] of Object.entries(moduleActionMap)) {
    const moduleKey = String(moduleName || '').toLowerCase();
    for (const actionName of actions) {
      const actionKey = String(actionName || '').toLowerCase();
      routes[`${moduleKey}.${actionKey}`] = component;
    }
  }
  return routes;
}

const explicitNativeActionRoutes: Record<string, ModernRouteComponent> = {
  'dashboard.setpipelinestatus': DashboardMyPage,
  'calendar.addevent': CalendarPage,
  'calendar.editevent': CalendarPage,
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
  'companies.delete': EntityDeleteActionPage,
  'contacts.delete': EntityDeleteActionPage,
  'joborders.delete': EntityDeleteActionPage,
  'reports.customerdashboarddetails': ReportsActionPage,
  'reports.customizeeeoreport': ReportsActionPage,
  'reports.customizejoborderreport': ReportsActionPage,
  'reports.generateeeoreportpreview': ReportsActionPage,
  'reports.generatejoborderreportpdf': ReportsActionPage,
  'reports.showhirereport': ReportsActionPage,
  'reports.showplacementreport': ReportsActionPage,
  'reports.showsubmissionreport': ReportsActionPage,
  ...buildExplicitBridgeRoutes(
    {
      home: [
        'addPersonalItem',
        'addSavedSearch',
        'appendPersonalNote',
        'archiveInboxThread',
        'createInboxNote',
        'createInboxTodo',
        'deleteInboxThread',
        'deletePersonalItem',
        'deleteSavedSearch',
        'movePersonalNoteToTodo',
        'postInboxMessage',
        'quickSearch',
        'sendPersonalNote',
        'setPersonalNoteArchived',
        'setPersonalTodoStatus',
        'submitFeedback',
        'togglePersonalTodo',
        'updatePersonalNote',
        'updatePersonalTodo'
      ]
    },
    HomeActionPage
  ),
  ...buildExplicitBridgeRoutes(
    {
      import: ['commit', 'import', 'importUploadFile'],
      login: [
        'attemptLogin',
        'forgotPassword',
        'googleCallback',
        'googleStart',
        'noCookiesModal',
        'requestAccess',
        'showLoginForm'
      ],
      rss: ['jobOrders']
    },
    LegacyRedirectPage
  )
};

// Comparison-driven explicit action coverage. Keep behavior legacy-safe while avoiding wildcard fallbacks.
const explicitActionCompatRoutes = buildExplicitBridgeRoutes({
  calendar: ['deleteEvent', 'dynamicData'],
  candidates: [
    'addActivityChangeStatus',
    'addCandidateTags',
    'addDuplicates',
    'addEditImage',
    'addProfileComment',
    'addToPipeline',
    'administrativeHideShow',
    'deleteAttachment',
    'deleteMessageThread',
    'emailCandidates',
    'linkDuplicate',
    'merge',
    'mergeInfo',
    'postMessage',
    'removeDuplicity',
    'removeFromPipeline',
    'saveSources',
    'savedLists'
  ],
  companies: ['deleteAttachment'],
  joborders: [
    'addActivityChangeStatus',
    'addProfileComment',
    'addToPipeline',
    'administrativeHideShow',
    'deleteAttachment',
    'deleteMessageThread',
    'editHiringPlan',
    'postMessage',
    'removeFromPipeline',
    'setCandidateJobOrder'
  ],
  lists: [
    'deleteStaticList',
    'removeFromListDatagrid',
    'saveListAccess'
  ]
}, ActionCompatPage);

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
  ...explicitActionCompatRoutes,
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
