import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardModernData, setDashboardPipelineStatus } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { JobOrderAssignCandidateModal } from '../components/primitives/JobOrderAssignCandidateModal';
import { DashboardToolbar } from '../components/dashboard/DashboardToolbar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { DashboardKanbanSkeleton } from '../components/dashboard/DashboardKanbanSkeleton';
import type { DashboardRow, DashboardStatusColumn } from '../components/dashboard/types';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
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

export function DashboardMyPage({ bootstrap }: Props) {
  const [data, setData] = useState<DashboardModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get('mode') === 'list' ? 'list' : 'kanban';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [localStatusID, setLocalStatusID] = useState<string>('all');
  const [reloadToken, setReloadToken] = useState(0);
  const [statusModal, setStatusModal] = useState<{
    url: string;
    candidateName: string;
    currentStatusLabel: string;
  } | null>(null);
  const [assignModal, setAssignModal] = useState<{
    url: string;
    jobOrderName: string;
  } | null>(null);
  const [detailsModal, setDetailsModal] = useState<{
    url: string;
    candidateName: string;
  } | null>(null);
  const [interactionError, setInteractionError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchDashboardModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setInteractionError('');
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
  }, [bootstrap, serverQueryString, reloadToken]);

  useEffect(() => {
    const nextURL = new URL(window.location.href);
    nextURL.searchParams.set('mode', viewMode);
    window.history.replaceState({}, '', nextURL.toString());
  }, [viewMode]);

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
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
    nextQuery.delete('statusID');

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

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  const refreshDashboard = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshDashboard);

  const openStatusModal = useCallback(
    (row: DashboardRow, targetStatusID: number | null) => {
      const enforceOwner = data?.meta.scope === 'mine' ? 1 : 0;
      let url = `${bootstrap.indexName}?m=joborders&a=addActivityChangeStatus`;
      url += `&jobOrderID=${encodeURIComponent(String(row.jobOrderID))}`;
      url += `&candidateID=${encodeURIComponent(String(row.candidateID))}`;
      url += `&enforceOwner=${encodeURIComponent(String(enforceOwner))}`;
      url += '&refreshParent=1';
      url += '&display=popup';
      url += '&ui=legacy';
      if (targetStatusID !== null && targetStatusID > 0) {
        url += `&statusID=${encodeURIComponent(String(targetStatusID))}`;
      }

      setStatusModal({
        url,
        candidateName: toDisplayText(row.candidateName),
        currentStatusLabel: toDisplayText(row.statusLabel)
      });
    },
    [bootstrap.indexName, data?.meta.scope]
  );

  const closeStatusModal = useCallback(
    (refreshOnClose: boolean) => {
      setStatusModal(null);
      if (refreshOnClose) {
        refreshDashboard();
      }
    },
    [refreshDashboard]
  );

  const closeDetailsModal = useCallback(
    (refreshOnClose: boolean) => {
      setDetailsModal(null);
      if (refreshOnClose) {
        refreshDashboard();
      }
    },
    [refreshDashboard]
  );

  const openPipelineDetails = useCallback(
    (row: DashboardRow) => {
      const pipelineID = Number(row.candidateJobOrderID || 0);
      if (pipelineID <= 0) {
        return;
      }

      const url = `${bootstrap.indexName}?m=joborders&a=pipelineStatusDetails&pipelineID=${encodeURIComponent(String(pipelineID))}&display=popup&ui=legacy`;
      setDetailsModal({
        url,
        candidateName: toDisplayText(row.candidateName)
      });
    },
    [bootstrap.indexName]
  );

  const openAssignWorkspace = useCallback(() => {
    const jobOrderID = Number(data?.filters.jobOrderID || 0);
    if (jobOrderID <= 0) {
      setInteractionError('Please select a Job Order first, then click Assign Candidate.');
      return;
    }

    const url = `${bootstrap.indexName}?m=joborders&a=considerCandidateSearch&jobOrderID=${encodeURIComponent(String(jobOrderID))}`;
    const jobOrderTitle =
      data?.options.jobOrders.find((jobOrder) => Number(jobOrder.jobOrderID) === jobOrderID)?.title || '';
    setAssignModal({
      url,
      jobOrderName: toDisplayText(jobOrderTitle, `Job Order #${jobOrderID}`)
    });
    setInteractionError('');
  }, [bootstrap.indexName, data?.filters.jobOrderID, data?.options.jobOrders]);

  if (loading && !data) {
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
  const filteredRows = data.rows
    .filter((row) => {
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
    })
    .map((row) => ({
      ...row,
      candidateURL: ensureModernUIURL(row.candidateURL)
    }));

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
  const canChangeStatus = !!data.meta.permissions?.canChangeStatus;
  const canAssignToJobOrder = !!data.meta.permissions?.canAssignToJobOrder;
  const rejectedStatusID =
    Number(data.meta.statusRules?.rejectedStatusID || 0) > 0
      ? Number(data.meta.statusRules?.rejectedStatusID)
      : Number(
          statusCatalog.find((status) => status.statusSlug === 'rejected')?.statusID || 0
        );
  const orderedStatusIDs =
    Array.isArray(data.meta.statusRules?.orderedStatusIDs) &&
    data.meta.statusRules?.orderedStatusIDs.length > 0
      ? data.meta.statusRules.orderedStatusIDs
      : statusCatalog.map((status) => status.statusID);
  const requestStatusChange = useCallback(
    async (row: DashboardRow, targetStatusID: number | null) => {
      if (targetStatusID === null || targetStatusID <= 0) {
        openStatusModal(row, null);
        return;
      }

      if (!canChangeStatus) {
        return;
      }

      if (targetStatusID === rejectedStatusID) {
        openStatusModal(row, targetStatusID);
        return;
      }

      const mutationToken = data.actions?.setPipelineStatusToken || '';
      if (mutationToken === '') {
        openStatusModal(row, targetStatusID);
        return;
      }

      try {
        const mutationResult = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions?.setPipelineStatusURL,
          securityToken: mutationToken,
          candidateID: Number(row.candidateID || 0),
          jobOrderID: Number(row.jobOrderID || 0),
          statusID: targetStatusID,
          enforceOwner: data.meta.scope === 'mine'
        });

        if (mutationResult.success) {
          setInteractionError('');
          refreshDashboard();
          return;
        }

        if (mutationResult.code === 'requiresModal') {
          openStatusModal(row, targetStatusID);
          return;
        }

        setInteractionError(mutationResult.message || 'Unable to change pipeline status.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to change pipeline status.';
        setInteractionError(message);
        openStatusModal(row, targetStatusID);
      }
    },
    [
      bootstrap,
      canChangeStatus,
      data.actions?.setPipelineStatusToken,
      data.actions?.setPipelineStatusURL,
      data.meta.scope,
      openStatusModal,
      refreshDashboard,
      rejectedStatusID
    ]
  );

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
          <>
            {canAssignToJobOrder ? (
              <button type="button" className="modern-btn modern-btn--secondary" onClick={openAssignWorkspace}>
                Assign Candidate
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
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
          searchTerm={searchTerm}
          localStatusID={localStatusID}
          localStatusOptions={[{ value: 'all', label: 'All statuses' }, ...localStatusOptions]}
          activeServerFilters={activeServerFilters}
          activeLocalFilters={activeLocalFilters}
          viewMode={viewMode}
          onScopeChange={(scope) => navigateWithFilters({ scope, page: 1 })}
          onCustomerChange={(companyID) => navigateWithFilters({ companyID, jobOrderID: '', page: 1 })}
          onJobOrderChange={(jobOrderID) => navigateWithFilters({ jobOrderID, page: 1 })}
          onShowClosedChange={(showClosed) => navigateWithFilters({ showClosed, page: 1 })}
          onSearchTermChange={setSearchTerm}
          onLocalStatusChange={setLocalStatusID}
          onViewModeChange={setViewMode}
          onResetServerFilters={() =>
            navigateWithFilters({
              scope: data.meta.scope,
              companyID: '',
              jobOrderID: '',
              showClosed: false,
              page: 1
            })
          }
          onClearLocalFilters={() => {
            setSearchTerm('');
            setLocalStatusID('all');
          }}
        />
        {interactionError ? (
          <div className="modern-state modern-state--error">{interactionError}</div>
        ) : null}

        {filteredRows.length === 0 ? (
          <EmptyState message="No candidates match current filters. Adjust search or reset filters." />
        ) : (
          <>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                columns={columns}
                totalVisibleRows={filteredRows.length}
                getStatusClassName={createStatusClassName}
                canChangeStatus={canChangeStatus}
                statusOrder={orderedStatusIDs}
                rejectedStatusID={rejectedStatusID}
                onRequestStatusChange={requestStatusChange}
                onOpenDetails={openPipelineDetails}
                onInteractionError={setInteractionError}
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
                    { key: 'lastUpdated', title: 'Last Updated' },
                    { key: 'actions', title: 'Actions' }
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
                        <a className="modern-link" href={ensureModernUIURL(row.jobOrderURL)}>
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
                      <td>
                        <div className="modern-table-actions">
                          {canChangeStatus ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() => openStatusModal(row, null)}
                            >
                              Change Status
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() => openPipelineDetails(row)}
                            disabled={Number(row.candidateJobOrderID || 0) <= 0}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            )}
          </>
        )}
        </div>

        <LegacyFrameModal
          isOpen={!!statusModal}
          title={`Change Status${statusModal ? `: ${statusModal.candidateName}` : ''}`}
          subtitle={statusModal ? `Current status: ${statusModal.currentStatusLabel}` : undefined}
          url={statusModal?.url || ''}
          onClose={closeStatusModal}
        />

        <JobOrderAssignCandidateModal
          isOpen={!!assignModal}
          bootstrap={bootstrap}
          sourceURL={assignModal?.url || ''}
          subtitle={assignModal?.jobOrderName}
          onClose={() => setAssignModal(null)}
          onAssigned={() => {
            refreshDashboard();
          }}
        />

        <LegacyFrameModal
          isOpen={!!detailsModal}
          title={`Pipeline Details${detailsModal ? `: ${detailsModal.candidateName}` : ''}`}
          url={detailsModal?.url || ''}
          onClose={closeDetailsModal}
          showRefreshClose={false}
        />
      </PageContainer>
    </div>
  );
}
