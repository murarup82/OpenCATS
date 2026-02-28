import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardModernData } from '../lib/api';
import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';

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
    return <div className="modern-state">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="modern-state modern-state--error">
        <p>{error}</p>
        <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
          Open Legacy UI
        </a>
      </div>
    );
  }

  if (!data) {
    return <div className="modern-state">No data available.</div>;
  }

  return (
    <div className="modern-dashboard">
      <div className="modern-summary">
        <span className="modern-chip">Rows: {data.meta.totalRows}</span>
        <span className="modern-chip">
          Page: {data.meta.page} / {data.meta.totalPages}
        </span>
        <span className="modern-chip">Read-only modern view</span>
      </div>

      <div className="modern-table-wrap">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job Order</th>
              <th>Company</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No rows for this selection.</td>
              </tr>
            ) : (
              data.rows.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

