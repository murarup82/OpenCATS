import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJobOrdersListModernData, setJobOrderMonitored } from '../lib/api';
import type { JobOrdersListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { ensureModernUIURL } from '../lib/navigation';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type NavigationFilters = {
  status?: string;
  companyID?: number;
  onlyMyJobOrders?: boolean;
  onlyHotJobOrders?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  maxResults?: number;
};

type ColumnVisibility = {
  company: boolean;
  status: boolean;
  pipeline: boolean;
  proposed: boolean;
  age: boolean;
  owner: boolean;
  recruiter: boolean;
  monitor: boolean;
};

type ColumnPresetKey = 'full' | 'balanced' | 'compact';

const columnPresets: Record<ColumnPresetKey, ColumnVisibility> = {
  full: {
    company: true,
    status: true,
    pipeline: true,
    proposed: true,
    age: true,
    owner: true,
    recruiter: true,
    monitor: true
  },
  balanced: {
    company: true,
    status: true,
    pipeline: true,
    proposed: true,
    age: true,
    owner: true,
    recruiter: false,
    monitor: false
  },
  compact: {
    company: false,
    status: true,
    pipeline: true,
    proposed: true,
    age: true,
    owner: false,
    recruiter: false,
    monitor: false
  }
};

const columnPresetOrder: Array<{ key: ColumnPresetKey; label: string }> = [
  { key: 'compact', label: 'Compact' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'full', label: 'Full' }
];

function isColumnVisibility(value: unknown): value is ColumnVisibility {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.company === 'boolean' &&
    typeof candidate.status === 'boolean' &&
    typeof candidate.pipeline === 'boolean' &&
    typeof candidate.proposed === 'boolean' &&
    typeof candidate.age === 'boolean' &&
    typeof candidate.owner === 'boolean' &&
    typeof candidate.recruiter === 'boolean' &&
    typeof candidate.monitor === 'boolean'
  );
}

function detectPreset(visibility: ColumnVisibility): ColumnPresetKey | 'custom' {
  const presetKeys = Object.keys(columnPresets) as ColumnPresetKey[];
  for (const presetKey of presetKeys) {
    const preset = columnPresets[presetKey];
    if (
      preset.company === visibility.company &&
      preset.status === visibility.status &&
      preset.pipeline === visibility.pipeline &&
      preset.proposed === visibility.proposed &&
      preset.age === visibility.age &&
      preset.owner === visibility.owner &&
      preset.recruiter === visibility.recruiter &&
      preset.monitor === visibility.monitor
    ) {
      return presetKey;
    }
  }

  return 'custom';
}

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

