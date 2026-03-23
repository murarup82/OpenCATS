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
  mode: 'embedded' | 'download';
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
  'reports.generatejoborderreportpdf': {
    title: 'Generate Job Order Report PDF',
    subtitle: 'Forwarding to the legacy PDF download endpoint.',
    panelTitle: 'Job Order Report PDF Redirect',
    panelSubtitle: 'The legacy endpoint will start the download immediately.',
    mode: 'download'
  },
  'reports.showhirereport': {
    title: 'Hire Report',
    subtitle: 'View the hire report in the legacy workspace.',
    panelTitle: 'Hire Report Workspace',
    panelSubtitle: 'Legacy reporting output is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.showplacementreport': {
    title: 'Placement Report',
    subtitle: 'View the placement report in the legacy workspace.',
    panelTitle: 'Placement Report Workspace',
    panelSubtitle: 'Legacy reporting output is embedded while modernization continues.',
    mode: 'embedded'
  },
  'reports.showsubmissionreport': {
    title: 'Submission Report',
    subtitle: 'View the submission report in the legacy workspace.',
    panelTitle: 'Submission Report Workspace',
    panelSubtitle: 'Legacy reporting output is embedded while modernization continues.',
    mode: 'embedded'
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

export function ReportsWorkflowActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => ROUTE_COPY[routeKey] || FALLBACK_COPY, [routeKey]);
  const reportsURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=reports&a=reports`),
    [bootstrap.indexName]
  );
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  useEffect(() => {
    if (copy.mode !== 'download' || legacyURL === '') {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [copy.mode, legacyURL]);

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
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
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
                {copy.mode === 'embedded' ? 'ui_embed=1' : 'download=1'}
              </div>
            </header>

            {copy.mode === 'embedded' ? (
              <>
                <div className="modern-compat-page__actions">
                  <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                    Reload
                  </button>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Open Legacy UI
                  </a>
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
              </>
            ) : (
              <div className="avel-list-panel">
                <div className="modern-state">
                  Preparing legacy PDF download...
                </div>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
