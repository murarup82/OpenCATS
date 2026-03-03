import { useEffect, useMemo, useState } from 'react';
import { fetchJobOrderAddPopupModernData } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import type { JobOrderAddPopupModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type AddMode = 'new' | 'existing';

function toRouteURL(rawURL: string): string {
  const normalized = ensureModernUIURL(rawURL);
  try {
    const parsed = new URL(normalized, window.location.origin);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch (_error) {
    return normalized;
  }
}

function buildCreateURL(startAddURL: string, mode: AddMode, selectedJobOrderID: number): string {
  const base = toRouteURL(startAddURL);
  try {
    const parsed = new URL(base, window.location.origin);
    parsed.searchParams.set('ui', 'modern');
    if (mode === 'existing' && selectedJobOrderID > 0) {
      parsed.searchParams.set('typeOfAdd', 'existing');
      parsed.searchParams.set('jobOrderID', String(selectedJobOrderID));
    } else {
      parsed.searchParams.delete('typeOfAdd');
      parsed.searchParams.delete('jobOrderID');
    }

    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch (_error) {
    return base;
  }
}

export function JobOrderAddActionPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrderAddPopupModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<AddMode>('new');
  const [selectedJobOrderID, setSelectedJobOrderID] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrderAddPopupModernData(bootstrap, query)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);
        setMode(payload.state.typeOfAdd === 'existing' ? 'existing' : 'new');
        setSelectedJobOrderID(Number(payload.state.selectedJobOrderID || 0));
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load add-job-order workspace.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString]);

  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  const filteredSources = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchTerm.trim().toLowerCase();
    if (query === '') {
      return data.copySources;
    }

    return data.copySources.filter((row) => {
      const haystack = `${row.title} ${row.companyName} ${row.status} ${row.label}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data, searchTerm]);

  const selectedSource = useMemo(() => {
    if (!data) {
      return null;
    }
    return data.copySources.find((row) => row.jobOrderID === selectedJobOrderID) || null;
  }, [data, selectedJobOrderID]);

  if (loading && !data) {
    return <div className="modern-state">Loading add-job-order workspace...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Add-job-order workspace unavailable." />;
  }

  const copyModeEnabled = data.copySources.length > 0;
  const effectiveMode: AddMode = copyModeEnabled ? mode : 'new';
  const createURL = buildCreateURL(data.actions.startAddURL, effectiveMode, selectedJobOrderID);
  const createDisabled = effectiveMode === 'existing' && selectedJobOrderID <= 0;
  const listURL = toRouteURL(data.actions.listURL);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Add Job Order"
        subtitle="Choose an empty form or prefill from an existing job order."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Job Orders
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Creation Mode</h2>
              <span className="modern-chip modern-chip--info">{data.state.totalCopySources} copy sources</span>
            </div>

            <div className="modern-command-grid modern-command-grid--dual">
              <label className="modern-command-toggle">
                <input
                  type="radio"
                  name="joborder-add-mode"
                  checked={effectiveMode === 'new'}
                  onChange={() => setMode('new')}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Empty Job Order</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="radio"
                  name="joborder-add-mode"
                  checked={effectiveMode === 'existing'}
                  onChange={() => setMode('existing')}
                  disabled={!copyModeEnabled}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Copy Existing Job Order</span>
              </label>
            </div>

            {effectiveMode === 'existing' ? (
              <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
                <label className="modern-command-field">
                  <span className="modern-command-label">Search Existing Job Orders</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Type title or company"
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Copy From</span>
                  <select
                    className="avel-form-control"
                    value={selectedJobOrderID > 0 ? String(selectedJobOrderID) : ''}
                    onChange={(event) => setSelectedJobOrderID(Number(event.target.value || 0))}
                  >
                    <option value="">Select a job order</option>
                    {filteredSources.map((row) => (
                      <option key={`joborder-copy-${row.jobOrderID}`} value={row.jobOrderID}>
                        {row.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedSource ? (
                  <div className="modern-state">
                    Selected: <strong>{selectedSource.title}</strong> ({selectedSource.companyName}) | Status:{' '}
                    <strong>{selectedSource.status}</strong>
                  </div>
                ) : null}

                {filteredSources.length === 0 ? (
                  <div className="modern-state">No matching job orders found for this search.</div>
                ) : null}
              </div>
            ) : null}

            <div className="modern-table-actions" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                disabled={createDisabled}
                onClick={() => window.location.assign(createURL)}
              >
                {effectiveMode === 'existing' ? 'Create From Selected Job Order' : 'Create Empty Job Order'}
              </button>
              <a className="modern-btn modern-btn--secondary" href={toRouteURL(data.actions.startAddURL)}>
                Open Add Form Directly
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
