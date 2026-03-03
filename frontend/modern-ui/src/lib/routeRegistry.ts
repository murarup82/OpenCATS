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
import { CandidatesShowPage } from '../pages/CandidatesShowPage';
import { CandidatesAddPage } from '../pages/CandidatesAddPage';
import { CandidatesEditPage } from '../pages/CandidatesEditPage';
import { JobOrdersAddPage } from '../pages/JobOrdersAddPage';
import { JobOrdersEditPage } from '../pages/JobOrdersEditPage';
import { JobOrdersListPage } from '../pages/JobOrdersListPage';
import { JobOrdersShowPage } from '../pages/JobOrdersShowPage';
import { CompaniesListPage } from '../pages/CompaniesListPage';
import { CompaniesShowPage } from '../pages/CompaniesShowPage';
import { CompaniesAddPage } from '../pages/CompaniesAddPage';
import { CompaniesEditPage } from '../pages/CompaniesEditPage';
import { ContactsListPage } from '../pages/ContactsListPage';
import { ContactsShowPage } from '../pages/ContactsShowPage';
import { ContactsAddPage } from '../pages/ContactsAddPage';
import { ContactsEditPage } from '../pages/ContactsEditPage';
import { ActivityListPage } from '../pages/ActivityListPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ListsManagePage } from '../pages/ListsManagePage';
import { ReportsLauncherPage } from '../pages/ReportsLauncherPage';
import { LogsPage } from '../pages/LogsPage';
import { LegacyRedirectPage } from '../pages/LegacyRedirectPage';
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
  'candidates.createattachment': CandidatesShowPage,
  'joborders.createattachment': JobOrdersShowPage,
  'joborders.addcandidatemodal': CandidatesAddPage,
  'companies.createattachment': CompaniesShowPage,
  'candidates.search': CandidatesListPage,
  'joborders.search': JobOrdersListPage,
  'companies.search': CompaniesListPage,
  'contacts.search': ContactsListPage,
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
  calendar: ['addEvent', 'deleteEvent', 'dynamicData', 'editEvent'],
  candidates: [
    'addActivityChangeStatus',
    'addCandidateTags',
    'addDuplicates',
    'addEditImage',
    'addProfileComment',
    'addToPipeline',
    'administrativeHideShow',
    'considerForJobSearch',
    'delete',
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
    'savedLists',
    'show_questionnaire',
    'viewResume'
  ],
  companies: ['delete', 'deleteAttachment', 'internalPostings'],
  contacts: ['addActivityScheduleEvent', 'delete', 'downloadVCard', 'showColdCallList'],
  joborders: [
    'addActivityChangeStatus',
    'addJobOrderPopup',
    'addProfileComment',
    'addToPipeline',
    'administrativeHideShow',
    'considerCandidateSearch',
    'delete',
    'deleteAttachment',
    'deleteMessageThread',
    'editHiringPlan',
    'pipelineStatusDetails',
    'pipelineStatusEditDate',
    'postMessage',
    'recruiterAllocation',
    'removeFromPipeline',
    'setCandidateJobOrder',
    'setMonitoredJobOrder'
  ],
  lists: [
    'addToListFromDatagridModal',
    'deleteStaticList',
    'quickActionAddToListModal',
    'removeFromListDatagrid',
    'saveListAccess',
    'show',
    'showList'
  ],
  reports: [
    'customerDashboard',
    'customerDashboardDetails',
    'customizeEEOReport',
    'customizeJobOrderReport',
    'generateEEOReportPreview',
    'generateJobOrderReportPDF',
    'graphView',
    'showHireReport',
    'showPlacementReport',
    'showSubmissionReport'
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
  'lists.(default)': ListsManagePage,
  'reports.reports': ReportsLauncherPage,
  'reports.(default)': ReportsLauncherPage,
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
  'candidates.*': ModuleBridgePage,
  'joborders.*': ModuleBridgePage,
  'companies.*': ModuleBridgePage,
  'contacts.*': ModuleBridgePage,
  'activity.*': ModuleBridgePage,
  'activities.*': ModuleBridgePage,
  'calendar.*': ModuleBridgePage,
  'lists.*': ModuleBridgePage,
  'reports.*': ModuleBridgePage,
  'home.*': ModuleBridgePage,
  'kpis.*': ModuleBridgePage,
  'logs.*': LogsPage,
  'sourcing.*': ModuleBridgePage,
  'queue.*': ModuleBridgePage,
  'graphs.*': ModuleBridgePage,
  'rss.*': ModuleBridgePage,
  'careers.*': ModuleBridgePage,
  'wizard.*': ModuleBridgePage,
  'tests.*': ModuleBridgePage,
  'xml.*': ModuleBridgePage,
  '*.*': ModuleBridgePage,
  'candidates.(default)': CandidatesListPage
};

const guardedRouteParams: Record<string, string[]> = {
  'candidates.show': ['candidateID'],
  'candidates.edit': ['candidateID'],
  'candidates.createattachment': ['candidateID'],
  'joborders.show': ['jobOrderID'],
  'joborders.edit': ['jobOrderID'],
  'joborders.createattachment': ['jobOrderID'],
  'joborders.addcandidatemodal': ['jobOrderID'],
  'companies.show': ['companyID'],
  'companies.edit': ['companyID'],
  'companies.createattachment': ['companyID'],
  'contacts.show': ['contactID'],
  'contacts.edit': ['contactID']
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
      ? [`${moduleKey}.*`, `${moduleKey}.(default)`, '*.*']
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
