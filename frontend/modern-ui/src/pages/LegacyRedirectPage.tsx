import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function buildLegacyURL(rawURL: string): string {
  const url = new URL(String(rawURL || ''), window.location.href);
  url.searchParams.set('ui', 'legacy');
  return url.toString();
}

export function LegacyRedirectPage({ bootstrap }: Props) {
  const legacyURL = useMemo(() => buildLegacyURL(bootstrap.legacyURL), [bootstrap.legacyURL]);

  useEffect(() => {
    window.location.replace(legacyURL);
  }, [legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Redirecting To Legacy"
        subtitle={`Action "${bootstrap.targetModule || 'module'}.${bootstrap.targetAction || 'action'}" is redirecting.`}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Redirecting...</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Continue
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
