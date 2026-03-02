import { useEffect, useMemo, useState } from 'react';
import { fetchKpisListModernData } from '../lib/api';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { useServerQueryState } from '../lib/useServerQueryState';
import type { KpisListModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function toNumber(value: unknown): number {
  const cast = Number(value);
  return Number.isFinite(cast) ? cast : 0;
}

export function KpisPage({ bootstrap }: Props) {
  const [data, setData] = useState<KpisListModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchKpisListModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load KPI data.');
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

  const updateFilter = (key: string, value: string | boolean) => {
    const next = new URLSearchParams(serverQueryString);
    next.set('m', 'kpis');
    if (typeof value === 'boolean') {
      next.set(key, value ? '1' : '0');
    } else {
      next.set(key, value);
    }
    applyServerQuery(next);
  };

  const metricCards = useMemo(() => {
    if (!data) {
      return [];
    }
    return [
      { label: 'New Positions', value: toNumber(data.summary.totals.newPositions), diff: toNumber(data.summary.totalsDiff.newPositions) },
      { label: 'Open Positions', value: toNumber(data.summary.totals.totalOpenPositions), diff: toNumber(data.summary.totalsDiff.totalOpenPositions) },
      { label: 'Filled Positions', value: toNumber(data.summary.totals.filledPositions), diff: toNumber(data.summary.totalsDiff.filledPositions) },
      { label: 'Expected Filled', value: toNumber(data.summary.totals.expectedFilled), diff: toNumber(data.summary.totalsDiff.expectedFilled) }
    ];
  }, [data]);

  if (loading && !data) {
    return <div className="modern-state">Loading KPIs...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="KPI data is not available." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="KPIs"
        subtitle={`Week ${data.state.weekLabel} | Data as of ${data.state.dataAsOfLabel}`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-command-grid modern-command-grid--triple">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.officialReports}
                  onChange={(event) => updateFilter('officialReports', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Official Reports</span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.showDeadline}
                  onChange={(event) => updateFilter('showDeadline', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Show Deadline</span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.hideZeroOpenPositions}
                  onChange={(event) => updateFilter('hideZeroOpenPositions', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Hide Zero Open</span>
              </label>
            </div>

            <div className="avel-kpi-grid" style={{ marginTop: '10px' }}>
              {metricCards.map((metric) => (
                <article key={metric.label} className="avel-kpi">
                  <p className="avel-kpi__label">{metric.label}</p>
                  <p className="avel-kpi__value">{metric.value}</p>
                  <p className="avel-kpi__hint">{metric.diff >= 0 ? `+${metric.diff}` : `${metric.diff}`} vs last week</p>
                </article>
              ))}
            </div>

            <div className="modern-command-grid modern-command-grid--dual" style={{ marginTop: '12px' }}>
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Company KPI Snapshot</h3>
                </div>
                {data.rows.kpiRows.length === 0 ? (
                  <div className="modern-state">No KPI rows.</div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Open</th>
                        <th>Filled</th>
                        <th>Expected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.kpiRows.slice(0, 20).map((row) => (
                        <tr key={`company-kpi-${row.companyID}`}>
                          <td>{row.companyName}</td>
                          <td>{row.totalOpenPositions}</td>
                          <td>{row.filledPositions}</td>
                          <td>{row.expectedFilled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Candidate Metrics</h3>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>This Week</th>
                      <th>Last Week</th>
                      <th>Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.candidateMetricRows.map((row) => (
                      <tr key={`metric-${row.label}`}>
                        <td>{row.label}</td>
                        <td>{row.thisWeek}</td>
                        <td>{row.lastWeek}</td>
                        <td>{row.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            </div>

            <article className="avel-list-panel" style={{ marginTop: '12px' }}>
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Job Order Throughput</h3>
              </div>
              {data.rows.jobOrderKpiRows.length === 0 ? (
                <div className="modern-state">No job order KPI rows.</div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Job Order</th>
                      <th>Company</th>
                      <th>Open</th>
                      <th>Submitted</th>
                      <th>Acceptance</th>
                      <th>Hiring</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.jobOrderKpiRows.slice(0, 25).map((row) => (
                      <tr key={`job-kpi-${row.jobOrderID}`}>
                        <td>{row.title}</td>
                        <td>{row.companyName}</td>
                        <td>{row.totalOpenPositions}</td>
                        <td>{row.submittedCount}</td>
                        <td>{row.acceptanceRate}</td>
                        <td>{row.hiringRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
