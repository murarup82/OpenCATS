import { KeyboardEvent, useEffect, useMemo, useState, type CSSProperties } from 'react';
import DOMPurify from 'dompurify';
import { fetchHomeOverviewModernData } from '../lib/api';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { HomeOverviewModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type HomeChartsModern = NonNullable<HomeOverviewModernDataResponse['chartsModern']>;
type HiringMetric = 'total' | 'submitted' | 'interviewing' | 'hired';
type TrendChartMode = 'line' | 'bars';
type TrendPoint = { label: string; value: number };
type FunnelSortMode = 'pipeline' | 'count';
type SeniorityRow = HomeChartsModern['seniorityDistribution']['activeOnly'][number];

const SENIORITY_COLORS = ['#0f98c0', '#2f7fbd', '#d18b32', '#4fa86f', '#7c6acb', '#b55a78', '#718995'];

function toNumber(value: unknown): number {
  const cast = Number(value);
  return Number.isFinite(cast) ? cast : 0;
}

function formatPercent(value: number): string {
  const rounded = Math.round(toNumber(value) * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

type OverviewTrendChartProps = {
  points: TrendPoint[];
  mode: TrendChartMode;
  activeIndex: number;
  onActivate: (index: number) => void;
  onStep: (direction: -1 | 1) => void;
};

function OverviewTrendChart({ points, mode, activeIndex, onActivate, onStep }: OverviewTrendChartProps) {
  if (points.length === 0) {
    return <div className="modern-state">No chart data is available.</div>;
  }

  const width = 760;
  const height = 260;
  const padLeft = 42;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const maxValue = Math.max(1, ...points.map((point) => toNumber(point.value)));
  const labelStep = points.length > 14 ? Math.ceil(points.length / 8) : 1;

  const coords = points.map((point, index) => {
    const x =
      points.length <= 1
        ? padLeft + plotWidth / 2
        : padLeft + (index / (points.length - 1)) * plotWidth;
    const y = padTop + (1 - toNumber(point.value) / maxValue) * plotHeight;
    return { x, y };
  });

  const linePath =
    coords.length <= 1
      ? `M ${coords[0].x} ${coords[0].y} L ${coords[0].x + 0.1} ${coords[0].y}`
      : coords
          .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
          .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(height - padBottom).toFixed(2)} L ${
    coords[0].x
  } ${(height - padBottom).toFixed(2)} Z`;
  const segmentWidth = plotWidth / Math.max(points.length, 1);
  const barWidth = points.length <= 1 ? Math.min(80, plotWidth * 0.6) : Math.max(12, segmentWidth * 0.66);

  const handlePointKeyDown = (event: KeyboardEvent<SVGElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate(index);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      onStep(-1);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      onStep(1);
    }
  };

  return (
    <div className="avel-trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Overview trend chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padTop + ratio * plotHeight;
          const value = Math.round(maxValue * (1 - ratio));
          return (
            <g key={`grid-${ratio}`}>
              <line className="avel-trend-chart__grid" x1={padLeft} y1={y} x2={width - padRight} y2={y} />
              <text className="avel-trend-chart__axis" x={padLeft - 8} y={y + 4} textAnchor="end">
                {value}
              </text>
            </g>
          );
        })}

        {mode === 'line' ? (
          <>
            <path className="avel-trend-chart__area" d={areaPath} />
            <path className="avel-trend-chart__line" d={linePath} />
            {coords.map((coord, index) => (
              <circle
                key={`point-${points[index].label}-${index}`}
                className={`avel-trend-chart__point${index === activeIndex ? ' is-active' : ''}`}
                cx={coord.x}
                cy={coord.y}
                r={index === activeIndex ? 5.5 : 4}
                tabIndex={0}
                onMouseEnter={() => onActivate(index)}
                onFocus={() => onActivate(index)}
                aria-label={`Trend ${points[index].label}: ${points[index].value}`}
                onKeyDown={(event) => handlePointKeyDown(event, index)}
              >
                <title>{`${points[index].label}: ${points[index].value}`}</title>
              </circle>
            ))}
          </>
        ) : (
          <>
            {points.map((point, index) => {
              const value = toNumber(point.value);
              const barHeight = Math.max(2, (value / maxValue) * plotHeight);
              const x = padLeft + segmentWidth * index + (segmentWidth - barWidth) / 2;
              const y = padTop + (plotHeight - barHeight);
              return (
                <rect
                  key={`bar-${point.label}-${index}`}
                  className={`avel-trend-chart__bar${index === activeIndex ? ' is-active' : ''}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  ry={4}
                  tabIndex={0}
                  onMouseEnter={() => onActivate(index)}
                  onFocus={() => onActivate(index)}
                  aria-label={`Trend ${point.label}: ${point.value}`}
                  onKeyDown={(event) => handlePointKeyDown(event, index)}
                >
                  <title>{`${point.label}: ${point.value}`}</title>
                </rect>
              );
            })}
          </>
        )}

        {coords.map((coord, index) => {
          if (index % labelStep !== 0 && index !== points.length - 1) {
            return null;
          }
          return (
            <text
              key={`x-${points[index].label}-${index}`}
              className="avel-trend-chart__axis"
              x={coord.x}
              y={height - 12}
              textAnchor="middle"
            >
              {points[index].label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function HomePage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeOverviewModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [hiringMetric, setHiringMetric] = useState<HiringMetric>('total');
  const [hiringChartMode, setHiringChartMode] = useState<TrendChartMode>('line');
  const [activeHiringIndex, setActiveHiringIndex] = useState<number>(0);
  const [funnelSortMode, setFunnelSortMode] = useState<FunnelSortMode>('pipeline');
  const [activeFunnelLabel, setActiveFunnelLabel] = useState<string>('all');
  const [includeInactiveSeniority, setIncludeInactiveSeniority] = useState<boolean>(false);
  const [seniorityFocusLabel, setSeniorityFocusLabel] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    const query = new URLSearchParams(window.location.search);

    fetchHomeOverviewModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load overview.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap]);

  const hasModernCharts = Boolean(data?.chartsModern);
  const hiringRows = data?.chartsModern?.hiringOverview.points || [];
  const hiringTrendPoints = useMemo<TrendPoint[]>(
    () =>
      hiringRows.map((point) => ({
        label: String(point.label || ''),
        value: toNumber(point[hiringMetric])
      })),
    [hiringRows, hiringMetric]
  );

  useEffect(() => {
    if (hiringTrendPoints.length === 0) {
      setActiveHiringIndex(0);
      return;
    }
    setActiveHiringIndex((previous) => {
      if (previous >= 0 && previous < hiringTrendPoints.length) {
        return previous;
      }
      return hiringTrendPoints.length - 1;
    });
  }, [hiringTrendPoints.length]);

  const safeHiringIndex =
    hiringTrendPoints.length === 0 ? -1 : Math.max(0, Math.min(activeHiringIndex, hiringTrendPoints.length - 1));
  const selectedHiringPoint = safeHiringIndex >= 0 ? hiringTrendPoints[safeHiringIndex] : null;
  const hiringPeak = Math.max(0, ...hiringTrendPoints.map((point) => toNumber(point.value)));
  const hiringSum = hiringTrendPoints.reduce((sum, point) => sum + toNumber(point.value), 0);
  const hiringMetricLabels: Record<HiringMetric, string> = {
    total: 'Total',
    submitted: 'Proposed',
    interviewing: 'Interviewing',
    hired: 'Hired'
  };

  const stepHiringPoint = (direction: -1 | 1) => {
    if (hiringTrendPoints.length === 0) {
      return;
    }
    setActiveHiringIndex((current) => {
      const next = current + direction;
      if (next < 0) {
        return hiringTrendPoints.length - 1;
      }
      if (next >= hiringTrendPoints.length) {
        return 0;
      }
      return next;
    });
  };

  const funnelStagesRaw = data?.chartsModern?.funnelSnapshot.stages || [];
  const funnelStages = useMemo(
    () =>
      (funnelSortMode === 'count'
        ? [...funnelStagesRaw].sort((left, right) => toNumber(right.count) - toNumber(left.count))
        : [...funnelStagesRaw]),
    [funnelStagesRaw, funnelSortMode]
  );
  const funnelMax = Math.max(1, ...funnelStages.map((stage) => toNumber(stage.count)));
  const funnelTotal = toNumber(data?.chartsModern?.funnelSnapshot.total);
  const activeFunnelStage = funnelStages.find((stage) => stage.label === activeFunnelLabel) || null;

  useEffect(() => {
    if (activeFunnelLabel === 'all') {
      return;
    }
    if (!funnelStages.some((stage) => stage.label === activeFunnelLabel)) {
      setActiveFunnelLabel('all');
    }
  }, [activeFunnelLabel, funnelStages]);

  const seniorityRowsRaw: SeniorityRow[] = includeInactiveSeniority
    ? data?.chartsModern?.seniorityDistribution.includingInactive || []
    : data?.chartsModern?.seniorityDistribution.activeOnly || [];
  const seniorityTotal = includeInactiveSeniority
    ? toNumber(data?.chartsModern?.seniorityDistribution.includingInactiveTotal)
    : toNumber(data?.chartsModern?.seniorityDistribution.activeOnlyTotal);
  const seniorityRows = useMemo(
    () => [...seniorityRowsRaw].sort((left, right) => toNumber(right.count) - toNumber(left.count)),
    [seniorityRowsRaw]
  );
  const seniorityMax = Math.max(1, ...seniorityRows.map((bucket) => toNumber(bucket.count)));
  const selectedSeniorityBucket = seniorityRows.find((bucket) => bucket.label === seniorityFocusLabel) || null;

  useEffect(() => {
    if (seniorityFocusLabel === 'all') {
      return;
    }
    if (!seniorityRows.some((bucket) => bucket.label === seniorityFocusLabel)) {
      setSeniorityFocusLabel('all');
    }
  }, [seniorityRows, seniorityFocusLabel]);

  const seniorityMixStyle = useMemo<CSSProperties>(() => {
    if (seniorityRows.length === 0 || seniorityTotal <= 0) {
      return { background: '#dbeaf3' };
    }

    let start = 0;
    const slices: string[] = [];
    seniorityRows.forEach((bucket, index) => {
      const count = Math.max(0, toNumber(bucket.count));
      const ratio = count / seniorityTotal;
      const end = start + ratio * 360;
      const baseColor = SENIORITY_COLORS[index % SENIORITY_COLORS.length];
      const color = seniorityFocusLabel !== 'all' && seniorityFocusLabel !== bucket.label ? '#cfdfeb' : baseColor;
      slices.push(`${color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`);
      start = end;
    });

    if (start < 360) {
      slices.push(`#dbeaf3 ${start.toFixed(1)}deg 360deg`);
    }

    return {
      background: `conic-gradient(${slices.join(', ')})`
    };
  }, [seniorityRows, seniorityFocusLabel, seniorityTotal]);

  if (loading && !data) {
    return <div className="modern-state">Loading overview...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Overview data is not available." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Overview"
        subtitle="Modern home workspace with hiring pulse, events, and quick insights."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.inboxURL}>
              My Inbox
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.myNotesURL}>
              My Notes
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-kpi-grid" style={{ marginBottom: '12px' }}>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Recent Hires</p>
                <p className="avel-kpi__value">{data.summary.recentHiresCount}</p>
              </article>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Important Candidates</p>
                <p className="avel-kpi__value">{data.summary.importantCandidatesCount}</p>
              </article>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Workspace</p>
                <p className="avel-kpi__value">
                  <a className="modern-link" href={data.actions.dashboardURL}>
                    Open Dashboard
                  </a>
                </p>
              </article>
            </div>

            <div className="modern-command-grid modern-command-grid--dual">
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Recent Hires</h3>
                </div>
                {data.recentHires.length === 0 ? (
                  <div className="modern-state">No recent hires.</div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Company</th>
                        <th>Recruiter</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentHires.map((row) => (
                        <tr key={`hire-${row.candidateID}-${row.companyID}`}>
                          <td>
                            <a className="modern-link" href={row.candidateURL}>
                              {row.candidateName}
                            </a>
                          </td>
                          <td>
                            <a className="modern-link" href={row.companyURL}>
                              {row.companyName}
                            </a>
                          </td>
                          <td>{row.recruiterName}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Upcoming Events</h3>
                </div>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.events.upcomingEventsHTML || '<p>No events.</p>') }} />
                <div className="modern-divider" />
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Follow-up</h3>
                </div>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.events.followUpEventsHTML || '<p>No follow-ups.</p>') }} />
              </article>
            </div>

            {hasModernCharts ? (
              <section className="avel-kpi-chart-grid" style={{ marginTop: '12px' }}>
                <article className="avel-list-panel avel-chart-card avel-chart-card--wide">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Hiring Overview</h3>
                    <p className="avel-list-panel__hint">Interactive trend using the same in-page chart system as KPIs.</p>
                  </div>
                  <div className="avel-chart-toolbar">
                    <label className="modern-command-field">
                      <span className="modern-command-label">Series</span>
                      <select value={hiringMetric} onChange={(event) => setHiringMetric(event.target.value as HiringMetric)}>
                        {Object.entries(hiringMetricLabels).map(([value, label]) => (
                          <option key={`home-hiring-series-${value}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="modern-command-field">
                      <span className="modern-command-label">Chart Style</span>
                      <select value={hiringChartMode} onChange={(event) => setHiringChartMode(event.target.value as TrendChartMode)}>
                        <option value="line">Line + Area</option>
                        <option value="bars">Bars</option>
                      </select>
                    </label>
                    <div className="avel-chart-kpi">
                      <span>Peak</span>
                      <strong>{hiringPeak}</strong>
                    </div>
                    <div className="avel-chart-kpi">
                      <span>Total</span>
                      <strong>{hiringSum}</strong>
                    </div>
                    <div className="avel-chart-kpi">
                      <span>Selected</span>
                      <strong>{selectedHiringPoint ? `${selectedHiringPoint.label}: ${selectedHiringPoint.value}` : '--'}</strong>
                    </div>
                  </div>
                  <OverviewTrendChart
                    points={hiringTrendPoints}
                    mode={hiringChartMode}
                    activeIndex={Math.max(0, safeHiringIndex)}
                    onActivate={setActiveHiringIndex}
                    onStep={stepHiringPoint}
                  />
                  <a className="modern-link" href={data.charts.hiringOverviewURL} target="_blank" rel="noreferrer">
                    Open legacy graph image
                  </a>
                </article>

                <article className="avel-list-panel avel-chart-card">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Status Funnel</h3>
                    <p className="avel-list-panel__hint">Toggle stage focus and sort mode without reloading.</p>
                  </div>
                  <div className="avel-chart-toolbar">
                    <label className="modern-command-field">
                      <span className="modern-command-label">Sort</span>
                      <select value={funnelSortMode} onChange={(event) => setFunnelSortMode(event.target.value as FunnelSortMode)}>
                        <option value="pipeline">Pipeline Order</option>
                        <option value="count">Highest Count</option>
                      </select>
                    </label>
                    <div className="avel-chart-kpi">
                      <span>Total</span>
                      <strong>{funnelTotal}</strong>
                    </div>
                    <div className="avel-chart-kpi">
                      <span>Focus</span>
                      <strong>{activeFunnelStage ? activeFunnelStage.label : 'All'}</strong>
                    </div>
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => setActiveFunnelLabel('all')}
                    >
                      Clear Focus
                    </button>
                  </div>
                  <div className="avel-company-bars">
                    {funnelStages.length === 0 ? (
                      <div className="modern-state">No status funnel data available.</div>
                    ) : (
                      funnelStages.map((stage) => {
                        const isActive = activeFunnelLabel === stage.label;
                        const isMuted = activeFunnelLabel !== 'all' && activeFunnelLabel !== stage.label;
                        const widthPercent = Math.max(4, (toNumber(stage.count) / funnelMax) * 100);
                        return (
                          <button
                            key={`home-funnel-stage-${stage.label}`}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setActiveFunnelLabel(isActive ? 'all' : stage.label)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              padding: 0,
                              cursor: 'pointer',
                              opacity: isMuted ? 0.5 : 1
                            }}
                          >
                            <div className="avel-company-bars__row">
                              <div className="avel-company-bars__meta">
                                <span>{stage.label}</span>
                                <strong>
                                  {stage.count} ({formatPercent(stage.percentOfTotal)})
                                </strong>
                              </div>
                              <div className="avel-company-bars__track">
                                <span
                                  style={{
                                    width: `${widthPercent}%`,
                                    background: isActive ? 'linear-gradient(90deg, #57b8d3 0%, #0b6f90 100%)' : undefined
                                  }}
                                ></span>
                              </div>
                              <p className="avel-list-panel__hint" style={{ margin: 0 }}>
                                {stage.retentionPercent === null ? 'First stage' : `Retention: ${formatPercent(stage.retentionPercent)}`}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <a className="modern-link" href={data.charts.funnelSnapshotURL} target="_blank" rel="noreferrer">
                    Open legacy graph image
                  </a>
                </article>

                <article className="avel-list-panel avel-chart-card">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Seniority Distribution</h3>
                    <p className="avel-list-panel__hint">Interactive donut and list breakdown with active/inactive scope switch.</p>
                  </div>
                  <div className="avel-chart-toolbar">
                    <label className="modern-command-toggle">
                      <input
                        type="checkbox"
                        checked={includeInactiveSeniority}
                        onChange={(event) => setIncludeInactiveSeniority(event.target.checked)}
                      />
                      <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                      <span>Include Inactive</span>
                    </label>
                    <div className="avel-chart-kpi">
                      <span>Total</span>
                      <strong>{seniorityTotal}</strong>
                    </div>
                    <div className="avel-chart-kpi">
                      <span>Focus</span>
                      <strong>{selectedSeniorityBucket ? selectedSeniorityBucket.label : 'All'}</strong>
                    </div>
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => setSeniorityFocusLabel('all')}
                    >
                      Clear Focus
                    </button>
                  </div>
                  <div className="avel-source-mix">
                    <div className="avel-source-mix__donut" style={seniorityMixStyle}>
                      <div className="avel-source-mix__center">
                        <strong>{selectedSeniorityBucket ? selectedSeniorityBucket.count : seniorityTotal}</strong>
                        <span>{selectedSeniorityBucket ? selectedSeniorityBucket.label : 'Total'}</span>
                      </div>
                    </div>
                    <div className="avel-source-mix__legend" role="group" aria-label="Seniority focus">
                      <button
                        type="button"
                        className={`avel-source-chip${seniorityFocusLabel === 'all' ? ' is-active' : ''}`}
                        onClick={() => setSeniorityFocusLabel('all')}
                        aria-pressed={seniorityFocusLabel === 'all'}
                      >
                        All
                      </button>
                      {seniorityRows.map((bucket) => (
                        <button
                          key={`home-seniority-${bucket.label}`}
                          type="button"
                          className={`avel-source-chip${seniorityFocusLabel === bucket.label ? ' is-active' : ''}`}
                          onClick={() => setSeniorityFocusLabel(bucket.label)}
                          aria-pressed={seniorityFocusLabel === bucket.label}
                        >
                          {bucket.label}: {bucket.count} ({formatPercent(bucket.percentOfTotal)})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="avel-company-bars">
                    {seniorityRows.length === 0 ? (
                      <div className="modern-state">No seniority data available.</div>
                    ) : (
                      seniorityRows.map((bucket, index) => {
                        const isMuted = seniorityFocusLabel !== 'all' && seniorityFocusLabel !== bucket.label;
                        const widthPercent = Math.max(4, (toNumber(bucket.count) / seniorityMax) * 100);
                        return (
                          <div
                            key={`home-seniority-row-${bucket.label}-${index}`}
                            className="avel-company-bars__row"
                            style={{ opacity: isMuted ? 0.5 : 1 }}
                          >
                            <div className="avel-company-bars__meta">
                              <span>{bucket.label}</span>
                              <strong>
                                {bucket.count} ({formatPercent(bucket.percentOfTotal)})
                              </strong>
                            </div>
                            <div className="avel-company-bars__track">
                              <span
                                style={{
                                  width: `${widthPercent}%`,
                                  background: SENIORITY_COLORS[index % SENIORITY_COLORS.length]
                                }}
                              ></span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <a className="modern-link" href={data.charts.seniorityDistributionURL} target="_blank" rel="noreferrer">
                    Open legacy graph image
                  </a>
                </article>
              </section>
            ) : (
              <div className="modern-command-grid modern-command-grid--triple" style={{ marginTop: '12px' }}>
                <article className="avel-list-panel">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Hiring Overview</h3>
                  </div>
                  <img src={data.charts.hiringOverviewURL} alt="Hiring overview" style={{ width: '100%', height: 'auto' }} />
                </article>
                <article className="avel-list-panel">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Status Funnel</h3>
                  </div>
                  <img src={data.charts.funnelSnapshotURL} alt="Status funnel snapshot" style={{ width: '100%', height: 'auto' }} />
                </article>
                <article className="avel-list-panel">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Seniority Distribution</h3>
                  </div>
                  <img src={data.charts.seniorityDistributionURL} alt="Seniority distribution" style={{ width: '100%', height: 'auto' }} />
                </article>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
