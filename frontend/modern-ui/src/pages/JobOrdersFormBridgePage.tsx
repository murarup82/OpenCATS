import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function resolvePageCopy(actionName: string): { title: string; subtitle: string } {
  const normalizedAction = String(actionName || '').toLowerCase();
  if (normalizedAction === 'add') {
    return {
      title: 'Add Job Order',
      subtitle: 'Create a job order in the modern shell with legacy-safe form behavior.'
    };
  }

  return {
    title: 'Edit Job Order',
    subtitle: 'Update job order details using the proven legacy form inside the modern UI.'
  };
}

export function JobOrdersFormBridgePage({ bootstrap }: Props) {
  const contentCopy = resolvePageCopy(bootstrap.targetAction);
  const embeddedURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const listURL = `${bootstrap.indexName}?m=joborders&a=listByView&ui=modern`;
  const dashboardURL = `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`;
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={contentCopy.title}
        subtitle={contentCopy.subtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Job Orders
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
                <h2 className="modern-compat-page__title">Job Order Form Compatibility Workspace</h2>
                <p className="modern-compat-page__subtitle">
                  This form is rendered from legacy code for full feature parity while modernization continues.
                </p>
              </div>
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={reloadFrame}
              >
                Reload Form
              </button>
              <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL} target="_blank" rel="noreferrer">
                Open Current Form In New Tab
              </a>
            </div>

            <nav className="modern-compat-page__nav" aria-label="Quick navigation">
              <a className="modern-chip modern-chip--info" href={dashboardURL}>
                Dashboard
              </a>
              <a className="modern-chip modern-chip--info" href={listURL}>
                Job Order List
              </a>
            </nav>

            <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading job order form...
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`Job order form ${bootstrap.targetAction || 'edit'}`}
                className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                src={embeddedURL}
                onLoad={handleFrameLoad}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
