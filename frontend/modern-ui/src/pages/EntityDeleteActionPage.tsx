import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type DeleteModule = 'candidates' | 'companies' | 'contacts' | 'joborders';

type DeleteModuleMeta = {
  idKey: string;
  title: string;
  subtitlePrefix: string;
  returnAction: string;
};

const DELETE_MODULE_META: Record<DeleteModule, DeleteModuleMeta> = {
  candidates: {
    idKey: 'candidateID',
    title: 'Delete Candidate',
    subtitlePrefix: 'Candidate',
    returnAction: 'listByView'
  },
  companies: {
    idKey: 'companyID',
    title: 'Delete Company',
    subtitlePrefix: 'Company',
    returnAction: 'listByView'
  },
  contacts: {
    idKey: 'contactID',
    title: 'Delete Contact',
    subtitlePrefix: 'Contact',
    returnAction: 'listByView'
  },
  joborders: {
    idKey: 'jobOrderID',
    title: 'Delete Job Order',
    subtitlePrefix: 'Job Order',
    returnAction: 'listByView'
  }
};

function asDeleteModule(value: string): DeleteModule | null {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'candidates' || normalized === 'companies' || normalized === 'contacts' || normalized === 'joborders') {
    return normalized;
  }
  return null;
}

function parsePositiveInt(value: string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

export function EntityDeleteActionPage({ bootstrap }: Props) {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const moduleName = useMemo(() => asDeleteModule(bootstrap.targetModule || search.get('m') || ''), [bootstrap.targetModule, search]);
  const moduleMeta = moduleName ? DELETE_MODULE_META[moduleName] : null;

  const recordID = useMemo(() => {
    if (!moduleMeta) {
      return 0;
    }
    return parsePositiveInt(search.get(moduleMeta.idKey));
  }, [moduleMeta, search]);

  const legacyDeleteURL = useMemo(() => {
    if (!moduleName || !moduleMeta || recordID <= 0) {
      return '';
    }
    return ensureUIURL(
      `${bootstrap.indexName}?m=${moduleName}&a=delete&${moduleMeta.idKey}=${recordID}`,
      'legacy'
    );
  }, [bootstrap.indexName, moduleMeta, moduleName, recordID]);

  const returnURL = useMemo(() => {
    if (!moduleName || !moduleMeta) {
      return ensureModernUIURL(`${bootstrap.indexName}?m=home&a=home`);
    }
    return ensureModernUIURL(`${bootstrap.indexName}?m=${moduleName}&a=${moduleMeta.returnAction}`);
  }, [bootstrap.indexName, moduleMeta, moduleName]);

  useEffect(() => {
    if (legacyDeleteURL === '') {
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.assign(legacyDeleteURL);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [legacyDeleteURL]);

  if (!moduleName || !moduleMeta || recordID <= 0) {
    return (
      <ErrorState
        message="Missing required delete route parameters."
        actionLabel="Back To Workspace"
        actionURL={ensureModernUIURL(`${bootstrap.indexName}?m=home&a=home`)}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={moduleMeta.title}
        subtitle={`${moduleMeta.subtitlePrefix} #${recordID}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={returnURL}>
              Cancel
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyDeleteURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Continuing to legacy delete endpoint...</div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
