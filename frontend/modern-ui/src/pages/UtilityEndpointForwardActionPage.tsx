import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type RouteCopy = {
  title: string;
  subtitle: string;
};

const MODULE_LABELS: Record<string, string> = {
  calendar: 'Calendar',
  toolbar: 'Toolbar',
  wizard: 'Wizard'
};

const ROUTE_COPY_BY_KEY: Record<string, RouteCopy> = {
  'calendar.dynamicdata': {
    title: 'Calendar Utility Endpoint',
    subtitle: 'Forwarding to legacy calendar data endpoint.'
  },
  'toolbar.checkemailisinsystem': {
    title: 'Toolbar Utility Endpoint',
    subtitle: 'Forwarding to legacy email validation endpoint.'
  },
  'toolbar.getjavascriptlib': {
    title: 'Toolbar Utility Endpoint',
    subtitle: 'Forwarding to legacy JavaScript library endpoint.'
  },
  'toolbar.getlicensekey': {
    title: 'Toolbar Utility Endpoint',
    subtitle: 'Forwarding to legacy license key endpoint.'
  },
  'toolbar.getremoteversion': {
    title: 'Toolbar Utility Endpoint',
    subtitle: 'Forwarding to legacy remote version endpoint.'
  },
  'toolbar.storemonsterresumetext': {
    title: 'Toolbar Utility Endpoint',
    subtitle: 'Forwarding to legacy resume text endpoint.'
  },
  'wizard.ajax_getpage': {
    title: 'Wizard Utility Endpoint',
    subtitle: 'Forwarding to legacy wizard AJAX endpoint.'
  }
};

function toText(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function toRouteKey(moduleName: string, actionName: string): string {
  return `${moduleName}.${actionName}`;
}

function getFallbackTitle(moduleName: string): string {
  const label = MODULE_LABELS[moduleName] || 'Utility';
  return `${label} Utility Endpoint`;
}

export function UtilityEndpointForwardActionPage({ bootstrap }: Props) {
  const moduleName = useMemo(() => toText(bootstrap.targetModule), [bootstrap.targetModule]);
  const actionName = useMemo(() => toText(bootstrap.targetAction), [bootstrap.targetAction]);
  const routeKey = useMemo(() => toRouteKey(moduleName, actionName), [moduleName, actionName]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const canContinue = legacyURL !== '';
  const routeCopy = ROUTE_COPY_BY_KEY[routeKey];
  const title = routeCopy?.title || getFallbackTitle(moduleName);
  const subtitle =
    routeCopy?.subtitle ||
    `Forwarding ${moduleName || 'module'} / ${actionName || 'action'} to a legacy utility endpoint.`;

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [canContinue, legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={subtitle}
        actions={
          canContinue ? (
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Continue
            </a>
          ) : null
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`}>
              {canContinue ? 'Redirecting to legacy utility endpoint...' : 'Legacy endpoint URL is unavailable.'}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
