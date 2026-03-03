import { useEffect, useState } from 'react';
import { fetchImportLauncherModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { DataTable } from '../components/primitives/DataTable';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { ImportLauncherModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function ImportLauncherPage({ bootstrap }: Props) {
  const [data, setData] = useState<ImportLauncherModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchImportLauncherModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load import launcher.');
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
    return <div className="modern-state">Loading import launcher...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Import launcher is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Import Data"
        subtitle="Import workspace entry point, pending import review, and bulk resume management."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.selectTypeURL}>
              Start Import
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.viewPendingURL}>
              View Pending
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {!data.permissions.canImport ? (
            <ErrorState
              message="You do not have permission to import data."
              actionLabel="Open Legacy UI"
              actionURL={data.actions.legacyURL}
            />
          ) : (
            <>
              <section className="avel-kpi-grid" style={{ marginBottom: '10px' }}>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Pending Imports</p>
                  <p className="avel-kpi__value">{data.summary.pendingImportsCount}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Bulk Resumes</p>
                  <p className="avel-kpi__value">{data.summary.bulkResumeCount}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Bulk Size (KB)</p>
                  <p className="avel-kpi__value">{data.summary.bulkFileSizeKB}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Bulk First Seen</p>
                  <p className="avel-kpi__value">{data.summary.firstBulkCreatedDate || '--'}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Bulk Last Seen</p>
                  <p className="avel-kpi__value">{data.summary.lastBulkCreatedDate || '--'}</p>
                </article>
              </section>

              <section className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Import Actions</h3>
                </div>
                <div className="modern-table-actions">
                  <a className="modern-btn modern-btn--secondary" href={data.actions.selectTypeURL}>
                    Open Import Type Selector
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={data.actions.massImportURL}>
                    Mass Import
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={data.actions.importBulkResumesURL}>
                    Rescan Bulk Resumes
                  </a>
                  {data.permissions.canManageBulkResumes ? (
                    <a className="modern-btn modern-btn--secondary" href={data.actions.deleteBulkResumesURL}>
                      Delete Bulk Resumes
                    </a>
                  ) : null}
                </div>
                <p className="modern-state" style={{ marginTop: '8px' }}>
                  Import upload and commit forms still run through legacy endpoints; this launcher modernizes access and review.
                </p>
              </section>

              <section className="avel-list-panel" style={{ marginTop: '10px' }}>
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Pending Imports</h3>
                </div>
                <DataTable
                  columns={[
                    { key: 'id', title: 'Import ID' },
                    { key: 'module', title: 'Module' },
                    { key: 'created', title: 'Created' },
                    { key: 'added', title: 'Added Rows' },
                    { key: 'actions', title: 'Actions' }
                  ]}
                  hasRows={data.pendingImports.length > 0}
                  emptyMessage="No pending imports in the recent window."
                >
                  {data.pendingImports.map((row) => (
                    <tr key={`import-${row.importID}`}>
                      <td>{row.importID}</td>
                      <td>{row.moduleName}</td>
                      <td>{row.dateCreated}</td>
                      <td>{row.addedLines}</td>
                      <td>
                        <div className="modern-table-actions">
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={row.viewErrorsURL}>
                            View Errors
                          </a>
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={row.revertURL}>
                            Revert
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </section>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
