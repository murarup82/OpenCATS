import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCandidatesListModernData } from '../lib/api';
import type { CandidatesListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { CandidateAssignJobOrderModal } from '../components/primitives/CandidateAssignJobOrderModal';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { isCapabilityEnabled } from '../lib/routeGuards';
import { useServerQueryState } from '../lib/useServerQueryState';
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

type AddToListCompletedDetail = {
  dataItemType?: number | string;
  dataItemIDs?: Array<number | string>;
  listIDs?: Array<number | string>;
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

function toInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter((part) => part !== '');
  if (parts.length === 0) {
    return 'NA';
  }
  const first = parts[0]?.charAt(0) || '';
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) || '' : '';
  return `${first}${second}`.toUpperCase();
}

export function CandidatesListPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [assignJobModal, setAssignJobModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

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
  usePageRefreshEvents(refreshPageData);

  useEffect(() => {
    const handleAddToListCompleted = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<AddToListCompletedDetail>;
      const ids = Array.isArray(event.detail?.dataItemIDs)
        ? event.detail.dataItemIDs.map((value) => Number(value || 0)).filter((value) => value > 0)
        : [];
      if (ids.length === 0) {
        return;
      }

      const visibleCandidateIDs = new Set(
        (data?.rows || []).map((row) => Number(row.candidateID || 0)).filter((value) => value > 0)
      );
      if (visibleCandidateIDs.size === 0) {
        return;
      }

      if (!ids.some((id) => visibleCandidateIDs.has(id))) {
        return;
      }

      refreshPageData();
    };

    window.addEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    return () => {
      window.removeEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    };
  }, [data?.rows, refreshPageData]);

  const openAddToListOverlay = useCallback((sourceURL: string) => {
    const normalizedURL = decodeLegacyURL(sourceURL);
    if (normalizedURL === '') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('opencats:add-to-list:open', {
        detail: {
          url: normalizedURL
        }
      })
    );
  }, []);

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

    applyServerQuery(nextQuery);
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
  const canAddCandidate = isCapabilityEnabled(permissions.canAddCandidate);
  const canEditCandidate = isCapabilityEnabled(permissions.canEditCandidate);
  const canAddToList = isCapabilityEnabled(permissions.canAddToList);
  const canAddToJobOrder = isCapabilityEnabled(permissions.canAddToJobOrder);
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
  const hasActiveFilters = activeFilterLabels.length > 0;
  const visibleHotCount = data.rows.filter((row) => row.isHot).length;
  const visibleDuplicateCount = data.rows.filter((row) => row.hasDuplicate).length;
  const visibleSubmittedCount = data.rows.filter((row) => row.isSubmitted).length;

  return (
    <div className="avel-dashboard-page avel-candidates-page">
      <PageContainer
        title="Candidates"
        subtitle="Candidate intelligence workspace for sourcing, triage, and placement prep."
        actions={
          <>
            {canAddCandidate ? (
              <a className="modern-btn modern-btn--emphasis" href={`${bootstrap.indexName}?m=candidates&a=add&ui=modern`}>
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
          <section className="avel-candidate-hero" aria-label="Candidates overview">
            <div className="avel-candidate-hero__intro">
              <p className="avel-candidate-hero__eyebrow">Candidate Intelligence</p>
              <h2 className="avel-candidate-hero__title">Move from search to action without friction</h2>
              <p className="avel-candidate-hero__subtitle">
                Filter quickly, inspect meaningful candidate signals, and trigger next-step actions directly from each profile card.
              </p>
            </div>
            <div className="avel-candidate-hero__stats">
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Visible Candidates</span>
                <strong className="avel-candidate-stat__value">{data.meta.totalRows}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Hot Profiles</span>
                <strong className="avel-candidate-stat__value">{visibleHotCount}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Submitted</span>
                <strong className="avel-candidate-stat__value">{visibleSubmittedCount}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Possible Duplicates</span>
                <strong className="avel-candidate-stat__value">{visibleDuplicateCount}</strong>
              </article>
            </div>
          </section>

          <section className="avel-candidate-toolbar modern-command-bar modern-command-bar--sticky" aria-label="Candidates filters and controls">
            <div className="avel-candidate-toolbar__primary">
              <form
                className="modern-command-search avel-candidate-toolbar__search"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigateWithFilters({ quickSearch: searchDraft, page: 1 });
                }}
              >
                <span className="modern-command-label">Search Talent</span>
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
                    placeholder="Search by name, skills, location, resume"
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

            <div className="avel-candidate-toolbar__filters">
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

            <div className="avel-candidate-toolbar__active">
              <div className={`modern-command-active__count${hasActiveFilters ? ' is-active' : ''}`}>
                {activeFilterLabels.length} active filter{activeFilterLabels.length === 1 ? '' : 's'}
              </div>
              {hasActiveFilters ? (
                <div className="modern-command-active__list">
                  {activeFilterLabels.map((label) => (
                    <span className="modern-active-filter modern-active-filter--server" key={label}>
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="modern-command-active__empty">No active filters. Showing the full candidate pipeline.</div>
              )}
            </div>
          </section>

          {toDisplayText(data.state.topLog, '') !== '' ? (
            <div className="modern-state">{toDisplayText(data.state.topLog, '')}</div>
          ) : null}

          <section className="avel-list-panel avel-candidate-results">
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
              <div className="avel-candidate-card-list" role="list" aria-label="Candidate results">
                {data.rows.map((row) => {
                  const locationParts = [row.city, row.country]
                    .map((value) => String(value || '').trim())
                    .filter((value) => value !== '');
                  const locationText = locationParts.length > 0 ? locationParts.join(', ') : '--';

                  return (
                    <article className="avel-candidate-card" key={row.candidateID} role="listitem">
                      <header className="avel-candidate-card__header">
                        <div className="avel-candidate-card__identity">
                          <span className="avel-candidate-card__avatar" aria-hidden="true">
                            {toInitials(row.fullName)}
                          </span>
                          <div className="avel-candidate-card__identity-text">
                            <a className="modern-link avel-candidate-card__name" href={ensureModernUIURL(row.candidateURL)}>
                              {toDisplayText(row.fullName)}
                            </a>
                            <div className="avel-candidate-card__meta">
                              <span>{locationText}</span>
                              <span aria-hidden="true">•</span>
                              <span>{toDisplayText(row.source)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="avel-candidate-card__signals">
                          <span className="avel-candidate-card__modified">Updated {toDisplayText(row.modifiedDate)}</span>
                          <div className="avel-candidate-flags">
                            {row.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                            {row.hasDuplicate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                            {row.isSubmitted ? <span className="modern-chip modern-chip--info">Submitted</span> : null}
                            {row.hasAttachment ? <span className="modern-chip">Resume</span> : null}
                            {row.commentCount > 0 ? (
                              <span className="modern-chip modern-chip--success">{row.commentCount} comments</span>
                            ) : null}
                          </div>
                        </div>
                      </header>

                      <p className="avel-candidate-card__skills">{toDisplayText(row.keySkills)}</p>

                      <footer className="avel-candidate-card__footer">
                        <div className="avel-candidate-card__ownership">
                          <span className="avel-candidate-card__ownership-item">
                            Owner <strong>{toDisplayText(row.ownerName)}</strong>
                          </span>
                          <span className="avel-candidate-card__ownership-item">
                            Added <strong>{toDisplayText(row.createdDate)}</strong>
                          </span>
                        </div>
                        <div className="modern-table-actions">
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.candidateURL)}>
                            View
                          </a>
                          {canEditCandidate ? (
                            <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.candidateEditURL)}>
                              Edit
                            </a>
                          ) : null}
                          {canAddToList ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() => openAddToListOverlay(row.addToListURL)}
                            >
                              Add To List
                            </button>
                          ) : null}
                          {canAddToJobOrder ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() =>
                                setAssignJobModal({
                                  url: decodeLegacyURL(row.addToJobOrderURL),
                                  title: `Add To Job Order: ${toDisplayText(row.fullName, 'Candidate')}`
                                })
                              }
                            >
                              Add To Job
                            </button>
                          ) : null}
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <CandidateAssignJobOrderModal
          isOpen={!!assignJobModal}
          bootstrap={bootstrap}
          sourceURL={assignJobModal?.url || ''}
          onClose={() => setAssignJobModal(null)}
          onAssigned={() => {
            refreshPageData();
          }}
        />
      </PageContainer>
    </div>
  );
}
