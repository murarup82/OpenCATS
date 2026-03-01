import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

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

function resolvePageCopy(actionName: string): { title: string; subtitle: string } {
  const normalizedAction = String(actionName || '').toLowerCase();
  if (normalizedAction === 'add') {
    return {
      title: 'Add Candidate',
      subtitle: 'Create a candidate profile in the modern shell with legacy-safe form behavior.'
    };
  }

  return {
    title: 'Edit Candidate',
    subtitle: 'Update candidate profile details using the proven legacy form inside the modern UI.'
  };
}

export function CandidatesFormBridgePage({ bootstrap }: Props) {
  const contentCopy = resolvePageCopy(bootstrap.targetAction);
  const embeddedURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const listURL = `${bootstrap.indexName}?m=candidates&a=listByView&view=list&ui=modern`;
  const dashboardURL = `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`;
  const [frameReloadToken, setFrameReloadToken] = useState(0);

  return (
    <div className="avel-dashboard-page avel-candidates-page">
      <PageContainer
        title={contentCopy.title}
        subtitle={contentCopy.subtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Candidates
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
                <h2 className="modern-compat-page__title">Candidate Form Compatibility Workspace</h2>
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
                onClick={() => setFrameReloadToken((current) => current + 1)}
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
                Candidate List
              </a>
            </nav>

            <div className="modern-compat-page__frame-wrap">
              <iframe
                key={frameReloadToken}
                title={`Candidate form ${bootstrap.targetAction || 'edit'}`}
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
