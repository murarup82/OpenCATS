import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchListsDetailModernData } from '../lib/api';
import type { ListsDetailModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
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

export function ListsDetailPage({ bootstrap }: Props) {
  const [data, setData] = useState<ListsDetailModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState('');
  const loadRequestRef = useRef(0);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchListsDetailModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.quickSearch || '');
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load list details.');
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString]);

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '15', label: '15 rows' },
    { value: '30', label: '30 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  const navigateWithFilters = (next: { quickSearch?: string; page?: number; maxResults?: number }) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'lists');
    nextQuery.set('a', 'showList');
    nextQuery.set('savedListID', String(data.list.savedListID));
    nextQuery.set('page', String(next.page && next.page > 0 ? next.page : 1));

    const rowsPerPage = next.maxResults && next.maxResults > 0 ? next.maxResults : data.meta.entriesPerPage;
    nextQuery.set('maxResults', String(rowsPerPage));

    const quickSearch = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
    if (quickSearch === '') {
      nextQuery.delete('wildCardString');
    } else {
      nextQuery.set('wildCardString', quickSearch);
    }

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    applyServerQuery(nextQuery);
  };

  if (loading && !data) {
    return <div className="modern-state">Loading list details...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="List details are unavailable." />;
  }

  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const listSubtitle = `${data.list.listTypeLabel} ${data.list.dataItemTypeLabel} list | ${data.meta.totalRows} matching entries`;

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title={`List: ${toDisplayText(data.list.description, `#${data.list.savedListID}`)}`}
        subtitle={listSubtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.listsURL)}>
              Back To Lists
            </a>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="List detail controls">
            <div className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <form
                className="modern-command-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigateWithFilters({ quickSearch: searchDraft, page: 1 });
                }}
              >
                <span className="modern-command-label">Search Entries</span>
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search by name, email, company, or ID"
                />
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
                    navigateWithFilters({ quickSearch: '', page: 1 });
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div
                  className={`modern-command-active__count${data.filters.quickSearch.trim() !== '' ? ' is-active' : ''}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {data.filters.quickSearch.trim() === '' ? 'No active filters' : `Search: "${data.filters.quickSearch.trim()}"`}
                </div>
                <div className="modern-command-active__list">
                  <span className="modern-active-filter modern-active-filter--server">Owner: {toDisplayText(data.list.ownerName, 'Unknown')}</span>
                  {data.permissions.listAccessRestricted ? (
                    <span className="modern-active-filter modern-active-filter--server">Restricted Access</span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {data.state.dynamicListUnsupported ? (
            <section className="avel-list-panel">
              <div className="modern-state modern-state--warning">
                {toDisplayText(data.state.message, 'This dynamic list is still served by legacy datagrid rendering.')}
              </div>
              <div style={{ marginTop: '10px' }}>
                <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.legacyURL)}>
                  Open Dynamic List In Legacy
                </a>
              </div>
            </section>
          ) : (
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Entries</h2>
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
                  { key: 'item', title: 'Item' },
                  { key: 'details', title: 'Details' },
                  { key: 'added', title: 'Added' }
                ]}
                hasRows={hasRows}
                emptyMessage="No list entries match the current filters."
              >
                {data.rows.map((row) => (
                  <tr key={`list-entry-${row.savedListEntryID}`}>
                    <td>
                      {row.itemURL.trim() !== '' ? (
                        <a className="modern-link" href={ensureModernUIURL(row.itemURL)}>
                          {toDisplayText(row.primaryLabel)}
                        </a>
                      ) : (
                        toDisplayText(row.primaryLabel)
                      )}
                      {row.isMissing ? (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-danger)' }}>
                          Source record no longer exists.
                        </div>
                      ) : null}
                    </td>
                    <td>{toDisplayText(row.secondaryLabel, '--')}</td>
                    <td>{toDisplayText(row.dateAdded, '--')}</td>
                  </tr>
                ))}
              </DataTable>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
