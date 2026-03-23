import { useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
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
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.addeditimage': {
    title: 'Edit Candidate Profile Picture',
    subtitle: 'Upload or update candidate profile image.',
    panelTitle: 'Candidate Profile Picture Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.emailcandidates': {
    title: 'Email Candidates',
    subtitle: 'Prepare and send candidate email communication.',
    panelTitle: 'Candidate Email Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.linkduplicate': {
    title: 'Link Duplicate Candidate',
    subtitle: 'Link related candidate profiles safely.',
    panelTitle: 'Candidate Link Duplicate Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.merge': {
    title: 'Merge Candidate Records',
    subtitle: 'Merge candidate profiles with legacy-safe behavior.',
    panelTitle: 'Candidate Merge Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.mergeinfo': {
    title: 'Candidate Merge Preview',
    subtitle: 'Review merge details before applying changes.',
    panelTitle: 'Candidate Merge Info Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.removeduplicity': {
    title: 'Remove Candidate Duplicity',
    subtitle: 'Finalize duplicate cleanup actions.',
    panelTitle: 'Candidate Duplicity Cleanup Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.savesources': {
    title: 'Save Candidate Sources',
    subtitle: 'Persist source values for candidate profiles.',
    panelTitle: 'Candidate Source Save Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'candidates.savedlists': {
    title: 'Candidate Saved Lists',
    subtitle: 'Manage candidate list assignment and access.',
    panelTitle: 'Candidate Saved Lists Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'joborders.edithiringplan': {
    title: 'Edit Hiring Plan',
    subtitle: 'Adjust hiring plan rows and openings for this job order.',
    panelTitle: 'Hiring Plan Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'joborders.setcandidatejoborder': {
    title: 'Set Candidate Job Order',
    subtitle: 'Assign candidate and job order linkage settings.',
    panelTitle: 'Candidate Job Order Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.customizeeeoreport': {
    title: 'Customize EEO Report',
    subtitle: 'Configure EEO report parameters.',
    panelTitle: 'EEO Report Customization Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.customizejoborderreport': {
    title: 'Customize Job Order Report',
    subtitle: 'Configure job order report options and filters.',
    panelTitle: 'Job Order Report Customization Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.generateeeoreportpreview': {
    title: 'EEO Report Preview',
    subtitle: 'Review generated EEO report preview output.',
    panelTitle: 'EEO Report Preview Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.generatejoborderreportpdf': {
    title: 'Generate Job Order Report PDF',
    subtitle: 'Generate and download the job order report PDF.',
    panelTitle: 'Job Order Report PDF Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.showhirereport': {
    title: 'Hire Report',
    subtitle: 'View hiring activity report output.',
    panelTitle: 'Hire Report Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.showplacementreport': {
    title: 'Placement Report',
    subtitle: 'View placement reporting output.',
    panelTitle: 'Placement Report Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'reports.showsubmissionreport': {
    title: 'Submission Report',
    subtitle: 'View submission reporting output.',
    panelTitle: 'Submission Report Workspace',
    panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
  },
  'graphs.generic': {
    title: 'Generic Graph',
    subtitle: 'View generated graph output in compatibility mode.',
    panelTitle: 'Generic Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while parity migration continues.'
  },
  'graphs.genericpie': {
    title: 'Generic Pie Graph',
    subtitle: 'View generated pie graph output in compatibility mode.',
    panelTitle: 'Generic Pie Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while parity migration continues.'
  },
  'graphs.joborderreportgraph': {
    title: 'Job Order Report Graph',
    subtitle: 'View job order report graph output in compatibility mode.',
    panelTitle: 'Job Order Report Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while parity migration continues.'
  },
  'graphs.testgraph': {
    title: 'Graph Test',
    subtitle: 'View test graph output in compatibility mode.',
    panelTitle: 'Graph Test Workspace',
    panelSubtitle: 'Legacy graph output is embedded while parity migration continues.'
  },
  'graphs.wordverify': {
    title: 'Word Verification Graphic',
    subtitle: 'View word verification image output in compatibility mode.',
    panelTitle: 'Word Verification Workspace',
    panelSubtitle: 'Legacy graph output is embedded while parity migration continues.'
  },
  'settings.getfirefoxmodal': {
    title: 'Toolbar Browser Requirement',
    subtitle: 'Display browser compatibility guidance for toolbar setup.',
    panelTitle: 'Firefox Requirement Workspace',
    panelSubtitle: 'Legacy settings flow is embedded while parity migration continues.'
  },
  'settings.previewpage': {
    title: 'Settings Preview',
    subtitle: 'Preview settings content in compatibility mode.',
    panelTitle: 'Settings Preview Workspace',
    panelSubtitle: 'Legacy settings flow is embedded while parity migration continues.'
  },
  'settings.previewpagetop': {
    title: 'Settings Preview Header',
    subtitle: 'Preview header content in compatibility mode.',
    panelTitle: 'Settings Preview Header Workspace',
    panelSubtitle: 'Legacy settings flow is embedded while parity migration continues.'
  },
  'settings.oncareerportaltweak': {
    title: 'Career Portal Template Action',
    subtitle: 'Apply career portal template changes in compatibility mode.',
    panelTitle: 'Career Portal Template Action Workspace',
    panelSubtitle: 'Legacy settings flow is embedded while parity migration continues.'
  },
  'gdpr.requests': {
    title: 'GDPR Requests',
    subtitle: 'Review and manage GDPR consent request records.',
    panelTitle: 'GDPR Requests Workspace',
    panelSubtitle: 'Legacy GDPR flow is embedded while parity migration continues.'
  },
  'toolbar.install': {
    title: 'Toolbar Install',
    subtitle: 'Install and review legacy toolbar setup guidance.',
    panelTitle: 'Toolbar Install Workspace',
    panelSubtitle: 'Legacy toolbar flow is embedded while parity migration continues.'
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Legacy Action Workspace',
  subtitle: 'Embedded compatibility workspace for legacy action flow.',
  panelTitle: 'Legacy Compatibility Workspace',
  panelSubtitle: 'Legacy workflow is embedded while parity migration continues.'
};

const MODULE_FALLBACK_COPY: Record<string, PageCopy> = {
  import: {
    title: 'Import Workspace',
    subtitle: 'Complete the import flow in legacy-compatibility mode.',
    panelTitle: 'Import Compatibility Workspace',
    panelSubtitle: 'Legacy import flow is embedded while parity migration continues.'
  },
  settings: {
    title: 'Settings Workspace',
    subtitle: 'Manage system settings through the embedded compatibility workspace.',
    panelTitle: 'Settings Compatibility Workspace',
    panelSubtitle: 'Legacy settings flow is embedded while parity migration continues.'
  },
  gdpr: {
    title: 'GDPR Workspace',
    subtitle: 'Manage GDPR request and consent operations in compatibility mode.',
    panelTitle: 'GDPR Compatibility Workspace',
    panelSubtitle: 'Legacy GDPR flow is embedded while parity migration continues.'
  },
  toolbar: {
    title: 'Toolbar Workspace',
    subtitle: 'Complete toolbar compatibility operations in embedded mode.',
    panelTitle: 'Toolbar Compatibility Workspace',
    panelSubtitle: 'Legacy toolbar flow is embedded while parity migration continues.'
  }
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

function resolveCopy(routeKey: string, bootstrap: UIModeBootstrap): PageCopy {
  const directCopy = COPY_BY_ROUTE_KEY[routeKey];
  if (directCopy) {
    return directCopy;
  }

  const moduleCopy = MODULE_FALLBACK_COPY[toLowerText(bootstrap.targetModule)];
  return moduleCopy || FALLBACK_COPY;
}

function resolveBackLink(bootstrap: UIModeBootstrap, query: URLSearchParams): BackLink | null {
  const moduleKey = toLowerText(bootstrap.targetModule);
  if (moduleKey === 'candidates') {
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

  if (moduleKey === 'joborders') {
    const jobOrderID = parsePositiveInt(query.get('jobOrderID'));
    if (jobOrderID > 0) {
      return {
        label: 'Back To Job Order Edit',
        href: ensureModernUIURL(`${bootstrap.indexName}?m=joborders&a=edit&jobOrderID=${jobOrderID}`)
      };
    }

    return {
      label: 'Back To Job Orders',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=joborders&a=listByView`)
    };
  }

  if (moduleKey === 'reports') {
    return {
      label: 'Back To Reports',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=reports&a=reports`)
    };
  }

  if (moduleKey === 'graphs') {
    return {
      label: 'Back To Graphs',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=graphs`)
    };
  }

  if (moduleKey === 'import') {
    return {
      label: 'Back To Import',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=import&a=import`)
    };
  }

  if (moduleKey === 'settings') {
    return {
      label: 'Back To Settings',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration`)
    };
  }

  if (moduleKey === 'gdpr') {
    return {
      label: 'Back To Candidates',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=listByView`)
    };
  }

  if (moduleKey === 'toolbar') {
    return {
      label: 'Back To Settings',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration`)
    };
  }

  return null;
}

export function LegacyActionWorkspacePage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => resolveCopy(routeKey, bootstrap), [routeKey, bootstrap]);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const backLink = useMemo(() => resolveBackLink(bootstrap, query), [bootstrap, query]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <>
            {backLink ? <a className="modern-btn modern-btn--secondary" href={backLink.href}>{backLink.label}</a> : null}
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
                <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
              </div>
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            <div className="modern-compat-page__actions">
              {backLink ? <a className="modern-btn modern-btn--secondary" href={backLink.href}>{backLink.label}</a> : null}
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>Reload</button>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">Open In New Tab</a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
            </div>

            <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading legacy workspace...
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`${copy.title} legacy workspace`}
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
