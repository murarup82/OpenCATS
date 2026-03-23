import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type RouteCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  mode: 'embedded' | 'forward';
};

const ROUTE_COPY: Record<string, RouteCopy> = {
  'reports.customizeeeoreport': {
    title: 'Customize EEO Report',
    subtitle: 'Configure the EEO report in the legacy workspace.',
    panelTitle: 'EEO Report Customization Workspace',
    panelSubtitle: 'Legacy report configuration is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.customizejoborderreport': {
    title: 'Customize Job Order Report',
    subtitle: 'Configure the job order report in the legacy workspace.',
    panelTitle: 'Job Order Report Customization Workspace',
    panelSubtitle: 'Legacy report configuration is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.generateeeoreportpreview': {
    title: 'EEO Report Preview',
    subtitle: 'Review the generated EEO report preview in the legacy workspace.',
    panelTitle: 'EEO Report Preview Workspace',
    panelSubtitle: 'Legacy report preview is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.showhirereport': {
    title: 'Hire Report',
    subtitle: 'View the hire report in the legacy workspace.',
    panelTitle: 'Hire Report Workspace',
    panelSubtitle: 'Legacy reporting output is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.showplacementreport': {
    title: 'Placement Report Redirect',
    subtitle: 'Forwarding to the legacy placement report workspace.',
    panelTitle: 'Placement Report Redirect',
    panelSubtitle: 'Legacy report output opens automatically while the fallback remains visible.',
    mode: 'forward'
  },
  'reports.showsubmissionreport': {
    title: 'Submission Report Redirect',
    subtitle: 'Forwarding to the legacy submission report workspace.',
    panelTitle: 'Submission Report Redirect',
    panelSubtitle: 'Legacy report output opens automatically in 500ms while the fallback remains visible.',
    mode: 'forward'
  }
};

const FALLBACK_COPY: RouteCopy = {
  title: 'Reports Workflow',
  subtitle: 'Legacy report workflow compatibility page.',
  panelTitle: 'Reports Workflow Workspace',
  panelSubtitle: 'Legacy workflow is embedded while modernization continues.',
  mode: 'embedded'
};

function toKey(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function buildRouteKey(bootstrap: UIModeBootstrap): string {
  return `${toKey(bootstrap.targetModule)}.${toKey(bootstrap.targetAction)}`;
}

type SharedProps = {
  copy: RouteCopy;
  reportsURL: string;
  legacyURL: string;
};

type EmbeddedProps = SharedProps & {
  embeddedURL: string;
};

function ReportsWorkflowEmbeddedPage({ copy, reportsURL, legacyURL, embeddedURL }: EmbeddedProps) {
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();
  const canContinue = legacyURL !== '';

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={reportsURL}>
              Back To Reports
            </a>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            ) : null}
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
              <div className="modern-compat-page__meta">
                ui_embed=1
              </div>
            </header>

            <div className="modern-compat-page__actions">
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload
              </button>
              {canContinue ? (
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              ) : null}
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

type ForwardProps = SharedProps;

function ReportsWorkflowForwardPage({ copy, reportsURL, legacyURL }: ForwardProps) {
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
            <a className="modern-btn modern-btn--secondary" href={reportsURL}>
              Back To Reports
            </a>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            ) : null}
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
              <div className="modern-compat-page__meta">
                legacy_forward=1
              </div>
            </header>

            <div className="avel-list-panel reports-workflow-forward__body">
              <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`} aria-live="polite">
                {canContinue
                  ? 'Preparing legacy report redirect...'
                  : 'Legacy report URL is unavailable.'}
              </div>
              {canContinue ? (
                <div className="modern-table-actions reports-workflow-forward__actions" style={{ marginTop: '10px' }}>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Continue to Legacy Report
                  </a>
                </div>
              ) : null}
              <p className="reports-workflow-forward__note">
                {canContinue
                  ? 'The redirect keeps the legacy report available while you still have an explicit escape hatch.'
                  : 'Use Back To Reports to return to the launcher and retry from there.'}
              </p>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

export function ReportsWorkflowActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => ROUTE_COPY[routeKey] || FALLBACK_COPY, [routeKey]);
  const reportsURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=reports&a=reports`),
    [bootstrap.indexName]
  );
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);

  if (copy.mode === 'forward') {
    return <ReportsWorkflowForwardPage copy={copy} reportsURL={reportsURL} legacyURL={legacyURL} />;
  }

  return (
    <ReportsWorkflowEmbeddedPage
      copy={copy}
      reportsURL={reportsURL}
      legacyURL={legacyURL}
      embeddedURL={embeddedURL}
    />
  );
}
