import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

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

function CandidateForwardPanel({
  legacyURL
}: {
  legacyURL: string;
}) {
  const canContinue = legacyURL !== '';

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [canContinue, legacyURL]);

  return (
    <section className="modern-compat-page modern-compat-page--forward">
      <header className="modern-compat-page__header">
        <div>
          <h2 className="modern-compat-page__title">Candidate Form Redirect</h2>
          <p className="modern-compat-page__subtitle">
            The candidate form continues in the legacy endpoint while the modern shell keeps the handoff visible.
          </p>
        </div>
        <div className="modern-compat-page__meta">legacy_forward=1</div>
      </header>

      <div className="modern-compat-page__actions">
        {canContinue ? (
          <>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Continue to Legacy UI
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
              Open In New Tab
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        ) : null}
      </div>

      <section className="avel-list-panel">
        <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`} aria-live="polite">
          {canContinue
            ? 'Preparing legacy candidate form redirect...'
            : 'Legacy candidate form URL is unavailable for this route.'}
        </div>
      </section>
    </section>
  );
}

export function CandidatesFormBridgePage({ bootstrap }: Props) {
  const contentCopy = resolvePageCopy(bootstrap.targetAction);
  const listURL = `${bootstrap.indexName}?m=candidates&a=listByView&view=list&ui=modern`;
  const dashboardURL = `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`;

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
          <CandidateForwardPanel legacyURL={bootstrap.legacyURL} />
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Quick Navigation</h2>
              <p className="avel-list-panel__hint">Use these links to move between the modern shell and the candidate list.</p>
            </div>
            <nav className="modern-compat-page__nav" aria-label="Quick navigation">
              <a className="modern-chip modern-chip--info" href={dashboardURL}>
                Dashboard
              </a>
              <a className="modern-chip modern-chip--info" href={listURL}>
                Candidate List
              </a>
            </nav>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
