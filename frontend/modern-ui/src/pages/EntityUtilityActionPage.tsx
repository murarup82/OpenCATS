import { useEffect, useMemo } from 'react';
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

type ModuleKey = 'candidates' | 'joborders' | 'companies' | 'lists' | 'calendar';
type ActionMode = 'embed' | 'redirect';

const CANDIDATE_ACTION_LABELS: Record<string, string> = {
  addactivitychangestatus: 'Change Pipeline Status',
  addcandidatetags: 'Manage Candidate Tags',
  addduplicates: 'Resolve Candidate Duplicates',
  addeditimage: 'Edit Candidate Image',
  addprofilecomment: 'Add Candidate Comment',
  addtopipeline: 'Add Candidate To Pipeline',
  administrativehideshow: 'Candidate Administrative Visibility',
  deleteattachment: 'Delete Candidate Attachment',
  deletemessagethread: 'Delete Candidate Message Thread',
  emailcandidates: 'Send Candidate Email',
  linkduplicate: 'Link Candidate Duplicate',
  merge: 'Merge Candidate Records',
  mergeinfo: 'Merge Candidate Information',
  postmessage: 'Post Candidate Message',
  removeduplicity: 'Remove Candidate Duplicity',
  removefrompipeline: 'Remove Candidate From Pipeline',
  savesources: 'Save Candidate Sources',
  savedlists: 'Candidate Saved Lists'
};

const JOBORDER_ACTION_LABELS: Record<string, string> = {
  addactivitychangestatus: 'Change Pipeline Status',
  addprofilecomment: 'Add Job Order Comment',
  addtopipeline: 'Add Candidate To Job Order',
  administrativehideshow: 'Job Order Administrative Visibility',
  deleteattachment: 'Delete Job Order Attachment',
  deletemessagethread: 'Delete Job Order Message Thread',
  edithiringplan: 'Edit Hiring Plan',
  postmessage: 'Post Job Order Message',
  removefrompipeline: 'Remove Candidate From Pipeline',
  setcandidatejoborder: 'Set Candidate Job Order'
};

const COMPANY_ACTION_LABELS: Record<string, string> = {
  deleteattachment: 'Delete Company Attachment'
};

const LISTS_ACTION_LABELS: Record<string, string> = {
  deletestaticlist: 'Delete List',
  removefromlistdatagrid: 'Remove From List',
  savelistaccess: 'Save List Access'
};

const CALENDAR_ACTION_LABELS: Record<string, string> = {
  deleteevent: 'Delete Calendar Event',
  dynamicdata: 'Calendar Dynamic Data'
};

