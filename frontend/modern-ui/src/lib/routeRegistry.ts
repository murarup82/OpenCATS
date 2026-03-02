import type { ComponentType } from 'react';
import type { UIModeBootstrap } from '../types';
import { DashboardMyPage } from '../pages/DashboardMyPage';
import { CandidatesListPage } from '../pages/CandidatesListPage';
import { CandidatesShowPage } from '../pages/CandidatesShowPage';
import { CandidatesAddPage } from '../pages/CandidatesAddPage';
import { CandidatesEditPage } from '../pages/CandidatesEditPage';
import { JobOrdersFormBridgePage } from '../pages/JobOrdersFormBridgePage';
import { JobOrdersListPage } from '../pages/JobOrdersListPage';
import { JobOrdersShowPage } from '../pages/JobOrdersShowPage';
import { CompaniesListPage } from '../pages/CompaniesListPage';
import { CompaniesShowPage } from '../pages/CompaniesShowPage';
import { CompaniesFormBridgePage } from '../pages/CompaniesFormBridgePage';
import { ContactsListPage } from '../pages/ContactsListPage';
import { ContactsShowPage } from '../pages/ContactsShowPage';
import { ContactsFormBridgePage } from '../pages/ContactsFormBridgePage';
import { ActivityListPage } from '../pages/ActivityListPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ListsManagePage } from '../pages/ListsManagePage';
import { ReportsLauncherPage } from '../pages/ReportsLauncherPage';
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

function buildExplicitBridgeRoutes(
  moduleActionMap: Record<string, string[]>
): Record<string, ModernRouteComponent> {
  const routes: Record<string, ModernRouteComponent> = {};
  for (const [moduleName, actions] of Object.entries(moduleActionMap)) {
    const moduleKey = String(moduleName || '').toLowerCase();
    for (const actionName of actions) {
      const actionKey = String(actionName || '').toLowerCase();
      routes[`${moduleKey}.${actionKey}`] = ModuleBridgePage;
    }
  }
  return routes;
}

const explicitNativeActionRoutes: Record<string, ModernRouteComponent> = {
  'dashboard.setpipelinestatus': DashboardMyPage,
  'candidates.search': CandidatesListPage,
  'joborders.search': JobOrdersListPage,
  'companies.search': CompaniesListPage,
  'contacts.search': ContactsListPage
};

// Comparison-driven explicit action coverage. Keep behavior legacy-safe while avoiding wildcard fallbacks.
const explicitBridgeActionRoutes = buildExplicitBridgeRoutes({
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
    'createAttachment',
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
  companies: ['createAttachment', 'delete', 'deleteAttachment', 'internalPostings'],
  contacts: ['addActivityScheduleEvent', 'delete', 'downloadVCard', 'showColdCallList'],
  joborders: [
    'addActivityChangeStatus',
    'addCandidateModal',
    'addJobOrderPopup',
    'addProfileComment',
    'addToPipeline',
    'administrativeHideShow',
    'considerCandidateSearch',
    'createAttachment',
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
});

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
  'joborders.add': JobOrdersFormBridgePage,
  'joborders.edit': JobOrdersFormBridgePage,
  'companies.listbyview': CompaniesListPage,
  'companies.list': CompaniesListPage,
  'companies.add': CompaniesFormBridgePage,
  'companies.edit': CompaniesFormBridgePage,
  'companies.show': CompaniesShowPage,
  'companies.(default)': CompaniesListPage,
  'contacts.listbyview': ContactsListPage,
  'contacts.list': ContactsListPage,
  'contacts.add': ContactsFormBridgePage,
  'contacts.edit': ContactsFormBridgePage,
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
  ...explicitNativeActionRoutes,
  ...explicitBridgeActionRoutes,
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
  '*.*': ModuleBridgePage,
  'candidates.(default)': CandidatesListPage
};

const guardedRouteParams: Record<string, string[]> = {
  'candidates.show': ['candidateID'],
  'candidates.edit': ['candidateID'],
  'joborders.show': ['jobOrderID'],
  'joborders.edit': ['jobOrderID'],
  'companies.show': ['companyID'],
  'companies.edit': ['companyID'],
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
