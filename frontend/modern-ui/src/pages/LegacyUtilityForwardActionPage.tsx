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
  calendar: 'Calendar',
  export: 'Export',
  gdpr: 'GDPR',
  import: 'Import',
  settings: 'Settings',
  toolbar: 'Toolbar',
  wizard: 'Wizard',
  xml: 'XML'
};

function toText(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function getModuleLabel(moduleName: string): string {
  return MODULE_LABELS[moduleName] || 'Utility';
}

export function LegacyUtilityForwardActionPage({ bootstrap }: Props) {
  const moduleName = useMemo(() => toText(bootstrap.targetModule), [bootstrap.targetModule]);
  const actionName = useMemo(() => toText(bootstrap.targetAction), [bootstrap.targetAction]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const title = useMemo(() => `${getModuleLabel(moduleName)} Action`, [moduleName]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={`Completing ${moduleName || 'module'} / ${actionName || 'action'} through legacy action endpoint.`}
        actions={
          <a className="modern-btn modern-btn--secondary" href={legacyURL}>
            Continue
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Redirecting to legacy action...</div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

