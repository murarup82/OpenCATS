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

type StatusFacet = {
  key: string;
  label: string;
  count: number;
  rank: number;
};

function getJobOrderStatusRank(status: string): number {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'active') {
    return 0;
  }
  if (normalized === 'on hold' || normalized === 'onhold') {
    return 1;
  }
  if (normalized === 'full') {
    return 2;
  }
  if (normalized === 'closed') {
    return 3;
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 4;
  }
  return 5;
}

function getJobOrderStatusClass(status: string): string {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'active') {
    return 'avel-assign-job-modal__status--active';
  }
  if (normalized === 'on hold' || normalized === 'onhold') {
    return 'avel-assign-job-modal__status--onhold';
  }
  if (normalized === 'full') {
    return 'avel-assign-job-modal__status--full';
  }
  if (normalized === 'closed') {
    return 'avel-assign-job-modal__status--closed';
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'avel-assign-job-modal__status--cancelled';
  }
  return 'avel-assign-job-modal__status--default';
}

function formatOpeningsLabel(openingsAvailable: number): string {
  if (openingsAvailable === 1) {
    return '1 opening';
  }
  return `${openingsAvailable} openings`;
}

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [includeAssigned, setIncludeAssigned] = useState<boolean>(false);
  const [onlyWithOpenings, setOnlyWithOpenings] = useState<boolean>(false);

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
    setStatusFilter('all');
    setIncludeAssigned(false);
    setOnlyWithOpenings(false);

    fetchCandidateAssignToJobOrderData(bootstrap, sourceURL)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setData(payload);

        const defaultStatusID = Number(payload.meta.defaultAssignmentStatusID || 0);
        const fallbackStatusID = Number(payload.options.assignmentStatuses[0]?.statusID || 0);
        setSelectedStatusID(defaultStatusID > 0 ? defaultStatusID : fallbackStatusID);

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

  const statusFacets = useMemo<StatusFacet[]>(() => {
    const counts = new Map<string, StatusFacet>();
    for (const row of data?.options.jobOrders || []) {
      const normalizedStatus = String(row.status || '').trim();
      const statusKey = normalizedStatus.toLowerCase() || 'unknown';
      const existing = counts.get(statusKey);
      if (existing) {
        existing.count += 1;
        continue;
      }
      counts.set(statusKey, {
        key: statusKey,
        label: normalizedStatus || 'Unknown',
        count: 1,
        rank: getJobOrderStatusRank(normalizedStatus)
      });
    }

    return Array.from(counts.values()).sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }
      return left.label.localeCompare(right.label, undefined, { sensitivity: 'base' });
    });
  }, [data?.options.jobOrders]);

  const visibleJobOrders = useMemo(() => {
    const rows = [...(data?.options.jobOrders || [])].sort((left, right) => {
      const rankDiff = getJobOrderStatusRank(left.status) - getJobOrderStatusRank(right.status);
      if (rankDiff !== 0) {
        return rankDiff;
      }
      const openingsDiff = Number(right.openingsAvailable || 0) - Number(left.openingsAvailable || 0);
      if (openingsDiff !== 0) {
        return openingsDiff;
      }
      return String(left.title || '').localeCompare(String(right.title || ''), undefined, { sensitivity: 'base' });
    });

    const query = searchTerm.trim().toLowerCase();
    return rows.filter((jobOrder) => {
      if (!includeAssigned && jobOrder.isInPipeline) {
        return false;
      }
      if (onlyWithOpenings && Number(jobOrder.openingsAvailable || 0) <= 0) {
        return false;
      }
      if (statusFilter !== 'all') {
        const statusKey = String(jobOrder.status || '').trim().toLowerCase() || 'unknown';
        if (statusKey !== statusFilter) {
          return false;
        }
      }
      if (query === '') {
        return true;
      }
      const searchable = `${jobOrder.title} ${jobOrder.companyName} ${jobOrder.status}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [data?.options.jobOrders, includeAssigned, onlyWithOpenings, searchTerm, statusFilter]);

  useEffect(() => {
    if (!isOpen || !data) {
      return;
    }
    const selectedVisibleRow = visibleJobOrders.find((row) => Number(row.jobOrderID) === selectedJobOrderID);
    if (selectedVisibleRow && !selectedVisibleRow.isInPipeline) {
      return;
    }
    const firstAssignable = visibleJobOrders.find((row) => !row.isInPipeline);
    setSelectedJobOrderID(firstAssignable ? Number(firstAssignable.jobOrderID || 0) : 0);
  }, [data, isOpen, selectedJobOrderID, visibleJobOrders]);

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
  const selectedJobOrder =
    visibleJobOrders.find((jobOrder) => Number(jobOrder.jobOrderID) === selectedJobOrderID) || null;
  const allJobOrderCount = data?.options.jobOrders.length || 0;
  const assignableVisibleCount = visibleJobOrders.filter((jobOrder) => !jobOrder.isInPipeline).length;
  const selectedStatusLabel = useMemo(() => {
    if (!data) {
      return 'Allocated';
    }
    const options = data.options.assignmentStatuses || [];
    if (options.length === 0) {
      return 'Allocated';
    }
    const selected = options.find((statusOption) => Number(statusOption.statusID) === selectedStatusID);
    if (selected && String(selected.status || '').trim() !== '') {
      return selected.status;
    }
    const defaultStatusID = Number(data.meta.defaultAssignmentStatusID || 0);
    const fallback =
      options.find((statusOption) => Number(statusOption.statusID) === defaultStatusID) || options[0] || null;
    return fallback && String(fallback.status || '').trim() !== '' ? fallback.status : 'Allocated';
  }, [data, selectedStatusID]);

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
        <div className="avel-assign-job-modal__intro">
          <p className="avel-assign-job-modal__hint">
            Pick a job order and assign instantly. Search and filters help recruiters narrow down active roles fast.
          </p>
          <span className="avel-assign-job-modal__result-count">
            {visibleJobOrders.length} shown / {allJobOrderCount} total
          </span>
        </div>

        <div className="avel-assign-job-modal__toolbar">
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

          <label className="modern-command-field avel-assign-job-modal__status-field">
            <span className="modern-command-label">Initial Status</span>
            <input
              className="avel-form-control"
              type="text"
              value={selectedStatusLabel}
              readOnly
              aria-readonly="true"
              disabled={loading}
            />
          </label>
        </div>

        {!loading && data ? (
          <div className="avel-assign-job-modal__quick-filters">
            <button
              type="button"
              className={`avel-assign-job-modal__chip${statusFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setStatusFilter('all')}
              disabled={pending}
            >
              All ({allJobOrderCount})
            </button>
            {statusFacets.map((facet) => (
              <button
                key={facet.key}
                type="button"
                className={`avel-assign-job-modal__chip${statusFilter === facet.key ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(facet.key)}
                disabled={pending}
              >
                {facet.label} ({facet.count})
              </button>
            ))}
            <label className="avel-assign-job-modal__toggle">
              <input
                type="checkbox"
                checked={includeAssigned}
                onChange={(event) => setIncludeAssigned(event.target.checked)}
                disabled={pending}
              />
              Include already assigned
            </label>
            <label className="avel-assign-job-modal__toggle">
              <input
                type="checkbox"
                checked={onlyWithOpenings}
                onChange={(event) => setOnlyWithOpenings(event.target.checked)}
                disabled={pending}
              />
              Only with openings
            </label>
          </div>
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
          <>
            {selectedJobOrder ? (
              <div className="avel-assign-job-modal__selection">
                <span className="avel-assign-job-modal__selection-text">
                  Selected: <strong>{selectedJobOrder.title}</strong> ({selectedJobOrder.companyName})
                </span>
                <span className="avel-assign-job-modal__selection-meta">
                  {selectedJobOrder.status || 'Unknown'} - {formatOpeningsLabel(selectedJobOrder.openingsAvailable)}
                </span>
              </div>
            ) : null}

            <div className="avel-assign-job-modal__list" role="listbox" aria-label="Job order options">
              {visibleJobOrders.length === 0 ? (
                <div className="avel-assign-job-modal__empty">No matching job orders with these filters.</div>
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
                      <span className="avel-assign-job-modal__item-header">
                        <span className="avel-assign-job-modal__item-title">{jobOrder.title}</span>
                        <span className="avel-assign-job-modal__item-badges">
                          <span className={`avel-assign-job-modal__status ${getJobOrderStatusClass(jobOrder.status)}`}>
                            {jobOrder.status || 'Unknown'}
                          </span>
                          <span
                            className={`avel-assign-job-modal__badge${
                              Number(jobOrder.openingsAvailable || 0) > 0
                                ? ' avel-assign-job-modal__badge--open'
                                : ' avel-assign-job-modal__badge--no-openings'
                            }`}
                          >
                            {formatOpeningsLabel(Number(jobOrder.openingsAvailable || 0))}
                          </span>
                          {disabled ? (
                            <span className="avel-assign-job-modal__badge avel-assign-job-modal__badge--assigned">
                              Already assigned
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="avel-assign-job-modal__item-meta">{jobOrder.companyName}</span>
                    </button>
                  );
                })
              )}
            </div>

            <p className="avel-assign-job-modal__assignable-note">
              {assignableVisibleCount} assignable job orders in current view.
            </p>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
