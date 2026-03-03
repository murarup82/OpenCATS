import { useEffect, useMemo, useState } from 'react';
import { fetchReportsGraphViewModernData } from '../lib/api';
import type { ReportsGraphViewModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { ensureModernUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type FitMode = 'contain' | 'cover' | 'fill';

function withCacheBuster(url: string, token: number): string {
  const raw = String(url || '').trim();
  if (raw === '') {
    return '';
  }
  try {
    const parsed = new URL(raw, window.location.origin);
    parsed.searchParams.set('_modernGraphTick', String(token));
    return parsed.toString();
  } catch (error) {
    const separator = raw.includes('?') ? '&' : '?';
    return `${raw}${separator}_modernGraphTick=${token}`;
  }
}

export function ReportsGraphViewPage({ bootstrap }: Props) {
  const [data, setData] = useState<ReportsGraphViewModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [imageDraft, setImageDraft] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSeconds, setRefreshSeconds] = useState(300);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  const [darkCanvas, setDarkCanvas] = useState(false);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchReportsGraphViewModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
        setImageDraft(result.graph.imageURL || '');
        setRefreshSeconds(result.settings.refreshSecondsDefault || 300);
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err.message || 'Unable to load graph view.');
        }
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
    const seconds = Math.max(30, Math.min(3600, refreshSeconds || 300));
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refreshSeconds]);

  const graphImageURL = useMemo(() => {
    if (!data) {
      return '';
    }
    return withCacheBuster(data.graph.imageURL, tick);
  }, [data, tick]);

  if (loading && !data) {
    return <div className="modern-state">Loading graph view...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Graph view is unavailable." />;
  }

  const chartFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  const graphStyle = {
    width: `${zoom}%`,
    maxWidth: fitMode === 'fill' ? '100%' : 'none',
    height: fitMode === 'fill' ? '100%' : 'auto',
    objectFit: fitMode,
    filter: chartFilter
  };

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Reports Graph View"
        subtitle="Native graph canvas with in-page refresh, zoom, and visual tuning controls."
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
              <form
                className="modern-command-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = new URLSearchParams(serverQueryString);
                  query.set('m', 'reports');
                  query.set('a', 'graphView');
                  const imageValue = imageDraft.trim();
                  if (imageValue === '') {
                    query.delete('theImage');
                  } else {
                    query.set('theImage', imageValue);
                  }
                  query.set('ui', 'modern');
                  applyServerQuery(query);
                }}
              >
                <span className="modern-command-label">Graph Image URL</span>
                <input type="url" value={imageDraft} onChange={(event) => setImageDraft(event.target.value)} placeholder="https://.../chart.png" />
              </form>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setTick((current) => current + 1)}>
                Refresh Now
              </button>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => {
                  const root = document.documentElement;
                  if (document.fullscreenElement) {
                    void document.exitFullscreen();
                  } else {
                    void root.requestFullscreen();
                  }
                }}
              >
                Toggle Fullscreen
              </button>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field">
                <span className="modern-command-label">Refresh</span>
                <select value={String(refreshSeconds)} onChange={(event) => setRefreshSeconds(Math.max(30, toInt(event.target.value, 300)))}>
                  {data.settings.refreshIntervals.map((value) => (
                    <option key={`refresh-${value}`} value={value}>
                      {value}s
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Auto Refresh</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={darkCanvas} onChange={(event) => setDarkCanvas(event.target.checked)} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Dark Canvas</span>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Fit</span>
                <select value={fitMode} onChange={(event) => setFitMode(event.target.value as FitMode)}>
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
                </select>
              </label>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field">
                <span className="modern-command-label">Zoom {zoom}%</span>
                <input type="range" min={60} max={170} step={5} value={zoom} onChange={(event) => setZoom(toInt(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Brightness {brightness}%</span>
                <input type="range" min={60} max={170} step={5} value={brightness} onChange={(event) => setBrightness(toInt(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Contrast {contrast}%</span>
                <input type="range" min={60} max={170} step={5} value={contrast} onChange={(event) => setContrast(toInt(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Saturation {saturation}%</span>
                <input type="range" min={0} max={170} step={5} value={saturation} onChange={(event) => setSaturation(toInt(event.target.value, 100))} />
              </label>
            </div>
          </section>

          <section className="avel-list-panel">
            {!data.graph.hasImage ? (
              <EmptyState message="No graph image URL provided. Paste a URL and submit to render the chart." />
            ) : (
              <div
                style={{
                  borderRadius: '14px',
                  border: darkCanvas ? '1px solid #2b3f4b' : '1px solid #d7e5ed',
                  background: darkCanvas ? 'linear-gradient(180deg, #12202a 0%, #0e1720 100%)' : '#f6fbfe',
                  padding: '14px',
                  overflow: 'auto',
                  minHeight: '380px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img src={graphImageURL} alt={`Graph for ${data.graph.siteName}`} style={graphStyle} />
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function toInt(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}
