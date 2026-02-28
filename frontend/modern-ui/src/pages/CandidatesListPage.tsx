import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCandidatesListModernData } from '../lib/api';
import type { CandidatesListModernDataResponse, UIModeBootstrap } from '../types';
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
  quickSearch?: string;
  sourceFilter?: string;
  onlyMyCandidates?: boolean;
  onlyHotCandidates?: boolean;
  onlyGdprUnsigned?: boolean;
  onlyInternalCandidates?: boolean;
  onlyActiveCandidates?: boolean;
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

export function CandidatesListPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesListModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.quickSearch || '');
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load candidates.');
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
      if (typeof popupWindow.showPopWin === 'function') {
        popupWindow.showPopWin(
          url,
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

      window.location.href = url;
    },
    [refreshPageData]
  );

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'candidates');
    nextQuery.set('a', 'listByView');
    nextQuery.set('view', 'list');

    const quickSearchValue = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
    if (quickSearchValue === '') {
      nextQuery.delete('wildCardString');
    } else {
      nextQuery.set('wildCardString', quickSearchValue);
    }

    const sourceFilterValue = String(next.sourceFilter ?? data.filters.sourceFilter ?? '').trim();
    if (sourceFilterValue === '') {
      nextQuery.delete('sourceFilter');
    } else {
      nextQuery.set('sourceFilter', sourceFilterValue);
    }

    const onlyMyCandidates = typeof next.onlyMyCandidates === 'boolean' ? next.onlyMyCandidates : data.filters.onlyMyCandidates;
    const onlyHotCandidates = typeof next.onlyHotCandidates === 'boolean' ? next.onlyHotCandidates : data.filters.onlyHotCandidates;
    const onlyGdprUnsigned = typeof next.onlyGdprUnsigned === 'boolean' ? next.onlyGdprUnsigned : data.filters.onlyGdprUnsigned;
    const onlyInternalCandidates = typeof next.onlyInternalCandidates === 'boolean' ? next.onlyInternalCandidates : data.filters.onlyInternalCandidates;
    const onlyActiveCandidates = typeof next.onlyActiveCandidates === 'boolean' ? next.onlyActiveCandidates : data.filters.onlyActiveCandidates;

    nextQuery.set('onlyMyCandidates', toBooleanString(onlyMyCandidates));
    nextQuery.set('onlyHotCandidates', toBooleanString(onlyHotCandidates));
    nextQuery.set('onlyGdprUnsigned', toBooleanString(onlyGdprUnsigned));
    nextQuery.set('onlyInternalCandidates', toBooleanString(onlyInternalCandidates));
    nextQuery.set('onlyActiveCandidates', toBooleanString(onlyActiveCandidates));

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

  const sourceOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '', label: 'All sources' }];
    }

    const normalized = (data.options.sources || []).map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Unknown')
    }));

    if (!normalized.find((option) => option.value === '')) {
      normalized.unshift({ value: '', label: 'All sources' });
    }

    return normalized;
  }, [data]);

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '15', label: '15 rows' },
    { value: '30', label: '30 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  if (loading && !data) {
    return <div className="modern-state">Loading candidates...</div>;
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
    return <EmptyState message="No candidates available." />;
  }

  const filters = data.filters;
  const permissions = data.meta.permissions;
  const activeFilterLabels: string[] = [];
  if (filters.quickSearch.trim() !== '') {
    activeFilterLabels.push(`Search: "${filters.quickSearch.trim()}"`);
  }
  if (filters.sourceFilter !== '') {
    activeFilterLabels.push(`Source: ${filters.sourceFilter}`);
  }
  if (filters.onlyMyCandidates) {
    activeFilterLabels.push('Only My Candidates');
  }
  if (filters.onlyHotCandidates) {
    activeFilterLabels.push('Only Hot Candidates');
  }
  if (filters.onlyGdprUnsigned) {
    activeFilterLabels.push('GDPR Not Signed');
  }
  if (filters.onlyInternalCandidates) {
    activeFilterLabels.push('Internal Candidates');
  }
  if (filters.onlyActiveCandidates) {
    activeFilterLabels.push('Only Active');
  }

  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;

  return (
    <div className="avel-dashboard-page avel-candidates-page">
      <PageContainer
        title="Candidates"
        subtitle="Modern candidate workspace powered by Avel UI tokens."
        actions={
          <>
            {permissions.canAddCandidate ? (
              <a className="modern-btn modern-btn--secondary" href={`${bootstrap.indexName}?m=candidates&a=add&ui=modern`}>
                Add Candidate
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Candidates controls">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <form
                className="modern-command-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigateWithFilters({ quickSearch: searchDraft, page: 1 });
                }}
              >
                <span className="modern-command-label">Search</span>
                <span className="modern-command-search__shell">
                  <span className="modern-command-search__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" role="presentation" style={{ width: 14, height: 14 }}>
                      <path d="M11 4a7 7 0 1 1-4.95 11.95A7 7 0 0 1 11 4zm0-2a9 9 0 1 0 5.66 16l4.17 4.17 1.41-1.41-4.17-4.17A9 9 0 0 0 11 2z" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search by name, skills, resume"
                  />
                </span>
              </form>

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
                  onClick={() => {
                    setSearchDraft('');
                    navigateWithFilters({
                      quickSearch: '',
                      sourceFilter: '',
                      onlyMyCandidates: false,
                      onlyHotCandidates: false,
                      onlyGdprUnsigned: false,
                      onlyInternalCandidates: false,
                      onlyActiveCandidates: true,
                      page: 1
                    });
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <SelectMenu
                label="Source"
                value={filters.sourceFilter}
                options={sourceOptions}
                onChange={(value) => navigateWithFilters({ sourceFilter: value, page: 1 })}
              />

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyMyCandidates}
                  onChange={(event) => navigateWithFilters({ onlyMyCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only My Candidates</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyHotCandidates}
                  onChange={(event) => navigateWithFilters({ onlyHotCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only Hot Candidates</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyGdprUnsigned}
                  onChange={(event) => navigateWithFilters({ onlyGdprUnsigned: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>GDPR Not Signed</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyInternalCandidates}
                  onChange={(event) => navigateWithFilters({ onlyInternalCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Internal Candidates</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyActiveCandidates}
                  onChange={(event) => navigateWithFilters({ onlyActiveCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only Active</span>
              </label>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div className={`modern-command-active__count${activeFilterLabels.length > 0 ? ' is-active' : ''}`}>
                  {activeFilterLabels.length} active filter{activeFilterLabels.length === 1 ? '' : 's'}
                </div>
                {activeFilterLabels.length > 0 ? (
                  <div className="modern-command-active__list">
                    {activeFilterLabels.map((label) => (
                      <span className="modern-active-filter modern-active-filter--server" key={label}>
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="modern-command-active__empty">No active filters. Showing full candidates list.</div>
                )}
              </div>
            </div>
          </section>

          {toDisplayText(data.state.topLog, '') !== '' ? (
            <div className="modern-state">{toDisplayText(data.state.topLog, '')}</div>
          ) : null}

          <div className="modern-table-animated avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">
                Candidates {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
              </h2>
              <div className="avel-candidates-pagination">
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoPrev}
                  onClick={() => navigateWithFilters({ page: data.meta.page - 1 })}
                >
                  Prev
                </button>
                <span className="avel-candidates-pagination__label">
                  Page {data.meta.page} / {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoNext}
                  onClick={() => navigateWithFilters({ page: data.meta.page + 1 })}
                >
                  Next
                </button>
              </div>
            </div>

            {!hasRows ? (
              <EmptyState message="No candidates match current filters." />
            ) : (
              <DataTable
                columns={[
                  { key: 'candidate', title: 'Candidate' },
                  { key: 'location', title: 'Location' },
                  { key: 'skills', title: 'Key Skills' },
                  { key: 'owner', title: 'Owner' },
                  { key: 'source', title: 'Source' },
                  { key: 'flags', title: 'Flags' },
                  { key: 'modified', title: 'Modified' },
                  { key: 'actions', title: 'Actions' }
                ]}
                hasRows={hasRows}
              >
                {data.rows.map((row) => (
                  <tr key={row.candidateID}>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(row.candidateURL)}>
                        {toDisplayText(row.fullName)}
                      </a>
                    </td>
                    <td>{`${toDisplayText(row.city)}, ${toDisplayText(row.country)}`}</td>
                    <td>{toDisplayText(row.keySkills)}</td>
                    <td>{toDisplayText(row.ownerName)}</td>
                    <td>{toDisplayText(row.source)}</td>
                    <td>
                      <div className="avel-candidate-flags">
                        {row.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                        {row.hasDuplicate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                        {row.isSubmitted ? <span className="modern-chip modern-chip--info">Submitted</span> : null}
                        {row.hasAttachment ? <span className="modern-chip">Resume</span> : null}
                        {row.commentCount > 0 ? (
                          <span className="modern-chip modern-chip--success">{row.commentCount} comments</span>
                        ) : null}
                      </div>
                    </td>
                    <td>{toDisplayText(row.modifiedDate)}</td>
                    <td>
                      <div className="modern-table-actions">
                        <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.candidateURL)}>
                          View
                        </a>
                        {permissions.canEditCandidate ? (
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.candidateEditURL)}>
                            Edit
                          </a>
                        ) : null}
                        {permissions.canAddToList ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() => openLegacyPopup(row.addToListURL, 520, 420, false)}
                          >
                            Add To List
                          </button>
                        ) : null}
                        {permissions.canAddToJobOrder ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() => openLegacyPopup(row.addToJobOrderURL, 860, 560, false)}
                          >
                            Add To Job
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
