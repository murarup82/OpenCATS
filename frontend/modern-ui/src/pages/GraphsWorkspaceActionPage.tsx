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

const COPY_BY_ROUTE_KEY: Record<string, PageCopy> = {
  'graphs.generic': {
    title: 'Generic Graph',
    subtitle: 'View generated graph output in compatibility mode.',
    panelTitle: 'Generic Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while migration continues.'
  },
  'graphs.genericpie': {
    title: 'Generic Pie Graph',
    subtitle: 'View generated pie graph output in compatibility mode.',
    panelTitle: 'Generic Pie Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while migration continues.'
  },
  'graphs.joborderreportgraph': {
    title: 'Job Order Report Graph',
    subtitle: 'View job order report graph output in compatibility mode.',
    panelTitle: 'Job Order Report Graph Workspace',
    panelSubtitle: 'Legacy graph output is embedded while migration continues.'
  },
  'graphs.testgraph': {
    title: 'Graph Test',
    subtitle: 'View test graph output in compatibility mode.',
    panelTitle: 'Graph Test Workspace',
    panelSubtitle: 'Legacy graph output is embedded while migration continues.'
  },
  'graphs.wordverify': {
    title: 'Word Verification Graphic',
    subtitle: 'View word verification image output in compatibility mode.',
    panelTitle: 'Word Verification Workspace',
    panelSubtitle: 'Legacy graph output is embedded while migration continues.'
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Graphs Workspace',
  subtitle: 'View graph outputs in compatibility mode.',
  panelTitle: 'Graphs Compatibility Workspace',
  panelSubtitle: 'Legacy graph output is embedded while migration continues.'
};

function toLowerText(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function buildRouteKey(bootstrap: UIModeBootstrap): string {
  return `${toLowerText(bootstrap.targetModule)}.${toLowerText(bootstrap.targetAction)}`;
}

export function GraphsWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => COPY_BY_ROUTE_KEY[routeKey] || FALLBACK_COPY, [routeKey]);
  const backLink = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=graphs`),
    [bootstrap.indexName]
  );
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
            <a className="modern-btn modern-btn--secondary" href={backLink}>
              Back To Graphs
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
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={backLink}>
                Back To Graphs
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
