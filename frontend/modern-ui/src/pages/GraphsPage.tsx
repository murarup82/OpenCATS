import { useEffect, useMemo, useState } from 'react';
import { fetchGraphsOverviewModernData } from '../lib/api';
import type { GraphsOverviewModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { ensureModernUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type GalleryMode = 'single' | 'all';

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function buildGraphURL(
  indexName: string,
  graph: GraphsOverviewModernDataResponse['graphs'][number],
  width: number,
  height: number,
  options: {
    viewValue: number;
    includeInactive: boolean;
    tick: number;
  }
): string {
  const query = new URLSearchParams();
  query.set('m', 'graphs');
  query.set('a', graph.action);
  query.set('width', String(Math.max(220, Math.min(1800, width))));
  query.set('height', String(Math.max(160, Math.min(1200, height))));

  Object.entries(graph.defaultParams || {}).forEach(([key, value]) => {
    query.set(key, String(value));
  });

  if (graph.action === 'miniHireStatistics' || graph.action === 'pipelineFunnelSnapshot') {
    query.set('view', String(options.viewValue));
  }
  if (graph.action === 'seniorityDistribution') {
    query.set('includeInactive', options.includeInactive ? '1' : '0');
  }

  query.set('_modernGraphsTick', String(options.tick));
  return `${indexName}?${query.toString()}`;
}

export function GraphsPage({ bootstrap }: Props) {
  const [data, setData] = useState<GraphsOverviewModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGraphID, setSelectedGraphID] = useState('');
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('single');
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(320);
  const [viewValue, setViewValue] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(90);
  const [tick, setTick] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchGraphsOverviewModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
        setWidth(Math.max(300, toNumber(result.state.defaultWidth, 640)));
        setHeight(Math.max(220, toNumber(result.state.defaultHeight, 320)));
        const graphID = result.graphs.length > 0 ? result.graphs[0].id : '';
        setSelectedGraphID(graphID);
        if (result.options.viewModes.length > 0) {
          setViewValue(toNumber(result.options.viewModes[0].value, 0));
        }
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load graphs workspace.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap, serverQueryString]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }
    const seconds = Math.max(20, Math.min(600, refreshSeconds));
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refreshSeconds]);

  const selectedGraph = useMemo(() => {
    if (!data) {
      return null;
    }
    return data.graphs.find((graph) => graph.id === selectedGraphID) || data.graphs[0] || null;
  }, [data, selectedGraphID]);

  const visibleGraphs = useMemo(() => {
    if (!data) {
      return [];
    }
    if (galleryMode === 'all') {
      return data.graphs;
    }
    return selectedGraph ? [selectedGraph] : [];
  }, [data, galleryMode, selectedGraph]);

  if (loading && !data) {
    return <div className="modern-state">Loading graphs workspace...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Graphs workspace unavailable." />;
  }

  const imageFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Graphs"
        subtitle="Native graph launcher with in-page interactive rendering controls."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.reportsURL)}>
              Back To Reports
            </a>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <label className="modern-command-field">
                <span className="modern-command-label">Graph</span>
                <select value={selectedGraphID} onChange={(event) => setSelectedGraphID(event.target.value)}>
                  {data.graphs.map((graph) => (
                    <option key={`graph-${graph.id}`} value={graph.id}>
                      {graph.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Gallery Mode</span>
                <select value={galleryMode} onChange={(event) => setGalleryMode(event.target.value as GalleryMode)}>
                  <option value="single">Selected Only</option>
                  <option value="all">All Graphs</option>
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">View Mode</span>
                <select value={String(viewValue)} onChange={(event) => setViewValue(toNumber(event.target.value, 0))}>
                  {data.options.viewModes.map((option) => (
                    <option key={`view-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setTick((current) => current + 1)}>
                Refresh Now
              </button>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field">
                <span className="modern-command-label">Width {width}px</span>
                <input type="range" min={300} max={1300} step={20} value={width} onChange={(event) => setWidth(toNumber(event.target.value, 640))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Height {height}px</span>
                <input type="range" min={220} max={760} step={20} value={height} onChange={(event) => setHeight(toNumber(event.target.value, 320))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Brightness {brightness}%</span>
                <input type="range" min={60} max={160} step={5} value={brightness} onChange={(event) => setBrightness(toNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Contrast {contrast}%</span>
                <input type="range" min={60} max={160} step={5} value={contrast} onChange={(event) => setContrast(toNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Saturation {saturation}%</span>
                <input type="range" min={0} max={180} step={5} value={saturation} onChange={(event) => setSaturation(toNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Include Inactive (Seniority)</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Auto Refresh</span>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Refresh Sec</span>
                <input type="number" min={20} max={600} step={10} value={refreshSeconds} onChange={(event) => setRefreshSeconds(toNumber(event.target.value, 90))} />
              </label>
            </div>
          </section>

          <section className="avel-kpi-grid avel-kpi-grid--spaced">
            <article className="avel-kpi">
              <p className="avel-kpi__label">Auth State</p>
              <p className="avel-kpi__value">{data.state.isLoggedIn ? 'Logged In' : 'Guest'}</p>
              <p className="avel-kpi__hint">Graph actions require authenticated access.</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Visible Graphs</p>
              <p className="avel-kpi__value">{visibleGraphs.length}</p>
              <p className="avel-kpi__hint">{galleryMode === 'all' ? 'All graph cards' : 'Selected graph card'}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Render Size</p>
              <p className="avel-kpi__value">
                {width} x {height}
              </p>
              <p className="avel-kpi__hint">Dimensions apply to generated graph images.</p>
            </article>
          </section>

          <section className="avel-kpi-chart-grid">
            {visibleGraphs.map((graph) => {
              const imageURL = buildGraphURL(bootstrap.indexName, graph, width, height, {
                viewValue,
                includeInactive,
                tick
              });
              return (
                <article key={`graph-card-${graph.id}`} className="avel-list-panel avel-chart-card avel-chart-card--wide">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">{graph.title}</h3>
                    <p className="avel-list-panel__hint">{graph.description}</p>
                  </div>
                  <div
                    style={{
                      border: '1px solid #d7e4ec',
                      borderRadius: '12px',
                      background: 'linear-gradient(180deg, #f8fcff 0%, #eef5f9 100%)',
                      padding: '10px',
                      overflow: 'auto'
                    }}
                  >
                    <img
                      src={imageURL}
                      alt={graph.title}
                      style={{
                        display: 'block',
                        maxWidth: '100%',
                        width: `${width}px`,
                        height: `${height}px`,
                        objectFit: 'contain',
                        margin: '0 auto',
                        filter: imageFilter
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#567080', wordBreak: 'break-all' }}>Source: {imageURL}</div>
                </article>
              );
            })}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
