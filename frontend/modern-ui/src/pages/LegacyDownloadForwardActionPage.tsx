import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const MODULE_LABELS: Record<string, string> = {
  attachments: 'Attachment',
  export: 'Export',
  gdpr: 'GDPR Export',
  xml: 'XML Feed'
};

function toText(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function getTitle(moduleName: string): string {
  return MODULE_LABELS[moduleName] || 'Download';
}

export function LegacyDownloadForwardActionPage({ bootstrap }: Props) {
  const moduleName = useMemo(() => toText(bootstrap.targetModule), [bootstrap.targetModule]);
  const actionName = useMemo(() => toText(bootstrap.targetAction), [bootstrap.targetAction]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const title = useMemo(() => `${getTitle(moduleName)} Redirect`, [moduleName]);
  const canContinue = legacyURL !== '';

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [canContinue, legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={`Completing ${moduleName || 'module'} / ${actionName || 'action'} through legacy download endpoint.`}
        actions={
          canContinue ? (
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Continue
            </a>
          ) : null
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`}>
              {canContinue ? 'Preparing legacy download/export...' : 'Legacy endpoint URL is unavailable.'}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

