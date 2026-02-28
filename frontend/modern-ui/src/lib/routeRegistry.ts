import type { ComponentType } from 'react';
import type { UIModeBootstrap } from '../types';
import { DashboardMyReadOnlyPage } from '../pages/DashboardMyReadOnlyPage';

export type ModernRouteComponentProps = {
  bootstrap: UIModeBootstrap;
};

export type ModernRouteComponent = ComponentType<ModernRouteComponentProps>;

const registry: Record<string, ModernRouteComponent> = {
  'dashboard.my': DashboardMyReadOnlyPage,
  'dashboard.(default)': DashboardMyReadOnlyPage
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
