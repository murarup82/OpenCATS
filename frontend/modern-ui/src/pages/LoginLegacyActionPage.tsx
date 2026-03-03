import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function LoginLegacyActionPage({ bootstrap }: Props) {
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(legacyURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Authentication Redirect"
        subtitle={`Completing ${bootstrap.targetModule || 'login'}.${bootstrap.targetAction || 'action'} in legacy-auth flow.`}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Continuing authentication...</div>
            <div className="modern-table-actions" style={{ marginTop: '12px' }}>
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

