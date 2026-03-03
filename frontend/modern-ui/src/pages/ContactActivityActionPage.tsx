import { useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
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
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
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

  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

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
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">Contact Activity Workspace</h2>
                <p className="modern-compat-page__subtitle">Native action wrapper for contact activity and event scheduling.</p>
              </div>
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={fullModeURL}>
                Full Mode
              </a>
              <a className="modern-btn modern-btn--secondary" href={scheduleOnlyURL}>
                Schedule-Only Mode
              </a>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload
              </button>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
            </div>

            <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading contact activity workspace...
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`Contact activity ${contactID}`}
                className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                src={embeddedURL}
                onLoad={handleFrameLoad}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
