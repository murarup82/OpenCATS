import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardModernData } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { StatChip } from '../components/primitives/StatChip';
import { DataTable } from '../components/primitives/DataTable';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function DashboardMyReadOnlyPage({ bootstrap }: Props) {
  const [data, setData] = useState<DashboardModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 980) {
      return 'cards';
    }
    return 'table';
  });

  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchDashboardModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load data');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, query]);

  if (loading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        actionLabel="Open Legacy UI"
        actionURL={bootstrap.legacyURL}
      />
    );
  }

  if (!data) {
    return <EmptyState message="No data available." />;
  }

  const openRows = data.rows.filter((row) => row.isActive === 1).length;
  const uniqueJobOrders = Object.keys(
    data.rows.reduce<Record<string, true>>((accumulator, row) => {
      accumulator[String(row.jobOrderID)] = true;
      return accumulator;
    }, {})
  ).length;
  const hasRows = data.rows.length > 0;

  const toStatusClass = (status: string) =>
    status
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';

  const navigateWithFilters = (next: {
    scope?: string;
    companyID?: string;
    jobOrderID?: string;
    statusID?: string;
    showClosed?: boolean;
    page?: number;
  }) => {
    const nextQuery = new URLSearchParams(window.location.search);
    nextQuery.set('m', 'dashboard');
    nextQuery.set('a', 'my');
    nextQuery.set('view', 'list');

    const scopeValue = next.scope ?? data.meta.scope;
    nextQuery.set('scope', scopeValue === 'all' ? 'all' : 'mine');

    const setOptionalNumberValue = (key: string, value: string | undefined) => {
      const normalized = (value ?? '').trim();
      if (normalized === '' || normalized === '0') {
        nextQuery.delete(key);
      } else {
        nextQuery.set(key, normalized);
      }
    };

    setOptionalNumberValue('companyID', next.companyID ?? String(data.filters.companyID || ''));
    setOptionalNumberValue('jobOrderID', next.jobOrderID ?? String(data.filters.jobOrderID || ''));
    setOptionalNumberValue('statusID', next.statusID ?? String(data.filters.statusID || ''));

    const showClosedValue = typeof next.showClosed === 'boolean' ? next.showClosed : data.meta.showClosed;
    if (showClosedValue) {
      nextQuery.set('showClosed', '1');
    } else {
      nextQuery.delete('showClosed');
    }

    const nextPage = typeof next.page === 'number' && next.page > 0 ? next.page : 1;
    nextQuery.set('page', String(nextPage));

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    window.location.href = `${bootstrap.indexName}?${nextQuery.toString()}`;
  };

  return (
    <PageContainer
      title="My Dashboard"
      subtitle="Read-only modern migration slice with live filters"
      actions={
        <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
          Open Legacy UI
        </a>
      }
    >
      <div className="modern-dashboard">
        <div className="modern-summary">
          <StatChip>Rows: {data.meta.totalRows}</StatChip>
          <StatChip>Open Pipeline: {openRows}</StatChip>
          <StatChip>Job Orders: {uniqueJobOrders}</StatChip>
          <StatChip>Page: {data.meta.page} / {data.meta.totalPages}</StatChip>
        </div>

        <section className="modern-filterpanel">
          <div className="modern-filterpanel__header">
            <div className="modern-filterpanel__title-wrap">
              <h4 className="modern-filterpanel__title">Pipeline Filters</h4>
              <p className="modern-filterpanel__hint">
                Adjust filters and switch between table and cards.
              </p>
            </div>
            <div className="modern-filterpanel__actions">
              <div className="modern-segment" role="group" aria-label="Display mode">
                <button
                  type="button"
                  className={`modern-segment__btn${displayMode === 'cards' ? ' is-active' : ''}`}
                  onClick={() => setDisplayMode('cards')}
                >
                  Cards
                </button>
                <button
                  type="button"
                  className={`modern-segment__btn${displayMode === 'table' ? ' is-active' : ''}`}
                  onClick={() => setDisplayMode('table')}
                >
                  Table
                </button>
              </div>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  navigateWithFilters({
                    scope: data.meta.scope,
                    companyID: '',
                    jobOrderID: '',
                    statusID: '',
                    showClosed: false,
                    page: 1
                  })
                }
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="modern-filterbar">
            {data.meta.canViewAllScopes ? (
              <label className="modern-filterbar__group">
                <span className="modern-filterbar__label">Scope</span>
                <select
                  className="modern-filterbar__control"
                  value={data.meta.scope}
                  onChange={(event) => navigateWithFilters({ scope: event.target.value, page: 1 })}
                >
                  <option value="mine">My Assigned Jobs</option>
                  <option value="all">All Jobs</option>
                </select>
              </label>
            ) : null}

            <label className="modern-filterbar__group">
              <span className="modern-filterbar__label">Customer</span>
              <select
                className="modern-filterbar__control"
                value={String(data.filters.companyID || '')}
                onChange={(event) =>
                  navigateWithFilters({
                    companyID: event.target.value,
                    jobOrderID: '',
                    page: 1
                  })
                }
              >
                <option value="">All customers</option>
                {data.options.companies.map((company) => (
                  <option key={company.companyID} value={company.companyID}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="modern-filterbar__group">
              <span className="modern-filterbar__label">Job Order</span>
              <select
                className="modern-filterbar__control"
                value={String(data.filters.jobOrderID || '')}
                onChange={(event) => navigateWithFilters({ jobOrderID: event.target.value, page: 1 })}
              >
                <option value="">{data.meta.jobOrderScopeLabel || 'All job orders'}</option>
                {data.options.jobOrders.map((jobOrder) => (
                  <option key={jobOrder.jobOrderID} value={jobOrder.jobOrderID}>
                    {jobOrder.title}
                    {jobOrder.companyName ? ` (${jobOrder.companyName})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="modern-filterbar__group">
              <span className="modern-filterbar__label">Status</span>
              <select
                className="modern-filterbar__control"
                value={String(data.filters.statusID || '')}
                onChange={(event) => navigateWithFilters({ statusID: event.target.value, page: 1 })}
              >
                <option value="">All statuses</option>
                {data.options.statuses.map((status) => (
                  <option key={status.statusID} value={status.statusID}>
                    {status.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="modern-filterbar__toggle">
              <input
                type="checkbox"
                checked={data.meta.showClosed}
                onChange={(event) => navigateWithFilters({ showClosed: event.target.checked, page: 1 })}
              />
              <span>Show Closed Job Orders</span>
            </label>
          </div>
        </section>

        {hasRows ? (
          <>
            {displayMode === 'cards' ? (
              <div className="modern-mobile-cards" aria-label="Pipeline cards">
                {data.rows.map((row, index) => (
                  <article
                    className="modern-mobile-card"
                    key={`mobile-${row.candidateID}-${row.jobOrderID}-${row.statusID}`}
                    style={{ animationDelay: `${Math.min(index * 0.03, 0.25)}s` }}
                  >
                    <div className="modern-mobile-card__title">
                      <a className="modern-link" href={row.candidateURL}>
                        {row.candidateName}
                      </a>
                    </div>
                    <div className="modern-mobile-card__job">
                      <a className="modern-link" href={row.jobOrderURL}>
                        {row.jobOrderTitle}
                      </a>
                    </div>
                    <div className="modern-mobile-card__meta">{row.companyName || '--'}</div>
                    <div className="modern-mobile-card__row">
                      <span className={`modern-status modern-status--${toStatusClass(row.statusLabel || '')}`}>
                        {row.statusLabel || '--'}
                      </span>
                      <span className="modern-mobile-card__time">{row.lastStatusChangeDisplay || '--'}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="modern-table-animated">
                <DataTable
                  columns={[
                    { key: 'candidate', title: 'Candidate' },
                    { key: 'jobOrder', title: 'Job Order' },
                    { key: 'company', title: 'Company' },
                    { key: 'status', title: 'Status' },
                    { key: 'lastUpdated', title: 'Last Updated' }
                  ]}
                  hasRows={data.rows.length > 0}
                  emptyMessage="No rows for this selection."
                >
                  {data.rows.map((row) => (
                    <tr key={`${row.candidateID}-${row.jobOrderID}-${row.statusID}`}>
                      <td>
                        <a className="modern-link" href={row.candidateURL}>
                          {row.candidateName}
                        </a>
                      </td>
                      <td>
                        <a className="modern-link" href={row.jobOrderURL}>
                          {row.jobOrderTitle}
                        </a>
                      </td>
                      <td>{row.companyName || '--'}</td>
                      <td>
                        <span className={`modern-status modern-status--${toStatusClass(row.statusLabel || '')}`}>
                          {row.statusLabel || '--'}
                        </span>
                      </td>
                      <td>{row.lastStatusChangeDisplay || '--'}</td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            )}
          </>
        ) : (
          <EmptyState message="No rows for this selection. Try resetting filters or enabling closed job orders." />
        )}

        {data.meta.totalPages > 1 ? (
          <div className="modern-pagination">
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              disabled={data.meta.page <= 1}
              onClick={() => navigateWithFilters({ page: data.meta.page - 1 })}
            >
              Previous
            </button>
            <span className="modern-pagination__meta">
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              disabled={data.meta.page >= data.meta.totalPages}
              onClick={() => navigateWithFilters({ page: data.meta.page + 1 })}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
