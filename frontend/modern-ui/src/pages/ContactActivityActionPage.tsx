import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function toBooleanString(value: boolean): string {
  return value ? 'true' : 'false';
}

function parseBoolean(value: string): boolean {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function buildLegacyActivityURL(indexName: string, contactID: number, onlyScheduleEvent: boolean): string {
  const query = new URLSearchParams();
  query.set('m', 'contacts');
  query.set('a', 'addActivityScheduleEvent');
  query.set('contactID', String(contactID));
  if (onlyScheduleEvent) {
    query.set('onlyScheduleEvent', 'true');
  }
  return ensureUIURL(`${indexName}?${query.toString()}`, 'legacy');
}

function buildModeURL(indexName: string, contactID: number, onlyScheduleEvent: boolean): string {
  const query = new URLSearchParams();
  query.set('m', 'contacts');
  query.set('a', 'addActivityScheduleEvent');
  query.set('contactID', String(contactID));
  query.set('onlyScheduleEvent', toBooleanString(onlyScheduleEvent));
  return ensureModernUIURL(`${indexName}?${query.toString()}`);
}

export function ContactActivityActionPage({ bootstrap }: Props) {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const contactID = useMemo(() => Number(search.get('contactID') || 0), [search]);
  const onlyScheduleEvent = useMemo(() => parseBoolean(search.get('onlyScheduleEvent') || ''), [search]);

  const legacyURL = useMemo(
    () => buildLegacyActivityURL(bootstrap.indexName, contactID, onlyScheduleEvent),
    [bootstrap.indexName, contactID, onlyScheduleEvent]
  );
  const contactURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=contacts&a=show&contactID=${contactID}`),
    [bootstrap.indexName, contactID]
  );
  const fullModeURL = useMemo(
    () => buildModeURL(bootstrap.indexName, contactID, false),
    [bootstrap.indexName, contactID]
  );
  const scheduleOnlyURL = useMemo(
    () => buildModeURL(bootstrap.indexName, contactID, true),
    [bootstrap.indexName, contactID]
  );
  const canContinue = legacyURL !== '';

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [canContinue, legacyURL]);

  if (!Number.isFinite(contactID) || contactID <= 0) {
    return (
      <ErrorState
        message="Missing or invalid contactID."
        actionLabel="Back To Contacts"
        actionURL={ensureModernUIURL(`${bootstrap.indexName}?m=contacts&a=listByView`)}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Contact Activity"
        subtitle={`Contact #${contactID} | ${onlyScheduleEvent ? 'Schedule Event Only' : 'Log Activity + Schedule Event'}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={contactURL}>
              Back To Contact
            </a>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page modern-compat-page--forward">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">Contact Activity Redirect</h2>
                <p className="modern-compat-page__subtitle">
                  The contact activity workflow now forwards to the legacy endpoint while preserving the mode links.
                </p>
              </div>
              <div className="modern-compat-page__meta">legacy_forward=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={fullModeURL}>
                Full Mode
              </a>
              <a className="modern-btn modern-btn--secondary" href={scheduleOnlyURL}>
                Schedule-Only Mode
              </a>
              {canContinue ? (
                <>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Continue to Legacy UI
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                    Open In New Tab
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Open Legacy UI
                  </a>
                </>
              ) : null}
            </div>

            <section className="avel-list-panel">
              <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`} aria-live="polite">
                {canContinue
                  ? 'Preparing legacy contact activity redirect...'
                  : 'Legacy contact activity URL is unavailable for this route.'}
              </div>
            </section>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
