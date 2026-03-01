import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchActivityListModernData } from '../lib/api';
import type { ActivityListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { useServerQueryState } from '../lib/useServerQueryState';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type NavigationFilters = {
  quickSearch?: string;
  period?: string;
  dataItemType?: string;
  activityTypeID?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  maxResults?: number;
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

function truncateText(value: string, maxLength = 120): string {
  const normalized = String(value || '').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}...`;
}

export function ActivityListPage({ bootstrap }: Props) {
  const [data, setData] = useState<ActivityListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [searchDraft, setSearchDraft] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchActivityListModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.quickSearch || '');
        setCustomStartDate(result.filters.startDate || '');
        setCustomEndDate(result.filters.endDate || '');
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load activities.');
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
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

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'activity');
    nextQuery.set('a', 'listByViewDataGrid');

    const quickSearchValue = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
    if (quickSearchValue === '') {
      nextQuery.delete('wildCardString');
    } else {
      nextQuery.set('wildCardString', quickSearchValue);
    }

    const periodValue = String(next.period ?? data.filters.period ?? 'lastmonth').toLowerCase();
    nextQuery.set('period', periodValue);

    const dataItemTypeValue = String(next.dataItemType ?? data.filters.dataItemType ?? 'all').toLowerCase();
    nextQuery.set('dataItemType', dataItemTypeValue);

    const activityTypeValue =
      typeof next.activityTypeID === 'number' ? next.activityTypeID : Number(data.filters.activityTypeID || 0);
    if (activityTypeValue > 0) {
      nextQuery.set('activityTypeID', String(activityTypeValue));
    } else {
      nextQuery.delete('activityTypeID');
    }

    if (periodValue === 'custom') {
      const startValue = String(next.startDate ?? customStartDate ?? data.filters.startDate ?? '').trim();
      const endValue = String(next.endDate ?? customEndDate ?? data.filters.endDate ?? '').trim();
      if (startValue !== '') {
        nextQuery.set('startDate', startValue);
      } else {
        nextQuery.delete('startDate');
      }
      if (endValue !== '') {
        nextQuery.set('endDate', endValue);
      } else {
        nextQuery.delete('endDate');
      }
    } else {
      nextQuery.delete('startDate');
      nextQuery.delete('endDate');
      nextQuery.delete('startMonth');
      nextQuery.delete('startDay');
      nextQuery.delete('startYear');
      nextQuery.delete('endMonth');
      nextQuery.delete('endDay');
      nextQuery.delete('endYear');
    }

    const entriesPerPage =
      typeof next.maxResults === 'number' && next.maxResults > 0
        ? next.maxResults
        : data.meta.entriesPerPage;
    nextQuery.set('maxResults', String(entriesPerPage));

    const page = typeof next.page === 'number' && next.page > 0 ? next.page : 1;
    nextQuery.set('page', String(page));

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    applyServerQuery(nextQuery);
  };

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '15', label: '15 rows' },
    { value: '30', label: '30 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  const periodOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.periods.map((period) => ({
            value: period.value,
            label: period.label
          }))
        : [],
    [data]
  );

  const dataItemTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.dataItemTypes.map((itemType) => ({
            value: itemType.value,
            label: itemType.label
          }))
        : [],
    [data]
  );

  const activityTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? [{ value: '0', label: 'All activity types' }].concat(
            data.options.activityTypes.map((activityType) => ({
              value: String(activityType.activityTypeID),
              label: activityType.label
            }))
          )
        : [{ value: '0', label: 'All activity types' }],
    [data]
  );

  if (loading && !data) {
    return <div className="modern-state">Loading activities...</div>;
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
    return <EmptyState message="No activity entries available." />;
  }

  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const activeFilterLabels: string[] = [];
  if (data.filters.quickSearch.trim() !== '') {
    activeFilterLabels.push(`Search: "${data.filters.quickSearch.trim()}"`);
  }
  if (data.filters.dataItemType !== 'all') {
    activeFilterLabels.push(data.filters.dataItemType === 'candidate' ? 'Candidates' : 'Contacts');
  }
  if (data.filters.activityTypeID > 0) {
    const matchedType = data.options.activityTypes.find((type) => type.activityTypeID === data.filters.activityTypeID);
    if (matchedType) {
      activeFilterLabels.push(`Type: ${matchedType.label}`);
    }
  }
  if (data.filters.period !== 'lastmonth') {
    const matchedPeriod = data.options.periods.find((period) => period.value === data.filters.period);
    activeFilterLabels.push(`Range: ${matchedPeriod?.label || data.filters.period}`);
  }
  if (data.filters.period === 'custom' && data.filters.startDate !== '' && data.filters.endDate !== '') {
    activeFilterLabels.push(`${data.filters.startDate} to ${data.filters.endDate}`);
  }

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title="Activities"
        subtitle="Unified timeline across candidate and contact workflows."
        actions={
          <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Activity controls">
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
                    placeholder="Search profile, regarding, notes, activity type"
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
                    setCustomStartDate('');
                    setCustomEndDate('');
                    navigateWithFilters({
                      quickSearch: '',
                      period: 'lastmonth',
                      dataItemType: 'all',
                      activityTypeID: 0,
                      startDate: '',
                      endDate: '',
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
                label="Range"
                value={data.filters.period}
                options={periodOptions}
                onChange={(value) => navigateWithFilters({ period: value, page: 1 })}
                className="modern-command-field"
              />
              <SelectMenu
                label="Profiles"
                value={data.filters.dataItemType}
                options={dataItemTypeOptions}
                onChange={(value) => navigateWithFilters({ dataItemType: value, page: 1 })}
                className="modern-command-field"
              />
              <SelectMenu
                label="Activity Type"
                value={String(data.filters.activityTypeID || 0)}
                options={activityTypeOptions}
                onChange={(value) => navigateWithFilters({ activityTypeID: Number(value), page: 1 })}
                className="modern-command-field"
              />
            </div>

            {data.filters.period === 'custom' ? (
              <div className="modern-command-bar__row modern-command-bar__row--filters">
                <label className="modern-command-field">
                  <span className="modern-command-label">Start Date</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(event) => setCustomStartDate(event.target.value)}
                    style={{ width: '100%', minHeight: 42 }}
                  />
                </label>
                <label className="modern-command-field">
                  <span className="modern-command-label">End Date</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(event) => setCustomEndDate(event.target.value)}
                    style={{ width: '100%', minHeight: 42 }}
                  />
                </label>
                <div className="modern-command-actions modern-command-actions--primary">
                  <button
                    type="button"
                    className="modern-btn modern-btn--secondary"
                    onClick={() =>
                      navigateWithFilters({
                        period: 'custom',
                        startDate: customStartDate,
                        endDate: customEndDate,
                        page: 1
                      })
                    }
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            ) : null}

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
                  <div className="modern-command-active__empty">No active filters. Showing default activity feed.</div>
                )}
              </div>
            </div>
          </section>

          <div className="modern-table-animated avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">
                Activity Feed {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
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
                  Page {data.meta.page} of {data.meta.totalPages}
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

            <DataTable
              columns={[
                { key: 'date', title: 'Date' },
                { key: 'profile', title: 'Profile' },
                { key: 'regarding', title: 'Regarding' },
                { key: 'activity', title: 'Activity' },
                { key: 'notes', title: 'Notes' },
                { key: 'enteredBy', title: 'Entered By' }
              ]}
              hasRows={hasRows}
              emptyMessage="No activity entries match the current filters."
            >
              {data.rows.map((row) => (
                <tr key={row.activityID}>
                  <td>{toDisplayText(row.dateCreated)}</td>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.profileURL)}>
                      {toDisplayText(row.fullName)}
                    </a>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                      <span className="modern-chip">
                        {row.dataItemTypeKey === 'candidate' ? 'Candidate' : 'Contact'}
                      </span>
                      {row.isHot ? <span className="modern-chip modern-chip--warning" style={{ marginLeft: 6 }}>Hot</span> : null}
                    </div>
                  </td>
                  <td>
                    {row.jobOrderID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(row.jobOrderURL)}>
                        {toDisplayText(row.regarding)}
                      </a>
                    ) : (
                      toDisplayText(row.regarding)
                    )}
                  </td>
                  <td>{toDisplayText(row.typeDescription)}</td>
                  <td>{truncateText(toDisplayText(row.notes, '(No Notes)'), 160)}</td>
                  <td>{toDisplayText(row.enteredByName)}</td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
