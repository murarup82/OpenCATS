import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { callLegacyAjaxFunction, fetchListsManageModernData } from '../lib/api';
import type { ListsManageModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { MutationToast, type MutationToastState } from '../components/primitives/MutationToast';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type NavigationFilters = {
  quickSearch?: string;
  dataItemType?: number;
  listType?: 'all' | 'static' | 'dynamic';
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

function createToast(id: number, tone: MutationToastState['tone'], message: string): MutationToastState {
  return { id, tone, message };
}

export function ListsManagePage({ bootstrap }: Props) {
  const [data, setData] = useState<ListsManageModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [searchDraft, setSearchDraft] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListDataType, setNewListDataType] = useState<string>('0');
  const [createPending, setCreatePending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ListsManageModernDataResponse['rows'][number] | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState<MutationToastState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);
  const toastIDRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchListsManageModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.quickSearch || '');
        const firstCreateType = result.options.dataItemTypes.find((option) => option.value > 0);
        if (firstCreateType) {
          setNewListDataType(String(firstCreateType.value));
        }
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load lists.');
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

  const nextToast = (tone: MutationToastState['tone'], message: string) => {
    toastIDRef.current += 1;
    setToast(createToast(toastIDRef.current, tone, message));
  };

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'lists');
    nextQuery.set('a', 'listByView');

    const quickSearchValue = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
    if (quickSearchValue === '') {
      nextQuery.delete('wildCardString');
    } else {
      nextQuery.set('wildCardString', quickSearchValue);
    }

    const dataItemTypeValue =
      typeof next.dataItemType === 'number' ? next.dataItemType : Number(data.filters.dataItemType || 0);
    if (dataItemTypeValue > 0) {
      nextQuery.set('dataItemType', String(dataItemTypeValue));
    } else {
      nextQuery.delete('dataItemType');
    }

    const listTypeValue = next.listType ?? data.filters.listType;
    if (listTypeValue === 'static' || listTypeValue === 'dynamic') {
      nextQuery.set('listType', listTypeValue);
    } else {
      nextQuery.delete('listType');
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

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '15', label: '15 rows' },
    { value: '30', label: '30 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  const dataItemTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.dataItemTypes.map((itemType) => ({
            value: String(itemType.value),
            label: itemType.label
          }))
        : [],
    [data]
  );

  const createDataTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.dataItemTypes
            .filter((itemType) => itemType.value > 0)
            .map((itemType) => ({
              value: String(itemType.value),
              label: itemType.label
            }))
        : [],
    [data]
  );

  const listTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.listTypes.map((listType) => ({
            value: listType.value,
            label: listType.label
          }))
        : [],
    [data]
  );

  const submitCreateList = async () => {
    if (!data) {
      return;
    }
    const description = newListName.trim();
    const dataItemType = Number(newListDataType || 0);

    if (description === '') {
      nextToast('error', 'List name is required.');
      return;
    }
    if (!Number.isFinite(dataItemType) || dataItemType <= 0) {
      nextToast('error', 'Please choose a data type for the list.');
      return;
    }

    setCreatePending(true);
    try {
      const response = await callLegacyAjaxFunction(
        'lists:newList',
        {
          description,
          dataItemType: String(dataItemType)
        },
        data.sessionCookie
      );

      if (response.response === 'success') {
        setNewListName('');
        nextToast('success', 'List created.');
        refreshPageData();
        return;
      }
      if (response.response === 'collision') {
        nextToast('error', 'A list with this name already exists.');
        return;
      }
      if (response.response === 'badName') {
        nextToast('error', 'Please provide a valid list name.');
        return;
      }

      nextToast('error', 'Unable to create list.');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to create list.';
      nextToast('error', message);
    } finally {
      setCreatePending(false);
    }
  };

  const confirmDeleteList = async () => {
    if (!data || !deleteTarget) {
      return;
    }

    setDeletePending(true);
    setDeleteError('');
    try {
      const response = await callLegacyAjaxFunction(
        'lists:deleteList',
        {
          savedListID: String(deleteTarget.savedListID)
        },
        data.sessionCookie
      );
      if (response.response !== 'success') {
        setDeleteError('Unable to delete list.');
        return;
      }

      nextToast('success', 'List deleted.');
      setDeleteTarget(null);
      refreshPageData();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to delete list.';
      setDeleteError(message);
    } finally {
      setDeletePending(false);
    }
  };

  if (loading && !data) {
    return <div className="modern-state">Loading lists...</div>;
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
    return <EmptyState message="Lists data unavailable." />;
  }

  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const activeFilterLabels: string[] = [];
  if (data.filters.quickSearch.trim() !== '') {
    activeFilterLabels.push(`Search: "${data.filters.quickSearch.trim()}"`);
  }
  if (data.filters.dataItemType > 0) {
    const matchedType = data.options.dataItemTypes.find((itemType) => itemType.value === data.filters.dataItemType);
    if (matchedType) {
      activeFilterLabels.push(matchedType.label);
    }
  }
  if (data.filters.listType !== 'all') {
    activeFilterLabels.push(data.filters.listType === 'static' ? 'Static' : 'Dynamic');
  }

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title="Lists"
        subtitle="Manage static and dynamic recruiting lists."
        actions={
          <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="List controls">
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
                    placeholder="Search list name or owner"
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
                      dataItemType: 0,
                      listType: 'all',
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
                label="Data Type"
                value={String(data.filters.dataItemType)}
                options={dataItemTypeOptions}
                onChange={(value) => navigateWithFilters({ dataItemType: Number(value), page: 1 })}
                className="modern-command-field"
              />
              <SelectMenu
                label="List Type"
                value={data.filters.listType}
                options={listTypeOptions}
                onChange={(value) => navigateWithFilters({ listType: value as 'all' | 'static' | 'dynamic', page: 1 })}
                className="modern-command-field"
              />
            </div>

            {data.meta.permissions.canCreateList ? (
              <div className="modern-command-bar__row modern-command-bar__row--filters">
                <label className="modern-command-field">
                  <span className="modern-command-label">New List Name</span>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(event) => setNewListName(event.target.value)}
                    style={{ width: '100%', minHeight: 42 }}
                    placeholder="List name"
                  />
                </label>
                <SelectMenu
                  label="Create For"
                  value={newListDataType}
                  options={createDataTypeOptions}
                  onChange={(value) => setNewListDataType(value)}
                  className="modern-command-field"
                />
                <div className="modern-command-actions modern-command-actions--primary">
                  <button
                    type="button"
                    className="modern-btn modern-btn--secondary"
                    onClick={submitCreateList}
                    disabled={createPending}
                  >
                    {createPending ? 'Creating...' : 'Create List'}
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
                  <div className="modern-command-active__empty">No active filters. Showing all available lists.</div>
                )}
              </div>
            </div>
          </section>

          <div className="modern-table-animated avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">
                Lists {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
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
                { key: 'name', title: 'Name' },
                { key: 'type', title: 'Data Type' },
                { key: 'mode', title: 'List Type' },
                { key: 'entries', title: 'Entries' },
                { key: 'owner', title: 'Owner' },
                { key: 'modified', title: 'Modified' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={hasRows}
              emptyMessage="No lists match the current filters."
            >
              {data.rows.map((row) => (
                <tr key={row.savedListID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.showURL)}>
                      {toDisplayText(row.description)}
                    </a>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                      #{row.savedListID}
                      {row.listAccessRestricted ? ' | Restricted Access' : ''}
                    </div>
                  </td>
                  <td>{toDisplayText(row.dataItemTypeLabel)}</td>
                  <td>{toDisplayText(row.listTypeLabel)}</td>
                  <td>{row.numberEntries}</td>
                  <td>{toDisplayText(row.ownerName)}</td>
                  <td>{toDisplayText(row.dateModified, row.dateCreated)}</td>
                  <td>
                    <div className="modern-table-actions">
                      <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.showURL)}>
                        Open
                      </a>
                      {row.canDelete ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--danger"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(row);
                          }}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </PageContainer>

      <ConfirmActionModal
        isOpen={deleteTarget !== null}
        title="Delete List"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.description}" with ${deleteTarget.numberEntries} entries?`
            : ''
        }
        confirmLabel="Delete"
        pending={deletePending}
        error={deleteError}
        onCancel={() => {
          if (!deletePending) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
        onConfirm={confirmDeleteList}
      />

      <MutationToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
