import { useEffect, useMemo, useState } from 'react';
import { assignCandidateToJobOrder, fetchCandidateAssignToJobOrderData } from '../../lib/api';
import type { CandidateAssignToJobOrderModernDataResponse, UIModeBootstrap } from '../../types';
import { Modal } from '../../ui-core';

type Props = {
  isOpen: boolean;
  bootstrap: UIModeBootstrap;
  sourceURL: string;
  onClose: () => void;
  onAssigned: (message: string) => void;
};

export function CandidateAssignJobOrderModal({
  isOpen,
  bootstrap,
  sourceURL,
  onClose,
  onAssigned
}: Props) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRequired, setConfirmRequired] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [data, setData] = useState<CandidateAssignToJobOrderModernDataResponse | null>(null);
  const [selectedJobOrderID, setSelectedJobOrderID] = useState<number>(0);
  const [selectedStatusID, setSelectedStatusID] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setPending(false);
    setError('');
    setSearchTerm('');
    setConfirmRequired(false);
    setConfirmMessage('');
    setData(null);
    setSelectedJobOrderID(0);
    setSelectedStatusID(0);

    fetchCandidateAssignToJobOrderData(bootstrap, sourceURL)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);

        const defaultStatusID = Number(payload.meta.defaultAssignmentStatusID || 0);
        setSelectedStatusID(defaultStatusID > 0 ? defaultStatusID : 0);

        const firstAssignable = payload.options.jobOrders.find((jobOrder) => !jobOrder.isInPipeline);
        if (firstAssignable) {
          setSelectedJobOrderID(Number(firstAssignable.jobOrderID || 0));
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Unable to load job order assignments.';
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, isOpen, sourceURL]);

  const visibleJobOrders = useMemo(() => {
    const rows = data?.options.jobOrders || [];
    const query = searchTerm.trim().toLowerCase();
    if (query === '') {
      return rows;
    }
    return rows.filter((jobOrder) => {
      const searchable = `${jobOrder.title} ${jobOrder.companyName} ${jobOrder.status}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [data?.options.jobOrders, searchTerm]);

  const submitAssignment = async (forceConfirm: boolean) => {
    if (!data) {
      return;
    }

    const candidateID = Number(data.meta.singleCandidateID || 0);
    if (candidateID <= 0) {
      setError('Native assign currently supports one candidate at a time.');
      return;
    }

    if (selectedJobOrderID <= 0) {
      setError('Select a job order first.');
      return;
    }

    setPending(true);
    setError('');
    try {
      const result = await assignCandidateToJobOrder(data.actions.addToPipelineURL, {
        candidateID,
        jobOrderID: selectedJobOrderID,
        securityToken: data.actions.securityToken || '',
        confirmReapplyRejected: forceConfirm,
        assignmentStatusID: selectedStatusID > 0 ? selectedStatusID : undefined
      });

      if (result.success) {
        onAssigned(result.message || 'Candidate added to job order.');
        onClose();
        return;
      }

      if (result.code === 'requiresConfirm') {
        setConfirmRequired(true);
        setConfirmMessage(result.message || 'Candidate was previously rejected for this role. Re-assign anyway?');
        return;
      }

      setError(result.message || 'Unable to assign candidate to this job order.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to assign candidate to this job order.');
    } finally {
      setPending(false);
    }
  };

  const title = data ? `Add To Job Order: ${data.meta.candidateDisplayName}` : 'Add To Job Order';
  const canAssign = !loading && !pending && selectedJobOrderID > 0;
  const isSingleCandidate = Number(data?.meta.singleCandidateID || 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="lg"
      closeOnBackdrop={!pending}
      closeOnEscape={!pending}
      footer={
        <>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose} disabled={pending}>
            Close
          </button>
          {confirmRequired ? (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              onClick={() => {
                setConfirmRequired(false);
                void submitAssignment(true);
              }}
              disabled={!canAssign}
            >
              {pending ? 'Assigning...' : 'Re-Assign Anyway'}
            </button>
          ) : (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              onClick={() => void submitAssignment(false)}
              disabled={!canAssign || !isSingleCandidate}
            >
              {pending ? 'Assigning...' : 'Assign Candidate'}
            </button>
          )}
        </>
      }
    >
      <div className="avel-assign-job-modal">
        <p className="avel-assign-job-modal__hint">
          Pick an open job order. Assignments happen instantly and refresh the current page.
        </p>

        <label className="modern-command-search avel-assign-job-modal__search">
          <span className="modern-command-label">Search Job Orders</span>
          <span className="modern-command-search__shell">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, company, status"
              disabled={loading || pending}
            />
          </span>
        </label>

        {data?.meta.canSetStatusOnAdd ? (
          <label className="modern-command-field">
            <span className="modern-command-label">Initial Status</span>
            <select
              className="avel-form-control"
              value={selectedStatusID > 0 ? String(selectedStatusID) : ''}
              onChange={(event) => setSelectedStatusID(Number(event.target.value || 0))}
              disabled={loading || pending}
            >
              {data.options.assignmentStatuses.map((statusOption) => (
                <option key={statusOption.statusID} value={String(statusOption.statusID)}>
                  {statusOption.status}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {loading ? <div className="modern-state">Loading job orders...</div> : null}
        {error !== '' ? (
          <div className="modern-state modern-state--error">
            {error}
            {sourceURL.trim() !== '' ? (
              <a className="modern-link" href={sourceURL}>
                Open legacy assignment
              </a>
            ) : null}
          </div>
        ) : null}
        {confirmRequired && confirmMessage !== '' ? (
          <div className="modern-state modern-state--warning">{confirmMessage}</div>
        ) : null}
        {!isSingleCandidate && data ? (
          <div className="modern-state modern-state--warning">
            Multi-candidate assignment remains in legacy modal for now.
            <a className="modern-link" href={data.actions.legacyURL}>
              Open legacy assignment
            </a>
          </div>
        ) : null}

        {!loading && data && isSingleCandidate ? (
          <div className="avel-assign-job-modal__list" role="listbox" aria-label="Job order options">
            {visibleJobOrders.length === 0 ? (
              <div className="avel-assign-job-modal__empty">No matching open job orders.</div>
            ) : (
              visibleJobOrders.map((jobOrder) => {
                const isSelected = Number(jobOrder.jobOrderID) === selectedJobOrderID;
                const disabled = !!jobOrder.isInPipeline;
                return (
                  <button
                    key={jobOrder.jobOrderID}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`avel-assign-job-modal__item${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedJobOrderID(Number(jobOrder.jobOrderID))}
                    disabled={pending || disabled}
                  >
                    <span className="avel-assign-job-modal__item-title">{jobOrder.title}</span>
                    <span className="avel-assign-job-modal__item-meta">
                      {jobOrder.companyName}
                      {jobOrder.status !== '' ? ` • ${jobOrder.status}` : ''}
                    </span>
                    {disabled ? <span className="avel-assign-job-modal__badge">Already assigned</span> : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
