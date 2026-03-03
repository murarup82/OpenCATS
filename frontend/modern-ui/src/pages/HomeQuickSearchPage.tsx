import { FormEvent, useEffect, useMemo, useState } from 'react';
import { fetchHomeQuickSearchModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { DataTable } from '../components/primitives/DataTable';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { HomeQuickSearchModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function buildSearchQuery(source: string, text: string): URLSearchParams {
  const query = new URLSearchParams(source);
  query.set('m', 'home');
  query.set('a', 'quickSearch');
  query.set('ui', 'modern');

  const normalized = String(text || '').trim();
  if (normalized === '') {
    query.delete('quickSearchFor');
  } else {
    query.set('quickSearchFor', normalized);
  }

  return query;
}

export function HomeQuickSearchPage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeQuickSearchModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchDraft, setSearchDraft] = useState<string>('');
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchHomeQuickSearchModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
        setSearchDraft(result.state.query || '');
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load quick search.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap, serverQueryString]);

  const hasResults = useMemo(() => {
    if (!data) {
      return false;
    }
    return data.summary.totalResults > 0;
  }, [data]);

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyServerQuery(buildSearchQuery(serverQueryString, searchDraft));
  };

  if (loading && !data) {
    return <div className="modern-state">Loading quick search...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Quick search is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Quick Search"
        subtitle="Cross-entity search for job orders, candidates, companies, and contacts."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.homeURL}>
              Home
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.inboxURL}>
              Inbox
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.myNotesURL}>
              My Notes
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky">
            <form onSubmit={onSubmitSearch} className="modern-command-bar__row modern-command-bar__row--primary modern-command-bar__row--primary-noscope">
              <label className="modern-command-field" style={{ minWidth: '340px', flex: 1 }}>
                <span className="modern-command-label">Search Text</span>
                <input
                  type="text"
                  value={searchDraft}
                  placeholder="Search candidates, companies, contacts, job orders..."
                  onChange={(event) => setSearchDraft(event.target.value)}
                />
              </label>
              <button type="submit" className="modern-btn modern-btn--primary">
                Search
              </button>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => {
                  setSearchDraft('');
                  applyServerQuery(buildSearchQuery(serverQueryString, ''));
                }}
              >
                Clear
              </button>
            </form>
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className={`modern-command-active__count${hasResults ? ' is-active' : ''}`} aria-live="polite">
                {data.state.query.trim() === ''
                  ? 'Enter search text to run quick search.'
                  : `${data.summary.totalResults} results for "${data.state.query.trim()}".`}
              </div>
            </div>
          </section>

          <section className="avel-kpi-grid" style={{ marginBottom: '10px' }}>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Job Orders</p>
              <p className="avel-kpi__value">{data.summary.jobOrdersCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Candidates Active</p>
              <p className="avel-kpi__value">{data.summary.activeCandidatesCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Candidates Inactive</p>
              <p className="avel-kpi__value">{data.summary.inactiveCandidatesCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Companies</p>
              <p className="avel-kpi__value">{data.summary.companiesCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Contacts</p>
              <p className="avel-kpi__value">{data.summary.contactsCount}</p>
            </article>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Total</p>
              <p className="avel-kpi__value">{data.summary.totalResults}</p>
            </article>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">Job Orders</h3>
            </div>
            <DataTable
              columns={[
                { key: 'title', title: 'Title' },
                { key: 'company', title: 'Company' },
                { key: 'type', title: 'Type' },
                { key: 'status', title: 'Status' },
                { key: 'start', title: 'Start' },
                { key: 'owner', title: 'Owner' }
              ]}
              hasRows={data.jobOrders.length > 0}
              emptyMessage="No matching job orders."
            >
              {data.jobOrders.map((row) => (
                <tr key={`job-${row.jobOrderID}`}>
                  <td>
                    <a className="modern-link" href={row.showURL}>
                      {row.title}
                    </a>
                  </td>
                  <td>
                    <a className="modern-link" href={row.companyURL}>
                      {row.companyName}
                    </a>
                  </td>
                  <td>{row.type}</td>
                  <td>{row.status}</td>
                  <td>{row.startDate}</td>
                  <td>{row.ownerName}</td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="modern-command-grid modern-command-grid--dual" style={{ marginTop: '10px' }}>
            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Active Candidates</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'candidate', title: 'Candidate' },
                  { key: 'skills', title: 'Key Skills' },
                  { key: 'phone', title: 'Cell' },
                  { key: 'owner', title: 'Owner' }
                ]}
                hasRows={data.candidates.active.length > 0}
                emptyMessage="No matching active candidates."
              >
                {data.candidates.active.map((row) => (
                  <tr key={`active-candidate-${row.candidateID}`}>
                    <td>
                      <a className="modern-link" href={row.showURL}>
                        {row.fullName}
                      </a>
                    </td>
                    <td>{row.keySkills}</td>
                    <td>{row.phoneCell}</td>
                    <td>{row.ownerName}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Inactive Candidates</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'candidate', title: 'Candidate' },
                  { key: 'skills', title: 'Key Skills' },
                  { key: 'phone', title: 'Cell' },
                  { key: 'owner', title: 'Owner' }
                ]}
                hasRows={data.candidates.inactive.length > 0}
                emptyMessage="No matching inactive candidates."
              >
                {data.candidates.inactive.map((row) => (
                  <tr key={`inactive-candidate-${row.candidateID}`}>
                    <td>
                      <a className="modern-link" href={row.showURL}>
                        {row.fullName}
                      </a>
                    </td>
                    <td>{row.keySkills}</td>
                    <td>{row.phoneCell}</td>
                    <td>{row.ownerName}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </section>

          <section className="modern-command-grid modern-command-grid--dual" style={{ marginTop: '10px' }}>
            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Companies</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'name', title: 'Company' },
                  { key: 'phone', title: 'Phone' },
                  { key: 'owner', title: 'Owner' },
                  { key: 'created', title: 'Created' }
                ]}
                hasRows={data.companies.length > 0}
                emptyMessage="No matching companies."
              >
                {data.companies.map((row) => (
                  <tr key={`company-${row.companyID}`}>
                    <td>
                      <a className="modern-link" href={row.showURL}>
                        {row.name}
                      </a>
                    </td>
                    <td>{row.phone}</td>
                    <td>{row.ownerName}</td>
                    <td>{row.dateCreated}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Contacts</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'name', title: 'Contact' },
                  { key: 'title', title: 'Title' },
                  { key: 'company', title: 'Company' },
                  { key: 'phone', title: 'Phone' }
                ]}
                hasRows={data.contacts.length > 0}
                emptyMessage="No matching contacts."
              >
                {data.contacts.map((row) => (
                  <tr key={`contact-${row.contactID}`}>
                    <td>
                      <a className="modern-link" href={row.showURL}>
                        {row.fullName}
                      </a>
                    </td>
                    <td>{row.title}</td>
                    <td>
                      <a className="modern-link" href={row.companyURL}>
                        {row.companyName}
                      </a>
                    </td>
                    <td>{row.phoneCell}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
