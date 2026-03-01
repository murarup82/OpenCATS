import { useState } from 'react';
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

const QUICK_NAV_ROUTES: Array<{ label: string; url: (indexName: string) => string }> = [
  {
    label: 'Dashboard',
    url: (indexName) => `${indexName}?m=dashboard&a=my&ui=modern`
  },
  {
    label: 'Candidates',
    url: (indexName) => `${indexName}?m=candidates&a=listByView&ui=modern`
  },
  {
    label: 'Job Orders',
    url: (indexName) => `${indexName}?m=joborders&a=listByView&ui=modern`
  }
];

export function ModuleBridgePage({ bootstrap }: Props) {
  const moduleName = toDisplayText(bootstrap.targetModule, 'unknown');
  const actionName = toDisplayText(bootstrap.targetAction, '(default)');
  const title = getPageTitle(moduleName);
  const embeddedURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const dashboardURL = `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`;
  const [frameReloadToken, setFrameReloadToken] = useState(0);
  const [frameLoading, setFrameLoading] = useState(true);

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
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">Legacy Compatibility Workspace</h2>
                <p className="modern-compat-page__subtitle">
                  Route: {moduleName} / {actionName}
                </p>
              </div>
              <div className="modern-compat-page__meta">
                ui_embed=1
              </div>
            </header>

            <div className="modern-compat-page__actions">
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => {
                  setFrameLoading(true);
                  setFrameReloadToken((current) => current + 1);
                }}
              >
                Reload Workspace
              </button>
              <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL} target="_blank" rel="noreferrer">
                Open Current Route In New Tab
              </a>
            </div>

            <nav className="modern-compat-page__nav" aria-label="Quick navigation">
              {QUICK_NAV_ROUTES.map((entry) => (
                <a
                  key={entry.label}
                  className="modern-chip modern-chip--info"
                  href={entry.url(bootstrap.indexName)}
                >
                  {entry.label}
                </a>
              ))}
            </nav>

            <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading legacy workspace...
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`Legacy compatibility route ${moduleName}/${actionName}`}
                className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                src={embeddedURL}
                onLoad={() => setFrameLoading(false)}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
