import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardModernData } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { StatChip } from '../components/primitives/StatChip';
import { DataTable } from '../components/primitives/DataTable';
import { DashboardToolbar } from '../components/dashboard/DashboardToolbar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { DashboardKanbanSkeleton } from '../components/dashboard/DashboardKanbanSkeleton';
import type { DashboardStatusColumn, FreshnessInfo } from '../components/dashboard/types';

type Props = {
  bootstrap: UIModeBootstrap;
};

type StatusCatalogEntry = {
  statusID: number;
  statusLabel: string;
  statusSlug: string;
};

type NavigationFilters = {
  scope?: string;
  companyID?: string;
  jobOrderID?: string;
  statusID?: string;
  showClosed?: boolean;
  page?: number;
};

function toStatusSlug(value: string): string {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'unknown';
}

function createStatusClassName(statusLabel: string): string {
  return `modern-status modern-status--${toStatusSlug(statusLabel)}`;
}

function parseDisplayDate(display: string): Date | null {
  const match = String(display || '').match(/(\d{2})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = 2000 + Number(match[3]);
  if (Number.isNaN(first) || Number.isNaN(second) || Number.isNaN(year)) {
    return null;
  }

  let month = first;
  let day = second;
  if (first > 12 && second <= 12) {
    day = first;
    month = second;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function getFreshness(lastStatusChangeDisplay: string): FreshnessInfo {
  const parsedDate = parseDisplayDate(lastStatusChangeDisplay);
  if (!parsedDate) {
    return { label: 'Untracked', tone: 'unknown' };
  }

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays <= 3) {
    return { label: 'Fresh', tone: 'fresh' };
  }

  if (diffDays <= 10) {
    return { label: 'Active', tone: 'active' };
  }

  if (diffDays <= 30) {
    return { label: 'Aging', tone: 'aging' };
  }

  return { label: 'Stale', tone: 'stale' };
}

export function DashboardMyReadOnlyPage({ bootstrap }: Props) {
  const [data, setData] = useState<DashboardModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get('mode') === 'list' ? 'list' : 'kanban';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [localStatusID, setLocalStatusID] = useState<string>('all');

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

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(window.location.search);
    nextQuery.set('m', 'dashboard');
    nextQuery.set('a', 'my');
    nextQuery.set('view', 'kanban');

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
    nextQuery.set('mode', viewMode);

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    window.location.href = `${bootstrap.indexName}?${nextQuery.toString()}`;
  };

  if (loading) {
    return <DashboardKanbanSkeleton />;
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRows = data.rows.filter((row) => {
    if (localStatusID !== 'all' && String(row.statusID) !== localStatusID) {
      return false;
    }

    if (normalizedSearch === '') {
      return true;
    }

    const searchable = [
      row.candidateName,
      row.jobOrderTitle,
      row.companyName,
      row.location,
      row.statusLabel
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });

  const statusCatalog = useMemo<StatusCatalogEntry[]>(() => {
    const byStatusID = new Map<number, StatusCatalogEntry>();

    data.options.statuses.forEach((statusOption) => {
      byStatusID.set(statusOption.statusID, {
        statusID: statusOption.statusID,
        statusLabel: statusOption.status || '--',
        statusSlug: toStatusSlug(statusOption.status || '--')
      });
    });

    data.rows.forEach((row) => {
      if (!byStatusID.has(row.statusID)) {
        byStatusID.set(row.statusID, {
          statusID: row.statusID,
          statusLabel: row.statusLabel || '--',
          statusSlug: toStatusSlug(row.statusLabel || '--')
        });
      }
    });

    return Array.from(byStatusID.values());
  }, [data.options.statuses, data.rows]);

  const visibleStatuses = localStatusID === 'all'
    ? statusCatalog
    : statusCatalog.filter((status) => String(status.statusID) === localStatusID);

  const columns = useMemo<DashboardStatusColumn[]>(() => {
    const grouped = new Map<number, DashboardModernDataResponse['rows']>();
    filteredRows.forEach((row) => {
      const existing = grouped.get(row.statusID) || [];
      existing.push(row);
      grouped.set(row.statusID, existing);
    });

    return visibleStatuses.map((status) => ({
      statusID: status.statusID,
      statusLabel: status.statusLabel,
      statusSlug: status.statusSlug,
      rows: grouped.get(status.statusID) || []
    }));
  }, [filteredRows, visibleStatuses]);

  const localStatusOptions = statusCatalog.map((status) => ({
    value: String(status.statusID),
    label: status.statusLabel
  }));

  const openRows = filteredRows.filter((row) => row.isActive === 1).length;
  const uniqueJobOrders = Object.keys(
    filteredRows.reduce<Record<string, true>>((accumulator, row) => {
      accumulator[String(row.jobOrderID)] = true;
      return accumulator;
    }, {})
  ).length;
  const freshnessCounts = filteredRows.reduce(
    (accumulator, row) => {
      const freshness = getFreshness(row.lastStatusChangeDisplay || '');
      if (freshness.tone === 'fresh') {
        accumulator.fresh += 1;
      }
      if (freshness.tone === 'stale') {
        accumulator.stale += 1;
      }
      return accumulator;
    },
    { fresh: 0, stale: 0 }
  );

  return (
    <PageContainer
      title="My Dashboard"
      subtitle="Read-only modern Kanban demo with contract-driven data"
      actions={
        <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
          Open Legacy UI
        </a>
      }
    >
      <div className="modern-dashboard">
        <div className="modern-summary">
          <StatChip>Total Rows: {data.meta.totalRows}</StatChip>
          <StatChip>Visible: {filteredRows.length}</StatChip>
          <StatChip>Open Pipeline: {openRows}</StatChip>
          <StatChip>Job Orders: {uniqueJobOrders}</StatChip>
          <StatChip>Fresh: {freshnessCounts.fresh}</StatChip>
          <StatChip>Stale: {freshnessCounts.stale}</StatChip>
        </div>

        <DashboardToolbar
          canViewAllScopes={data.meta.canViewAllScopes}
          scope={data.meta.scope}
          customerID={String(data.filters.companyID || '')}
          jobOrderID={String(data.filters.jobOrderID || '')}
          statusID={String(data.filters.statusID || '')}
          showClosed={data.meta.showClosed}
          customers={[
            { value: '', label: 'All customers' },
            ...data.options.companies.map((company) => ({
              value: String(company.companyID),
              label: company.name
            }))
          ]}
          jobOrders={[
            { value: '', label: data.meta.jobOrderScopeLabel || 'All job orders' },
            ...data.options.jobOrders.map((jobOrder) => ({
              value: String(jobOrder.jobOrderID),
              label: `${jobOrder.title}${jobOrder.companyName ? ` (${jobOrder.companyName})` : ''}`
            }))
          ]}
          statuses={[
            { value: '', label: 'All statuses' },
            ...data.options.statuses.map((status) => ({
              value: String(status.statusID),
              label: status.status
            }))
          ]}
          searchTerm={searchTerm}
          localStatusID={localStatusID}
          localStatusOptions={[{ value: 'all', label: 'All statuses' }, ...localStatusOptions]}
          viewMode={viewMode}
          onScopeChange={(scope) => navigateWithFilters({ scope, page: 1 })}
          onCustomerChange={(companyID) => navigateWithFilters({ companyID, jobOrderID: '', page: 1 })}
          onJobOrderChange={(jobOrderID) => navigateWithFilters({ jobOrderID, page: 1 })}
          onStatusChange={(statusID) => navigateWithFilters({ statusID, page: 1 })}
          onShowClosedChange={(showClosed) => navigateWithFilters({ showClosed, page: 1 })}
          onSearchTermChange={setSearchTerm}
          onLocalStatusChange={setLocalStatusID}
          onViewModeChange={setViewMode}
          onResetServerFilters={() =>
            navigateWithFilters({
              scope: data.meta.scope,
              companyID: '',
              jobOrderID: '',
              statusID: '',
              showClosed: false,
              page: 1
            })
          }
          onClearLocalFilters={() => {
            setSearchTerm('');
            setLocalStatusID('all');
          }}
        />

        {filteredRows.length === 0 ? (
          <EmptyState message="No candidates match current filters. Adjust search or reset filters." />
        ) : (
          <>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                columns={columns}
                getStatusClassName={createStatusClassName}
                getFreshness={getFreshness}
              />
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
                  hasRows={filteredRows.length > 0}
                  emptyMessage="No rows for this selection."
                >
                  {filteredRows.map((row) => (
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
                        <span className={createStatusClassName(row.statusLabel || '')}>
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
        )}
      </div>
    </PageContainer>
  );
}
