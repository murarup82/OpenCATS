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

type RouteCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
};

type BackLink = {
  label: string;
  href: string;
};

const COPY_BY_ROUTE: Record<string, RouteCopy> = {
  'joborders.edithiringplan': {
    title: 'Edit Hiring Plan',
    subtitle: 'Adjust hiring plan rows and openings through the compatibility workspace.',
    panelTitle: 'Hiring Plan Workspace',
    panelSubtitle: 'Legacy hiring-plan UI is embedded while migration continues.'
  },
  'gdpr.requests': {
    title: 'GDPR Requests',
    subtitle: 'Review GDPR request records in compatibility mode.',
    panelTitle: 'GDPR Requests Workspace',
    panelSubtitle: 'Legacy GDPR requests UI is embedded while migration continues.'
  },
  'toolbar.install': {
    title: 'Toolbar Install',
    subtitle: 'Complete toolbar installation steps in compatibility mode.',
    panelTitle: 'Toolbar Install Workspace',
    panelSubtitle: 'Legacy toolbar installation UI is embedded while migration continues.'
  },
  'settings.getfirefoxmodal': {
    title: 'Toolbar Browser Requirement',
    subtitle: 'Review browser compatibility guidance in compatibility mode.',
    panelTitle: 'Browser Requirement Workspace',
    panelSubtitle: 'Legacy settings UI is embedded while migration continues.'
  },
  'settings.previewpage': {
    title: 'Settings Preview',
    subtitle: 'Preview settings content in compatibility mode.',
    panelTitle: 'Settings Preview Workspace',
    panelSubtitle: 'Legacy settings preview UI is embedded while migration continues.'
  },
  'settings.previewpagetop': {
    title: 'Settings Preview Header',
    subtitle: 'Preview header content in compatibility mode.',
    panelTitle: 'Settings Preview Header Workspace',
    panelSubtitle: 'Legacy settings preview UI is embedded while migration continues.'
  }
};

const FALLBACK_COPY: RouteCopy = {
  title: 'Operations Workspace',
  subtitle: 'Embedded compatibility workspace for operations workflows.',
  panelTitle: 'Operations Compatibility Workspace',
  panelSubtitle: 'Legacy workspace is embedded while migration continues.'
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

  if (routeKey === 'gdpr.requests') {
    return {
      label: 'Back To Candidates',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=listByView`)
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

export function OperationsWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => COPY_BY_ROUTE[routeKey] || FALLBACK_COPY, [routeKey]);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const backLink = useMemo(() => resolveBackLink(routeKey, bootstrap, query), [routeKey, bootstrap, query]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

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
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
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
              <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                {backLink.label}
              </a>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload
              </button>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
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
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
