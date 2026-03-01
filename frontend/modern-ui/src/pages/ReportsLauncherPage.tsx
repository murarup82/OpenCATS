import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchReportsLauncherModernData } from '../lib/api';
import type { ReportsLauncherModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function metricRows(block: {
  toDate: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  lastYear: number;
}) {
  return [
    ['To Date', block.toDate],
    ['Today', block.today],
    ['Yesterday', block.yesterday],
    ['This Week', block.thisWeek],
    ['Last Week', block.lastWeek],
    ['This Month', block.thisMonth],
    ['Last Month', block.lastMonth],
    ['This Year', block.thisYear],
    ['Last Year', block.lastYear]
  ];
}

export function ReportsLauncherPage({ bootstrap }: Props) {
  const [data, setData] = useState<ReportsLauncherModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(window.location.search);
    fetchReportsLauncherModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load reports workspace.');
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, reloadToken]);

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshPageData);

  if (loading && !data) {
    return <div className="modern-state">Loading reports workspace...</div>;
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
    return <EmptyState message="Reports workspace unavailable." />;
  }

  const metricPanels = [
    { key: 'companies', title: 'Companies', block: data.statistics.companies },
    { key: 'candidates', title: 'Candidates', block: data.statistics.candidates },
    { key: 'contacts', title: 'Contacts', block: data.statistics.contacts },
    { key: 'jobOrders', title: 'Job Orders', block: data.statistics.jobOrders },
    { key: 'submissions', title: 'Submissions', block: data.statistics.submissions },
    { key: 'hires', title: 'Hires', block: data.statistics.hires }
  ];

  return (
    <div className="avel-dashboard-page avel-joborder-show-page">
      <PageContainer
        title="Reports"
        subtitle="Native launchpad for reporting workflows with legacy-safe deep links."
        actions={
          <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-joborder-show-split">
            {data.launchers.map((launcher) => (
              <div className="avel-list-panel" key={launcher.id}>
                <div className="avel-list-panel__header">
                  <h2 className="avel-list-panel__title">{launcher.title}</h2>
                </div>
                <p className="avel-list-panel__hint" style={{ marginBottom: '12px' }}>
                  {launcher.description}
                </p>
                <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(launcher.url)}>
                  Open
                </a>
              </div>
            ))}
          </section>

          <section className="avel-joborder-show-grid">
            {metricPanels.map((panel) => (
              <div className="avel-list-panel" key={panel.key}>
                <div className="avel-list-panel__header">
                  <h2 className="avel-list-panel__title">{panel.title}</h2>
                </div>
                <DataTable
                  columns={[
                    { key: 'range', title: 'Range' },
                    { key: 'count', title: 'Count' }
                  ]}
                  hasRows={true}
                >
                  {metricRows(panel.block).map(([label, value]) => (
                    <tr key={`${panel.key}:${label}`}>
                      <td>{label}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ))}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
