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
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Form</h2>
              <p className="avel-list-panel__hint">
                This form is rendered from legacy code for full feature parity while modernization continues.
              </p>
            </div>

            <div className="modern-compat-page__frame-wrap">
              <iframe
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
