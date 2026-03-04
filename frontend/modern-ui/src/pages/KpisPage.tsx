import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
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

type TrendChartMode = 'line' | 'bars';
type SourceFocusMode = 'all' | 'internal' | 'partner';
type CompanyMetricKey = 'newPositions' | 'totalOpenPositions' | 'filledPositions' | 'expectedFilled';
type CandidateMetricMode = 'thisWeek' | 'lastWeek' | 'delta';
type TrendPoint = { label: string; value: number };
const KPI_PREFS_STORAGE_KEY = 'opencats:modern:kpis:prefs:v1';

function toNumber(value: unknown): number {
  const cast = Number(value);
  return Number.isFinite(cast) ? cast : 0;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function toPercent(part: number, total: number): string {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) {
    return '0%';
  }
  return `${Math.round((part / total) * 100)}%`;
}

function normalizeSearchValue(value: string): string {
  return String(value || '').trim().toLowerCase();
}

type KpiPrefs = {
  trendChartMode: TrendChartMode;
  sourceFocusMode: SourceFocusMode;
  companyMetric: CompanyMetricKey;
  companyLimit: number;
  candidateMetricMode: CandidateMetricMode;
};

function readKpiPrefs(): Partial<KpiPrefs> {
  try {
    const raw = window.localStorage.getItem(KPI_PREFS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Partial<KpiPrefs>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeKpiPrefs(prefs: KpiPrefs): void {
  try {
    window.localStorage.setItem(KPI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Best effort only.
  }
}

type TrendChartProps = {
  points: TrendPoint[];
  mode: TrendChartMode;
  activeIndex: number;
  onActivate: (index: number) => void;
  onStep: (direction: -1 | 1) => void;
};

function TrendChart({ points, mode, activeIndex, onActivate, onStep }: TrendChartProps) {
  if (points.length === 0) {
    return <div className="modern-state">No trend data available for the selected range.</div>;
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
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="New candidates trend chart">
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

export function KpisPage({ bootstrap }: Props) {
  const [data, setData] = useState<KpisListModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [trendChartMode, setTrendChartMode] = useState<TrendChartMode>(() => {
    const prefs = readKpiPrefs();
    return prefs.trendChartMode === 'bars' ? 'bars' : 'line';
  });
  const [sourceFocusMode, setSourceFocusMode] = useState<SourceFocusMode>(() => {
    const prefs = readKpiPrefs();
    return prefs.sourceFocusMode === 'internal' || prefs.sourceFocusMode === 'partner' ? prefs.sourceFocusMode : 'all';
  });
  const [companyMetric, setCompanyMetric] = useState<CompanyMetricKey>(() => {
    const prefs = readKpiPrefs();
    return prefs.companyMetric === 'newPositions' ||
      prefs.companyMetric === 'filledPositions' ||
      prefs.companyMetric === 'expectedFilled'
      ? prefs.companyMetric
      : 'totalOpenPositions';
  });
  const [companyLimit, setCompanyLimit] = useState<number>(() => {
    const prefs = readKpiPrefs();
    return Math.max(3, Math.min(20, toNumber(prefs.companyLimit || 8)));
  });
  const [candidateMetricMode, setCandidateMetricMode] = useState<CandidateMetricMode>(() => {
    const prefs = readKpiPrefs();
    return prefs.candidateMetricMode === 'lastWeek' || prefs.candidateMetricMode === 'delta'
      ? prefs.candidateMetricMode
      : 'thisWeek';
  });
  const [activeTrendIndex, setActiveTrendIndex] = useState<number>(0);
  const [companySearch, setCompanySearch] = useState<string>('');
  const [candidateMetricSearch, setCandidateMetricSearch] = useState<string>('');
  const [jobOrderSearch, setJobOrderSearch] = useState<string>('');
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

  const trendPoints = useMemo<TrendPoint[]>(
    () =>
      (data?.charts.candidateTrend.points || []).map((point) => ({
        label: String(point.label || ''),
        value: toNumber(point.value)
      })),
    [data]
  );

  useEffect(() => {
    if (trendPoints.length === 0) {
      setActiveTrendIndex(0);
      return;
    }
    setActiveTrendIndex((previous) => {
      if (previous >= 0 && previous < trendPoints.length) {
        return previous;
      }
      return trendPoints.length - 1;
    });
  }, [trendPoints.length]);

  useEffect(() => {
    writeKpiPrefs({
      trendChartMode,
      sourceFocusMode,
      companyMetric,
      companyLimit,
      candidateMetricMode
    });
  }, [trendChartMode, sourceFocusMode, companyMetric, companyLimit, candidateMetricMode]);

  const stepTrendPoint = (direction: -1 | 1) => {
    if (trendPoints.length === 0) {
      return;
    }
    setActiveTrendIndex((current) => {
      const next = current + direction;
      if (next < 0) {
        return trendPoints.length - 1;
      }
      if (next >= trendPoints.length) {
        return 0;
      }
      return next;
    });
  };

  const updateFilter = (key: string, value: string | boolean) => {
    const next = new URLSearchParams(serverQueryString);
    next.set('m', 'kpis');
    next.delete('a');
    if (typeof value === 'boolean') {
      next.set(key, value ? '1' : '0');
    } else if (String(value).trim() === '') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    applyServerQuery(next);
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    next.set('m', 'kpis');
    next.set('resetKpiFilters', '1');
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

  const companyMetricLabels: Record<CompanyMetricKey, string> = {
    newPositions: 'New Positions',
    totalOpenPositions: 'Open Positions',
    filledPositions: 'Filled Positions',
    expectedFilled: 'Expected Filled'
  };
  const companySearchNeedle = normalizeSearchValue(companySearch);
  const candidateMetricSearchNeedle = normalizeSearchValue(candidateMetricSearch);
  const jobOrderSearchNeedle = normalizeSearchValue(jobOrderSearch);

  const companyRows = useMemo(() => {
    if (!data) {
      return [];
    }
    return [...data.rows.kpiRows]
      .filter((row) => {
        if (companySearchNeedle === '') {
          return true;
        }
        return String(row.companyName || '').toLowerCase().includes(companySearchNeedle);
      })
      .map((row) => ({
        companyID: row.companyID,
        companyName: row.companyName,
        value: Math.max(0, toNumber(row[companyMetric]))
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, Math.max(3, Math.min(20, companyLimit)));
  }, [data, companyMetric, companyLimit, companySearchNeedle]);

  const candidateMetricRows = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.rows.candidateMetricRows.map((row) => {
      const thisWeek = toNumber(row.thisWeek);
      const lastWeek = toNumber(row.lastWeek);
      const delta = toNumber(row.delta);
      const value =
        candidateMetricMode === 'lastWeek' ? lastWeek : candidateMetricMode === 'delta' ? delta : thisWeek;
      return {
        label: row.label,
        value,
        thisWeek,
        lastWeek,
        delta
      };
    });
  }, [data, candidateMetricMode]);

  const companySnapshotRows = useMemo(
    () =>
      (data?.rows.kpiRows || []).filter((row) =>
        companySearchNeedle === '' ? true : String(row.companyName || '').toLowerCase().includes(companySearchNeedle)
      ),
    [data, companySearchNeedle]
  );

  const candidateTableRows = useMemo(
    () =>
      (data?.rows.candidateMetricRows || []).filter((row) =>
        candidateMetricSearchNeedle === '' ? true : String(row.label || '').toLowerCase().includes(candidateMetricSearchNeedle)
      ),
    [data, candidateMetricSearchNeedle]
  );

  const jobOrderRows = useMemo(
    () =>
      (data?.rows.jobOrderKpiRows || []).filter((row) => {
        if (jobOrderSearchNeedle === '') {
          return true;
        }
        const haystack = `${String(row.title || '')} ${String(row.companyName || '')}`.toLowerCase();
        return haystack.includes(jobOrderSearchNeedle);
      }),
    [data, jobOrderSearchNeedle]
  );

  if (loading && !data) {
    return <div className="modern-state">Loading KPIs...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="KPI data is not available." />;
  }

  const safeTrendIndex =
    trendPoints.length === 0 ? -1 : Math.max(0, Math.min(activeTrendIndex, trendPoints.length - 1));
  const selectedTrendPoint = safeTrendIndex >= 0 ? trendPoints[safeTrendIndex] : null;
  const sourceTotal = Math.max(
    0,
    toNumber(data.rows.candidateSourceSnapshot.total),
    toNumber(data.rows.candidateSourceSnapshot.internal) + toNumber(data.rows.candidateSourceSnapshot.partner)
  );
  const sourceInternal = Math.max(0, toNumber(data.rows.candidateSourceSnapshot.internal));
  const sourcePartner = Math.max(0, toNumber(data.rows.candidateSourceSnapshot.partner));
  const sourceInternalColor = sourceFocusMode === 'partner' ? '#aac6d3' : '#0f98c0';
  const sourcePartnerColor = sourceFocusMode === 'internal' ? '#d4c4a6' : '#d18b32';
  const sourceInternalAngle = sourceTotal > 0 ? (sourceInternal / sourceTotal) * 360 : 0;
  const sourceMixStyle = {
    background: `conic-gradient(${sourceInternalColor} 0deg ${sourceInternalAngle}deg, ${sourcePartnerColor} ${sourceInternalAngle}deg 360deg)`
  };
  const companyMax = Math.max(1, ...companyRows.map((row) => row.value));
  const candidateMetricMax = Math.max(1, ...candidateMetricRows.map((row) => Math.abs(row.value)));
  const kpiResultsSummary = `Rows visible: ${companySnapshotRows.length} companies, ${candidateTableRows.length} candidate metrics, ${jobOrderRows.length} job orders.`;

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
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">Live KPI Controls</h3>
              <p className="avel-list-panel__hint">Server filters update the KPI dataset. Chart style controls apply in page without reload.</p>
            </div>

            <div className="avel-kpi-controls">
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
                  checked={data.filters.showExpectedFilled}
                  onChange={(event) => updateFilter('showExpectedFilled', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Show Expected Filled</span>
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

            <div className="avel-kpi-filter-grid">
              <label className="modern-command-field">
                <span className="modern-command-label">Candidate Source</span>
                <select
                  value={data.filters.candidateSourceScope}
                  onChange={(event) => updateFilter('candidateSourceScope', event.target.value)}
                >
                  {data.options.candidateSourceScopes.map((option) => (
                    <option key={`source-scope-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Job Order Scope</span>
                <select value={data.filters.jobOrderScope} onChange={(event) => updateFilter('jobOrderScope', event.target.value)}>
                  {data.options.jobOrderScopes.map((option) => (
                    <option key={`joborder-scope-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Trend View</span>
                <select value={data.filters.trendView} onChange={(event) => updateFilter('trendView', event.target.value)}>
                  {data.options.trendViews.map((option) => (
                    <option key={`trend-view-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Trend Start</span>
                <input
                  className="avel-kpi-date"
                  type="date"
                  value={data.filters.trendStart || ''}
                  onChange={(event) => updateFilter('trendStart', event.target.value)}
                />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Trend End</span>
                <input
                  className="avel-kpi-date"
                  type="date"
                  value={data.filters.trendEnd || ''}
                  onChange={(event) => updateFilter('trendEnd', event.target.value)}
                />
              </label>
              <button type="button" className="modern-btn modern-btn--secondary modern-btn--mini" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
            <p className="avel-kpi-results-summary" role="status" aria-live="polite">
              {kpiResultsSummary}
            </p>
            <div className="avel-kpi-filter-grid">
              <label className="modern-command-field">
                <span className="modern-command-label">Search Companies</span>
                <input
                  type="search"
                  className="avel-form-control"
                  value={companySearch}
                  onChange={(event) => setCompanySearch(event.target.value)}
                  placeholder="Filter by company name"
                />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Search Candidate Metrics</span>
                <input
                  type="search"
                  className="avel-form-control"
                  value={candidateMetricSearch}
                  onChange={(event) => setCandidateMetricSearch(event.target.value)}
                  placeholder="Filter by metric label"
                />
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Search Job Orders</span>
                <input
                  type="search"
                  className="avel-form-control"
                  value={jobOrderSearch}
                  onChange={(event) => setJobOrderSearch(event.target.value)}
                  placeholder="Filter by title or company"
                />
              </label>
              <button
                type="button"
                className="modern-btn modern-btn--secondary modern-btn--mini"
                onClick={() => {
                  setCompanySearch('');
                  setCandidateMetricSearch('');
                  setJobOrderSearch('');
                }}
              >
                Clear Local Filters
              </button>
            </div>

            <div className="avel-kpi-grid avel-kpi-grid--spaced">
              {metricCards.map((metric) => (
                <article key={metric.label} className="avel-kpi">
                  <p className="avel-kpi__label">{metric.label}</p>
                  <p className="avel-kpi__value">{metric.value}</p>
                  <p className="avel-kpi__hint">{formatSigned(metric.diff)} vs last week</p>
                </article>
              ))}
            </div>
          </section>

          <section className="avel-kpi-chart-grid">
            <article className="avel-list-panel avel-chart-card avel-chart-card--wide">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">New Candidates Trend</h3>
                <p className="avel-list-panel__hint">
                  {data.filters.trendView} view | {data.filters.trendStart} to {data.filters.trendEnd}
                </p>
              </div>
              <div className="avel-chart-toolbar">
                <label className="modern-command-field">
                  <span className="modern-command-label">Chart Style</span>
                  <select value={trendChartMode} onChange={(event) => setTrendChartMode(event.target.value as TrendChartMode)}>
                    <option value="line">Line + Area</option>
                    <option value="bars">Bars</option>
                  </select>
                </label>
                <div className="avel-chart-kpi">
                  <span>Peak</span>
                  <strong>{toNumber(data.charts.candidateTrend.peak)}</strong>
                </div>
                <div className="avel-chart-kpi">
                  <span>Total</span>
                  <strong>{toNumber(data.charts.candidateTrend.total)}</strong>
                </div>
                <div className="avel-chart-kpi">
                  <span>Selected</span>
                  <strong>{selectedTrendPoint ? `${selectedTrendPoint.label}: ${selectedTrendPoint.value}` : '--'}</strong>
                </div>
              </div>
              <TrendChart
                points={trendPoints}
                mode={trendChartMode}
                activeIndex={Math.max(0, safeTrendIndex)}
                onActivate={setActiveTrendIndex}
                onStep={stepTrendPoint}
              />
            </article>

            <article className="avel-list-panel avel-chart-card">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Candidate Source Mix</h3>
                <p className="avel-list-panel__hint">Interactive in-page donut using current database snapshot.</p>
              </div>
              <div className="avel-source-mix">
                <div className="avel-source-mix__donut" style={sourceMixStyle}>
                  <div className="avel-source-mix__center">
                    <strong>{sourceTotal}</strong>
                    <span>Total</span>
                  </div>
                </div>
                <div className="avel-source-mix__legend" role="group" aria-label="Source mix focus">
                  <button
                    type="button"
                    className={`avel-source-chip${sourceFocusMode === 'all' ? ' is-active' : ''}`}
                    onClick={() => setSourceFocusMode('all')}
                    aria-pressed={sourceFocusMode === 'all'}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`avel-source-chip${sourceFocusMode === 'internal' ? ' is-active' : ''}`}
                    onClick={() => setSourceFocusMode('internal')}
                    aria-pressed={sourceFocusMode === 'internal'}
                  >
                    Internal: {sourceInternal} ({toPercent(sourceInternal, sourceTotal)})
                  </button>
                  <button
                    type="button"
                    className={`avel-source-chip${sourceFocusMode === 'partner' ? ' is-active' : ''}`}
                    onClick={() => setSourceFocusMode('partner')}
                    aria-pressed={sourceFocusMode === 'partner'}
                  >
                    Partner: {sourcePartner} ({toPercent(sourcePartner, sourceTotal)})
                  </button>
                </div>
              </div>
            </article>

            <article className="avel-list-panel avel-chart-card">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Top Companies</h3>
                <p className="avel-list-panel__hint">Customize by metric and number of rows.</p>
              </div>
              <div className="avel-chart-toolbar">
                <label className="modern-command-field">
                  <span className="modern-command-label">Metric</span>
                  <select value={companyMetric} onChange={(event) => setCompanyMetric(event.target.value as CompanyMetricKey)}>
                    {Object.entries(companyMetricLabels).map(([value, label]) => (
                      <option key={`company-metric-${value}`} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="modern-command-field">
                  <span className="modern-command-label">Top N ({companyLimit})</span>
                  <input
                    className="avel-kpi-range"
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={companyLimit}
                    onChange={(event) => setCompanyLimit(toNumber(event.target.value))}
                  />
                </label>
                <div className="avel-kpi-limit-presets" role="group" aria-label="Top companies preset limit">
                  {[5, 8, 12].map((preset) => (
                    <button
                      key={`company-limit-${preset}`}
                      type="button"
                      className={`modern-btn modern-btn--mini ${companyLimit === preset ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`}
                      aria-pressed={companyLimit === preset}
                      onClick={() => setCompanyLimit(preset)}
                    >
                      Top {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="avel-company-bars">
                {companyRows.length === 0 ? (
                  <div className="modern-state">No company KPI rows.</div>
                ) : (
                  companyRows.map((row) => (
                    <div key={`company-chart-${row.companyID}`} className="avel-company-bars__row">
                      <div className="avel-company-bars__meta">
                        <span>{row.companyName}</span>
                        <strong>{row.value}</strong>
                      </div>
                      <div className="avel-company-bars__track">
                        <span style={{ width: `${Math.max(4, (row.value / companyMax) * 100)}%` }}></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="avel-list-panel avel-chart-card">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Candidate Pipeline Metrics</h3>
                <p className="avel-list-panel__hint">Switch between This Week, Last Week, and Delta.</p>
              </div>
              <div className="avel-chart-toolbar">
                <label className="modern-command-field">
                  <span className="modern-command-label">Series</span>
                  <select
                    value={candidateMetricMode}
                    onChange={(event) => setCandidateMetricMode(event.target.value as CandidateMetricMode)}
                  >
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="delta">Delta</option>
                  </select>
                </label>
              </div>
              <div className="avel-company-bars">
                {candidateMetricRows.length === 0 ? (
                  <div className="modern-state">No candidate metric rows.</div>
                ) : (
                  candidateMetricRows.map((row) => {
                    const widthPercent = Math.max(4, (Math.abs(row.value) / candidateMetricMax) * 100);
                    return (
                      <div key={`candidate-metric-${row.label}`} className="avel-company-bars__row">
                        <div className="avel-company-bars__meta">
                          <span>{row.label}</span>
                          <strong>{candidateMetricMode === 'delta' ? formatSigned(row.value) : row.value}</strong>
                        </div>
                        <div className="avel-company-bars__track">
                          <span
                            className={row.value < 0 ? 'is-negative' : ''}
                            style={{ width: `${widthPercent}%` }}
                          ></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>

          <section className="avel-kpi-table-grid">
            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Company KPI Snapshot</h3>
              </div>
              {companySnapshotRows.length === 0 ? (
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
                    {companySnapshotRows.slice(0, 20).map((row) => (
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
                <h3 className="avel-list-panel__title">Candidate Metrics Table</h3>
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
                  {candidateTableRows.map((row) => (
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
          </section>

          <article className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">Job Order Throughput</h3>
            </div>
            {jobOrderRows.length === 0 ? (
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
                  {jobOrderRows.slice(0, 25).map((row) => (
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
        </div>
      </PageContainer>
    </div>
  );
}
