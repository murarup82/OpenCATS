import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function toPositiveInt(value: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

export function CompaniesInternalPostingsActionPage({ bootstrap }: Props) {
  const [error, setError] = useState('');

  const resolveURL = useMemo(
    () => ensureUIURL(`${bootstrap.indexName}?m=companies&a=internalPostings`, 'legacy'),
    [bootstrap.indexName]
  );
  const fallbackURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=companies&a=listByView`),
    [bootstrap.indexName]
  );

  useEffect(() => {
    let active = true;

    async function resolveInternalPostingsTarget() {
      try {
        const response = await fetch(resolveURL, {
          credentials: 'same-origin',
          redirect: 'follow'
        });
        if (!response.ok) {
          throw new Error(`Unable to resolve default company (${response.status}).`);
        }

        const finalURL = response.url || resolveURL;
        const parsed = new URL(finalURL, window.location.href);
        const companyID = toPositiveInt(parsed.searchParams.get('companyID'));
        if (companyID > 0) {
          window.location.replace(
            ensureModernUIURL(`${bootstrap.indexName}?m=companies&a=show&companyID=${companyID}`)
          );
          return;
        }

        window.location.replace(resolveURL);
      } catch (err: unknown) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to resolve My Company route.');
      }
    }

    void resolveInternalPostingsTarget();
    return () => {
      active = false;
    };
  }, [bootstrap.indexName, resolveURL]);

  if (error !== '') {
    return (
      <ErrorState
        message={error}
        actionLabel="Open Legacy UI"
        actionURL={resolveURL}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="My Company"
        subtitle="Resolving default company and opening modern company profile."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={fallbackURL}>
              Back To Companies
            </a>
            <a className="modern-btn modern-btn--secondary" href={resolveURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Resolving default company...</div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
