import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type PageCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  mode: 'forward';
};

type BackLink = {
  label: string;
  href: string;
};

const COPY_BY_ROUTE_KEY: Record<string, PageCopy> = {
  'candidates.addduplicates': {
    title: 'Candidate Duplicate Review',
    subtitle: 'Review and resolve duplicate candidate records.',
    panelTitle: 'Duplicate Candidate Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.addeditimage': {
    title: 'Edit Candidate Profile Picture',
    subtitle: 'Upload or update the candidate profile image.',
    panelTitle: 'Candidate Profile Picture Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.emailcandidates': {
    title: 'Email Candidates',
    subtitle: 'Prepare and send candidate email communication.',
    panelTitle: 'Candidate Email Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.linkduplicate': {
    title: 'Link Duplicate Candidate',
    subtitle: 'Link related candidate profiles safely.',
    panelTitle: 'Candidate Link Duplicate Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.merge': {
    title: 'Merge Candidate Records',
    subtitle: 'Merge candidate profiles with legacy-safe behavior.',
    panelTitle: 'Candidate Merge Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.mergeinfo': {
    title: 'Candidate Merge Preview',
    subtitle: 'Review merge details before applying changes.',
    panelTitle: 'Candidate Merge Info Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.removeduplicity': {
    title: 'Remove Candidate Duplicity',
    subtitle: 'Finalize duplicate cleanup actions.',
    panelTitle: 'Candidate Duplicity Cleanup Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.savesources': {
    title: 'Save Candidate Sources',
    subtitle: 'Persist source values for candidate profiles.',
    panelTitle: 'Candidate Source Save Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  },
  'candidates.savedlists': {
    title: 'Candidate Saved Lists',
    subtitle: 'Manage candidate list assignment and access.',
    panelTitle: 'Candidate Saved Lists Workspace',
    panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
    mode: 'forward'
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Candidate Workspace',
  subtitle: 'Complete candidate action flow in compatibility mode.',
  panelTitle: 'Candidate Compatibility Workspace',
  panelSubtitle: 'Legacy candidate workflow is forwarded while migration continues.',
  mode: 'forward'
};

function toLowerText(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function parsePositiveInt(value: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

function buildRouteKey(bootstrap: UIModeBootstrap): string {
  return `${toLowerText(bootstrap.targetModule)}.${toLowerText(bootstrap.targetAction)}`;
}

function resolveBackLink(bootstrap: UIModeBootstrap, query: URLSearchParams): BackLink {
  const candidateID =
    parsePositiveInt(query.get('candidateID')) ||
    parsePositiveInt(query.get('newCandidateID')) ||
    parsePositiveInt(query.get('oldCandidateID')) ||
    parsePositiveInt(query.get('duplicateCandidateID'));

  if (candidateID > 0) {
    return {
      label: 'Back To Candidate',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=show&candidateID=${candidateID}`)
    };
  }

  return {
    label: 'Back To Candidates',
    href: ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=listByView`)
  };
}

export function CandidatesWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => COPY_BY_ROUTE_KEY[routeKey] || FALLBACK_COPY, [routeKey]);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const backLink = useMemo(() => resolveBackLink(bootstrap, query), [bootstrap, query]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
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
    <div className="avel-dashboard-page">
      <PageContainer
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page modern-compat-page--forward">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
                <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
              </div>
              <div className="modern-compat-page__meta">legacy_forward=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                {backLink.label}
              </a>
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
                {canContinue ? 'Preparing legacy candidate workflow redirect...' : 'Legacy candidate URL is unavailable.'}
              </div>
            </section>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
