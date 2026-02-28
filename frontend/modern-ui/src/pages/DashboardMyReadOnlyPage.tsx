import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardModernData } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { DashboardToolbar } from '../components/dashboard/DashboardToolbar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { DashboardKanbanSkeleton } from '../components/dashboard/DashboardKanbanSkeleton';
import type { DashboardStatusColumn } from '../components/dashboard/types';
import '../dashboard-avel.css';

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

function toDisplayText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function toSearchText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

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

  useEffect(() => {
    const nextURL = new URL(window.location.href);
    nextURL.searchParams.set('mode', viewMode);
    window.history.replaceState({}, '', nextURL.toString());
  }, [viewMode]);

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
      .map((value) => toSearchText(value))
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });

  const byStatusID = new Map<number, StatusCatalogEntry>();
  data.options.statuses.forEach((statusOption) => {
    const statusLabel = toDisplayText(statusOption.status);
    byStatusID.set(statusOption.statusID, {
      statusID: statusOption.statusID,
      statusLabel,
      statusSlug: toStatusSlug(statusLabel)
    });
  });
  data.rows.forEach((row) => {
    if (!byStatusID.has(row.statusID)) {
      const statusLabel = toDisplayText(row.statusLabel);
      byStatusID.set(row.statusID, {
        statusID: row.statusID,
        statusLabel,
        statusSlug: toStatusSlug(statusLabel)
      });
    }
  });
  const statusCatalog: StatusCatalogEntry[] = Array.from(byStatusID.values());

  const visibleStatuses = localStatusID === 'all'
    ? statusCatalog
    : statusCatalog.filter((status) => String(status.statusID) === localStatusID);

  const groupedByStatus = new Map<number, DashboardModernDataResponse['rows']>();
  filteredRows.forEach((row) => {
    const existing = groupedByStatus.get(row.statusID) || [];
    existing.push(row);
    groupedByStatus.set(row.statusID, existing);
  });

  const columns: DashboardStatusColumn[] = visibleStatuses.map((status) => ({
    statusID: status.statusID,
    statusLabel: status.statusLabel,
    statusSlug: status.statusSlug,
    rows: groupedByStatus.get(status.statusID) || []
  }));

  const localStatusOptions = statusCatalog.map((status) => ({
    value: String(status.statusID),
    label: status.statusLabel
  }));

  const topStatuses = [...columns]
    .sort((left, right) => right.rows.length - left.rows.length)
    .slice(0, 3);


  const activeServerFilters: string[] = [];
  if (data.meta.scope === 'all') {
    activeServerFilters.push('Scope: All Jobs');
  }
  if (data.filters.companyID > 0) {
    const selectedCompany = data.options.companies.find((company) => company.companyID === data.filters.companyID);
    activeServerFilters.push(`Customer: ${selectedCompany ? toDisplayText(selectedCompany.name) : data.filters.companyID}`);
  }
  if (data.filters.jobOrderID > 0) {
    const selectedJobOrder = data.options.jobOrders.find((jobOrder) => jobOrder.jobOrderID === data.filters.jobOrderID);
    activeServerFilters.push(`Job: ${selectedJobOrder ? toDisplayText(selectedJobOrder.title) : data.filters.jobOrderID}`);
  }
  if (data.filters.statusID > 0) {
    const selectedStatus = data.options.statuses.find((status) => status.statusID === data.filters.statusID);
    activeServerFilters.push(`Server status: ${selectedStatus ? toDisplayText(selectedStatus.status) : data.filters.statusID}`);
  }
  if (data.meta.showClosed) {
    activeServerFilters.push('Show Closed');
  }

  const activeLocalFilters: string[] = [];
  if (searchTerm.trim() !== '') {
    activeLocalFilters.push(`Search: "${searchTerm.trim()}"`);
  }
  if (localStatusID !== 'all') {
    const localStatus = statusCatalog.find((status) => String(status.statusID) === localStatusID);
    activeLocalFilters.push(`Quick status: ${localStatus ? localStatus.statusLabel : localStatusID}`);
  }
  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="MyDashboard"
        subtitle="Avel recruiting control center"
        actions={
          <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
        <section className="avel-priority-band" aria-label="Priority stages">
          <h2 className="avel-priority-band__title">Priority Stages</h2>
          {topStatuses.length > 0 ? (
            <div className="avel-priority-band__chips">
              {topStatuses.map((status) => (
                <span key={`priority-${status.statusID}`} className="avel-priority-band__chip">
                  <strong>{status.statusLabel}</strong>
                  <span>{status.rows.length} candidates</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="avel-priority-band__empty">No stages available for this filter selection.</p>
          )}
        </section>

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
              label: toDisplayText(company.name)
            }))
          ]}
          jobOrders={[
            { value: '', label: data.meta.jobOrderScopeLabel || 'All job orders' },
            ...data.options.jobOrders.map((jobOrder) => ({
              value: String(jobOrder.jobOrderID),
              label: `${toDisplayText(jobOrder.title)}${jobOrder.companyName ? ` (${toDisplayText(jobOrder.companyName)})` : ''}`
            }))
          ]}
          statuses={[
            { value: '', label: 'All statuses' },
            ...data.options.statuses.map((status) => ({
              value: String(status.statusID),
              label: toDisplayText(status.status)
            }))
          ]}
          searchTerm={searchTerm}
          localStatusID={localStatusID}
          localStatusOptions={[{ value: 'all', label: 'All statuses' }, ...localStatusOptions]}
          activeServerFilters={activeServerFilters}
          activeLocalFilters={activeLocalFilters}
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
                totalVisibleRows={filteredRows.length}
                getStatusClassName={createStatusClassName}
              />
            ) : (
              <div className="modern-table-animated avel-list-panel">
                <div className="avel-list-panel__header">
                  <h2 className="avel-list-panel__title">Candidate List View</h2>
                  <p className="avel-list-panel__hint">Flat view for quick scanning and exporting.</p>
                </div>
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
                          {toDisplayText(row.candidateName)}
                        </a>
                      </td>
                      <td>
                        <a className="modern-link" href={row.jobOrderURL}>
                          {toDisplayText(row.jobOrderTitle)}
                        </a>
                      </td>
                      <td>{toDisplayText(row.companyName)}</td>
                      <td>
                        <span className={createStatusClassName(toDisplayText(row.statusLabel))}>
                          {toDisplayText(row.statusLabel)}
                        </span>
                      </td>
                      <td>{toDisplayText(row.lastStatusChangeDisplay)}</td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            )}
          </>
        )}
        </div>
      </PageContainer>
    </div>
  );
}
