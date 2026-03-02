import { useEffect, useState } from 'react';
import { fetchKpisDetailsModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { KpisDetailsModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function KpisDetailsPage({ bootstrap }: Props) {
  const [data, setData] = useState<KpisDetailsModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchKpisDetailsModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load KPI details.');
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

  const goToPage = (page: number) => {
    const next = new URLSearchParams(serverQueryString);
    next.set('m', 'kpis');
    next.set('a', 'details');
    next.set('page', String(page));
    applyServerQuery(next);
  };

  if (loading && !data) {
    return <div className="modern-state">Loading KPI details...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="KPI detail data is unavailable." />;
  }

  const currentPage = data.meta.page;
  const totalPages = data.meta.totalPages;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="KPI Details"
        subtitle={`${data.state.detailTitle} | ${data.state.detailRangeLabel}`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.backURL}>
              Back to KPIs
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.rows.length === 0 ? (
            <EmptyState message="No results found." />
          ) : (
            <section className="avel-list-panel">
              <div className="modern-table-actions" style={{ marginBottom: '8px' }}>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary modern-btn--mini"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Prev
                </button>
                <span className="modern-state">Page {currentPage} / {totalPages}</span>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary modern-btn--mini"
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    {data.state.detailMode === 'status' ? <th>Job Order</th> : null}
                    <th>{data.state.detailMode === 'status' ? 'Status Date' : 'Created'}</th>
                    {data.state.detailMode === 'status' ? null : <th>Source</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={`detail-${row.candidateID}-${row.jobOrderID || 0}-${row.statusDate || row.created || ''}`}>
                      <td>
                        <a className="modern-link" href={`${bootstrap.indexName}?m=candidates&a=show&candidateID=${row.candidateID}&ui=modern`}>
                          {row.candidateName}
                        </a>
                      </td>
                      {data.state.detailMode === 'status' ? (
                        <td>
                          {row.jobOrderID ? (
                            <a className="modern-link" href={`${bootstrap.indexName}?m=joborders&a=show&jobOrderID=${row.jobOrderID}&ui=modern`}>
                              {row.jobOrderTitle}
                            </a>
                          ) : (
                            row.jobOrderTitle || '--'
                          )}
                        </td>
                      ) : null}
                      <td>{data.state.detailMode === 'status' ? (row.statusDate || '--') : (row.created || '--')}</td>
                      {data.state.detailMode === 'status' ? null : <td>{row.source || '--'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
