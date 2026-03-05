import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../ui-core';

type JobOrderOption = {
  jobOrderID: number;
  title: string;
  companyName: string;
};

type Props = {
  isOpen: boolean;
  jobOrders: JobOrderOption[];
  initialJobOrderID?: number;
  initialCandidateQuery?: string;
  onClose: () => void;
  onStart: (payload: { jobOrderID: number; candidateQuery: string }) => void;
};

function toSearchValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export function DashboardAssignCandidateLauncherModal({
  isOpen,
  jobOrders,
  initialJobOrderID,
  initialCandidateQuery,
  onClose,
  onStart
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobOrderID, setSelectedJobOrderID] = useState<number>(0);
  const [candidateQuery, setCandidateQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const preferredID = Number(initialJobOrderID || 0);
    const hasPreferred = preferredID > 0 && jobOrders.some((jobOrder) => Number(jobOrder.jobOrderID) === preferredID);
    const fallbackID = hasPreferred ? preferredID : Number(jobOrders[0]?.jobOrderID || 0);

    setSearchTerm('');
    setSelectedJobOrderID(fallbackID);
    setCandidateQuery(String(initialCandidateQuery || '').trim());
  }, [initialCandidateQuery, initialJobOrderID, isOpen, jobOrders]);

  const visibleJobOrders = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const sortedRows = [...jobOrders].sort((left, right) => {
      const companyCompare = toSearchValue(left.companyName).localeCompare(toSearchValue(right.companyName), undefined, {
        sensitivity: 'base'
      });
      if (companyCompare !== 0) {
        return companyCompare;
      }
      return toSearchValue(left.title).localeCompare(toSearchValue(right.title), undefined, { sensitivity: 'base' });
    });

    if (normalizedQuery === '') {
      return sortedRows;
    }

    return sortedRows.filter((jobOrder) => {
      const searchable = `${toSearchValue(jobOrder.title)} ${toSearchValue(jobOrder.companyName)}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [jobOrders, searchTerm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (selectedJobOrderID <= 0) {
      return;
    }
    const selectedVisible = visibleJobOrders.some((jobOrder) => Number(jobOrder.jobOrderID) === selectedJobOrderID);
    if (selectedVisible) {
      return;
    }
    setSelectedJobOrderID(Number(visibleJobOrders[0]?.jobOrderID || 0));
  }, [isOpen, selectedJobOrderID, visibleJobOrders]);

  const canContinue = selectedJobOrderID > 0;

  return (
    <Modal
      isOpen={isOpen}
      title="Assign Candidate"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="modern-btn modern-btn--emphasis"
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) {
                return;
              }
              onStart({
                jobOrderID: selectedJobOrderID,
                candidateQuery: candidateQuery.trim()
              });
            }}
          >
            Continue
          </button>
        </>
      }
    >
      <div className="avel-assign-launcher-modal">
        <p className="avel-assign-launcher-modal__hint">
          Select a job order first, then search and assign candidates in the next step.
        </p>

        <label className="modern-command-search avel-assign-launcher-modal__search">
          <span className="modern-command-label">Search Job Orders</span>
          <span className="modern-command-search__shell">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title or customer"
            />
          </span>
        </label>

        <label className="modern-command-field avel-assign-launcher-modal__candidate-query">
          <span className="modern-command-label">Candidate Search (Optional)</span>
          <input
            className="avel-form-control"
            type="text"
            value={candidateQuery}
            onChange={(event) => setCandidateQuery(event.target.value)}
            placeholder="Prefill candidate name"
          />
        </label>

        <div className="avel-assign-launcher-modal__meta">{visibleJobOrders.length} job orders available</div>

        <div className="avel-assign-launcher-modal__list" role="listbox" aria-label="Job order options">
          {visibleJobOrders.length === 0 ? (
            <div className="avel-assign-launcher-modal__empty">No job orders match this search.</div>
          ) : (
            visibleJobOrders.map((jobOrder) => {
              const isSelected = Number(jobOrder.jobOrderID) === selectedJobOrderID;
              return (
                <button
                  key={jobOrder.jobOrderID}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`avel-assign-launcher-modal__item${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedJobOrderID(Number(jobOrder.jobOrderID))}
                >
                  <span className="avel-assign-launcher-modal__item-title">{toSearchValue(jobOrder.title)}</span>
                  <span className="avel-assign-launcher-modal__item-meta">{toSearchValue(jobOrder.companyName) || 'No customer'}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
