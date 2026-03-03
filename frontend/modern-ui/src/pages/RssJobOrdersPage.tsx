import { useEffect, useState } from 'react';
import { fetchRssJobOrdersModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { DataTable } from '../components/primitives/DataTable';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { RssJobOrdersModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function RssJobOrdersPage({ bootstrap }: Props) {
  const [data, setData] = useState<RssJobOrdersModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchRssJobOrdersModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load RSS job orders feed.');
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

  if (loading && !data) {
    return <div className="modern-state">Loading RSS feed preview...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Feed XML" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="RSS job orders feed is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Public Job Orders RSS"
        subtitle="Preview of currently shared public job postings."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.xmlURL}>
              Open XML Feed
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.careersURL}>
              Open Careers Portal
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-kpi-grid" style={{ marginBottom: '10px' }}>
            <article className="avel-kpi">
              <p className="avel-kpi__label">Public Job Orders</p>
              <p className="avel-kpi__value">{data.summary.totalJobOrders}</p>
            </article>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h3 className="avel-list-panel__title">Feed Items</h3>
            </div>
            <DataTable
              columns={[
                { key: 'title', title: 'Title' },
                { key: 'type', title: 'Type' },
                { key: 'location', title: 'Location' },
                { key: 'publicURL', title: 'Public URL' }
              ]}
              hasRows={data.rows.length > 0}
              emptyMessage="No public job orders are currently shared."
            >
              {data.rows.map((row) => (
                <tr key={`rss-job-${row.jobOrderID}`}>
                  <td>{row.title}</td>
                  <td>{row.type}</td>
                  <td>{row.location}</td>
                  <td>
                    <a className="modern-link" href={row.publicURL}>
                      Open Listing
                    </a>
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
