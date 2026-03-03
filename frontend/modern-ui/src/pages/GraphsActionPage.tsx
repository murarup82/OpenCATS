import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const ACTION_LABELS: Record<string, string> = {
  generic: 'Generic Graph',
  genericpie: 'Generic Pie Graph',
  joborderreportgraph: 'Job Order Report Graph',
  testgraph: 'Test Graph',
  wordverify: 'Word Verification Image'
};

function toRoundedNumber(value: string | number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.round(parsed);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function stripSystemParams(query: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(query);
  next.delete('m');
  next.delete('a');
  next.delete('ui');
  next.delete('format');
  next.delete('modernPage');
  next.delete('width');
  next.delete('height');
  next.delete('_modernGraphTick');
  return next;
}

function resolveActionLabel(actionKey: string): string {
  const normalized = String(actionKey || '').trim().toLowerCase();
  if (ACTION_LABELS[normalized]) {
    return ACTION_LABELS[normalized];
  }
  return 'Graph Action';
}

export function GraphsActionPage({ bootstrap }: Props) {
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [actionKey, setActionKey] = useState('generic');
  const [extraParams, setExtraParams] = useState('');
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(320);
  const [tick, setTick] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(90);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    const query = new URLSearchParams(serverQueryString);
    const requestedAction = String(bootstrap.targetAction || query.get('a') || 'generic').trim().toLowerCase();
    setActionKey(requestedAction === '' ? 'generic' : requestedAction);
    setWidth(clamp(toRoundedNumber(query.get('width') || 640, 640), 220, 1800));
    setHeight(clamp(toRoundedNumber(query.get('height') || 320, 320), 160, 1200));
    setExtraParams(stripSystemParams(query).toString());
  }, [bootstrap.targetAction, serverQueryString]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const seconds = clamp(toRoundedNumber(refreshSeconds, 90), 20, 600);
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refreshSeconds]);

  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const workspaceURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=graphs&ui=modern`),
    [bootstrap.indexName]
  );

  const renderURL = useMemo(() => {
    const query = new URLSearchParams(extraParams);
    query.set('m', 'graphs');
    query.set('a', actionKey);
    query.set('ui', 'legacy');
    query.set('width', String(clamp(width, 220, 1800)));
    query.set('height', String(clamp(height, 160, 1200)));
    query.set('_modernGraphTick', String(tick));
    return `${bootstrap.indexName}?${query.toString()}`;
  }, [actionKey, bootstrap.indexName, extraParams, height, tick, width]);

  const uiFilter = useMemo(
    () => `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    [brightness, contrast, saturation]
  );
  const actionLabel = useMemo(() => resolveActionLabel(actionKey), [actionKey]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={actionLabel}
        subtitle={`Native action workspace for graphs / ${actionKey}.`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={workspaceURL}>
              Back To Graphs
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <label className="modern-command-field">
                <span className="modern-command-label">Action</span>
                <input type="text" value={actionKey} onChange={(event) => setActionKey(event.target.value.toLowerCase())} />
              </label>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setTick((current) => current + 1)}>
                Refresh Now
              </button>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => {
                  const query = new URLSearchParams(extraParams);
                  query.set('m', 'graphs');
                  query.set('a', actionKey);
                  query.set('ui', 'modern');
                  query.set('width', String(clamp(width, 220, 1800)));
                  query.set('height', String(clamp(height, 160, 1200)));
                  applyServerQuery(query);
                }}
              >
                Save URL State
              </button>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field">
                <span className="modern-command-label">Width {width}px</span>
                <input type="range" min={220} max={1800} step={20} value={width} onChange={(event) => setWidth(toRoundedNumber(event.target.value, 640))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Height {height}px</span>
                <input type="range" min={160} max={1200} step={20} value={height} onChange={(event) => setHeight(toRoundedNumber(event.target.value, 320))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Brightness {brightness}%</span>
                <input type="range" min={60} max={160} step={5} value={brightness} onChange={(event) => setBrightness(toRoundedNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Contrast {contrast}%</span>
                <input type="range" min={60} max={160} step={5} value={contrast} onChange={(event) => setContrast(toRoundedNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Saturation {saturation}%</span>
                <input type="range" min={0} max={180} step={5} value={saturation} onChange={(event) => setSaturation(toRoundedNumber(event.target.value, 100))} />
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Auto Refresh</span>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Refresh Sec</span>
                <input
                  type="number"
                  min={20}
                  max={600}
                  step={10}
                  value={refreshSeconds}
                  onChange={(event) => setRefreshSeconds(toRoundedNumber(event.target.value, 90))}
                />
              </label>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field" style={{ width: '100%' }}>
                <span className="modern-command-label">Custom Query Params</span>
                <textarea
                  rows={3}
                  value={extraParams}
                  onChange={(event) => setExtraParams(event.target.value)}
                  placeholder="title=My%20Graph&labels=A,B,C&data=1,2,3"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </label>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Graph Preview</h2>
              <a className="modern-btn modern-btn--secondary" href={renderURL} target="_blank" rel="noreferrer">
                Open Image In New Tab
              </a>
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
                src={renderURL}
                alt={actionLabel}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  width: `${clamp(width, 220, 1800)}px`,
                  height: `${clamp(height, 160, 1200)}px`,
                  objectFit: 'contain',
                  margin: '0 auto',
                  filter: uiFilter
                }}
              />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#567080', wordBreak: 'break-all' }}>
              Source: {renderURL}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
