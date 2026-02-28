import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  joborders: 'Job Orders',
  companies: 'Companies',
  contacts: 'Contacts',
  activities: 'Activities',
  calendar: 'Calendar',
  lists: 'Lists',
  reports: 'Reports',
  home: 'Home'
};

function toDisplayText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }
  return fallback;
}

function buildEmbeddedLegacyURL(legacyURL: string): string {
  try {
    const url = new URL(legacyURL, window.location.href);
    url.searchParams.set('ui_embed', '1');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (error) {
    const hasQuery = legacyURL.includes('?');
    return `${legacyURL}${hasQuery ? '&' : '?'}ui_embed=1`;
  }
}

function getPageTitle(moduleName: string): string {
  const normalized = String(moduleName || '').toLowerCase();
  if (MODULE_LABELS[normalized]) {
    return MODULE_LABELS[normalized];
  }

  return toDisplayText(moduleName, 'Workspace');
}

export function ModuleBridgePage({ bootstrap }: Props) {
  const moduleName = toDisplayText(bootstrap.targetModule, 'unknown');
  const actionName = toDisplayText(bootstrap.targetAction, '(default)');
  const title = getPageTitle(moduleName);
  const embeddedURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const dashboardURL = `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={`Compatibility mode for ${moduleName} / ${actionName}. Native modernization is in progress.`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={dashboardURL}>
              Back To Dashboard
            </a>
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Legacy Compatibility Workspace</h2>
              <p className="avel-list-panel__hint">
                Route: {moduleName} / {actionName}
              </p>
            </div>

            <div className="modern-compat-page__frame-wrap">
              <iframe
                title={`Legacy compatibility route ${moduleName}/${actionName}`}
                className="modern-compat-page__frame"
                src={embeddedURL}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
