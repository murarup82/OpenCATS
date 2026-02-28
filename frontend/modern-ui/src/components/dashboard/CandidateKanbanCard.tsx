import type { DashboardRow } from './types';
import type { DragEvent as ReactDragEvent } from 'react';

type Props = {
  row: DashboardRow;
  statusClassName: string;
  canChangeStatus: boolean;
  canDrag: boolean;
  isDragging: boolean;
  onDragStart: (event: ReactDragEvent<HTMLElement>, row: DashboardRow) => void;
  onDragEnd: () => void;
  onOpenDetails: (row: DashboardRow) => void;
  onRequestStatusChange: (row: DashboardRow, targetStatusID: number | null) => void;
};

function toDisplayText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function getInitials(value: string): string {
  const tokens = value
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token !== '');

  if (tokens.length === 0) {
    return 'NA';
  }

  const initials = tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('');

  return initials || 'NA';
}

function parseDisplayDate(display: string): Date | null {
  const match = String(display || '').match(/(\d{2})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = 2000 + Number(match[3]);
  if (Number.isNaN(first) || Number.isNaN(second) || Number.isNaN(year)) {
    return null;
  }

  let month = first;
  let day = second;
  if (first > 12 && second <= 12) {
    day = first;
    month = second;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

type AgingTone = 'green' | 'yellow' | 'orange' | 'red' | 'unknown';

function getAgingInfo(display: string): { days: number | null; tone: AgingTone; label: string } {
  const parsed = parseDisplayDate(display);
  if (!parsed) {
    return { days: null, tone: 'unknown', label: 'Aging N/A' };
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.max(0, Math.floor((todayStart.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));

  if (diffDays > 21) {
    return { days: diffDays, tone: 'red', label: `Aging ${diffDays}d` };
  }

  if (diffDays >= 14) {
    return { days: diffDays, tone: 'orange', label: `Aging ${diffDays}d` };
  }

  if (diffDays >= 5) {
    return { days: diffDays, tone: 'yellow', label: `Aging ${diffDays}d` };
  }

  return { days: diffDays, tone: 'green', label: `Aging ${diffDays}d` };
}

export function CandidateKanbanCard({
  row,
  statusClassName,
  canChangeStatus,
  canDrag,
  isDragging,
  onDragStart,
  onDragEnd,
  onOpenDetails,
  onRequestStatusChange
}: Props) {
  const statusSlug = toDisplayText(row.statusSlug, 'unknown');
  const candidateName = toDisplayText(row.candidateName);
  const jobOrderTitle = toDisplayText(row.jobOrderTitle);
  const companyName = toDisplayText(row.companyName);
  const statusLabel = toDisplayText(row.statusLabel);
  const aging = getAgingInfo(toDisplayText(row.lastStatusChangeDisplay, ''));
  const initials = getInitials(candidateName);
  const isClosed = Number(row.isActive || 0) === 0;
  const hasDetails = Number(row.candidateJobOrderID || 0) > 0;

  return (
    <article
      className={
        `modern-kanban-card modern-kanban-card--${statusSlug}` +
        `${canDrag ? '' : ' is-locked'}` +
        `${isDragging ? ' is-dragging' : ''}` +
        `${isClosed ? ' is-closed' : ''}`
      }
      draggable={canDrag}
      onDragStart={(event) => onDragStart(event, row)}
      onDragEnd={() => onDragEnd()}
    >
      <div className="modern-kanban-card__head">
        <div className="modern-kanban-card__identity">
          <div className="modern-kanban-card__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="modern-kanban-card__identity-content">
            <a className="modern-link modern-kanban-card__candidate" href={row.candidateURL}>
              {candidateName}
            </a>
            <div className="modern-kanban-card__identity-hint">Candidate profile</div>
          </div>
        </div>

        <div className="modern-kanban-card__chips">
          <span className={statusClassName}>{statusLabel}</span>
          <span className={`modern-chip modern-chip--aging modern-chip--aging-${aging.tone}`}>
            {aging.label}
          </span>
          {isClosed ? <span className="modern-chip modern-chip--closed">Closed</span> : null}
        </div>
      </div>

      <div className="modern-kanban-card__job-wrap">
        <span className="modern-kanban-card__job-label">Job Order</span>
        <a className="modern-link modern-kanban-card__job" href={row.jobOrderURL}>
          {jobOrderTitle}
        </a>
      </div>

      <div className="modern-kanban-card__facts">
        <div className="modern-kanban-card__fact">
          <span className="modern-kanban-card__fact-key">Company</span>
          <span className="modern-kanban-card__fact-value">{companyName}</span>
        </div>
      </div>

      <div className="modern-kanban-card__actions">
        {canChangeStatus ? (
          <button
            type="button"
            className="modern-btn modern-btn--mini modern-btn--secondary"
            onClick={() => onRequestStatusChange(row, null)}
          >
            Change Status
          </button>
        ) : (
          <span className="modern-kanban-card__actions-note">No access</span>
        )}
        <button
          type="button"
          className="modern-btn modern-btn--mini modern-btn--secondary"
          onClick={() => onOpenDetails(row)}
          disabled={!hasDetails}
        >
          Details
        </button>
      </div>
    </article>
  );
}
