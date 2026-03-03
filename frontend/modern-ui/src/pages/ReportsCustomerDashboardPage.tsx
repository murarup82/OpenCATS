import { useEffect, useMemo, useState } from 'react';
import { fetchReportsCustomerDashboardModernData } from '../lib/api';
import type { ReportsCustomerDashboardModernDataResponse, UIModeBootstrap } from '../types';
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

type TrendChartMode = 'line' | 'bars';
type ActivityMetricKey = 'submissions' | 'interviews' | 'offers' | 'hires';
type SourceSortMode = 'hireRate' | 'hires' | 'interviews';
type TrendPoint = { label: string; value: number };
type DetailRow = Record<string, unknown>;
type DetailShape = {
  key: string;
  title: string;
  emptyLabel: string;
  rows: DetailRow[];
};

function toNumber(value: unknown): number {
  const cast = Number(value);
  return Number.isFinite(cast) ? cast : 0;
}

function toText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readDetailShape(value: unknown): DetailShape | null {
  if (!isRecord(value)) {
    return null;
  }
  const key = typeof value.key === 'string' ? value.key : '';
  const title = typeof value.title === 'string' ? value.title : '';
  const emptyLabel = typeof value.emptyLabel === 'string' ? value.emptyLabel : 'No rows found.';
  const rows = Array.isArray(value.rows) ? value.rows.filter((row): row is DetailRow => isRecord(row)) : [];
  if (key === '' || title === '') {
    return null;
  }
  return { key, title, emptyLabel, rows };
}

type TrendChartProps = {
  points: TrendPoint[];
  mode: TrendChartMode;
  activeIndex: number;
  onActivate: (index: number) => void;
};

function TrendChart({ points, mode, activeIndex, onActivate }: TrendChartProps) {
  if (points.length === 0) {
    return <div className="modern-state">No trend data available.</div>;
  }

  const width = 740;
  const height = 240;
  const padLeft = 38;
  const padRight = 12;
  const padTop = 10;
  const padBottom = 32;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const maxValue = Math.max(1, ...points.map((point) => toNumber(point.value)));

  const coords = points.map((point, index) => {
    const x = points.length <= 1 ? padLeft + plotWidth / 2 : padLeft + (index / (points.length - 1)) * plotWidth;
    const y = padTop + (1 - toNumber(point.value) / maxValue) * plotHeight;
    return { x, y };
  });

  const linePath =
    coords.length <= 1
      ? `M ${coords[0].x} ${coords[0].y} L ${coords[0].x + 0.1} ${coords[0].y}`
      : coords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(height - padBottom).toFixed(2)} L ${
    coords[0].x
  } ${(height - padBottom).toFixed(2)} Z`;

  const segmentWidth = plotWidth / Math.max(points.length, 1);
  const barWidth = points.length <= 1 ? Math.min(80, plotWidth * 0.6) : Math.max(12, segmentWidth * 0.66);

  return (
    <div className="avel-trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Customer trend chart">
        <path className="avel-trend-chart__area" d={areaPath} />
        {mode === 'line' ? (
          <>
            <path className="avel-trend-chart__line" d={linePath} />
            {coords.map((coord, index) => (
              <circle
                key={`pt-${index}`}
                className={`avel-trend-chart__point${index === activeIndex ? ' is-active' : ''}`}
                cx={coord.x}
                cy={coord.y}
                r={index === activeIndex ? 5.5 : 4}
                tabIndex={0}
                onMouseEnter={() => onActivate(index)}
                onFocus={() => onActivate(index)}
              />
            ))}
          </>
        ) : (
          points.map((point, index) => {
            const value = toNumber(point.value);
            const barHeight = Math.max(2, (value / maxValue) * plotHeight);
            const x = padLeft + segmentWidth * index + (segmentWidth - barWidth) / 2;
            const y = padTop + (plotHeight - barHeight);
            return (
              <rect
                key={`bar-${index}`}
                className={`avel-trend-chart__bar${index === activeIndex ? ' is-active' : ''}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                onMouseEnter={() => onActivate(index)}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

