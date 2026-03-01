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
import { ModuleBridgePage } from '../pages/ModuleBridgePage';

export type ModernRouteComponentProps = {
  bootstrap: UIModeBootstrap;
};

export type ModernRouteComponent = ComponentType<ModernRouteComponentProps>;

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
  'companies.(default)': CompaniesListPage,
  'candidates.*': ModuleBridgePage,
  'joborders.*': ModuleBridgePage,
  'companies.*': ModuleBridgePage,
  'contacts.*': ModuleBridgePage,
  'activities.*': ModuleBridgePage,
  'calendar.*': ModuleBridgePage,
  'lists.*': ModuleBridgePage,
  'reports.*': ModuleBridgePage,
  'home.*': ModuleBridgePage,
  '*.*': ModuleBridgePage,
  'candidates.(default)': CandidatesListPage
};

export function resolveModernRouteComponent(moduleName: string, actionName: string): ModernRouteComponent | null {
  const moduleKey = (moduleName || '').toLowerCase();
  const actionKey = (actionName || '').toLowerCase();
  const candidates = [
    `${moduleKey}.${actionKey}`,
    `${moduleKey}.(default)`,
    `${moduleKey}.*`,
    '*.*'
  ];

  for (const routeKey of candidates) {
    if (registry[routeKey]) {
      return registry[routeKey];
    }
  }

  return null;
}
