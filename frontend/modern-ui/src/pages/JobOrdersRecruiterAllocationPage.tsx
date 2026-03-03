import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJobOrdersRecruiterAllocationModernData, saveJobOrderRecruiterAllocation } from '../lib/api';
import type { JobOrdersRecruiterAllocationModernDataResponse, UIModeBootstrap } from '../types';
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

type AllocationFilters = {
  scope: string;
  ownerUserID: number;
  recruiterUserID: number;
  search: string;
  page: number;
};

function toInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value || '').trim();
  return normalized === '' ? fallback : normalized;
}

export function JobOrdersRecruiterAllocationPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersRecruiterAllocationModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savePending, setSavePending] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [assignmentDraft, setAssignmentDraft] = useState<Record<number, number>>({});
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersRecruiterAllocationModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        const nextDraft: Record<number, number> = {};
        result.rows.forEach((row) => {
          nextDraft[row.jobOrderID] = toInteger(row.recruiterUserID, 0);
        });
        setAssignmentDraft(nextDraft);
        setSearchDraft(result.filters.search || '');
        setSaveMessage(result.state.noticeMessage || '');
        setSaveError(result.state.errorMessage || '');
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load recruiter allocation workspace.');
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

  const applyFilters = useCallback(
    (next: Partial<AllocationFilters>) => {
      const baseScope = data?.filters.scope || 'all';
      const baseOwner = toInteger(data?.filters.ownerUserID, 0);
      const baseRecruiter = toInteger(data?.filters.recruiterUserID, -2);
      const baseSearch = data?.filters.search || '';
      const basePage = toInteger(data?.meta.page, 1);

      const query = new URLSearchParams(serverQueryString);
      query.set('m', 'joborders');
      query.set('a', 'recruiterAllocation');
      query.set('ui', 'modern');
      query.set('scope', String(next.scope ?? baseScope));
      query.set('ownerUserID', String(next.ownerUserID ?? baseOwner));
      query.set('recruiterUserID', String(next.recruiterUserID ?? baseRecruiter));

      const searchValue = String(next.search ?? baseSearch).trim();
      if (searchValue === '') {
        query.delete('search');
      } else {
        query.set('search', searchValue);
      }

      const page = Math.max(1, toInteger(next.page ?? basePage, 1));
      query.set('page', String(page));
      applyServerQuery(query);
    },
    [applyServerQuery, data, serverQueryString]
  );

  const assignmentOptions = useMemo(() => {
    const options = [{ value: '0', label: 'Unassigned' }];
    if (!data) {
      return options;
    }
    data.options.recruiters.forEach((option) => {
      const valueNumber = toInteger(option.value, -9999);
      if (valueNumber <= 0) {
        return;
      }
      options.push({
        value: String(valueNumber),
        label: option.label
      });
    });
    return options;
  }, [data]);

  const currentAssignments = useMemo<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    if (!data) {
      return map;
    }
    data.rows.forEach((row) => {
      map[row.jobOrderID] = toInteger(row.recruiterUserID, 0);
    });
    return map;
  }, [data]);

  const changedCount = useMemo(() => {
    if (!data) {
      return 0;
    }
    return data.rows.reduce((total, row) => {
      const jobOrderID = row.jobOrderID;
      const original = toInteger(currentAssignments[jobOrderID], 0);
      const current = toInteger(assignmentDraft[jobOrderID], original);
      return total + (current !== original ? 1 : 0);
    }, 0);
  }, [assignmentDraft, currentAssignments, data]);

  const saveAssignments = useCallback(async () => {
    if (!data || savePending) {
      return;
    }

    setSavePending(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const result = await saveJobOrderRecruiterAllocation(data.actions.submitURL, {
        scope: data.filters.scope,
        ownerUserID: data.filters.ownerUserID,
        recruiterUserID: data.filters.recruiterUserID,
        search: data.filters.search,
        page: data.meta.page,
        assignments: assignmentDraft,
        currentAssignments
      });

      if (result.noticeMessage) {
        setSaveMessage(result.noticeMessage);
      } else if (result.success) {
        setSaveMessage('Assignments updated.');
      }
      if (result.errorMessage) {
        setSaveError(result.errorMessage);
      }
      refreshPageData();
    } catch (saveErr: unknown) {
      setSaveError(saveErr instanceof Error ? saveErr.message : 'Unable to save assignments.');
    } finally {
      setSavePending(false);
    }
  }, [assignmentDraft, currentAssignments, data, refreshPageData, savePending]);

  if (loading && !data) {
    return <div className="modern-state">Loading recruiter allocation workspace...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Recruiter allocation data is unavailable." />;
  }

  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Recruiter Allocation"
        subtitle="Assign recruiters across job orders from a native modern workspace."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.listURL)}>
              Back To Job Orders
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Visible Rows</span>
              <span className="avel-kpi__value">{data.rows.length}</span>
              <span className="avel-kpi__hint">Current page</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Total Job Orders</span>
              <span className="avel-kpi__value">{data.meta.totalRows}</span>
              <span className="avel-kpi__hint">Matching filters</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Changed Assignments</span>
              <span className="avel-kpi__value">{changedCount}</span>
              <span className="avel-kpi__hint">Unsaved edits</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Page</span>
              <span className="avel-kpi__value">
                {data.meta.page}/{data.meta.totalPages}
              </span>
              <span className="avel-kpi__hint">
                {data.state.startRow}-{data.state.endRow}
              </span>
            </div>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field">
                <span className="modern-command-label">Scope</span>
                <select
                  value={data.filters.scope}
                  onChange={(event) => applyFilters({ scope: event.target.value, page: 1 })}
                >
                  {data.options.scopes.map((scopeOption) => (
                    <option key={`scope-${scopeOption.value}`} value={scopeOption.value}>
                      {scopeOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Owner</span>
                <select
                  value={String(data.filters.ownerUserID)}
                  onChange={(event) => applyFilters({ ownerUserID: toInteger(event.target.value, 0), page: 1 })}
                >
                  {data.options.owners.map((ownerOption) => (
                    <option key={`owner-${ownerOption.value}`} value={ownerOption.value}>
                      {ownerOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field">
                <span className="modern-command-label">Recruiter</span>
                <select
                  value={String(data.filters.recruiterUserID)}
                  onChange={(event) => applyFilters({ recruiterUserID: toInteger(event.target.value, -2), page: 1 })}
                >
                  {data.options.recruiters.map((recruiterOption) => (
                    <option key={`recruiter-${recruiterOption.value}`} value={recruiterOption.value}>
                      {recruiterOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modern-command-field" style={{ minWidth: '320px' }}>
                <span className="modern-command-label">Search Title / Company / Job ID</span>
                <input
                  type="text"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Filter job orders"
                />
              </label>
              <div className="modern-table-actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => applyFilters({ search: searchDraft, page: 1 })}
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => {
                    setSearchDraft('');
                    applyFilters({
                      scope: 'all',
                      ownerUserID: 0,
                      recruiterUserID: -2,
                      search: '',
                      page: 1
                    });
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            {saveMessage !== '' ? <div className="modern-state modern-state--success">{saveMessage}</div> : null}
            {saveError !== '' ? <div className="modern-state modern-state--error">{saveError}</div> : null}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Assignments</h2>
              <p className="avel-list-panel__hint">Allocate recruiter ownership per job order.</p>
            </div>

            <DataTable
              columns={[
                { key: 'jobID', title: 'Job ID' },
                { key: 'title', title: 'Title' },
                { key: 'company', title: 'Company' },
                { key: 'status', title: 'Status' },
                { key: 'owner', title: 'Owner' },
                { key: 'allocated', title: 'Allocated User' },
                { key: 'assign', title: 'Assign To' },
                { key: 'modified', title: 'Modified' }
              ]}
              hasRows={data.rows.length > 0}
              emptyMessage="No job orders match the selected filters."
            >
              {data.rows.map((row) => {
                const currentValue = toInteger(
                  assignmentDraft[row.jobOrderID],
                  toInteger(row.recruiterUserID, 0)
                );
                const originalValue = toInteger(row.recruiterUserID, 0);
                const changed = currentValue !== originalValue;

                return (
                  <tr key={`allocation-row-${row.jobOrderID}`}>
                    <td>{toDisplayText(row.companyJobID)}</td>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(row.showURL)}>
                        {toDisplayText(row.title)}
                      </a>
                    </td>
                    <td>{toDisplayText(row.companyName)}</td>
                    <td>{toDisplayText(row.status)}</td>
                    <td>{toDisplayText(row.ownerFullName)}</td>
                    <td>{toDisplayText(row.recruiterFullName, '(Unassigned)')}</td>
                    <td>
                      <select
                        className="avel-form-control"
                        value={String(currentValue)}
                        onChange={(event) =>
                          setAssignmentDraft((current) => ({
                            ...current,
                            [row.jobOrderID]: toInteger(event.target.value, 0)
                          }))
                        }
                      >
                        {assignmentOptions.map((option) => (
                          <option key={`assign-${row.jobOrderID}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {changed ? <span className="modern-chip modern-chip--warning">Changed</span> : null}
                    </td>
                    <td>{toDisplayText(row.dateModified)}</td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="modern-table-actions" style={{ marginTop: '12px', justifyContent: 'space-between' }}>
              <span className="modern-state">
                Showing {data.state.startRow} - {data.state.endRow} of {data.meta.totalRows}
              </span>
              <div className="modern-table-actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  disabled={changedCount === 0 || savePending}
                  onClick={() => void saveAssignments()}
                >
                  {savePending ? 'Saving...' : 'Save Assignments'}
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  disabled={!canGoPrev}
                  onClick={() => applyFilters({ page: data.meta.page - 1 })}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  disabled={!canGoNext}
                  onClick={() => applyFilters({ page: data.meta.page + 1 })}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
