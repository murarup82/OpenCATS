import { useEffect, useState } from 'react';
import { fetchHomeOverviewModernData } from '../lib/api';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { HomeOverviewModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function HomePage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeOverviewModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const query = new URLSearchParams(window.location.search);

    fetchHomeOverviewModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load overview.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap]);

  if (loading && !data) {
    return <div className="modern-state">Loading overview...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Overview data is not available." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Overview"
        subtitle="Modern home workspace with hiring pulse, events, and quick insights."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.inboxURL}>
              My Inbox
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
          <section className="avel-list-panel">
            <div className="avel-kpi-grid" style={{ marginBottom: '12px' }}>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Recent Hires</p>
                <p className="avel-kpi__value">{data.summary.recentHiresCount}</p>
              </article>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Important Candidates</p>
                <p className="avel-kpi__value">{data.summary.importantCandidatesCount}</p>
              </article>
              <article className="avel-kpi">
                <p className="avel-kpi__label">Workspace</p>
                <p className="avel-kpi__value">
                  <a className="modern-link" href={data.actions.dashboardURL}>
                    Open Dashboard
                  </a>
                </p>
              </article>
            </div>

            <div className="modern-command-grid modern-command-grid--dual">
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Recent Hires</h3>
                </div>
                {data.recentHires.length === 0 ? (
                  <div className="modern-state">No recent hires.</div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Company</th>
                        <th>Recruiter</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentHires.map((row) => (
                        <tr key={`hire-${row.candidateID}-${row.companyID}`}>
                          <td>
                            <a className="modern-link" href={row.candidateURL}>
                              {row.candidateName}
                            </a>
                          </td>
                          <td>
                            <a className="modern-link" href={row.companyURL}>
                              {row.companyName}
                            </a>
                          </td>
                          <td>{row.recruiterName}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Upcoming Events</h3>
                </div>
                <div dangerouslySetInnerHTML={{ __html: data.events.upcomingEventsHTML || '<p>No events.</p>' }} />
                <div className="modern-divider" />
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Follow-up</h3>
                </div>
                <div dangerouslySetInnerHTML={{ __html: data.events.followUpEventsHTML || '<p>No follow-ups.</p>' }} />
              </article>
            </div>

            <div className="modern-command-grid modern-command-grid--triple" style={{ marginTop: '12px' }}>
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Hiring Overview</h3>
                </div>
                <img src={data.charts.hiringOverviewURL} alt="Hiring overview" style={{ width: '100%', height: 'auto' }} />
              </article>
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Status Funnel</h3>
                </div>
                <img src={data.charts.funnelSnapshotURL} alt="Status funnel snapshot" style={{ width: '100%', height: 'auto' }} />
              </article>
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Seniority Distribution</h3>
                </div>
                <img src={data.charts.seniorityDistributionURL} alt="Seniority distribution" style={{ width: '100%', height: 'auto' }} />
              </article>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
