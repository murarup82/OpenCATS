import { useEffect, useMemo, useState } from 'react';
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

type DeleteMutationResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  redirectURL?: string;
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

function appendQueryParam(url: string, key: string, value: string): string {
  const raw = String(url || '').trim();
  if (raw === '') {
    return raw;
  }

  try {
    const parsed = new URL(raw, window.location.href);
    parsed.searchParams.set(key, value);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch (_error) {
    const hasQuery = raw.includes('?');
    return `${raw}${hasQuery ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

export function EntityDeleteActionPage({ bootstrap }: Props) {
  const [deleteError, setDeleteError] = useState('');
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

  const legacyDeleteMutationURL = useMemo(
    () => appendQueryParam(legacyDeleteURL, 'format', 'modern-json'),
    [legacyDeleteURL]
  );

  const returnURL = useMemo(() => {
    if (!moduleName || !moduleMeta) {
      return ensureModernUIURL(`${bootstrap.indexName}?m=home&a=home`);
    }
    return ensureModernUIURL(`${bootstrap.indexName}?m=${moduleName}&a=${moduleMeta.returnAction}`);
  }, [bootstrap.indexName, moduleMeta, moduleName]);

  useEffect(() => {
    let active = true;

    if (legacyDeleteMutationURL === '') {
      return;
    }

    async function deleteEntity() {
      setDeleteError('');

      try {
        const response = await fetch(legacyDeleteMutationURL, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json'
          }
        });

        const payloadText = await response.text();
        let payload: DeleteMutationResponse | null = null;
        try {
          payload = payloadText.trim() === '' ? null : (JSON.parse(payloadText) as DeleteMutationResponse);
        } catch (_error) {
          payload = null;
        }

        if (!active) {
          return;
        }

        if (!response.ok) {
          const message = String(payload?.message || '').trim();
          throw new Error(message !== '' ? message : `Delete request failed (${response.status}).`);
        }

        if (!payload || payload.success !== true) {
          const message = String(payload?.message || '').trim();
          throw new Error(message !== '' ? message : 'Delete request did not return a success response.');
        }

        const payloadRedirect = String(payload.redirectURL || '').trim();
        window.location.assign(payloadRedirect !== '' ? ensureModernUIURL(payloadRedirect) : returnURL);
      } catch (error) {
        if (!active) {
          return;
        }
        setDeleteError(error instanceof Error ? error.message : 'Unable to complete delete action.');
      }
    }

    void deleteEntity();

    return () => {
      active = false;
    };
  }, [legacyDeleteMutationURL, returnURL]);

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
            {deleteError === '' ? (
              <div className="modern-state">Deleting record and returning to modern workspace...</div>
            ) : (
              <div className="modern-state modern-state--error" role="alert">
                {deleteError}
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
