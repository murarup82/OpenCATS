import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { fetchImportDeleteBulkResumesModernMutation, fetchImportBulkResumesModernMutation } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
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

type ImportWorkflowActionMode = 'modern-redirect' | 'legacy-redirect' | 'endpoint-forward';

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
    mode: 'endpoint-forward',
    title: 'Import Error Review',
    subtitle: 'Forward import errors to the legacy workspace without embedding a frame.',
    panelTitle: 'Import Error Review Forward',
    panelSubtitle: 'Legacy import error review remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy import error review workspace...'
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
    mode: 'endpoint-forward',
    title: 'Import Select Type',
    subtitle: 'Forward the legacy import type selector without embedding a frame.',
    panelTitle: 'Import Select Type Forward',
    panelSubtitle: 'Legacy import type selection remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy import type selector...'
  },
  importuploadresume: {
    mode: 'endpoint-forward',
    title: 'Import Upload Resume',
    subtitle: 'Forward the legacy resume upload flow without embedding a frame.',
    panelTitle: 'Import Upload Resume Forward',
    panelSubtitle: 'Legacy resume upload remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy resume upload workspace...'
  },
  massimport: {
    mode: 'endpoint-forward',
    title: 'Mass Import',
    subtitle: 'Forward the legacy mass import workspace without embedding a frame.',
    panelTitle: 'Mass Import Forward',
    panelSubtitle: 'Legacy mass import remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy mass import workspace...'
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
    mode: 'endpoint-forward',
    title: 'Mass Import Edit',
    subtitle: 'Forward the legacy mass import edit workspace without embedding a frame.',
    panelTitle: 'Mass Import Edit Forward',
    panelSubtitle: 'Legacy mass import editing remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy mass import edit workspace...'
  },
  showmassimport: {
    mode: 'endpoint-forward',
    title: 'Show Mass Import',
    subtitle: 'Forward the legacy mass import review workspace without embedding a frame.',
    panelTitle: 'Show Mass Import Forward',
    panelSubtitle: 'Legacy mass import review remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy mass import review workspace...'
  },
  whatisbulkresumes: {
    mode: 'endpoint-forward',
    title: 'What Is Bulk Resumes',
    subtitle: 'Forward the legacy bulk resumes help workspace without embedding a frame.',
    panelTitle: 'Bulk Resumes Help Forward',
    panelSubtitle: 'Legacy bulk resumes help remains available while parity migration continues.',
    statusMessage: 'Forwarding to the legacy bulk resumes help workspace...'
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

  const isForwardPanel = copy?.mode === 'endpoint-forward' || copy?.mode === 'legacy-redirect';
  const pageActions = (
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
          <section className={`modern-compat-page${isForwardPanel ? ' modern-compat-page--forward' : ''}`}>
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
                <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
              </div>
              {isForwardPanel ? <div className="modern-compat-page__meta">legacy_forward=1</div> : null}
            </header>

            {isForwardPanel ? (
              <div className="modern-compat-page__actions">
                <a className="modern-btn modern-btn--secondary" href={modernImportURL}>
                  Back To Import
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                  Open In New Tab
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            ) : null}

            <div className="modern-compat-page__frame-wrap">
              <section className="avel-list-panel">
                <div
                  className={`modern-state${forwardError !== '' ? ' modern-state--error' : ''}`}
                  role={forwardError !== '' ? 'alert' : undefined}
                  aria-live="polite"
                >
                  {forwardError !== '' ? forwardError : copy.statusMessage}
                </div>
                {isForwardPanel ? (
                  <p className="reports-workflow-forward__note">
                    The redirect keeps the legacy import workflow available while the native shell finishes loading.
                  </p>
                ) : null}
              </section>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
