import type { ComponentType } from 'react';
import type { UIModeBootstrap } from '../types';
import { DashboardMyPage } from '../pages/DashboardMyPage';
import { CandidatesListPage } from '../pages/CandidatesListPage';
import { CandidatesShowPage } from '../pages/CandidatesShowPage';
import { CandidatesFormBridgePage } from '../pages/CandidatesFormBridgePage';

export type ModernRouteComponentProps = {
  bootstrap: UIModeBootstrap;
};

export type ModernRouteComponent = ComponentType<ModernRouteComponentProps>;

const registry: Record<string, ModernRouteComponent> = {
  'dashboard.my': DashboardMyPage,
  'dashboard.(default)': DashboardMyPage,
  'candidates.listbyview': CandidatesListPage,
  'candidates.show': CandidatesShowPage,
  'candidates.add': CandidatesFormBridgePage,
  'candidates.edit': CandidatesFormBridgePage,
  'candidates.(default)': CandidatesListPage
};

export function resolveModernRouteComponent(moduleName: string, actionName: string): ModernRouteComponent | null {
  const moduleKey = (moduleName || '').toLowerCase();
  const actionKey = (actionName || '').toLowerCase();
  const candidates = [
    `${moduleKey}.${actionKey}`,
    `${moduleKey}.(default)`
  ];

  for (const routeKey of candidates) {
    if (registry[routeKey]) {
      return registry[routeKey];
    }
  }

  return null;
}