function toBooleanString(value: boolean): string {
  return value ? '1' : '0';
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function buildStatusTone(tone: string): string {
  const normalized = String(tone || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized === '' ? 'status' : normalized;
}

const sortOptions: SelectMenuOption[] = [
  { value: 'dateCreatedSort', label: 'Created Date' },
  { value: 'title', label: 'Job Title' },
  { value: 'companyName', label: 'Company' },
  { value: 'status', label: 'Status' },
  { value: 'daysOld', label: 'Age (Days)' },
  { value: 'pipeline', label: 'Pipeline Size' },
  { value: 'submitted', label: 'Proposed Count' },
  { value: 'ownerSort', label: 'Owner' },
  { value: 'recruiterSort', label: 'Recruiter' }
];

const sortDirectionOptions: SelectMenuOption[] = [
  { value: 'DESC', label: 'Descending' },
  { value: 'ASC', label: 'Ascending' }
];

export function JobOrdersListPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>(columnPresets.balanced);
  const [columnPreset, setColumnPreset] = useState<ColumnPresetKey | 'custom'>('balanced');
  const [addJobOrderModal, setAddJobOrderModal] = useState<{
    url: string;
    title: string;
    openInPopup: { width: number; height: number; refreshOnClose: boolean };
  } | null>(null);
  const [monitorTogglePendingIDs, setMonitorTogglePendingIDs] = useState<number[]>([]);
  const [monitorToggleError, setMonitorToggleError] = useState('');
  const columnStorageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:joborders:columns:v1`,
    [bootstrap.siteID, bootstrap.userID]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(columnStorageKey);
      if (!raw) {
        setVisibleColumns(columnPresets.balanced);
        setColumnPreset('balanced');
        return;
      }

      const parsed = JSON.parse(raw) as { visibleColumns?: unknown; preset?: unknown };
      if (!isColumnVisibility(parsed.visibleColumns)) {
        setVisibleColumns(columnPresets.balanced);
        setColumnPreset('balanced');
        return;
      }

      const restoredColumns = parsed.visibleColumns;
      setVisibleColumns(restoredColumns);
      if (parsed.preset === 'full' || parsed.preset === 'balanced' || parsed.preset === 'compact') {
        setColumnPreset(parsed.preset);
      } else {
        setColumnPreset(detectPreset(restoredColumns));
      }
    } catch (_error) {
      setVisibleColumns(columnPresets.balanced);
      setColumnPreset('balanced');
    }
  }, [columnStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        columnStorageKey,
        JSON.stringify({
          visibleColumns,
          preset: columnPreset,
          updatedAt: new Date().toISOString()
        })
      );
    } catch (_error) {
      // Ignore persistence issues (private mode / storage blocked).
    }
  }, [columnPreset, columnStorageKey, visibleColumns]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersListModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load job orders.');
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

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  const closeAddJobOrderModal = useCallback(
    (refreshOnClose: boolean) => {
      setAddJobOrderModal(null);
      if (refreshOnClose) {
        refreshPageData();
      }
    },
    [refreshPageData]
  );

  const toggleMonitoredState = useCallback(
    async (row: JobOrdersListModernDataResponse['rows'][number]) => {
      const jobOrderID = Number(row.jobOrderID || 0);
      if (jobOrderID <= 0) {
        return;
      }
      if (monitorTogglePendingIDs.includes(jobOrderID)) {
        return;
      }

      setMonitorToggleError('');
      setMonitorTogglePendingIDs((current) => [...current, jobOrderID]);
      try {
        const result = await setJobOrderMonitored(decodeLegacyURL(row.setMonitoredBaseURL), {
          state: !row.isMonitored
        });
        if (!result.success) {
          setMonitorToggleError(result.message || 'Unable to update monitor setting.');
          return;
        }
        refreshPageData();
      } catch (err: unknown) {
        setMonitorToggleError(err instanceof Error ? err.message : 'Unable to update monitor setting.');
      } finally {
        setMonitorTogglePendingIDs((current) => current.filter((id) => id !== jobOrderID));
      }
    },
    [monitorTogglePendingIDs, refreshPageData]
  );

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'joborders');
    nextQuery.set('a', 'listByView');

    const statusValue = String(next.status ?? data.filters.status ?? '').trim();
    if (statusValue === '') {
      nextQuery.delete('view');
      nextQuery.delete('status');
    } else {
      nextQuery.set('view', statusValue);
    }

    const companyID = typeof next.companyID === 'number' ? next.companyID : data.filters.companyID;
    if (companyID > 0) {
      nextQuery.set('companyID', String(companyID));
    } else {
      nextQuery.delete('companyID');
      nextQuery.delete('companyFilter');
    }

    const onlyMyJobOrders = typeof next.onlyMyJobOrders === 'boolean' ? next.onlyMyJobOrders : data.filters.onlyMyJobOrders;
    const onlyHotJobOrders = typeof next.onlyHotJobOrders === 'boolean' ? next.onlyHotJobOrders : data.filters.onlyHotJobOrders;
    nextQuery.set('onlyMyJobOrders', toBooleanString(onlyMyJobOrders));
    nextQuery.set('onlyHotJobOrders', toBooleanString(onlyHotJobOrders));

    const sortBy = String(next.sortBy ?? data.meta.sortBy ?? '').trim();
    if (sortBy === '') {
      nextQuery.delete('sortBy');
    } else {
      nextQuery.set('sortBy', sortBy);
    }

    const sortDirection = String(next.sortDirection ?? data.meta.sortDirection ?? '').trim().toUpperCase();
    if (sortDirection === 'ASC' || sortDirection === 'DESC') {
      nextQuery.set('sortDirection', sortDirection);
    } else {
      nextQuery.delete('sortDirection');
    }

    const entriesPerPage =
      typeof next.maxResults === 'number' && next.maxResults > 0
        ? next.maxResults
        : data.meta.entriesPerPage;
    nextQuery.set('maxResults', String(entriesPerPage));

    const page = typeof next.page === 'number' && next.page > 0 ? next.page : 1;
    nextQuery.set('page', String(page));
    nextQuery.delete('rangeStart');

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  const statusOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '', label: 'All statuses', tone: 'all-statuses' }];
    }

    return (data.options.statuses || []).map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Status'),
      tone: buildStatusTone(option.tone)
    }));
  }, [data]);

  const companyOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '0', label: 'All companies' }];
    }

    return (data.options.companies || []).map((company) => ({
      value: String(company.companyID || 0),
      label: toDisplayText(company.name, 'Unknown')
    }));
  }, [data]);

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '25', label: '25 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  const selectedSortBy = sortOptions.some((option) => option.value === data?.meta.sortBy) ? data?.meta.sortBy : 'dateCreatedSort';
  const selectedSortDirection = data?.meta.sortDirection === 'ASC' ? 'ASC' : 'DESC';
  const tableColumns = [
    { key: 'title', title: 'Job Order' },
    ...(visibleColumns.company ? [{ key: 'company', title: 'Company' }] : []),
    ...(visibleColumns.status ? [{ key: 'status', title: 'Status' }] : []),
    ...(visibleColumns.pipeline ? [{ key: 'pipeline', title: 'Pipeline' }] : []),
    ...(visibleColumns.proposed ? [{ key: 'proposed', title: 'Proposed' }] : []),
    ...(visibleColumns.age ? [{ key: 'age', title: 'Age' }] : []),
    ...(visibleColumns.owner ? [{ key: 'owner', title: 'Owner' }] : []),
    ...(visibleColumns.recruiter ? [{ key: 'recruiter', title: 'Recruiter' }] : []),
    ...(visibleColumns.monitor ? [{ key: 'monitor', title: 'Monitor' }] : [])
  ];
  const columnToggleItems: Array<{ key: keyof ColumnVisibility; label: string }> = [
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'proposed', label: 'Proposed' },
    { key: 'age', label: 'Age' },
    { key: 'owner', label: 'Owner' },
    { key: 'recruiter', label: 'Recruiter' },
    { key: 'monitor', label: 'Monitor' }
  ];

  if (loading && !data) {
    return <div className="modern-state">Loading job orders...</div>;
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
    return <EmptyState message="No job orders available." />;
  }

  const permissions = data.meta.permissions;
  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const activeFilterLabels: string[] = [];
  if (data.filters.status.trim() !== '') {
    activeFilterLabels.push(`Status: ${data.filters.status}`);
  }
  if (data.filters.companyID > 0 && data.filters.companyName.trim() !== '') {
    activeFilterLabels.push(`Company: ${data.filters.companyName}`);
  }
  if (data.filters.onlyMyJobOrders) {
    activeFilterLabels.push('Only My Job Orders');
  }
  if (data.filters.onlyHotJobOrders) {
    activeFilterLabels.push('Only Hot Job Orders');
  }

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title="Job Orders"
        subtitle="Modern job order board with legacy-safe actions and full filter parity."
        actions={
          <>
            {permissions.canAddJobOrder ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setAddJobOrderModal({
                    url: decodeLegacyURL(data.actions.addJobOrderPopupURL),
                    title: 'Add Job Order',
                    openInPopup: { width: 520, height: 360, refreshOnClose: true }
                  })
                }
              >
                Add Job Order
              </button>
            ) : null}
            {permissions.canManageRecruiterAllocation ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.recruiterAllocationURL)}>
                Recruiter Allocation
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Visible Job Orders</span>
              <span className="avel-kpi__value">{data.meta.totalRows}</span>
              <span className="avel-kpi__hint">Filtered slice</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Total In System</span>
              <span className="avel-kpi__value">{data.meta.totalJobOrders}</span>
              <span className="avel-kpi__hint">All statuses</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Current Page</span>
              <span className="avel-kpi__value">{data.meta.page}</span>
              <span className="avel-kpi__hint">{data.meta.totalPages} pages</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Rows Per Page</span>
              <span className="avel-kpi__value">{data.meta.entriesPerPage}</span>
              <span className="avel-kpi__hint">Adjust from controls</span>
            </div>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Job order controls">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope avel-joborders-primary-row">
              <SelectMenu
                label="Sort By"
                value={selectedSortBy}
                options={sortOptions}
                onChange={(value) => navigateWithFilters({ sortBy: value, page: 1 })}
                className="modern-command-field modern-command-field--compact"
              />

              <SelectMenu
                label="Direction"
                value={selectedSortDirection}
                options={sortDirectionOptions}
                onChange={(value) => navigateWithFilters({ sortDirection: value as 'ASC' | 'DESC', page: 1 })}
                className="modern-command-field modern-command-field--compact"
              />

              <SelectMenu
                label="Rows"
                value={String(data.meta.entriesPerPage)}
                options={rowsPerPageOptions}
                onChange={(value) => navigateWithFilters({ maxResults: Number(value), page: 1 })}
                className="modern-command-field modern-command-field--compact"
              />

              <div className="modern-command-actions modern-command-actions--primary">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() =>
                    navigateWithFilters({
                      status: '',
                      companyID: 0,
                      onlyMyJobOrders: false,
                      onlyHotJobOrders: false,
                      sortBy: 'dateCreatedSort',
                      sortDirection: 'DESC',
                      page: 1
                    })
                  }
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--filters avel-joborders-filters-row">
              <SelectMenu
                label="Status"
                value={data.filters.status || ''}
                options={statusOptions}
                onChange={(value) => navigateWithFilters({ status: value, page: 1 })}
                className="modern-command-field"
              />

              <SelectMenu
                label="Company"
                value={String(data.filters.companyID || 0)}
                options={companyOptions}
                onChange={(value) => navigateWithFilters({ companyID: Number(value), page: 1 })}
                className="modern-command-field"
              />

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.onlyMyJobOrders}
                  onChange={(event) => navigateWithFilters({ onlyMyJobOrders: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true" />
                <span>Only My Job Orders</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.onlyHotJobOrders}
                  onChange={(event) => navigateWithFilters({ onlyHotJobOrders: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true" />
                <span>Only Hot Job Orders</span>
              </label>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-chip-strip">
                {activeFilterLabels.length === 0 ? (
                  <span className="modern-chip modern-chip--info">No active filters</span>
                ) : (
                  activeFilterLabels.map((label) => (
                    <span key={label} className="modern-chip modern-chip--info">
                      {label}
                    </span>
                  ))
                )}
              </div>
              <div className="modern-chip-strip">
                <span className="modern-chip modern-chip--info">Presets</span>
                {columnPresetOrder.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`modern-chip modern-chip--column-toggle ${columnPreset === preset.key ? 'is-active' : ''}`}
                    onClick={() => {
                      setVisibleColumns(columnPresets[preset.key]);
                      setColumnPreset(preset.key);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
                {columnPreset === 'custom' ? <span className="modern-chip modern-chip--warning">Custom</span> : null}
              </div>
              <div className="modern-chip-strip">
                {columnToggleItems.map((columnItem) => (
                  <button
                    key={columnItem.key}
                    type="button"
                    className={`modern-chip modern-chip--column-toggle ${visibleColumns[columnItem.key] ? 'is-active' : ''}`}
                    onClick={() => {
                      setVisibleColumns((current) => {
                        const next = {
                          ...current,
                          [columnItem.key]: !current[columnItem.key]
                        };
                        setColumnPreset(detectPreset(next));
                        return next;
                      });
                    }}
                  >
                    {columnItem.label}
                  </button>
                ))}
                <span className="modern-chip modern-chip--info">Saved per user</span>
              </div>
              {data.state.errorMessage ? (
                <span className="modern-chip modern-chip--critical">{data.state.errorMessage}</span>
              ) : null}
              {monitorToggleError !== '' ? (
                <span className="modern-chip modern-chip--critical">{monitorToggleError}</span>
              ) : null}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Active Job Orders</h2>
              <p className="avel-list-panel__hint">Phase 4 native list view with per-user column presets.</p>
            </div>

            <DataTable
              columns={tableColumns}
              hasRows={hasRows}
              emptyMessage="No job orders match the current filters."
            >
              {data.rows.map((row) => (
                <tr key={row.jobOrderID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.showURL)}>
                      {toDisplayText(row.title, 'Job Order')}
                    </a>
                    <div className="avel-joborders-flags">
                      {row.isMonitored ? <span className="modern-chip modern-chip--success">Monitored</span> : null}
                      {row.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                      {row.hasAttachment ? <span className="modern-chip modern-chip--info">Attachment</span> : null}
                      {row.commentCount > 0 ? <span className="modern-chip modern-chip--info">{row.commentCount} comments</span> : null}
                    </div>
                  </td>
                  {visibleColumns.company ? (
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(row.companyURL)}>
                        {toDisplayText(row.companyName)}
                      </a>
                    </td>
                  ) : null}
                  {visibleColumns.status ? (
                    <td>
                      <span className={`modern-chip modern-chip--status-${row.statusSlug}`}>{toDisplayText(row.status)}</span>
                    </td>
                  ) : null}
                  {visibleColumns.pipeline ? <td>{row.pipeline}</td> : null}
                  {visibleColumns.proposed ? <td>{row.submitted}</td> : null}
                  {visibleColumns.age ? <td>{row.daysOld}d</td> : null}
                  {visibleColumns.owner ? <td>{toDisplayText(row.ownerName)}</td> : null}
                  {visibleColumns.recruiter ? <td>{toDisplayText(row.recruiterName)}</td> : null}
                  {visibleColumns.monitor ? (
                    <td>
                      {permissions.canToggleMonitored ? (
                        <div className="modern-table-actions">
                          <button
                            type="button"
                            className="modern-btn modern-btn--secondary modern-btn--mini"
                            onClick={() => void toggleMonitoredState(row)}
                            disabled={monitorTogglePendingIDs.includes(Number(row.jobOrderID || 0))}
                          >
                            {monitorTogglePendingIDs.includes(Number(row.jobOrderID || 0))
                              ? 'Updating...'
                              : row.isMonitored
                                ? 'Disable'
                                : 'Enable'}
                          </button>
                        </div>
                      ) : (
                        <span className="modern-chip modern-chip--info">{row.isMonitored ? 'On' : 'Off'}</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </DataTable>

            <div className="avel-candidates-pagination">
              <span className="avel-candidates-pagination__label">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                disabled={!canGoPrev}
                onClick={() => navigateWithFilters({ page: data.meta.page - 1 })}
              >
                Previous
              </button>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                disabled={!canGoNext}
                onClick={() => navigateWithFilters({ page: data.meta.page + 1 })}
              >
                Next
              </button>
            </div>
          </section>
        </div>

        <LegacyFrameModal
          isOpen={!!addJobOrderModal}
          title={addJobOrderModal?.title || 'Add Job Order'}
          url={addJobOrderModal?.url || ''}
          onClose={closeAddJobOrderModal}
          showRefreshClose
        />
      </PageContainer>
    </div>
  );
}
