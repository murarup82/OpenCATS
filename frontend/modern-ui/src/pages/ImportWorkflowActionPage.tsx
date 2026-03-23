import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ImportWorkflowActionKey = 'viewpending' | 'viewerrors' | 'revert' | 'importbulkresumes' | 'deletebulkresumes';

type ImportWorkflowCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  statusMessage: string;
};

const ACTION_COPY: Record<ImportWorkflowActionKey, ImportWorkflowCopy> = {
  viewpending: {
    title: 'Import Pending Review',
    subtitle: 'Opening the modern import launcher for pending import work.',
    panelTitle: 'Import Launcher Redirect',
    panelSubtitle: 'The modern import launcher is the correct entry point for this workflow.',
    statusMessage: 'Redirecting to the modern import launcher...'
  },
  viewerrors: {
    title: 'Import Error Review',
    subtitle: 'Review import errors in an embedded legacy workspace.',
    panelTitle: 'Import Error Workspace',
    panelSubtitle: 'Legacy import error review remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy import error workspace...'
  },
  revert: {
    title: 'Revert Import Batch',
    subtitle: 'Redirecting to the legacy import revert workflow.',
    panelTitle: 'Import Revert Redirect',
    panelSubtitle: 'This action still runs through the legacy import flow.',
    statusMessage: 'Redirecting to the legacy import revert endpoint...'
  },
  importbulkresumes: {
    title: 'Import Bulk Resumes',
    subtitle: 'Redirecting to the legacy bulk resume import workflow.',
    panelTitle: 'Bulk Resume Import Redirect',
    panelSubtitle: 'This action still runs through the legacy bulk import flow.',
    statusMessage: 'Redirecting to the legacy bulk resume import endpoint...'
  },
  deletebulkresumes: {
    title: 'Delete Bulk Resumes',
    subtitle: 'Redirecting to the legacy bulk resume cleanup workflow.',
    panelTitle: 'Bulk Resume Cleanup Redirect',
    panelSubtitle: 'This action still runs through the legacy bulk cleanup flow.',
    statusMessage: 'Redirecting to the legacy bulk resume cleanup endpoint...'
  }
};

function normalizeAction(value: string): ImportWorkflowActionKey | '' {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized in ACTION_COPY ? (normalized as ImportWorkflowActionKey) : '';
}

export function ImportWorkflowActionPage({ bootstrap }: Props) {
  const actionKey = useMemo(() => normalizeAction(bootstrap.targetAction), [bootstrap.targetAction]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const modernImportURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=import&a=import`),
    [bootstrap.indexName]
  );
  const embeddedLegacyURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();
  const copy = actionKey ? ACTION_COPY[actionKey] : null;

  useEffect(() => {
    if (actionKey === 'viewpending') {
      window.location.replace(modernImportURL);
      return;
    }

    if (actionKey === 'revert' || actionKey === 'importbulkresumes' || actionKey === 'deletebulkresumes') {
      window.location.assign(legacyURL);
    }
  }, [actionKey, legacyURL, modernImportURL]);

  if (!copy || actionKey === '') {
    return (
      <div className="avel-dashboard-page">
        <PageContainer
          title="Import Workflow"
          subtitle="Unsupported import workflow action."
          actions={
            <>
              <a className="modern-btn modern-btn--secondary" href={modernImportURL}>
                Back To Import
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </>
          }
        >
          <div className="modern-dashboard avel-dashboard-shell">
            <section className="avel-list-panel">
              <div className="modern-state modern-state--error">Unsupported import workflow action.</div>
            </section>
          </div>
        </PageContainer>
      </div>
    );
  }

  const isEmbedMode = actionKey === 'viewerrors';
  const pageActions = isEmbedMode ? (
    <>
      <a className="modern-btn modern-btn--secondary" href={modernImportURL}>
        Back To Import
      </a>
      <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
        Reload
      </button>
      <a className="modern-btn modern-btn--secondary" href={legacyURL}>
        Open Legacy UI
      </a>
    </>
  ) : (
    <>
      <a className="modern-btn modern-btn--secondary" href={modernImportURL}>
        Back To Import
      </a>
      <a className="modern-btn modern-btn--secondary" href={legacyURL}>
        Open Legacy UI
      </a>
    </>
  );

  return (
    <div className="avel-dashboard-page">
      <PageContainer title={copy.title} subtitle={copy.subtitle} actions={pageActions}>
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
                <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
              </div>
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            {isEmbedMode ? (
              <div className="modern-compat-page__actions">
                <a className="modern-btn modern-btn--secondary" href={modernImportURL}>
                  Back To Import
                </a>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                  Reload
                </button>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            ) : null}

            <div className="modern-compat-page__frame-wrap">
              {isEmbedMode && frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading legacy import workspace...
                </div>
              ) : null}
              {isEmbedMode ? (
                <iframe
                  key={frameReloadToken}
                  title={`${copy.title} legacy workspace`}
                  className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                  src={embeddedLegacyURL}
                  onLoad={handleFrameLoad}
                />
              ) : (
                <section className="avel-list-panel">
                  <div className="modern-state">{copy.statusMessage}</div>
                </section>
              )}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
