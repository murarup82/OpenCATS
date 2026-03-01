import type { UIModeBootstrap } from '../../types';
import { buildEmbeddedLegacyURL } from '../../lib/embeddedLegacy';
import { useEmbeddedLegacyFrame } from '../../lib/useEmbeddedLegacyFrame';
import { PageContainer } from '../layout/PageContainer';

type Props = {
  bootstrap: UIModeBootstrap;
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  joborders: 'Job Orders',
  companies: 'Companies',
  contacts: 'Contacts',
  activity: 'Activities',
  calendar: 'Calendar',
  lists: 'Lists',
  reports: 'Reports',
  home: 'Home'
};

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
  },
  {
    label: 'Reports',
    url: (indexName) => `${indexName}?m=reports&a=reports&ui=modern`
  }
];

function getPageTitle(moduleName: string): string {
  const normalized = String(moduleName || '').toLowerCase();
  if (MODULE_LABELS[normalized]) {
    return MODULE_LABELS[normalized];
  }
  return 'Workspace';
}

export function LegacyCompatPage({ bootstrap }: Props) {
  const moduleName = bootstrap.targetModule || '--';
  const actionName = bootstrap.targetAction || '(default)';
  const pageTitle = getPageTitle(moduleName);
  const embedLegacyURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={pageTitle}
        subtitle={`Compatibility mode for ${moduleName} / ${actionName}. Native modernization is in progress.`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
            <a className="modern-btn modern-btn--secondary" href={bootstrap.modernURL}>
              Reload Modern Shell
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">Compatibility Workspace</h2>
                <p className="modern-compat-page__subtitle">
                  This route is not fully migrated yet. Legacy page is embedded inline to preserve functionality.
                </p>
              </div>
              <div className="modern-compat-page__meta">
                <span>Route: {moduleName} / {actionName}</span>
              </div>
            </header>

            <div className="modern-compat-page__actions">
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload Workspace
              </button>
              <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL} target="_blank" rel="noreferrer">
                Open Current Route In New Tab
              </a>
            </div>

            <nav className="modern-compat-page__nav" aria-label="Quick navigation">
              {QUICK_NAV_ROUTES.map((entry) => (
                <a key={entry.label} className="modern-chip modern-chip--info" href={entry.url(bootstrap.indexName)}>
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
                src={embedLegacyURL}
                onLoad={handleFrameLoad}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
