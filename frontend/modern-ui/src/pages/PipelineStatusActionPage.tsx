import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchPipelineStatusDetailsModernData,
  updatePipelineStatusHistoryDate
} from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { PipelineStatusDetailsModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { PipelineDetailsInlineModal } from '../components/primitives/PipelineDetailsInlineModal';
import { ErrorState } from '../components/states/ErrorState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

export function PipelineStatusActionPage({ bootstrap }: Props) {
  const pipelineID = useMemo(() => Number(new URLSearchParams(window.location.search).get('pipelineID') || 0), []);
  const [details, setDetails] = useState<PipelineStatusDetailsModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [reloadToken, setReloadToken] = useState(0);
  const actionKey = String(bootstrap.targetAction || '').toLowerCase();

  const fallbackURL = useMemo(() => {
    if (details && Number(details.meta.jobOrderID || 0) > 0) {
      return ensureModernUIURL(
        `${bootstrap.indexName}?m=joborders&a=show&jobOrderID=${details.meta.jobOrderID}`
      );
    }
    return ensureModernUIURL(`${bootstrap.indexName}?m=joborders&a=listByView`);
  }, [bootstrap.indexName, details]);

  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  useEffect(() => {
    if (!Number.isFinite(pipelineID) || pipelineID <= 0) {
      setLoading(false);
      setError('Missing pipelineID in request.');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');
    fetchPipelineStatusDetailsModernData(bootstrap, pipelineID)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setDetails(payload);
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load pipeline details.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, pipelineID, reloadToken]);

  const savePipelineHistoryDate = useCallback(
    async (
      payloadDetails: PipelineStatusDetailsModernDataResponse,
      payload: { historyID: number; newDate: string; originalDate: string; editNote: string }
    ) => {
      const editURL = decodeLegacyURL(payloadDetails.actions.editDateURL);
      if (editURL === '') {
        return 'Missing edit endpoint.';
      }
      if (String(payload.newDate || '').trim() === '') {
        return 'Please select a date.';
      }

      try {
        const result = await updatePipelineStatusHistoryDate(editURL, {
          pipelineID: payloadDetails.meta.pipelineID,
          historyID: payload.historyID,
          newDate: payload.newDate.replace('T', ' '),
          originalDate: payload.originalDate,
          editNote: payload.editNote
        });
        if (!result.success) {
          return result.message || 'Unable to update history date.';
        }

        setReloadToken((current) => current + 1);
        return null;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : 'Unable to update history date.';
      }
    },
    []
  );

  if (error !== '' && !loading && !details) {
    return (
      <ErrorState
        message={error}
        actionLabel="Open Legacy UI"
        actionURL={legacyURL}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Pipeline Status Timeline"
        subtitle={`Executing joborders action "${actionKey || '(default)'}" in native mode.`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={fallbackURL}>
              Back To Job Order
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">
              {loading
                ? 'Loading pipeline timeline...'
                : 'Pipeline timeline loaded. You can review and edit transition dates here.'}
            </div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setReloadToken((current) => current + 1)}>
                Reload Timeline
              </button>
              <a className="modern-btn modern-btn--secondary" href={fallbackURL}>
                Continue
              </a>
            </div>
          </section>
        </div>

        <PipelineDetailsInlineModal
          isOpen={true}
          title="Pipeline Details"
          details={details}
          loading={loading}
          error={error}
          onClose={() => {
            window.location.assign(fallbackURL);
          }}
          onSaveHistoryDate={savePipelineHistoryDate}
          onOpenFullDetails={
            details
              ? () => {
                  window.location.assign(ensureUIURL(decodeLegacyURL(details.actions.legacyDetailsURL), 'legacy'));
                }
              : undefined
          }
        />
      </PageContainer>
    </div>
  );
}
