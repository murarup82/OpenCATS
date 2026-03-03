import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function buildLegacyDownloadURL(indexName: string, contactID: number): string {
  return ensureUIURL(`${indexName}?m=contacts&a=downloadVCard&contactID=${contactID}`, 'legacy');
}

function buildReturnURL(indexName: string, contactID: number): string {
  if (contactID > 0) {
    return ensureModernUIURL(`${indexName}?m=contacts&a=show&contactID=${contactID}`);
  }
  return ensureModernUIURL(`${indexName}?m=contacts&a=listByView`);
}

export function ContactVCardActionPage({ bootstrap }: Props) {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const contactID = useMemo(() => Number(query.get('contactID') || 0), [query]);
  const legacyDownloadURL = useMemo(
    () => buildLegacyDownloadURL(bootstrap.indexName, Number.isFinite(contactID) ? contactID : 0),
    [bootstrap.indexName, contactID]
  );
  const returnURL = useMemo(
    () => buildReturnURL(bootstrap.indexName, Number.isFinite(contactID) ? contactID : 0),
    [bootstrap.indexName, contactID]
  );

  useEffect(() => {
    if (!Number.isFinite(contactID) || contactID <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.assign(legacyDownloadURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [contactID, legacyDownloadURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Download vCard"
        subtitle={contactID > 0 ? `Contact #${contactID}` : 'Invalid contact'}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={returnURL}>
              Back To Contacts
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyDownloadURL}>
              Open Legacy Download
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">
              {contactID > 0
                ? 'Starting vCard download using the legacy export endpoint...'
                : 'Missing or invalid contactID parameter.'}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
