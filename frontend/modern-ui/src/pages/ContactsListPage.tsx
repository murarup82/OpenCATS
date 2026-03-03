import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchContactsListModernData } from '../lib/api';
import type { ContactsListModernDataResponse, UIModeBootstrap } from '../types';
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
  onlyMyContacts?: boolean;
  onlyHotContacts?: boolean;
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

function toBooleanString(value: boolean): string {
  return value ? '1' : '0';
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

export function ContactsListPage({ bootstrap }: Props) {
  const [data, setData] = useState<ContactsListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchContactsListModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load contacts.');
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
    nextQuery.set('m', 'contacts');
    nextQuery.set('a', 'listByView');

    const quickSearchValue = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
    if (quickSearchValue === '') {
      nextQuery.delete('wildCardString');
    } else {
      nextQuery.set('wildCardString', quickSearchValue);
    }

    const onlyMyContacts = typeof next.onlyMyContacts === 'boolean' ? next.onlyMyContacts : data.filters.onlyMyContacts;
    const onlyHotContacts = typeof next.onlyHotContacts === 'boolean' ? next.onlyHotContacts : data.filters.onlyHotContacts;
    nextQuery.set('onlyMyContacts', toBooleanString(onlyMyContacts));
    nextQuery.set('onlyHotContacts', toBooleanString(onlyHotContacts));

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

  if (loading && !data) {
    return <div className="modern-state">Loading contacts...</div>;
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
    return <EmptyState message="No contacts available." />;
  }

  const filters = data.filters;
  const permissions = data.meta.permissions;
  const activeFilterLabels: string[] = [];
  if (filters.quickSearch.trim() !== '') {
    activeFilterLabels.push(`Search: "${filters.quickSearch.trim()}"`);
  }
  if (filters.onlyMyContacts) {
    activeFilterLabels.push('Only My Contacts');
  }
  if (filters.onlyHotContacts) {
    activeFilterLabels.push('Only Hot Contacts');
  }

  const hasRows = data.rows.length > 0;
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title="Contacts"
        subtitle="Modern contact workspace with Avel styling."
        actions={
          <>
            {permissions.canAddContact ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.addContactURL)}>
                Add Contact
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Contact controls">
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
                    placeholder="Search by name, company, title, city, phone"
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
                      onlyMyContacts: false,
                      onlyHotContacts: false,
                      page: 1
                    });
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyMyContacts}
                  onChange={(event) => navigateWithFilters({ onlyMyContacts: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only My Contacts</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyHotContacts}
                  onChange={(event) => navigateWithFilters({ onlyHotContacts: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only Hot Contacts</span>
              </label>

              {permissions.canShowColdCallList ? (
                <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.coldCallListURL)}>
                  Cold Call List
                </a>
              ) : null}
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div
                  className={`modern-command-active__count${activeFilterLabels.length > 0 ? ' is-active' : ''}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
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
                  <div className="modern-command-active__empty">No active filters. Showing full contacts list.</div>
                )}
              </div>
            </div>
          </section>

          {data.state.errorMessage.trim() !== '' ? (
            <div className="modern-state modern-state--error" style={{ marginTop: '10px' }}>
              {data.state.errorMessage}
            </div>
          ) : null}

          <div className="modern-table-animated avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">
                Contacts {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
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
                { key: 'company', title: 'Company' },
                { key: 'title', title: 'Title' },
                { key: 'contact', title: 'Contact' },
                { key: 'owner', title: 'Owner' },
                { key: 'updated', title: 'Updated' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={hasRows}
              emptyMessage="No contacts match the current filters."
            >
              {data.rows.map((row) => (
                <tr key={row.contactID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.showURL)}>
                      {toDisplayText(row.fullName)}
                    </a>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                      {row.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                      {row.leftCompany ? <span className="modern-chip modern-chip--critical" style={{ marginLeft: 6 }}>Left Company</span> : null}
                    </div>
                  </td>
                  <td>
                    {row.companyID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(row.companyURL)}>
                        {toDisplayText(row.companyName)}
                      </a>
                    ) : (
                      toDisplayText(row.companyName)
                    )}
                  </td>
                  <td>{toDisplayText(row.title)}</td>
                  <td>
                    {toDisplayText(row.phone)}
                    {row.email.trim() !== '' ? (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>{row.email}</div>
                    ) : null}
                  </td>
                  <td>{toDisplayText(row.ownerName)}</td>
                  <td>{toDisplayText(row.dateModified, row.dateCreated)}</td>
                  <td>
                    <div className="modern-table-actions">
                      {permissions.canEditContact ? (
                        <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.editURL)}>
                          Edit
                        </a>
                      ) : null}
                      {permissions.canAddToList ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--secondary"
                          onClick={() => openAddToListOverlay(row.addToListURL)}
                        >
                          Add To List
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
    </div>
  );
}
