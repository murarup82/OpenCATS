import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ActionMode = 'embed' | 'download' | 'modern-redirect';

type ReportsActionMeta = {
  canonicalAction: string;
  title: string;
  subtitle: string;
  mode: ActionMode;
};

const REPORTS_ACTION_META: Record<string, ReportsActionMeta> = {
  customerdashboarddetails: {
    canonicalAction: 'customerDashboardDetails',
    title: 'Customer Dashboard Detail',
    subtitle: 'Metric drill-down view for the selected customer window.',
    mode: 'modern-redirect'
  },
  customizeeeoreport: {
    canonicalAction: 'customizeEEOReport',
    title: 'EEO Report Builder',
    subtitle: 'Configure EEO report window and composition filters.',
    mode: 'embed'
  },
  customizejoborderreport: {
    canonicalAction: 'customizeJobOrderReport',
    title: 'Job Order Report Builder',
    subtitle: 'Configure export scope for job order report output.',
    mode: 'embed'
  },
  generateeeoreportpreview: {
    canonicalAction: 'generateEEOReportPreview',
    title: 'EEO Report Preview',
    subtitle: 'Legacy preview rendering embedded in modern workspace.',
    mode: 'embed'
  },
  generatejoborderreportpdf: {
    canonicalAction: 'generateJobOrderReportPDF',
    title: 'Job Order Report PDF',
    subtitle: 'Legacy export endpoint download.',
    mode: 'download'
  },
  showhirereport: {
    canonicalAction: 'showHireReport',
    title: 'Hire Report',
    subtitle: 'Legacy report rendering embedded in modern workspace.',
    mode: 'embed'
  },
  showplacementreport: {
    canonicalAction: 'showPlacementReport',
    title: 'Placement Report',
    subtitle: 'Legacy report rendering embedded in modern workspace.',
    mode: 'embed'
  },
  showsubmissionreport: {
    canonicalAction: 'showSubmissionReport',
    title: 'Submission Report',
    subtitle: 'Legacy report rendering embedded in modern workspace.',
    mode: 'embed'
  }
};

const RELATED_ACTIONS = [
  'showSubmissionReport',
  'showPlacementReport',
  'showHireReport',
  'customizeJobOrderReport',
  'customizeEEOReport'
] as const;

function normalizeAction(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function buildBaseQuery(search: URLSearchParams, actionName: string): URLSearchParams {
  const query = new URLSearchParams(search);
  query.delete('ui');
  query.delete('format');
  query.delete('modernPage');
  query.delete('contractVersion');
  query.set('m', 'reports');
  query.set('a', actionName);
  return query;
}

function buildModernReportsURL(indexName: string): string {
  return ensureModernUIURL(`${indexName}?m=reports&a=reports`);
}

function buildModernCustomerDashboardURL(indexName: string, source: URLSearchParams): string {
  const query = new URLSearchParams();
  query.set('m', 'reports');
  query.set('a', 'customerDashboard');

  const companyID = source.get('companyID');
  const rangeDays = source.get('rangeDays');
  const activityType = source.get('activityType');
  const focusMetric = source.get('focusMetric');
  if (companyID) {
    query.set('companyID', companyID);
  }
  if (rangeDays) {
    query.set('rangeDays', rangeDays);
  }
  if (activityType) {
    query.set('activityType', activityType);
  }
  if (focusMetric) {
    query.set('focusMetric', focusMetric);
  }

  return ensureModernUIURL(`${indexName}?${query.toString()}`);
}

function buildModernActionURL(indexName: string, source: URLSearchParams, actionName: string): string {
  return ensureModernUIURL(`${indexName}?${buildBaseQuery(source, actionName).toString()}`);
}

export function ReportsActionPage({ bootstrap }: Props) {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const targetAction = useMemo(() => {
    const rawAction = bootstrap.targetAction || search.get('a') || '';
    return normalizeAction(rawAction);
  }, [bootstrap.targetAction, search]);
  const actionMeta = REPORTS_ACTION_META[targetAction] || null;

  const reportsURL = useMemo(() => buildModernReportsURL(bootstrap.indexName), [bootstrap.indexName]);
  const customerDashboardURL = useMemo(
    () => buildModernCustomerDashboardURL(bootstrap.indexName, search),
    [bootstrap.indexName, search]
  );
  const returnURL = useMemo(() => {
    if (targetAction === 'customerdashboarddetails') {
      return customerDashboardURL;
    }
    return reportsURL;
  }, [customerDashboardURL, reportsURL, targetAction]);

  const legacyRouteURL = useMemo(() => {
    if (!actionMeta) {
      return ensureUIURL(`${bootstrap.indexName}?m=reports&a=reports`, 'legacy');
    }
    return ensureUIURL(`${bootstrap.indexName}?${buildBaseQuery(search, actionMeta.canonicalAction).toString()}`, 'legacy');
  }, [actionMeta, bootstrap.indexName, search]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyRouteURL), [legacyRouteURL]);

  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  useEffect(() => {
    if (!actionMeta || actionMeta.mode === 'embed') {
      return;
    }
    const timer = window.setTimeout(() => {
      if (actionMeta.mode === 'modern-redirect') {
        window.location.assign(customerDashboardURL);
        return;
      }
      window.location.assign(legacyRouteURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [actionMeta, customerDashboardURL, legacyRouteURL]);

  if (!actionMeta) {
    return <ErrorState message="Unsupported reports action." actionLabel="Back To Reports" actionURL={reportsURL} />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={actionMeta.title}
        subtitle={actionMeta.subtitle}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={returnURL}>
              Back To Reports
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyRouteURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {actionMeta.mode !== 'embed' ? (
            <section className="avel-list-panel">
              <div className="modern-state">
                {actionMeta.mode === 'modern-redirect'
                  ? 'Continuing to the modern customer dashboard workspace...'
                  : 'Starting report export download from the legacy endpoint...'}
              </div>
            </section>
          ) : (
            <section className="modern-compat-page">
              <header className="modern-compat-page__header">
                <div>
                  <h2 className="modern-compat-page__title">{actionMeta.title}</h2>
                  <p className="modern-compat-page__subtitle">{actionMeta.subtitle}</p>
                </div>
                <div className="modern-compat-page__meta">ui_embed=1</div>
              </header>

              <div className="modern-compat-page__actions">
                {RELATED_ACTIONS.map((relatedAction) => (
                  <a
                    key={relatedAction}
                    className="modern-btn modern-btn--secondary"
                    href={buildModernActionURL(bootstrap.indexName, search, relatedAction)}
                  >
                    {relatedAction === 'showSubmissionReport'
                      ? 'Submission'
                      : relatedAction === 'showPlacementReport'
                      ? 'Placement'
                      : relatedAction === 'showHireReport'
                      ? 'Hire'
                      : relatedAction === 'customizeJobOrderReport'
                      ? 'Job Order Builder'
                      : 'EEO Builder'}
                  </a>
                ))}
                <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                  Reload
                </button>
                <a className="modern-btn modern-btn--secondary" href={legacyRouteURL} target="_blank" rel="noreferrer">
                  Open In New Tab
                </a>
              </div>

              <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
                {frameLoading ? (
                  <div className="modern-compat-page__frame-loader" aria-live="polite">
                    Loading report workspace...
                  </div>
                ) : null}
                <iframe
                  key={frameReloadToken}
                  title={actionMeta.title}
                  className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                  src={embeddedURL}
                  onLoad={handleFrameLoad}
                />
              </div>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
