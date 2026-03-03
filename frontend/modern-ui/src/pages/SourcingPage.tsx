import { useEffect, useMemo, useState } from 'react';
import { fetchSourcingListModernData, saveSourcingListModernData } from '../lib/api';
import type { SourcingListModernDataResponse, UIModeBootstrap } from '../types';
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

type HistoryWindow = 'all' | '26' | '52';
type ChartMetric = 'count' | 'rolling4';

function rowKey(weekYear: number, weekNumber: number): string {
  return `${weekYear}-${weekNumber}`;
}

function toInt(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export function SourcingPage({ bootstrap }: Props) {
  const [data, setData] = useState<SourcingListModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>('52');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('count');
  const [draftCounts, setDraftCounts] = useState<Record<string, number>>({});
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchSourcingListModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
        setSaveStatus('');
        setDraftCounts(() => {
          const next: Record<string, number> = {};
          result.rows.forEach((row) => {
            next[rowKey(row.weekYear, row.weekNumber)] = toInt(row.count, 0);
          });
          return next;
        });
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load sourcing data.');
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

  const rowsWithDraft = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.rows.map((row) => {
      const key = rowKey(row.weekYear, row.weekNumber);
      const count = Object.prototype.hasOwnProperty.call(draftCounts, key) ? toInt(draftCounts[key], 0) : toInt(row.count, 0);
      return { ...row, count: Math.max(0, count) };
    });
  }, [data, draftCounts]);

  const visibleRows = useMemo(() => {
    if (historyWindow === 'all') {
      return rowsWithDraft;
    }
    const size = historyWindow === '26' ? 26 : 52;
    return rowsWithDraft.slice(0, size);
  }, [rowsWithDraft, historyWindow]);

  const totalVisible = useMemo(() => visibleRows.reduce((sum, row) => sum + toInt(row.count, 0), 0), [visibleRows]);
  const avgVisible = useMemo(() => (visibleRows.length > 0 ? Math.round((totalVisible / visibleRows.length) * 100) / 100 : 0), [totalVisible, visibleRows.length]);

  const chartSeries = useMemo(() => {
    const chronological = [...visibleRows].reverse();
    return chronological.map((row, index) => {
      const current = toInt(row.count, 0);
      let rolling4 = current;
      if (index > 0) {
        let sum = 0;
        let count = 0;
        for (let offset = 0; offset < 4; offset++) {
          const sourceIndex = index - offset;
          if (sourceIndex < 0) {
            break;
          }
          sum += toInt(chronological[sourceIndex].count, 0);
          count += 1;
        }
        rolling4 = count > 0 ? Math.round((sum / count) * 100) / 100 : current;
      }
      return {
        label: row.weekLabel,
        count: current,
        rolling4
      };
    });
  }, [visibleRows]);

  const chartValues = chartSeries.map((point) => (chartMetric === 'rolling4' ? point.rolling4 : point.count));
  const chartMax = Math.max(1, ...chartValues);

  const dirtyCount = useMemo(() => {
    if (!data) {
      return 0;
    }
    let dirty = 0;
    data.rows.forEach((row) => {
      const key = rowKey(row.weekYear, row.weekNumber);
      if (toInt(draftCounts[key], 0) !== toInt(row.count, 0)) {
        dirty += 1;
      }
    });
    return dirty;
  }, [data, draftCounts]);

  const saveChanges = async () => {
    if (!data || saving) {
      return;
    }
    setSaving(true);
    setSaveStatus('');
    try {
      const payloadRows = data.rows.map((row) => {
        const key = rowKey(row.weekYear, row.weekNumber);
        return {
          weekYear: row.weekYear,
          weekNumber: row.weekNumber,
          count: Math.max(0, toInt(draftCounts[key], 0))
        };
      });
      const result = await saveSourcingListModernData(data.actions.saveURL, payloadRows);
      if (!result.success) {
        throw new Error(result.message || 'Save failed.');
      }
      setSaveStatus(result.message || 'Saved.');
      setData((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          rows: current.rows.map((row) => {
            const key = rowKey(row.weekYear, row.weekNumber);
            return { ...row, count: Math.max(0, toInt(draftCounts[key], 0)) };
          })
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed.';
      setSaveStatus(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="modern-state">Loading sourcing workspace...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Sourcing workspace is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Sourcing"
        subtitle={`Weekly HR sourced candidates from ${data.state.startYear}W${String(data.state.startWeek).padStart(2, '0')} to current week.`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
            <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setDraftCounts(Object.fromEntries(data.rows.map((row) => [rowKey(row.weekYear, row.weekNumber), toInt(row.count, 0)])))}>
              Reset Draft
            </button>
            <button type="button" className="modern-btn modern-btn--primary" onClick={saveChanges} disabled={saving || dirtyCount === 0}>
              {saving ? 'Saving...' : `Save ${dirtyCount > 0 ? `(${dirtyCount})` : ''}`}
            </button>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <label className="modern-command-field">
                <span className="modern-command-label">History Window</span>
                <select value={historyWindow} onChange={(event) => setHistoryWindow(event.target.value as HistoryWindow)}>
                  <option value="26">Latest 26 weeks</option>
                  <option value="52">Latest 52 weeks</option>
                  <option value="all">All weeks</option>
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Chart Metric</span>
                <select value={chartMetric} onChange={(event) => setChartMetric(event.target.value as ChartMetric)}>
                  <option value="count">Weekly Count</option>
                  <option value="rolling4">Rolling 4-Week Avg</option>
                </select>
              </label>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div className="modern-command-active__count is-active" aria-live="polite" aria-atomic="true">
                  Visible weeks: {visibleRows.length} | Total sourced: {totalVisible} | Avg/week: {avgVisible}
                </div>
                {saveStatus !== '' ? <div className="modern-command-active__list">{saveStatus}</div> : null}
              </div>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Sourcing Trend</h2>
              <p className="avel-list-panel__hint">Interactive in-page chart reflects unsaved draft values.</p>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {chartSeries.length === 0 ? (
                <div className="modern-state">No sourcing rows available.</div>
              ) : (
                chartSeries.map((point) => {
                  const value = chartMetric === 'rolling4' ? point.rolling4 : point.count;
                  const width = Math.max(2, Math.round((value / chartMax) * 100));
                  return (
                    <div key={`series-${point.label}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px' }}>{point.label}</span>
                      <div style={{ height: '12px', borderRadius: '999px', background: '#dfeaf0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #0f98c0 0%, #0fb17b 100%)' }} />
                      </div>
                      <strong style={{ fontSize: '12px', textAlign: 'right' }}>{value}</strong>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Weekly Sourcing Table</h2>
              <p className="avel-list-panel__hint">Edit weekly counts and save in one operation.</p>
            </div>
            <DataTable
              columns={[
                { key: 'week', title: 'Week' },
                { key: 'year', title: 'Year' },
                { key: 'count', title: 'HR Sourced' },
                { key: 'state', title: 'State' }
              ]}
              hasRows={visibleRows.length > 0}
              emptyMessage="No sourcing rows for the selected window."
            >
              {visibleRows.map((row) => {
                const key = rowKey(row.weekYear, row.weekNumber);
                const baseline = toInt(data.rows.find((sourceRow) => rowKey(sourceRow.weekYear, sourceRow.weekNumber) === key)?.count, 0);
                const draft = toInt(draftCounts[key], 0);
                const changed = draft !== baseline;
                return (
                  <tr key={`sourcing-row-${key}`} style={row.isCurrent ? { background: '#f3fafc' } : undefined}>
                    <td>{row.weekLabel}</td>
                    <td>{row.weekYear}</td>
                    <td>
                      <input
                        className="inputbox"
                        type="number"
                        min={0}
                        value={draft}
                        onChange={(event) => {
                          const next = Math.max(0, toInt(event.target.value, 0));
                          setDraftCounts((current) => ({ ...current, [key]: next }));
                        }}
                        style={{ width: '96px' }}
                      />
                    </td>
                    <td>{changed ? <span className="modern-active-filter modern-active-filter--server">Edited</span> : row.isCurrent ? 'Current Week' : 'Saved'}</td>
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
