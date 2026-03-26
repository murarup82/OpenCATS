import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { assignCandidateToJobOrder, fetchJobOrderAssignCandidateData } from '../../lib/api';
import type { JobOrderAssignCandidateModernDataResponse, UIModeBootstrap } from '../../types';
import { Modal } from '../../ui-core';

type JobOrderOption = {
  jobOrderID: number;
  title: string;
  companyName: string;
};

type Props = {
  isOpen: boolean;
  bootstrap: UIModeBootstrap;
  jobOrders: JobOrderOption[];
  initialJobOrderID?: number;
  initialCandidateQuery?: string;
  onClose: () => void;
  onAssigned: (message: string) => void;
};

function toStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

export function QuickAssignModal({
  isOpen,
  bootstrap,
  jobOrders,
  initialJobOrderID,
  initialCandidateQuery,
  onClose,
  onAssigned
}: Props) {
  const [joFilter, setJoFilter] = useState('');
  const [selectedJobOrderID, setSelectedJobOrderID] = useState(0);
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidateData, setCandidateData] = useState<JobOrderAssignCandidateModernDataResponse | null>(null);
  const [selectedCandidateID, setSelectedCandidateID] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [confirmRequired, setConfirmRequired] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the job order ID that triggered the last search so debounce doesn't
  // re-fire after a job order change already triggered an immediate search.
  const lastSearchedJobOrderRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const preferredID = Number(initialJobOrderID || 0);
    const hasPreferred = preferredID > 0 && jobOrders.some((jo) => Number(jo.jobOrderID) === preferredID);
    setJoFilter('');
    setSelectedJobOrderID(hasPreferred ? preferredID : 0);
    setCandidateQuery(toStr(initialCandidateQuery).trim());
    setCandidateData(null);
    setSelectedCandidateID(0);
    setLoadingCandidates(false);
    setPending(false);
    setError('');
    setConfirmRequired(false);
    setConfirmMessage('');
    lastSearchedJobOrderRef.current = 0;
  }, [isOpen, initialJobOrderID, initialCandidateQuery, jobOrders]);

  const visibleJobOrders = useMemo(() => {
    const q = joFilter.trim().toLowerCase();
    const sorted = [...jobOrders].sort((a, b) => {
      const cmp = toStr(a.companyName).localeCompare(toStr(b.companyName), undefined, { sensitivity: 'base' });
      return cmp !== 0 ? cmp : toStr(a.title).localeCompare(toStr(b.title), undefined, { sensitivity: 'base' });
    });
    return q ? sorted.filter((jo) => `${toStr(jo.title)} ${toStr(jo.companyName)}`.toLowerCase().includes(q)) : sorted;
  }, [jobOrders, joFilter]);

  const searchCandidates = useCallback(
    async (jobOrderID: number, query: string) => {
      if (jobOrderID <= 0) return;
      const sourceURL = `${bootstrap.indexName}?m=joborders&a=considerCandidateSearch&jobOrderID=${encodeURIComponent(String(jobOrderID))}`;
      setLoadingCandidates(true);
      setError('');
      setCandidateData(null);
      setSelectedCandidateID(0);
      try {
        const payload = await fetchJobOrderAssignCandidateData(bootstrap, sourceURL, query);
        setCandidateData(payload);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load candidates.');
      } finally {
        setLoadingCandidates(false);
      }
    },
    [bootstrap]
  );

  // Immediate search when job order changes
  useEffect(() => {
    if (!isOpen) return;
    if (selectedJobOrderID <= 0) {
      setCandidateData(null);
      setSelectedCandidateID(0);
      lastSearchedJobOrderRef.current = 0;
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    lastSearchedJobOrderRef.current = selectedJobOrderID;
    void searchCandidates(selectedJobOrderID, candidateQuery);
    // candidateQuery intentionally excluded — job order change triggers immediate search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedJobOrderID, searchCandidates]);

  // Debounced search when candidate query changes
  useEffect(() => {
    if (!isOpen || selectedJobOrderID <= 0) return;
    // Skip if this effect fired because of a job order change (already searched above)
    if (lastSearchedJobOrderRef.current !== selectedJobOrderID) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      void searchCandidates(selectedJobOrderID, candidateQuery);
    }, 350);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [isOpen, candidateQuery, selectedJobOrderID, searchCandidates]);

  const submitAssign = async (forceConfirm: boolean) => {
    if (!candidateData || selectedCandidateID <= 0) return;
    setPending(true);
    setError('');
    try {
      const result = await assignCandidateToJobOrder(candidateData.actions.addToPipelineURL, {
        candidateID: selectedCandidateID,
        jobOrderID: Number(candidateData.meta.jobOrderID || 0),
        securityToken: candidateData.actions.securityToken || '',
        confirmReapplyRejected: forceConfirm,
        assignmentStatusID: undefined
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
      setError(result.message || 'Unable to add candidate to job order.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to add candidate to job order.');
    } finally {
      setPending(false);
    }
  };

  const selectedJobOrder = jobOrders.find((jo) => Number(jo.jobOrderID) === selectedJobOrderID);
  const hasRows = (candidateData?.rows || []).length > 0;
  const canAssign = !loadingCandidates && !pending && selectedCandidateID > 0 && selectedJobOrderID > 0;

  return (
    <Modal
      isOpen={isOpen}
      title="Quick Assign"
      onClose={onClose}
      size="lg"
      closeOnEscape={!pending}
      closeOnBackdrop={!pending}
      footer={
        <>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          {confirmRequired ? (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              disabled={!canAssign}
              onClick={() => {
                setConfirmRequired(false);
                void submitAssign(true);
              }}
            >
              {pending ? 'Assigning...' : 'Re-Assign Anyway'}
            </button>
          ) : (
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              disabled={!canAssign}
              onClick={() => void submitAssign(false)}
            >
              {pending ? 'Assigning...' : 'Assign to Pipeline'}
            </button>
          )}
        </>
      }
    >
      <div className="avel-quick-assign">
        {jobOrders.length === 0 ? (
          <div className="modern-state modern-state--warning">
            No job orders are available in the current scope. Switch to &ldquo;All Jobs&rdquo; or broaden your filters to see more.
          </div>
        ) : (
          <div className="avel-quick-assign__layout">
            {/* ── Job Order Panel ── */}
            <div className="avel-quick-assign__panel avel-quick-assign__panel--jobs">
              <div className="avel-quick-assign__panel-head">
                <span className="avel-quick-assign__step-badge">1</span>
                <span className="avel-quick-assign__panel-label">Select Job Order</span>
              </div>

              {selectedJobOrder ? (
                <div className="avel-quick-assign__selection">
                  <span className="avel-quick-assign__selection-title">{toStr(selectedJobOrder.title)}</span>
                  <span className="avel-quick-assign__selection-meta">{toStr(selectedJobOrder.companyName) || 'No customer'}</span>
                </div>
              ) : null}

              <span className="modern-command-search avel-quick-assign__panel-search">
                <span className="modern-command-search__shell">
                  <input
                    type="search"
                    value={joFilter}
                    onChange={(e) => setJoFilter(e.target.value)}
                    placeholder="Filter by title or customer…"
                    aria-label="Filter job orders"
                  />
                </span>
              </span>

              <div className="avel-quick-assign__count">
                {visibleJobOrders.length} job order{visibleJobOrders.length !== 1 ? 's' : ''}
              </div>

              <div className="avel-quick-assign__list" role="listbox" aria-label="Job orders">
                {visibleJobOrders.length === 0 ? (
                  <div className="avel-quick-assign__empty">No job orders match.</div>
                ) : (
                  visibleJobOrders.map((jo) => {
                    const isSelected = Number(jo.jobOrderID) === selectedJobOrderID;
                    return (
                      <button
                        key={jo.jobOrderID}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`avel-quick-assign__item${isSelected ? ' is-selected' : ''}`}
                        onClick={() => setSelectedJobOrderID(Number(jo.jobOrderID))}
                      >
                        <span className="avel-quick-assign__item-title">{toStr(jo.title)}</span>
                        <span className="avel-quick-assign__item-meta">{toStr(jo.companyName) || 'No customer'}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Candidate Panel ── */}
            <div className={`avel-quick-assign__panel avel-quick-assign__panel--candidates${selectedJobOrderID <= 0 ? ' is-locked' : ''}`}>
              <div className="avel-quick-assign__panel-head">
                <span className="avel-quick-assign__step-badge">2</span>
                <span className="avel-quick-assign__panel-label">
                  {selectedJobOrderID > 0
                    ? `Candidates for: ${toStr(selectedJobOrder?.title) || 'selected job order'}`
                    : 'Search Candidate'}
                </span>
              </div>

              <span className="modern-command-search avel-quick-assign__panel-search">
                <span className="modern-command-search__shell">
                  <input
                    type="search"
                    value={candidateQuery}
                    onChange={(e) => setCandidateQuery(e.target.value)}
                    placeholder="Filter by name…"
                    aria-label="Filter candidates"
                    disabled={selectedJobOrderID <= 0 || pending}
                  />
                </span>
              </span>

              {loadingCandidates ? <div className="modern-state">Searching candidates…</div> : null}

              {!loadingCandidates && selectedJobOrderID > 0 && !candidateData ? (
                <div className="avel-quick-assign__empty">Loading candidates…</div>
              ) : null}

              {!loadingCandidates && candidateData && !hasRows ? (
                <div className="avel-quick-assign__empty">No candidates found for this search.</div>
              ) : null}

              {selectedJobOrderID <= 0 ? (
                <div className="avel-quick-assign__locked-hint">
                  Select a job order on the left to search candidates.
                </div>
              ) : null}

              {hasRows ? (
                <div className="avel-quick-assign__list" role="listbox" aria-label="Candidates">
                  {(candidateData?.rows || []).map((row) => {
                    const candidateID = Number(row.candidateID || 0);
                    const isSelected = candidateID === selectedCandidateID;
                    const isAssigned = !!row.inPipeline;
                    return (
                      <button
                        key={candidateID}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`avel-quick-assign__item${isSelected ? ' is-selected' : ''}${isAssigned ? ' is-assigned' : ''}`}
                        onClick={() => !isAssigned && setSelectedCandidateID(candidateID)}
                        disabled={pending || isAssigned || candidateID <= 0}
                      >
                        <span className="avel-quick-assign__item-title">{row.fullName || `Candidate #${candidateID}`}</span>
                        <span className="avel-quick-assign__item-meta">
                          {row.city && row.state
                            ? `${row.city}, ${row.state}`
                            : row.city || row.state || 'Location not set'}
                          {row.ownerName ? ` · ${row.ownerName}` : ''}
                        </span>
                        {row.keySkills ? (
                          <span className="avel-quick-assign__item-skills">{row.keySkills}</span>
                        ) : null}
                        {isAssigned ? (
                          <span className="avel-quick-assign__badge">Already in pipeline</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {error !== '' ? <div className="modern-state modern-state--error">{error}</div> : null}
        {confirmRequired && confirmMessage !== '' ? (
          <div className="modern-state modern-state--warning">{confirmMessage}</div>
        ) : null}
      </div>
    </Modal>
  );
}
