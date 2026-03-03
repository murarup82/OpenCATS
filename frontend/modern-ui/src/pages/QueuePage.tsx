import { useEffect, useMemo, useState } from 'react';
import { fetchQueueOverviewModernData } from '../lib/api';
import type { QueueOverviewModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type StateFilter = 'all' | 'pending' | 'locked' | 'error' | 'completed';
type PriorityChartMode = 'count' | 'share';
type RowLimit = 25 | 50 | 100 | 150;

function toText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const next = value.trim();
    return next !== '' ? next : fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeState(value: string): 'pending' | 'locked' | 'error' | 'completed' {
  const next = String(value || '').toLowerCase();
  if (next === 'locked') {
    return 'locked';
  }
  if (next === 'error') {
    return 'error';
  }
  if (next === 'completed') {
    return 'completed';
  }
  return 'pending';
}

function stateChipStyle(state: string): { color: string; background: string; border: string } {
  const normalized = normalizeState(state);
  if (normalized === 'error') {
    return { color: '#8b1e2d', background: '#fdecef', border: '#f5b7c0' };
  }
  if (normalized === 'locked') {
    return { color: '#7c4a0e', background: '#fff4e4', border: '#f8d3a3' };
  }
  if (normalized === 'completed') {
    return { color: '#15603d', background: '#e9f9f0', border: '#b8e8cd' };
  }
  return { color: '#0d5f80', background: '#e8f4fb', border: '#bbdaea' };
}

export function QueuePage({ bootstrap }: Props) {
  const [data, setData] = useState<QueueOverviewModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [rowLimit, setRowLimit] = useState<RowLimit>(50);
  const [priorityChartMode, setPriorityChartMode] = useState<PriorityChartMode>('count');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchQueueOverviewModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load queue workspace.');
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

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }
    const searchValue = taskSearch.trim().toLowerCase();
    const source = data.rows.filter((row) => {
      if (stateFilter !== 'all' && normalizeState(row.state) !== stateFilter) {
        return false;
      }
      if (searchValue === '') {
        return true;
      }
      const searchable = `${row.task} ${row.argsPreview} ${row.responsePreview}`.toLowerCase();
      return searchable.includes(searchValue);
    });
    return source.slice(0, rowLimit);
  }, [data, stateFilter, taskSearch, rowLimit]);

  const totalPriorityCount = useMemo(() => {
    if (!data) {
      return 0;
    }
    return data.charts.priorityBuckets.reduce((sum, bucket) => sum + toNumber(bucket.count), 0);
  }, [data]);

  const maxPriorityCount = useMemo(() => {
    if (!data || data.charts.priorityBuckets.length === 0) {
      return 1;
    }
    return Math.max(1, ...data.charts.priorityBuckets.map((bucket) => toNumber(bucket.count)));
  }, [data]);

  if (loading && !data) {
    return <div className="modern-state">Loading queue workspace...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Queue workspace unavailable." />;
  }

  if (!data.state.queueTableAvailable) {
    return (
      <div className="avel-dashboard-page">
        <PageContainer
          title="Queue"
          subtitle="Queue table is not available in this environment."
          actions={
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          }
        >
          <div className="modern-state modern-state--warning">Queue module cannot load because queue table is missing.</div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Queue"
        subtitle="Native queue operations workspace with live pipeline visibility."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.refreshURL)}>
              Refresh
            </a>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-kpi-grid avel-kpi-grid--spaced">
            <article className="avel-kpi">
              <p className="avel-kpi__label">Queue Processor</p>
              <p className="avel-kpi__value">{data.summary.processorActive ? 'Active' : 'Inactive'}</p>
              <p className="avel-kpi__hint">Last run: {toText(data.summary.lastRunLabel, 'Never')}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Pending</p>
              <p className="avel-kpi__value">{data.summary.pendingCount}</p>
              <p className="avel-kpi__hint">Awaiting execution</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Locked</p>
              <p className="avel-kpi__value">{data.summary.lockedCount}</p>
              <p className="avel-kpi__hint">Stale: {data.summary.staleLockedCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Errors</p>
              <p className="avel-kpi__value">{data.summary.errorCount}</p>
              <p className="avel-kpi__hint">Requires intervention</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Completed</p>
              <p className="avel-kpi__value">{data.summary.completedCount}</p>
              <p className="avel-kpi__hint">Total queue rows: {data.summary.totalCount}</p>
            </article>
          </section>

          <section className="avel-kpi-chart-grid">
            <article className="avel-list-panel avel-chart-card">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Priority Distribution</h3>
                <p className="avel-list-panel__hint">Interactive mode switches between counts and share.</p>
              </div>
              <label className="modern-command-field">
                <span className="modern-command-label">Chart Mode</span>
                <select value={priorityChartMode} onChange={(event) => setPriorityChartMode(event.target.value as PriorityChartMode)}>
                  <option value="count">Count</option>
                  <option value="share">Share %</option>
                </select>
              </label>
              <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                {data.charts.priorityBuckets.length === 0 ? (
                  <div className="modern-state">No queue tasks recorded.</div>
                ) : (
                  data.charts.priorityBuckets.map((bucket) => {
                    const count = toNumber(bucket.count);
                    const width =
                      priorityChartMode === 'share'
                        ? Math.max(2, Math.round((count / Math.max(1, totalPriorityCount)) * 100))
                        : Math.max(2, Math.round((count / Math.max(1, maxPriorityCount)) * 100));
                    const label = priorityChartMode === 'share' ? `${Math.round((count / Math.max(1, totalPriorityCount)) * 100)}%` : `${count}`;
                    return (
                      <div key={`priority-${bucket.priority}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>Priority {bucket.priority}</span>
                        <div style={{ height: '11px', borderRadius: '999px', background: '#dfeaf0', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #0f98c0 0%, #1167c8 100%)' }} />
                        </div>
                        <strong style={{ textAlign: 'right', fontSize: '12px' }}>{label}</strong>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <label className="modern-command-field">
                <span className="modern-command-label">State</span>
                <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value as StateFilter)}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="locked">Locked</option>
                  <option value="error">Error</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Rows</span>
                <select value={String(rowLimit)} onChange={(event) => setRowLimit(toNumber(event.target.value) as RowLimit)}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="150">150</option>
                </select>
              </label>
              <form
                className="modern-command-search"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <span className="modern-command-label">Search Task/Args/Response</span>
                <input type="search" value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} placeholder="Filter rows..." />
              </form>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active__count is-active">Showing {filteredRows.length} rows from latest {data.rows.length} queue entries.</div>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Latest Queue Tasks</h2>
              <p className="avel-list-panel__hint">Newest first. Response and args are shortened for readability.</p>
            </div>
            <DataTable
              columns={[
                { key: 'id', title: 'Queue ID' },
                { key: 'task', title: 'Task' },
                { key: 'state', title: 'State' },
                { key: 'priority', title: 'Priority' },
                { key: 'dates', title: 'Dates' },
                { key: 'details', title: 'Args / Response' }
              ]}
              hasRows={filteredRows.length > 0}
              emptyMessage="No queue rows match current filters."
            >
              {filteredRows.map((row) => {
                const chip = stateChipStyle(row.state);
                return (
                  <tr key={`queue-row-${row.queueID}`}>
                    <td>{row.queueID}</td>
                    <td>
                      <div>{toText(row.task)}</div>
                      <div style={{ fontSize: '11px', color: '#5f7482' }}>Site: {row.siteID}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          borderRadius: '999px',
                          border: `1px solid ${chip.border}`,
                          background: chip.background,
                          color: chip.color,
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px'
                        }}
                      >
                        {normalizeState(row.state)}
                      </span>
                    </td>
                    <td>{row.priority}</td>
                    <td>
                      <div>Created: {toText(row.dateCreated)}</div>
                      <div>Timeout: {toText(row.dateTimeout)}</div>
                      <div>Completed: {toText(row.dateCompleted)}</div>
                    </td>
                    <td>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Args:</strong> {toText(row.argsPreview, '(none)')}
                      </div>
                      <div>
                        <strong>Response:</strong> {toText(row.responsePreview, '(none)')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
