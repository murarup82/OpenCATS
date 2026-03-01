import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJobOrdersListModernData } from '../lib/api';
import type { JobOrdersListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
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
  page?: number;
  maxResults?: number;
};

type PopupCallback = ((returnValue?: unknown) => void) | null;

type PopupWindow = Window & {
  showPopWin?: (url: string, width: number, height: number, returnFunc?: PopupCallback) => void;
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

export function JobOrdersListPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);

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

  const openLegacyPopup = useCallback(
    (url: string, width: number, height: number, refreshOnClose: boolean) => {
      const popupWindow = window as PopupWindow;
      const popupURL = decodeLegacyURL(url);
      if (typeof popupWindow.showPopWin === 'function') {
        popupWindow.showPopWin(
          popupURL,
          width,
          height,
          refreshOnClose
            ? () => {
                refreshPageData();
              }
            : null
        );
        return;
      }

      window.location.href = popupURL;
    },
    [refreshPageData]
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
                onClick={() => openLegacyPopup(data.actions.addJobOrderPopupURL, 400, 250, true)}
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
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
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
              {data.state.errorMessage ? (
                <span className="modern-chip modern-chip--critical">{data.state.errorMessage}</span>
              ) : null}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Active Job Orders</h2>
              <p className="avel-list-panel__hint">Phase 1 native list view. Open a job order to continue in compatibility mode where needed.</p>
            </div>

            <DataTable
              columns={[
                { key: 'title', title: 'Job Order' },
                { key: 'company', title: 'Company' },
                { key: 'status', title: 'Status' },
                { key: 'pipeline', title: 'Pipeline' },
                { key: 'proposed', title: 'Proposed' },
                { key: 'age', title: 'Age' },
                { key: 'owner', title: 'Owner' },
                { key: 'recruiter', title: 'Recruiter' }
              ]}
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
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.companyURL)}>
                      {toDisplayText(row.companyName)}
                    </a>
                  </td>
                  <td>
                    <span className={`modern-chip modern-chip--status-${row.statusSlug}`}>{toDisplayText(row.status)}</span>
                  </td>
                  <td>{row.pipeline}</td>
                  <td>{row.submitted}</td>
                  <td>{row.daysOld}d</td>
                  <td>{toDisplayText(row.ownerName)}</td>
                  <td>{toDisplayText(row.recruiterName)}</td>
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
      </PageContainer>
    </div>
  );
}