function detailLink(moduleName: string, idKey: string, idValue: unknown): string {
  const id = Math.round(toNumber(idValue));
  return id > 0 ? `?m=${moduleName}&a=show&${idKey}=${id}` : '';
}

export function ReportsCustomerDashboardPage({ bootstrap }: Props) {
  const [data, setData] = useState<ReportsCustomerDashboardModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trendMode, setTrendMode] = useState<TrendChartMode>('line');
  const [activityMetric, setActivityMetric] = useState<ActivityMetricKey>('submissions');
  const [sourceSort, setSourceSort] = useState<SourceSortMode>('hireRate');
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchReportsCustomerDashboardModernData(bootstrap, query)
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err.message || 'Unable to load customer dashboard.');
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

  const updateFilters = (next: { companyID?: number; rangeDays?: number; activityType?: string; focusMetric?: string }) => {
    if (!data) {
      return;
    }
    const query = new URLSearchParams(serverQueryString);
    query.set('m', 'reports');
    query.set('a', 'customerDashboard');
    query.set('companyID', String(next.companyID ?? data.filters.selectedCompanyID));
    query.set('rangeDays', String(next.rangeDays ?? data.filters.rangeDays));
    query.set('activityType', String(next.activityType ?? data.filters.activityType));
    const focusMetric = String(next.focusMetric ?? data.filters.focusMetric ?? '').trim();
    if (focusMetric === '') {
      query.delete('focusMetric');
    } else {
      query.set('focusMetric', focusMetric);
    }
    query.set('ui', 'modern');
    applyServerQuery(query);
  };

  const trendPoints = useMemo<TrendPoint[]>(() => {
    if (!data) {
      return [];
    }
    return data.dashboard.activityTrendRows.map((row) => ({
      label: toText(row.weekLabel, 'Week'),
      value: toNumber(
        activityMetric === 'interviews'
          ? row.interviewsCount
          : activityMetric === 'offers'
          ? row.offersCount
          : activityMetric === 'hires'
          ? row.hiresCount
          : row.submissionsCount
      )
    }));
  }, [data, activityMetric]);

  useEffect(() => {
    setActiveTrendIndex((current) => (trendPoints.length === 0 ? 0 : Math.max(0, Math.min(current, trendPoints.length - 1))));
  }, [trendPoints.length]);

  const sourceRows = useMemo(() => {
    if (!data) {
      return [];
    }
    const parseRate = (value: string) => {
      const parsed = Number(String(value || '').replace('%', '').trim());
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return [...data.dashboard.sourceQualityRows].sort((left, right) => {
      if (sourceSort === 'hires') {
        return toNumber(right.hireCount) - toNumber(left.hireCount);
      }
      if (sourceSort === 'interviews') {
        return toNumber(right.interviewPathCount) - toNumber(left.interviewPathCount);
      }
      return parseRate(String(right.hireRateLabel)) - parseRate(String(left.hireRateLabel));
    });
  }, [data, sourceSort]);

  if (loading && !data) {
    return <div className="modern-state">Loading customer dashboard...</div>;
  }
  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }
  if (!data) {
    return <EmptyState message="Customer dashboard is unavailable." />;
  }

  const selectedPoint = trendPoints[Math.max(0, Math.min(activeTrendIndex, Math.max(0, trendPoints.length - 1)))] ?? null;
  const snapshot = data.dashboard.snapshot;
  const aging = data.dashboard.aging;
  const detail = readDetailShape(data.dashboard.cardDetail);
  const maxSourceMetric = Math.max(
    1,
    ...sourceRows.map((row) => (sourceSort === 'interviews' ? toNumber(row.interviewPathCount) : toNumber(row.hireCount)))
  );

  const cards = [
    { key: 'openJobOrders', label: 'Open Job Orders', value: snapshot.openJobOrders, hint: `Total: ${snapshot.totalJobOrders}` },
    { key: 'currentHires', label: 'Current Hires', value: snapshot.hiresInRange, hint: snapshot.medianDaysToFill === null ? 'Median: N/A' : `Median: ${snapshot.medianDaysToFill}d` },
    { key: 'confirmedFutureHires', label: 'Future Hires', value: snapshot.confirmedFutureHires, hint: 'Confirmed future starts' },
    { key: 'activePipeline', label: 'Active Pipeline', value: snapshot.activePipelineCount, hint: 'Candidates in open jobs' },
    { key: 'offerAcceptance', label: 'Offer Acceptance', value: snapshot.offerAcceptanceLabel, hint: `${snapshot.offersAccepted}/${snapshot.offersMade} accepted` },
    { key: 'aging0to15', label: 'Aging 0-15', value: aging.bucket0to15, hint: 'Fresh openings' },
    { key: 'aging16to30', label: 'Aging 16-30', value: aging.bucket16to30, hint: 'Needs attention' },
    { key: 'aging31plus', label: 'Aging 31+', value: aging.bucket31plus, hint: 'Delivery risk' }
  ];

  const activityMetricLabel: Record<ActivityMetricKey, string> = {
    submissions: 'Submissions',
    interviews: 'Interviews',
    offers: 'Offers',
    hires: 'Hires'
  };

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={`Customer Dashboard: ${toText(data.state.selectedCompanyName, 'Unknown')}`}
        subtitle={`Window ${data.state.rangeStartLabel} to ${data.state.rangeEndLabel} | Activity ${data.state.activityTypeLabel}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.graphViewURL)}>
              Open Graph View
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
                <span className="modern-command-label">Customer</span>
                <select value={String(data.filters.selectedCompanyID)} onChange={(event) => updateFilters({ companyID: toNumber(event.target.value), focusMetric: '' })}>
                  {data.options.companies.map((company) => (
                    <option key={`company-${company.companyID}`} value={company.companyID}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Window</span>
                <select value={String(data.filters.rangeDays)} onChange={(event) => updateFilters({ rangeDays: toNumber(event.target.value), focusMetric: '' })}>
                  {data.options.rangeDays.map((option) => (
                    <option key={`range-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Activity Type</span>
                <select value={data.filters.activityType} onChange={(event) => updateFilters({ activityType: event.target.value, focusMetric: '' })}>
                  {data.options.activityTypes.map((option) => (
                    <option key={`activity-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => updateFilters({ focusMetric: '' })}
                aria-pressed={String(data.filters.focusMetric || '').trim() === ''}
                aria-label="Clear focused metric detail"
              >
                Clear Detail
              </button>
            </div>
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active__count is-active" aria-live="polite" aria-atomic="true">
                {toText(data.dashboard.insightLine, 'No insight available yet.')}
              </div>
            </div>
          </section>

          <section className="avel-kpi-grid avel-kpi-grid--spaced">
            {cards.map((card) => (
              <article key={card.key} className="avel-kpi">
                <p className="avel-kpi__label">{card.label}</p>
                <p className="avel-kpi__value">{toText(card.value, '0')}</p>
                <p className="avel-kpi__hint">{card.hint}</p>
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  onClick={() => updateFilters({ focusMetric: card.key })}
                  aria-pressed={String(data.filters.focusMetric || '').trim() === String(card.key)}
                  aria-label={`Inspect ${card.label} metric`}
                >
                  Inspect
                </button>
              </article>
            ))}
          </section>

          <section className="avel-kpi-chart-grid">
            <article className="avel-list-panel avel-chart-card avel-chart-card--wide">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Recruiter Activity Trend</h3>
                <p className="avel-list-panel__hint">Interactive chart style and metric controls are in-page only.</p>
              </div>
              <div className="avel-chart-toolbar">
                <label className="modern-command-field">
                  <span className="modern-command-label">Metric</span>
                  <select value={activityMetric} onChange={(event) => setActivityMetric(event.target.value as ActivityMetricKey)}>
                    {Object.entries(activityMetricLabel).map(([value, label]) => (
                      <option key={`metric-${value}`} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="modern-command-field">
                  <span className="modern-command-label">Style</span>
                  <select value={trendMode} onChange={(event) => setTrendMode(event.target.value as TrendChartMode)}>
                    <option value="line">Line + Area</option>
                    <option value="bars">Bars</option>
                  </select>
                </label>
                <div className="avel-chart-kpi">
                  <span>Selected</span>
                  <strong>{selectedPoint ? `${selectedPoint.label}: ${selectedPoint.value}` : '--'}</strong>
                </div>
              </div>
              <TrendChart points={trendPoints} mode={trendMode} activeIndex={activeTrendIndex} onActivate={setActiveTrendIndex} />
            </article>

            <article className="avel-list-panel avel-chart-card">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Source Quality</h3>
                <p className="avel-list-panel__hint">In-page sort controls for source performance.</p>
              </div>
              <label className="modern-command-field">
                <span className="modern-command-label">Sort</span>
                <select value={sourceSort} onChange={(event) => setSourceSort(event.target.value as SourceSortMode)}>
                  <option value="hireRate">Hire Rate</option>
                  <option value="hires">Hires</option>
                  <option value="interviews">Interview Path</option>
                </select>
              </label>
              <div style={{ marginTop: '10px' }}>
                {sourceRows.map((row, index) => {
                  const metricValue = sourceSort === 'interviews' ? toNumber(row.interviewPathCount) : toNumber(row.hireCount);
                  const width = Math.max(3, Math.round((metricValue / maxSourceMetric) * 100));
                  return (
                    <div key={`source-${index}`} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>{toText(row.source, 'Unknown')}</span>
                        <strong>
                          {toText(row.hireRateLabel, '0%')} | {toNumber(row.hireCount)} hires
                        </strong>
                      </div>
                      <div style={{ height: '10px', borderRadius: '999px', background: '#e6edf3', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #f4a23a 0%, #ce6c1b 100%)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">{detail ? `${detail.title} (${detail.rows.length})` : 'Metric Details'}</h3>
              <p className="avel-list-panel__hint">{detail ? `Focus metric: ${detail.key}` : 'Select Inspect on any KPI card.'}</p>
            </div>
            {!detail ? (
              <div className="modern-state">No detail selected.</div>
            ) : detail.rows.length === 0 ? (
              <div className="modern-state">{detail.emptyLabel}</div>
            ) : (
              <DataTable
                columns={[
                  { key: 'primary', title: 'Primary' },
                  { key: 'secondary', title: 'Secondary' },
                  { key: 'tertiary', title: 'Tertiary' },
                  { key: 'meta', title: 'Meta' }
                ]}
                hasRows={true}
              >
                {detail.rows.map((row, index) => {
                  const candidateURL = detailLink('candidates', 'candidateID', row.candidateID);
                  const jobOrderURL = detailLink('joborders', 'jobOrderID', row.jobOrderID);
                  const primaryText = toText(row.candidateName, toText(row.title, '--'));
                  const secondaryText = toText(row.jobOrderTitle, toText(row.status, '--'));
                  const tertiaryText = toText(row.hireDateLabel, toText(row.offerDateLabel, toText(row.lastUpdatedLabel, '--')));
                  const metaText =
                    detail.key === 'offerAcceptance'
                      ? toText(row.outcomeLabel)
                      : detail.key === 'activePipeline'
                      ? toText(row.statusLabel)
                      : `${toText(row.healthLabel, '--')} | ${toText(row.lastPipelineDateLabel, '--')}`;
                  return (
                    <tr key={`detail-${index}`}>
                      <td>
                        {candidateURL !== '' ? (
                          <a className="modern-link" href={ensureModernUIURL(candidateURL)}>
                            {primaryText}
                          </a>
                        ) : (
                          primaryText
                        )}
                      </td>
                      <td>
                        {jobOrderURL !== '' ? (
                          <a className="modern-link" href={ensureModernUIURL(jobOrderURL)}>
                            {secondaryText}
                          </a>
                        ) : (
                          secondaryText
                        )}
                      </td>
                      <td>{tertiaryText}</td>
                      <td>{metaText}</td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
