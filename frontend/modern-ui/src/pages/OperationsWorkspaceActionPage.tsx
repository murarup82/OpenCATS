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
  mode: 'embed' | 'forward';
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  statusMessage: string;
};

type BackLink = {
  label: string;
  href: string;
};

const COPY_BY_ROUTE: Record<string, RouteCopy> = {
  'joborders.edithiringplan': {
    mode: 'forward',
    title: 'Edit Hiring Plan',
    subtitle: 'Forward hiring plan rows and openings through the legacy endpoint without embedding a frame.',
    panelTitle: 'Hiring Plan Redirect',
    panelSubtitle: 'Legacy hiring-plan UI is forwarded while migration continues.',
    statusMessage: 'Forwarding hiring-plan workspace to the legacy endpoint...'
  },
  'toolbar.install': {
    mode: 'forward',
    title: 'Toolbar Install',
    subtitle: 'Forward toolbar installation steps through the legacy endpoint without embedding a frame.',
    panelTitle: 'Toolbar Install Redirect',
    panelSubtitle: 'Legacy toolbar installation UI is forwarded while migration continues.',
    statusMessage: 'Forwarding toolbar installation workspace to the legacy endpoint...'
  },
  'settings.getfirefoxmodal': {
    mode: 'forward',
    title: 'Toolbar Browser Requirement',
    subtitle: 'Forward browser compatibility guidance through the legacy endpoint without embedding a frame.',
    panelTitle: 'Browser Requirement Redirect',
    panelSubtitle: 'Legacy settings UI is forwarded while migration continues.',
    statusMessage: 'Forwarding browser requirement workspace to the legacy endpoint...'
  },
  'settings.previewpage': {
    mode: 'forward',
    title: 'Settings Preview Redirect',
    subtitle: 'Forward settings preview content through the legacy endpoint without embedding a frame.',
    panelTitle: 'Settings Preview Forward',
    panelSubtitle: 'Legacy settings preview UI is forwarded while migration continues.',
    statusMessage: 'Forwarding settings preview page to the legacy endpoint...'
  },
  'settings.previewpagetop': {
    mode: 'forward',
    title: 'Settings Preview Header Redirect',
    subtitle: 'Forward settings preview header content through the legacy endpoint without embedding a frame.',
    panelTitle: 'Settings Preview Header Forward',
    panelSubtitle: 'Legacy settings preview header UI is forwarded while migration continues.',
    statusMessage: 'Forwarding settings preview header page to the legacy endpoint...'
  }
};

const FALLBACK_COPY: RouteCopy = {
  mode: 'embed',
  title: 'Operations Workspace',
  subtitle: 'Embedded compatibility workspace for operations workflows.',
  panelTitle: 'Operations Compatibility Workspace',
  panelSubtitle: 'Legacy workspace is embedded while migration continues.',
  statusMessage: 'Loading embedded legacy workspace...'
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

function resolveBackLink(routeKey: string, bootstrap: UIModeBootstrap, query: URLSearchParams): BackLink {
  if (routeKey === 'joborders.edithiringplan') {
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

  if (
    routeKey === 'toolbar.install' ||
    routeKey === 'settings.getfirefoxmodal' ||
    routeKey === 'settings.previewpage' ||
    routeKey === 'settings.previewpagetop'
  ) {
    return {
      label: 'Back To Settings',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration`)
    };
  }

  return {
    label: 'Back To Dashboard',
    href: ensureModernUIURL(`${bootstrap.indexName}?m=dashboard&a=my`)
  };
}

type CompatibilityPanelProps = {
  copy: RouteCopy;
  backLink: BackLink;
  canContinue: boolean;
  legacyURL: string;
};

function CompatibilityForwardPanel({ copy, backLink, canContinue, legacyURL }: CompatibilityPanelProps) {
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
    <div className="modern-dashboard avel-dashboard-shell">
      <section className="modern-compat-page modern-compat-page--forward">
        <header className="modern-compat-page__header">
          <div>
            <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
            <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
          </div>
          <div className="modern-compat-page__meta">ui_forward=1</div>
        </header>

        <div className="modern-compat-page__actions">
          <a className="modern-btn modern-btn--secondary" href={backLink.href}>
            {backLink.label}
          </a>
          {canContinue ? (
            <>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Continue
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
          <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`}>
            {canContinue ? copy.statusMessage : 'Legacy endpoint URL is unavailable for this settings preview route.'}
          </div>
        </section>
      </section>
    </div>
  );
}

type EmbeddedPanelProps = {
  copy: RouteCopy;
  backLink: BackLink;
  legacyURL: string;
  canContinue: boolean;
};

function CompatibilityEmbeddedPanel({ copy, backLink, legacyURL, canContinue }: EmbeddedPanelProps) {
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  return (
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
          <a className="modern-btn modern-btn--secondary" href={backLink.href}>
            {backLink.label}
          </a>
          {canContinue ? (
            <>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload
              </button>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </>
          ) : null}
        </div>

        <div className="modern-compat-page__frame-wrap">
          {canContinue ? (
            <>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  {copy.statusMessage}
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`${copy.title} legacy workspace`}
                className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                src={embeddedURL}
                onLoad={handleFrameLoad}
              />
            </>
          ) : (
            <div className="modern-state modern-state--error">Legacy endpoint URL is unavailable for this settings route.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export function OperationsWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => COPY_BY_ROUTE[routeKey] || FALLBACK_COPY, [routeKey]);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const backLink = useMemo(() => resolveBackLink(routeKey, bootstrap, query), [routeKey, bootstrap, query]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const canContinue = legacyURL !== '';

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            ) : null}
          </>
        }
      >
        {copy.mode === 'forward' ? (
          <CompatibilityForwardPanel copy={copy} backLink={backLink} canContinue={canContinue} legacyURL={legacyURL} />
        ) : (
          <CompatibilityEmbeddedPanel copy={copy} backLink={backLink} legacyURL={legacyURL} canContinue={canContinue} />
        )}
      </PageContainer>
    </div>
  );
}
