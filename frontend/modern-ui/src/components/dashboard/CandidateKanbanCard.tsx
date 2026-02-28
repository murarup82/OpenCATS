import type { FreshnessInfo, DashboardRow } from './types';

type Props = {
  row: DashboardRow;
  statusClassName: string;
  freshness: FreshnessInfo;
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

function toUpdatedDay(display: string): string {
  const parsed = parseDisplayDate(display);
  if (!parsed) {
    return '--';
  }

  return parsed.toLocaleDateString(undefined, { weekday: 'short' });
}

export function CandidateKanbanCard({ row, statusClassName, freshness }: Props) {
  const statusSlug = toDisplayText(row.statusSlug, 'unknown');
  const candidateName = toDisplayText(row.candidateName);
  const jobOrderTitle = toDisplayText(row.jobOrderTitle);
  const companyName = toDisplayText(row.companyName);
  const statusLabel = toDisplayText(row.statusLabel);
  const updatedDay = toUpdatedDay(toDisplayText(row.lastStatusChangeDisplay, ''));
  const isActive = Number(row.isActive) === 1;
  const initials = getInitials(candidateName);

  return (
    <article className={`modern-kanban-card modern-kanban-card--${statusSlug}`}>
      <div className="modern-kanban-card__head">
        <div className="modern-kanban-card__identity">
          <div className="modern-kanban-card__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="modern-kanban-card__identity-content">
            <a
              className={`modern-link modern-kanban-card__candidate modern-kanban-card__candidate--${freshness.tone}`}
              href={row.candidateURL}
            >
              {candidateName}
            </a>
            <div className="modern-kanban-card__identity-hint">Candidate profile</div>
          </div>
        </div>

        <div className="modern-kanban-card__chips">
          <span className={statusClassName}>{statusLabel}</span>
          <span className={`modern-chip modern-chip--pipeline ${isActive ? 'is-active' : 'is-closed'}`}>
            {isActive ? 'Open Pipeline' : 'Closed'}
          </span>
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
        <div className="modern-kanban-card__fact">
          <span className="modern-kanban-card__fact-key">Day</span>
          <span className="modern-kanban-card__fact-value">{updatedDay}</span>
        </div>
      </div>
    </article>
  );
}
