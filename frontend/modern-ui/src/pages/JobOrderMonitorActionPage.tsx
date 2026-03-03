import { useEffect, useMemo, useState } from 'react';
import { setJobOrderMonitored } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ExecutionState = 'pending' | 'success' | 'error';

function buildActionBaseURL(indexName: string, jobOrderID: number, currentURLRaw: string): string {
  const query = new URLSearchParams();
  query.set('m', 'joborders');
  query.set('a', 'setMonitoredJobOrder');
  query.set('jobOrderID', String(jobOrderID));
  if (currentURLRaw.trim() !== '') {
    query.set('currentURL', currentURLRaw.trim());
  }
  return `${indexName}?${query.toString()}`;
}

function toSafeReturnURL(indexName: string, currentURLRaw: string): string {
  const fallback = ensureModernUIURL(`${indexName}?m=joborders&a=listByView`);
  const raw = String(currentURLRaw || '').trim();
  if (raw === '') {
    return fallback;
  }

  try {
    if (raw.startsWith('m=')) {
      return ensureModernUIURL(`${indexName}?${raw}`);
    }

    const parsed = new URL(raw, window.location.href);
    if (parsed.origin !== window.location.origin) {
      return fallback;
    }
    return ensureModernUIURL(`${parsed.pathname}${parsed.search}${parsed.hash}`);
  } catch (_error) {
    if (raw.startsWith('?m=')) {
      return ensureModernUIURL(`${indexName}${raw}`);
    }
    return fallback;
  }
}

export function JobOrderMonitorActionPage({ bootstrap }: Props) {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const jobOrderID = useMemo(() => Number(query.get('jobOrderID') || 0), [query]);
  const requestedValue = useMemo(() => String(query.get('value') || '').trim().toLowerCase(), [query]);
  const currentURLRaw = useMemo(() => query.get('currentURL') || '', [query]);
  const desiredState = useMemo(() => ['1', 'true', 'yes', 'y', 'on'].includes(requestedValue), [requestedValue]);
  const returnURL = useMemo(() => toSafeReturnURL(bootstrap.indexName, currentURLRaw), [bootstrap.indexName, currentURLRaw]);
  const actionBaseURL = useMemo(
    () => buildActionBaseURL(bootstrap.indexName, jobOrderID, currentURLRaw),
    [bootstrap.indexName, currentURLRaw, jobOrderID]
  );
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  const [executionState, setExecutionState] = useState<ExecutionState>('pending');
  const [message, setMessage] = useState('Applying monitor preference...');

  useEffect(() => {
    let mounted = true;
    if (!Number.isFinite(jobOrderID) || jobOrderID <= 0) {
      setExecutionState('error');
      setMessage('Missing or invalid jobOrderID.');
      return;
    }

    setExecutionState('pending');
    setMessage('Applying monitor preference...');
    setJobOrderMonitored(actionBaseURL, { state: desiredState })
      .then((result) => {
        if (!mounted) {
          return;
        }
        if (!result.success) {
          setExecutionState('error');
          setMessage(result.message || 'Unable to update monitor setting.');
          return;
        }
        setExecutionState('success');
        setMessage(result.message || 'Monitor setting updated.');
      })
      .catch((err: unknown) => {
        if (!mounted) {
          return;
        }
        setExecutionState('error');
        setMessage(err instanceof Error ? err.message : 'Unable to update monitor setting.');
      });

    return () => {
      mounted = false;
    };
  }, [actionBaseURL, desiredState, jobOrderID]);

  useEffect(() => {
    if (executionState !== 'success') {
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.assign(returnURL);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [executionState, returnURL]);

  if (executionState === 'error' && message === 'Missing or invalid jobOrderID.') {
    return <ErrorState message={message} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Job Order Monitor"
        subtitle={`Job Order #${jobOrderID > 0 ? jobOrderID : '--'} | ${desiredState ? 'Enable' : 'Disable'} monitor`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={returnURL}>
              Back To Previous View
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">{message}</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              {executionState === 'pending' ? (
                <button type="button" className="modern-btn modern-btn--secondary" disabled>
                  Updating...
                </button>
              ) : null}
              {executionState === 'success' ? (
                <a className="modern-btn modern-btn--secondary" href={returnURL}>
                  Continue
                </a>
              ) : null}
              {executionState === 'error' ? (
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => {
                    setExecutionState('pending');
                    setMessage('Retrying monitor update...');
                    void setJobOrderMonitored(actionBaseURL, { state: desiredState })
                      .then((result) => {
                        if (!result.success) {
                          setExecutionState('error');
                          setMessage(result.message || 'Unable to update monitor setting.');
                          return;
                        }
                        setExecutionState('success');
                        setMessage(result.message || 'Monitor setting updated.');
                      })
                      .catch((err: unknown) => {
                        setExecutionState('error');
                        setMessage(err instanceof Error ? err.message : 'Unable to update monitor setting.');
                      });
                  }}
                >
                  Retry
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
