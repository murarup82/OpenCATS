import { useEffect, useMemo, useState } from 'react';
import { fetchJobOrderCompanyContextModernData } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { JobOrderCompanyContextModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value ?? '').trim();
  return normalized === '' ? fallback : normalized;
}

export function JobOrderCompanyContextActionPage({ bootstrap }: Props) {
  const companyID = useMemo(() => Number(new URLSearchParams(window.location.search).get('companyID') || 0), []);
  const [data, setData] = useState<JobOrderCompanyContextModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const addJobOrderURL = useMemo(
    () =>
      companyID > 0
        ? ensureModernUIURL(`${bootstrap.indexName}?m=joborders&a=add&companyID=${companyID}`)
        : ensureModernUIURL(`${bootstrap.indexName}?m=joborders&a=add`),
    [bootstrap.indexName, companyID]
  );

  useEffect(() => {
    if (!Number.isFinite(companyID) || companyID <= 0) {
      setLoading(false);
      setError('Missing or invalid companyID.');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');
    fetchJobOrderCompanyContextModernData(bootstrap, companyID)
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
        setError(err instanceof Error ? err.message : 'Unable to load company context.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, companyID]);

  if (loading && !data) {
    return <div className="modern-state">Loading company context...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Company context is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Company Context"
        subtitle="Job order defaults for selected company."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={addJobOrderURL}>
              Open Add Job Order
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
              <h2 className="avel-list-panel__title">Location Defaults</h2>
              <span className="modern-chip modern-chip--info">Company #{data.meta.companyID}</span>
            </div>
            <div className="modern-state">
              City: <strong>{toDisplayText(data.location.city)}</strong> | State:{' '}
              <strong>{toDisplayText(data.location.state)}</strong>
            </div>
          </section>

          <section className="modern-command-grid modern-command-grid--dual">
            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Contacts</h3>
                <span className="modern-chip modern-chip--info">{data.contacts.length}</span>
              </div>
              {data.contacts.length === 0 ? (
                <div className="modern-state">No contacts mapped for this company.</div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {data.contacts.map((contact) => (
                    <article key={`context-contact-${contact.value}`} className="avel-list-panel" style={{ background: '#f9fcff' }}>
                      <div className="avel-list-panel__header">
                        <h4 className="avel-list-panel__title">{toDisplayText(contact.label)}</h4>
                        <span className="modern-chip modern-chip--info">#{toDisplayText(contact.value)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Departments</h3>
                <span className="modern-chip modern-chip--info">{data.departments.items.length}</span>
              </div>
              {data.departments.items.length === 0 ? (
                <div className="modern-state">No departments mapped for this company.</div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {data.departments.items.map((department) => (
                    <article
                      key={`context-department-${department.departmentID}`}
                      className="avel-list-panel"
                      style={{ background: '#f9fcff' }}
                    >
                      <div className="avel-list-panel__header">
                        <h4 className="avel-list-panel__title">{toDisplayText(department.name)}</h4>
                        <span className="modern-chip modern-chip--info">#{department.departmentID}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="modern-state" style={{ marginTop: '8px' }}>
                CSV: <strong>{toDisplayText(data.departments.csv, '(empty)')}</strong>
              </div>
            </article>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
