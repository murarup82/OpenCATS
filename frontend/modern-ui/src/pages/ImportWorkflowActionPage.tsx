import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { fetchImportDeleteBulkResumesModernMutation, fetchImportBulkResumesModernMutation } from '../lib/api';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ImportWorkflowActionKey =
  | 'viewpending'
  | 'viewerrors'
  | 'revert'
  | 'importbulkresumes'
  | 'deletebulkresumes'
  | 'importselecttype'
  | 'importuploadresume'
  | 'massimport'
  | 'massimportdocument'
  | 'massimportedit'
  | 'showmassimport'
  | 'whatisbulkresumes';

type ImportWorkflowActionMode = 'modern-redirect' | 'legacy-redirect' | 'endpoint-forward' | 'embed';

type ImportWorkflowActionCopy = {
  mode: ImportWorkflowActionMode;
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  statusMessage: string;
};

const ACTION_COPY: Record<ImportWorkflowActionKey, ImportWorkflowActionCopy> = {
  viewpending: {
    mode: 'modern-redirect',
    title: 'Import Pending Review',
    subtitle: 'Opening the modern import launcher for pending import work.',
    panelTitle: 'Import Launcher Redirect',
    panelSubtitle: 'The modern import launcher is the correct entry point for this workflow.',
    statusMessage: 'Redirecting to the modern import launcher...'
  },
  viewerrors: {
    mode: 'embed',
    title: 'Import Error Review',
    subtitle: 'Review import errors in an embedded legacy workspace.',
    panelTitle: 'Import Error Workspace',
    panelSubtitle: 'Legacy import error review remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy import error workspace...'
  },
  revert: {
    mode: 'endpoint-forward',
    title: 'Revert Import Batch',
    subtitle: 'Forwarding to the legacy import revert endpoint.',
    panelTitle: 'Import Revert Forward',
    panelSubtitle: 'This action forwards to the legacy import endpoint without embedding a frame.',
    statusMessage: 'Forwarding to the legacy import revert endpoint...'
  },
  importbulkresumes: {
    mode: 'endpoint-forward',
    title: 'Import Bulk Resumes',
    subtitle: 'Forwarding the bulk resume rescan workflow without embedding the legacy frame.',
    panelTitle: 'Bulk Resume Rescan Forward',
    panelSubtitle: 'This action runs the bulk resume import contract, then continues into mass import.',
    statusMessage: 'Preparing bulk resume rescan and forwarding to mass import...'
  },
  deletebulkresumes: {
    mode: 'endpoint-forward',
    title: 'Delete Bulk Resumes',
    subtitle: 'Forwarding bulk resume cleanup through the legacy endpoint without embedding a frame.',
    panelTitle: 'Bulk Resume Cleanup Forward',
    panelSubtitle: 'This action runs the bulk resume delete contract, then returns to the import launcher.',
    statusMessage: 'Preparing bulk resume cleanup and forwarding to the import launcher...'
  },
  importselecttype: {
    mode: 'embed',
    title: 'Import Select Type',
    subtitle: 'Open the legacy import type selector in an embedded workspace.',
    panelTitle: 'Import Select Type Workspace',
    panelSubtitle: 'Legacy import type selection remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy import type selector...'
  },
  importuploadresume: {
    mode: 'embed',
    title: 'Import Upload Resume',
    subtitle: 'Open the legacy resume upload flow in an embedded workspace.',
    panelTitle: 'Import Upload Resume Workspace',
    panelSubtitle: 'Legacy resume upload remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy resume upload workspace...'
  },
  massimport: {
    mode: 'embed',
    title: 'Mass Import',
    subtitle: 'Open the legacy mass import workspace in embedded mode.',
    panelTitle: 'Mass Import Workspace',
    panelSubtitle: 'Legacy mass import remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy mass import workspace...'
  },
  massimportdocument: {
    mode: 'legacy-redirect',
    title: 'Mass Import Document',
    subtitle: 'Redirecting to the legacy mass import document endpoint.',
    panelTitle: 'Mass Import Document Redirect',
    panelSubtitle: 'This action still runs through the legacy import flow.',
    statusMessage: 'Redirecting to the legacy mass import document endpoint...'
  },
  massimportedit: {
    mode: 'embed',
    title: 'Mass Import Edit',
    subtitle: 'Open the legacy mass import edit workspace in embedded mode.',
    panelTitle: 'Mass Import Edit Workspace',
    panelSubtitle: 'Legacy mass import editing remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy mass import edit workspace...'
  },
  showmassimport: {
    mode: 'embed',
    title: 'Show Mass Import',
    subtitle: 'Open the legacy mass import review workspace in embedded mode.',
    panelTitle: 'Show Mass Import Workspace',
    panelSubtitle: 'Legacy mass import review remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy mass import review workspace...'
  },
  whatisbulkresumes: {
    mode: 'embed',
    title: 'What Is Bulk Resumes',
    subtitle: 'Open the legacy bulk resumes help workspace in embedded mode.',
    panelTitle: 'Bulk Resumes Help Workspace',
    panelSubtitle: 'Legacy bulk resumes help remains embedded while parity migration continues.',
    statusMessage: 'Loading embedded legacy bulk resumes help workspace...'
  }
};