function parsePositiveInt(value: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function resolveModule(value: string): ModuleKey | null {
  const normalized = String(value || '').trim().toLowerCase();
  if (
    normalized === 'candidates' ||
    normalized === 'joborders' ||
    normalized === 'companies' ||
    normalized === 'lists' ||
    normalized === 'calendar'
  ) {
    return normalized;
  }
  return null;
}

function resolveCandidateID(search: URLSearchParams): number {
  const candidateID = parsePositiveInt(search.get('candidateID'));
  if (candidateID > 0) {
    return candidateID;
  }
  const newCandidateID = parsePositiveInt(search.get('newCandidateID'));
  if (newCandidateID > 0) {
    return newCandidateID;
  }
  const oldCandidateID = parsePositiveInt(search.get('oldCandidateID'));
  if (oldCandidateID > 0) {
    return oldCandidateID;
  }
  return parsePositiveInt(search.get('duplicateCandidateID'));
}

function resolveActionLabel(moduleKey: ModuleKey, actionKey: string): string {
  if (moduleKey === 'candidates') {
    return CANDIDATE_ACTION_LABELS[actionKey] || 'Candidate Utility Action';
  }
  if (moduleKey === 'joborders') {
    return JOBORDER_ACTION_LABELS[actionKey] || 'Job Order Utility Action';
  }
  if (moduleKey === 'companies') {
    return COMPANY_ACTION_LABELS[actionKey] || 'Company Utility Action';
  }
  if (moduleKey === 'lists') {
    return LISTS_ACTION_LABELS[actionKey] || 'List Utility Action';
  }
  return CALENDAR_ACTION_LABELS[actionKey] || 'Calendar Utility Action';
}

function resolveActionMode(moduleKey: ModuleKey, actionKey: string): ActionMode {
  if (moduleKey === 'calendar' && (actionKey === 'deleteevent' || actionKey === 'dynamicdata')) {
    return 'redirect';
  }
  return 'embed';
}

function buildReturnURL(indexName: string, moduleKey: ModuleKey, search: URLSearchParams): string {
  if (moduleKey === 'candidates') {
    const candidateID = resolveCandidateID(search);
    if (candidateID > 0) {
      return ensureModernUIURL(`${indexName}?m=candidates&a=show&candidateID=${candidateID}`);
    }
    return ensureModernUIURL(`${indexName}?m=candidates&a=listByView`);
  }

  if (moduleKey === 'joborders') {
    const jobOrderID = parsePositiveInt(search.get('jobOrderID'));
    if (jobOrderID > 0) {
      return ensureModernUIURL(`${indexName}?m=joborders&a=show&jobOrderID=${jobOrderID}`);
    }
    return ensureModernUIURL(`${indexName}?m=joborders&a=listByView`);
  }

  if (moduleKey === 'companies') {
    const companyID = parsePositiveInt(search.get('companyID'));
    if (companyID > 0) {
      return ensureModernUIURL(`${indexName}?m=companies&a=show&companyID=${companyID}`);
    }
    return ensureModernUIURL(`${indexName}?m=companies&a=listByView`);
  }

  if (moduleKey === 'lists') {
    const savedListID = parsePositiveInt(search.get('savedListID'));
    if (savedListID > 0) {
      return ensureModernUIURL(`${indexName}?m=lists&a=showList&savedListID=${savedListID}`);
    }
    return ensureModernUIURL(`${indexName}?m=lists&a=listByView`);
  }

  return ensureModernUIURL(`${indexName}?m=calendar&a=showCalendar`);
}

export function EntityUtilityActionPage({ bootstrap }: Props) {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const moduleKey = useMemo(
    () => resolveModule(bootstrap.targetModule || search.get('m') || ''),
    [bootstrap.targetModule, search]
  );
  const actionKey = useMemo(
    () => String(bootstrap.targetAction || search.get('a') || '').trim().toLowerCase(),
    [bootstrap.targetAction, search]
  );
  const mode = useMemo(() => (moduleKey ? resolveActionMode(moduleKey, actionKey) : 'embed'), [actionKey, moduleKey]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const returnURL = useMemo(
    () =>
      moduleKey
        ? buildReturnURL(bootstrap.indexName, moduleKey, search)
        : ensureModernUIURL(`${bootstrap.indexName}?m=home&a=home`),
    [bootstrap.indexName, moduleKey, search]
  );
  const actionLabel = useMemo(
    () => (moduleKey ? resolveActionLabel(moduleKey, actionKey) : 'Unsupported Utility Action'),
    [actionKey, moduleKey]
  );

  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  useEffect(() => {
    if (mode !== 'redirect') {
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [legacyURL, mode]);

  if (!moduleKey) {
    return (
      <ErrorState
        message="Unsupported utility action module."
        actionLabel="Back To Dashboard"
        actionURL={ensureModernUIURL(`${bootstrap.indexName}?m=dashboard&a=my`)}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={actionLabel}
        subtitle={`Legacy-safe utility workspace for ${moduleKey} / ${actionKey}.`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={returnURL}>
              Back To Workspace
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {mode === 'redirect' ? (
            <section className="avel-list-panel">
              <div className="modern-state">Continuing to legacy action endpoint...</div>
            </section>
          ) : (
            <section className="modern-compat-page">
              <header className="modern-compat-page__header">
                <div>
                  <h2 className="modern-compat-page__title">{actionLabel}</h2>
                  <p className="modern-compat-page__subtitle">
                    Native action workspace with embedded legacy rendering.
                  </p>
                </div>
                <div className="modern-compat-page__meta">ui_embed=1</div>
              </header>

              <div className="modern-compat-page__actions">
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
                    Loading utility workspace...
                  </div>
                ) : null}
                <iframe
                  key={frameReloadToken}
                  title={`${moduleKey} ${actionKey}`}
                  className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                  src={embeddedURL}
                  onLoad={handleFrameLoad}
                />
              </div>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
