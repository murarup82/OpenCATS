import { useEffect, useState } from 'react';
import { fetchContactsColdCallListModernData } from '../lib/api';
import type { ContactsColdCallListModernDataResponse, UIModeBootstrap } from '../types';
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

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value || '').trim();
  return normalized === '' ? fallback : normalized;
}

export function ContactsColdCallListPage({ bootstrap }: Props) {
  const [data, setData] = useState<ContactsColdCallListModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchContactsColdCallListModernData(bootstrap, query)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load cold call list.');
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

  if (loading && !data) {
    return <div className="modern-state">Loading cold call list...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Cold call list unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Cold Call List"
        subtitle="Contacts with phone numbers ready for outreach."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.listURL)}>
              Back To Contacts
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
              <span className="avel-kpi__label">Total Contacts</span>
              <span className="avel-kpi__value">{data.meta.totalRows}</span>
              <span className="avel-kpi__hint">With phone numbers</span>
            </div>
          </section>

          <section className="avel-list-panel">
            <DataTable
              columns={[
                { key: 'company', title: 'Company' },
                { key: 'name', title: 'Name' },
                { key: 'title', title: 'Title' },
                { key: 'phone', title: 'Phone' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={data.rows.length > 0}
              emptyMessage="No contacts with phone numbers found."
            >
              {data.rows.map((row) => (
                <tr key={`cold-call-${row.contactID}`}>
                  <td>
                    {row.companyID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(row.companyURL)}>
                        {toDisplayText(row.companyName)}
                      </a>
                    ) : (
                      toDisplayText(row.companyName)
                    )}
                  </td>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(row.showURL)}>
                      {toDisplayText(row.fullName)}
                    </a>
                  </td>
                  <td>{toDisplayText(row.title)}</td>
                  <td>{toDisplayText(row.phoneCell)}</td>
                  <td>
                    {data.meta.permissions.canDownloadVCard ? (
                      <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(row.downloadVCardURL)}>
                        Download vCard
                      </a>
                    ) : (
                      <span className="modern-state">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
