import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function decodeTitle(rawValue: string): string {
  const value = String(rawValue || '').trim();
  if (value === '') {
    return '';
  }
  try {
    return decodeURIComponent(value);
  } catch (_error) {
    return value;
  }
}

function toRouteURL(indexName: string, candidateID: number, title: string, printMode: 'yes' | 'no'): string {
  return ensureModernUIURL(
    `${indexName}?m=candidates&a=show_questionnaire&candidateID=${candidateID}` +
      `&questionnaireTitle=${encodeURIComponent(title)}&print=${printMode}`
  );
}

function toLegacyRouteURL(indexName: string, candidateID: number, title: string, printMode: 'yes' | 'no'): string {
  return ensureUIURL(
    `${indexName}?m=candidates&a=show_questionnaire&candidateID=${candidateID}` +
      `&questionnaireTitle=${encodeURIComponent(title)}&print=${printMode}`,
    'legacy'
  );
}

export function CandidateQuestionnaireActionPage({ bootstrap }: Props) {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const candidateID = useMemo(() => Number(query.get('candidateID') || 0), [query]);
  const questionnaireTitle = useMemo(() => decodeTitle(query.get('questionnaireTitle') || ''), [query]);
  const printRaw = useMemo(() => String(query.get('print') || 'no').toLowerCase(), [query]);
  const printMode: 'yes' | 'no' = printRaw === 'yes' ? 'yes' : 'no';
  const viewURL = useMemo(
    () => toRouteURL(bootstrap.indexName, candidateID, questionnaireTitle, 'no'),
    [bootstrap.indexName, candidateID, questionnaireTitle]
  );
  const printURL = useMemo(
    () => toRouteURL(bootstrap.indexName, candidateID, questionnaireTitle, 'yes'),
    [bootstrap.indexName, candidateID, questionnaireTitle]
  );
  const legacyRouteURL = useMemo(
    () => toLegacyRouteURL(bootstrap.indexName, candidateID, questionnaireTitle, printMode),
    [bootstrap.indexName, candidateID, printMode, questionnaireTitle]
  );
  const candidateURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=show&candidateID=${candidateID}`),
    [bootstrap.indexName, candidateID]
  );
  const canContinue = legacyRouteURL !== '';

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyRouteURL);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [canContinue, legacyRouteURL]);

  if (!Number.isFinite(candidateID) || candidateID <= 0 || questionnaireTitle.trim() === '') {
    return (
      <ErrorState
        message="Missing required questionnaire route parameters."
        actionLabel="Back To Candidates"
        actionURL={ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=listByView`)}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={`Questionnaire: ${questionnaireTitle}`}
        subtitle={`Candidate #${candidateID} | ${printMode === 'yes' ? 'Print View' : 'Standard View'}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={candidateURL}>
              Back To Candidate
            </a>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyRouteURL}>
                Open Legacy UI
              </a>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page modern-compat-page--forward">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">Candidate Questionnaire Redirect</h2>
                <p className="modern-compat-page__subtitle">
                  The questionnaire now forwards to the legacy endpoint while preserving the view and print route links.
                </p>
              </div>
              <div className="modern-compat-page__meta">legacy_forward=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={viewURL}>
                View Mode
              </a>
              <a className="modern-btn modern-btn--secondary" href={printURL}>
                Print Mode
              </a>
              {canContinue ? (
                <>
                  <a className="modern-btn modern-btn--secondary" href={legacyRouteURL}>
                    Continue to Legacy UI
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyRouteURL} target="_blank" rel="noreferrer">
                    Open In New Tab
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyRouteURL}>
                    Open Legacy UI
                  </a>
                </>
              ) : null}
            </div>

            <section className="avel-list-panel">
              <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`} aria-live="polite">
                {canContinue
                  ? 'Preparing legacy questionnaire redirect...'
                  : 'Legacy questionnaire URL is unavailable for this route.'}
              </div>
            </section>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
