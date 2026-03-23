import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function ReportsJobOrderPdfActionPage({ bootstrap }: Props) {
  const reportsURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=reports&a=reports`),
    [bootstrap.indexName]
  );
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  useEffect(() => {
    if (legacyURL === '') {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Generate Job Order Report PDF"
        subtitle="Forwarding to the legacy PDF download endpoint."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={reportsURL}>
              Back To Reports
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Preparing legacy PDF download...</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Continue Download
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
