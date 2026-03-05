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
type TrendPoint = { label: string; value: number };
const KPI_EXECUTIVE_SCORECARD_PREF_KEY = 'opencats:modern:kpis:exec-scorecard:visible:v1';

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

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&').trim();
}

function toStatusTokenSlug(value: string): string {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug === 'onhold') {
    return 'on-hold';
  }
  if (slug === 'canceled') {
    return 'cancelled';
  }
  return slug || 'default';
}

function readExecutiveScorecardVisibility(): boolean {
  try {
    return window.localStorage.getItem(KPI_EXECUTIVE_SCORECARD_PREF_KEY) === '1';
  } catch {
    return false;
  }
}

function writeExecutiveScorecardVisibility(value: boolean): void {
  try {
    window.localStorage.setItem(KPI_EXECUTIVE_SCORECARD_PREF_KEY, value ? '1' : '0');
  } catch {
    // Best effort only.
  }
}

function toSemanticCellClass(rawClass: string): string {
  const normalized = String(rawClass || '').toLowerCase();
  if (normalized.includes('overdue') || normalized.includes('late') || normalized.includes('low')) {
    return 'avel-kpi-cell avel-kpi-cell--bad';
  }
  if (normalized.includes('ok') || normalized.includes('zero')) {
    return 'avel-kpi-cell avel-kpi-cell--good';
  }
  if (normalized.includes('unknown')) {
    return 'avel-kpi-cell avel-kpi-cell--neutral';
  }
  return '';
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
  const [trendChartMode, setTrendChartMode] = useState<TrendChartMode>('line');
  const [activeTrendIndex, setActiveTrendIndex] = useState<number>(0);
  const [showExecutiveScorecard, setShowExecutiveScorecard] = useState<boolean>(() => readExecutiveScorecardVisibility());
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    const query = new URLSearchParams(serverQueryString);
    if (query.has('jobOrderScope')) {
      return;
    }
    query.set('m', 'kpis');
    query.delete('a');
    query.delete('resetKpiFilters');
    query.set('jobOrderScope', 'open');
    applyServerQuery(query);
  }, [serverQueryString, applyServerQuery]);

  useEffect(() => {
    writeExecutiveScorecardVisibility(showExecutiveScorecard);
  }, [showExecutiveScorecard]);

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

  const candidateSourceScopeLabel =
    data.options.candidateSourceScopes.find((option) => option.value === data.filters.candidateSourceScope)?.label ||
    data.filters.candidateSourceScope;
  const jobOrderScopeLabel =
    data.options.jobOrderScopes.find((option) => option.value === data.filters.jobOrderScope)?.label ||
    data.filters.jobOrderScope;
  const trendViewLabel =
    data.options.trendViews.find((option) => option.value === data.filters.trendView)?.label || data.filters.trendView;
  const selectedCustomerLabel =
    data.options.customers.find((option) => toNumber(option.value) === toNumber(data.filters.customerID))?.label ||
    (toNumber(data.filters.customerID) > 0 ? `Customer #${data.filters.customerID}` : 'All customers');

  const sourceTotal = Math.max(
    0,
    toNumber(data.rows.candidateSourceSnapshot.total),
    toNumber(data.rows.candidateSourceSnapshot.internal) + toNumber(data.rows.candidateSourceSnapshot.partner)
  );
  const sourceInternal = Math.max(0, toNumber(data.rows.candidateSourceSnapshot.internal));
  const sourcePartner = Math.max(0, toNumber(data.rows.candidateSourceSnapshot.partner));
  const sourceInternalAngle = sourceTotal > 0 ? (sourceInternal / sourceTotal) * 360 : 0;
  const sourceMixStyle = {
    background: `conic-gradient(#0f98c0 0deg ${sourceInternalAngle}deg, #d18b32 ${sourceInternalAngle}deg 360deg)`
  };
  const hideClosedJobOrders = data.filters.jobOrderScope === 'open';
  const activeFilterChips: Array<{ key: string; label: string; onClear?: () => void }> = [];
  if (data.filters.officialReports) {
    activeFilterChips.push({
      key: 'official-reports',
      label: 'Official Reports',
      onClear: () => updateFilter('officialReports', false)
    });
  }
  if (data.filters.showDeadline) {
    activeFilterChips.push({
      key: 'show-deadline',
      label: 'Show Deadline',
      onClear: () => updateFilter('showDeadline', false)
    });
  }
  if (data.filters.showExpectedFilled) {
    activeFilterChips.push({
      key: 'show-expected-filled',
      label: 'Show Expected Filled',
      onClear: () => updateFilter('showExpectedFilled', false)
    });
  }
  if (hideClosedJobOrders) {
    activeFilterChips.push({
      key: 'hide-closed-jo',
      label: 'Hide Closed JO',
      onClear: () => updateFilter('jobOrderScope', 'all')
    });
  }
  if (toNumber(data.filters.customerID) > 0) {
    activeFilterChips.push({
      key: 'customer',
      label: `Customer: ${selectedCustomerLabel}`,
      onClear: () => updateFilter('customerID', '0')
    });
  }
  if (data.filters.candidateSourceScope !== 'all') {
    activeFilterChips.push({
      key: 'source-scope',
      label: `Source: ${candidateSourceScopeLabel}`,
      onClear: () => updateFilter('candidateSourceScope', 'all')
    });
  }
  const totalProposedToCustomer = data.rows.jobOrderKpiRows.reduce((total, row) => total + toNumber(row.submittedCount), 0);
  const totalInterviews = data.rows.jobOrderKpiRows.reduce((total, row) => total + toNumber(row.interviewCount), 0);
  const totalAcceptedByCustomer = data.rows.jobOrderKpiRows.reduce((total, row) => total + toNumber(row.approvedCount), 0);
  const totalHired = data.rows.jobOrderKpiRows.reduce((total, row) => total + toNumber(row.hiredCount), 0);
  const totalOpenPositionsForSelection = data.rows.jobOrderKpiRows.reduce(
    (total, row) => total + toNumber(row.totalOpenPositions),
    0
  );

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="KPIs"
        subtitle={`Week ${data.state.weekLabel} | Data as of ${data.state.dataAsOfLabel}`}
        actions={
          <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel avel-kpi-filters-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">KPI Filters</h3>
              <p className="avel-list-panel__hint">Matches legacy KPI filter behavior.</p>
            </div>

            <div className="avel-kpi-controls">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.officialReports}
                  onChange={(event) => updateFilter('officialReports', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span className="avel-kpi-toggle-label">
                  Official Reports
                  <span
                    className="avel-kpi-hint-icon"
                    title="Limits KPIs to job orders marked for official reporting."
                    aria-label="Official Reports help"
                    tabIndex={0}
                  >
                    ?
                  </span>
                </span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.showDeadline}
                  onChange={(event) => updateFilter('showDeadline', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span className="avel-kpi-toggle-label">
                  Show Deadline
                  <span
                    className="avel-kpi-hint-icon"
                    title="Shows time-to-deadline based on Expected Completion Date."
                    aria-label="Show Deadline help"
                    tabIndex={0}
                  >
                    ?
                  </span>
                </span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.showExpectedFilled}
                  onChange={(event) => updateFilter('showExpectedFilled', event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span className="avel-kpi-toggle-label">
                  Show Expected Filled
                  <span
                    className="avel-kpi-hint-icon"
                    title="Displays expected filled positions using conversion assumptions."
                    aria-label="Show Expected Filled help"
                    tabIndex={0}
                  >
                    ?
                  </span>
                </span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={hideClosedJobOrders}
                  onChange={(event) => updateFilter('jobOrderScope', event.target.checked ? 'open' : 'all')}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span className="avel-kpi-toggle-label">
                  Hide Closed JO
                  <span
                    className="avel-kpi-hint-icon"
                    title="When enabled, KPIs include only open job orders."
                    aria-label="Hide Closed JO help"
                    tabIndex={0}
                  >
                    ?
                  </span>
                </span>
              </label>
            </div>

            <div className="avel-kpi-filter-grid">
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
                <span className="modern-command-label">Customer</span>
                <select
                  value={String(data.filters.customerID)}
                  onChange={(event) => updateFilter('customerID', event.target.value)}
                >
                  {data.options.customers.map((option) => (
                    <option key={`customer-${option.value}`} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
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
              <button type="button" className="modern-btn modern-btn--secondary modern-btn--mini" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </section>

          <section className="avel-kpi-active-bar" role="region" aria-label="Active KPI filters">
            <div className="avel-kpi-active-bar__chips">
              {activeFilterChips.map((chip) => (
                <span key={chip.key} className="avel-kpi-active-chip">
                  <span>{chip.label}</span>
                  {chip.onClear ? (
                    <button
                      type="button"
                      className="avel-kpi-active-chip__clear"
                      aria-label={`Remove ${chip.label}`}
                      onClick={chip.onClear}
                    >
                      x
                    </button>
                  ) : null}
                </span>
              ))}
            </div>
            <button type="button" className="modern-btn modern-btn--mini modern-btn--secondary" onClick={resetFilters}>
              Clear All
            </button>
          </section>

          <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Positions Open</h3>
                <div className="avel-my-notes-chip-row">
                  <span className="modern-chip modern-chip--info">Official Reports: {data.filters.officialReports ? 'On' : 'Off'}</span>
                  <span className="modern-chip modern-chip--info">JO Scope: {jobOrderScopeLabel}</span>
                  <span className="modern-chip modern-chip--info">Customer: {selectedCustomerLabel}</span>
                </div>
              </div>
            {data.rows.kpiRows.length === 0 ? (
              <div className="modern-state">No KPI data found.</div>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>New positions this week</th>
                    <th>Total open positions</th>
                    <th>Filled positions</th>
                    <th>Expected conversion</th>
                    {data.filters.showExpectedFilled ? <th>Expected filled</th> : null}
                    <th>Expected in forecast</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.kpiRows.map((row) => (
                    <tr key={`kpi-company-${row.companyID}`}>
                      <td>
                        <a className="modern-link" href={`${bootstrap.indexName}?m=companies&a=show&companyID=${row.companyID}&ui=modern`}>
                          {row.companyName}
                        </a>
                      </td>
                      <td>{row.newPositions}</td>
                      <td>{row.totalOpenPositions}</td>
                      <td>{row.filledPositions}</td>
                      <td>{row.expectedConversionDisplay}</td>
                      {data.filters.showExpectedFilled ? <td>{row.expectedFilled}</td> : null}
                      <td>{row.expectedInFullPlan}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{data.summary.totals.newPositions}</td>
                    <td>{data.summary.totals.totalOpenPositions}</td>
                    <td>{data.summary.totals.filledPositions}</td>
                    <td></td>
                    {data.filters.showExpectedFilled ? <td>{data.summary.totals.expectedFilled}</td> : null}
                    <td>{data.summary.totals.expectedInFullPlan}</td>
                  </tr>
                  <tr>
                    <td>vs Last week</td>
                    <td>{formatSigned(toNumber(data.summary.totalsDiff.newPositions))}</td>
                    <td>{formatSigned(toNumber(data.summary.totalsDiff.totalOpenPositions))}</td>
                    <td>{formatSigned(toNumber(data.summary.totalsDiff.filledPositions))}</td>
                    <td></td>
                    {data.filters.showExpectedFilled ? <td>{formatSigned(toNumber(data.summary.totalsDiff.expectedFilled))}</td> : null}
                    <td>{formatSigned(toNumber(data.summary.totalsDiff.expectedInFullPlan))}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>

          {data.rows.jobOrderKpiRows.length > 0 ? (
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Client Interview : Acceptance</h3>
                <div className="avel-my-notes-chip-row">
                  <span className="modern-chip modern-chip--info">JO Scope: {jobOrderScopeLabel}</span>
                  <span className="modern-chip modern-chip--info">Customer: {selectedCustomerLabel}</span>
                  <span className="modern-chip modern-chip--info">Deadline: {data.filters.showDeadline ? 'On' : 'Off'}</span>
                  <span className="modern-chip modern-chip--info">Hide Closed JO: {hideClosedJobOrders ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className="avel-kpi-grid avel-kpi-grid--acceptance">
                <article className="avel-kpi avel-kpi--compact">
                  <p className="avel-kpi__label">Proposed to customer</p>
                  <p className="avel-kpi__value">{totalProposedToCustomer}</p>
                </article>
                <article className="avel-kpi avel-kpi--compact">
                  <p className="avel-kpi__label">Interviews</p>
                  <p className="avel-kpi__value">{totalInterviews}</p>
                </article>
                <article className="avel-kpi avel-kpi--compact">
                  <p className="avel-kpi__label">Validated by customer</p>
                  <p className="avel-kpi__value">{totalAcceptedByCustomer}</p>
                </article>
                <article className="avel-kpi avel-kpi--compact">
                  <p className="avel-kpi__label">Hired candidates</p>
                  <p className="avel-kpi__value">{totalHired}</p>
                </article>
                <article className="avel-kpi avel-kpi--compact">
                  <p className="avel-kpi__label">Total open positions</p>
                  <p className="avel-kpi__value">{totalOpenPositionsForSelection}</p>
                </article>
              </div>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Status</th>
                    {data.filters.showDeadline ? <th>Time to deadline</th> : null}
                    <th>Client</th>
                    <th>Total open positions</th>
                    <th>Submitted to customer</th>
                    <th>Acceptance Rate</th>
                    <th>Hiring Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.jobOrderKpiRows.map((row) => (
                    <tr key={`joborder-kpi-${row.jobOrderID}`}>
                      <td>
                        <a className="modern-link" href={`${bootstrap.indexName}?m=joborders&a=show&jobOrderID=${row.jobOrderID}&ui=modern`}>
                          {row.title}
                        </a>
                      </td>
                      <td>
                        <span className={`modern-chip avel-kpi-status-chip avel-kpi-status-chip--${toStatusTokenSlug(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      {data.filters.showDeadline ? (
                        <td className={toSemanticCellClass(row.timeToDeadlineClass) || undefined}>{row.timeToDeadline}</td>
                      ) : null}
                      <td>{row.companyName}</td>
                      <td>{row.totalOpenPositions}</td>
                      <td>{row.submittedCount}</td>
                      <td className={toSemanticCellClass(row.acceptanceRateClass) || undefined}>{row.acceptanceRate}</td>
                      <td>{row.hiringRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.filters.showDeadline ? (
                <p className="avel-kpi-results-summary">Time to deadline uses Expected Completion Date (date - today).</p>
              ) : null}
            </section>
          ) : null}

          {data.rows.requestQualifiedRows.length > 0 ? (
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Request to qualified candidate</h3>
                <div className="avel-my-notes-chip-row">
                  <span className="modern-chip modern-chip--info">Target: {'< 3 days'}</span>
                  <span className="modern-chip modern-chip--info">JO Scope: {jobOrderScopeLabel}</span>
                  <span className="modern-chip modern-chip--info">Official Reports: {data.filters.officialReports ? 'On' : 'Off'}</span>
                  <span className="modern-chip modern-chip--info">Hide Closed JO: {hideClosedJobOrders ? 'On' : 'Off'}</span>
                </div>
              </div>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Client</th>
                    <th>Date demand received</th>
                    <th>Date first qualified candidate submitted</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.requestQualifiedRows.map((row) => (
                    <tr key={`request-qualified-${row.jobOrderID}`}>
                      <td>
                        <a className="modern-link" href={`${bootstrap.indexName}?m=joborders&a=show&jobOrderID=${row.jobOrderID}&ui=modern`}>
                          {row.title}
                        </a>
                      </td>
                      <td>{row.companyName}</td>
                      <td>{row.receivedDate}</td>
                      <td>{row.submittedDate}</td>
                      <td className={toSemanticCellClass(row.daysClass) || undefined}>{row.daysValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">New Candidates</h3>
              <div className="avel-my-notes-chip-row">
                <span className="modern-chip modern-chip--info">Source: {candidateSourceScopeLabel}</span>
              </div>
            </div>
            {data.rows.candidateSourceRows.length === 0 && data.rows.candidateMetricRows.length === 0 ? (
              <div className="modern-state">No candidate KPI data found.</div>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>This week</th>
                    <th>Last week</th>
                    <th>Delta vs LW</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.candidateSourceRows.map((row) => (
                    <tr key={`candidate-source-${row.label}`}>
                      <td>{row.label}</td>
                      <td>
                        {row.thisWeekLink ? (
                          <a className="modern-link" href={decodeLegacyURL(row.thisWeekLink)}>
                            {row.thisWeek}
                          </a>
                        ) : (
                          row.thisWeek
                        )}
                      </td>
                      <td>
                        {row.lastWeekLink ? (
                          <a className="modern-link" href={decodeLegacyURL(row.lastWeekLink)}>
                            {row.lastWeek}
                          </a>
                        ) : (
                          row.lastWeek
                        )}
                      </td>
                      <td>{formatSigned(toNumber(row.delta))}</td>
                    </tr>
                  ))}
                  {data.rows.candidateMetricRows.map((row) => (
                    <tr key={`candidate-metric-${row.label}`}>
                      <td>{row.label}</td>
                      <td>
                        {row.thisWeekLink ? (
                          <a className="modern-link" href={decodeLegacyURL(row.thisWeekLink)}>
                            {row.thisWeek}
                          </a>
                        ) : (
                          row.thisWeek
                        )}
                      </td>
                      <td>
                        {row.lastWeekLink ? (
                          <a className="modern-link" href={decodeLegacyURL(row.lastWeekLink)}>
                            {row.lastWeek}
                          </a>
                        ) : (
                          row.lastWeek
                        )}
                      </td>
                      <td>{formatSigned(toNumber(row.delta))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">New Candidates Trend</h3>
              <div className="avel-my-notes-chip-row">
                <span className="modern-chip modern-chip--info">View: {trendViewLabel}</span>
                <span className="modern-chip modern-chip--info">Source: {candidateSourceScopeLabel}</span>
                <span className="modern-chip modern-chip--info">
                  {data.filters.trendStart} to {data.filters.trendEnd}
                </span>
              </div>
            </div>
            <div className="avel-kpi-trend-filters">
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
            </div>
            <div className="avel-kpi-chart-grid">
              <article className="avel-list-panel avel-chart-card">
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
                  <h3 className="avel-list-panel__title">Candidate Source Distribution</h3>
                </div>
                <div className="avel-source-mix">
                  <div className="avel-source-mix__donut" style={sourceMixStyle}>
                    <div className="avel-source-mix__center">
                      <strong>{sourceTotal}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="avel-source-mix__legend">
                    <div className="avel-source-chip">Internal: {sourceInternal} ({toPercent(sourceInternal, sourceTotal)})</div>
                    <div className="avel-source-chip">Partner: {sourcePartner} ({toPercent(sourcePartner, sourceTotal)})</div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">Executive Scorecard</h3>
              <div className="avel-my-notes-chip-row">
                <button
                  type="button"
                  className={`modern-btn modern-btn--mini ${showExecutiveScorecard ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`}
                  aria-pressed={showExecutiveScorecard}
                  onClick={() => setShowExecutiveScorecard((previous) => !previous)}
                >
                  {showExecutiveScorecard ? 'Hide Scorecard' : 'Show Scorecard'}
                </button>
              </div>
            </div>
            {showExecutiveScorecard ? (
              data.summary.executiveScorecard.metrics.length === 0 ? (
                <div className="modern-state">No executive scorecard data available.</div>
              ) : (
                <div className="avel-kpi-grid avel-kpi-grid--exec">
                  {data.summary.executiveScorecard.metrics.map((metric) => (
                    <article key={`exec-${metric.key}`} className="avel-kpi">
                      <p className="avel-kpi__label">{metric.label}</p>
                      <p className="avel-kpi__value">{metric.value}</p>
                      <p className="avel-kpi__hint">{metric.hint}</p>
                    </article>
                  ))}
                </div>
              )
            ) : (
              <div className="modern-state">Executive scorecard is hidden. Toggle to display all KPI leadership metrics.</div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