function normalizeAction(value: string): ImportWorkflowActionKey | '' {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized in ACTION_COPY ? (normalized as ImportWorkflowActionKey) : '';
}

export function ImportWorkflowActionPage({ bootstrap }: Props) {
  const actionKey = useMemo(() => normalizeAction(bootstrap.targetAction), [bootstrap.targetAction]);
  const [forwardError, setForwardError] = useState<string>('');
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const modernImportURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=import&a=import`),
    [bootstrap.indexName]
  );
  const embeddedLegacyURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();
  const copy = actionKey ? ACTION_COPY[actionKey] : null;

  useEffect(() => {
    let mounted = true;

    if (actionKey === 'viewpending') {
      window.location.replace(modernImportURL);
      return;
    }

    if (actionKey === 'importbulkresumes') {
      void (async () => {
        try {
          setForwardError('');
          const result = await fetchImportBulkResumesModernMutation(bootstrap);
          if (!mounted) {
            return;
          }

          if (!result.success) {
            throw new Error(String(result.message || 'Unable to prepare bulk resume import.'));
          }

          const redirectURL = ensureUIURL(String(result.redirectURL || legacyURL), 'legacy');
          window.location.replace(redirectURL);
        } catch (error) {
          if (!mounted) {
            return;
          }
          setForwardError(error instanceof Error ? error.message : 'Unable to prepare bulk resume import.');
        }
      })();

      return () => {
        mounted = false;
      };
    }

    if (actionKey === 'deletebulkresumes') {
      void (async () => {
        try {
          setForwardError('');
          const result = await fetchImportDeleteBulkResumesModernMutation(bootstrap);
          if (!mounted) {
            return;
          }

          if (!result.success) {
            throw new Error(String(result.message || 'Unable to delete bulk resume documents.'));
          }

          const redirectURL = ensureModernUIURL(String(result.redirectURL || modernImportURL));
          window.location.replace(redirectURL);
        } catch (error) {
          if (!mounted) {
            return;
          }
          setForwardError(error instanceof Error ? error.message : 'Unable to delete bulk resume documents.');
        }
      })();

      return () => {
        mounted = false;
      };
    }

    if (copy?.mode === 'endpoint-forward') {
      const timer = window.setTimeout(() => {
        window.location.assign(legacyURL);
      }, 80);

      return () => {
        mounted = false;
        window.clearTimeout(timer);
      };
    }

    if (copy?.mode === 'legacy-redirect') {
      window.location.assign(legacyURL);
    }

    return () => {
      mounted = false;
    };
  }, [actionKey, bootstrap, copy, legacyURL, modernImportURL]);

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

  const isEmbedMode = copy?.mode === 'embed';
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
                    <div className={`modern-state${forwardError !== '' ? ' modern-state--error' : ''}`} role={forwardError !== '' ? 'alert' : undefined}>
                      {forwardError !== '' ? forwardError : copy.statusMessage}
                    </div>
                  </section>
                )}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
