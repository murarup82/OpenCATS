import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardModernData } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingState } from '../components/states/LoadingState';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { StatChip } from '../components/primitives/StatChip';
import { DataTable } from '../components/primitives/DataTable';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function DashboardMyReadOnlyPage({ bootstrap }: Props) {
  const [data, setData] = useState<DashboardModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchDashboardModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load data');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, query]);

  if (loading) {
    return <LoadingState message="Loading dashboard data..." />;
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
    return <EmptyState message="No data available." />;
  }

  return (
    <PageContainer
      title="My Dashboard"
      subtitle="Read-only modern migration slice"
      actions={
        <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
          Open Legacy UI
        </a>
      }
    >
      <div className="modern-dashboard">
        <div className="modern-summary">
          <StatChip>Rows: {data.meta.totalRows}</StatChip>
          <StatChip>
            Page: {data.meta.page} / {data.meta.totalPages}
          </StatChip>
          <StatChip>Read-only modern view</StatChip>
        </div>

        <DataTable
          columns={[
            { key: 'candidate', title: 'Candidate' },
            { key: 'jobOrder', title: 'Job Order' },
            { key: 'company', title: 'Company' },
            { key: 'status', title: 'Status' },
            { key: 'lastUpdated', title: 'Last Updated' }
          ]}
          hasRows={data.rows.length > 0}
          emptyMessage="No rows for this selection."
        >
          {data.rows.map((row) => (
            <tr key={`${row.candidateID}-${row.jobOrderID}-${row.statusID}`}>
              <td>
                <a href={row.candidateURL}>{row.candidateName}</a>
              </td>
              <td>
                <a href={row.jobOrderURL}>{row.jobOrderTitle}</a>
              </td>
              <td>{row.companyName || '--'}</td>
              <td>{row.statusLabel || '--'}</td>
              <td>{row.lastStatusChangeDisplay || '--'}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </PageContainer>
  );
}
