import type { FreshnessInfo, DashboardRow } from './types';

type Props = {
  row: DashboardRow;
  statusClassName: string;
  freshness: FreshnessInfo;
};

function withLegacyMode(url: string): string {
  const safeURL = String(url || '').trim();
  if (safeURL === '') {
    return 'index.php?ui=legacy';
  }

  if (safeURL.includes('ui=')) {
    return safeURL.replace(/ui=[^&]*/i, 'ui=legacy');
  }

  return safeURL + (safeURL.includes('?') ? '&' : '?') + 'ui=legacy';
}

export function CandidateKanbanCard({ row, statusClassName, freshness }: Props) {
  return (
    <article className="modern-kanban-card">
      <div className="modern-kanban-card__head">
        <a className="modern-link modern-kanban-card__candidate" href={row.candidateURL}>
          {row.candidateName}
        </a>
        <div className="modern-kanban-card__chips">
          <span className={statusClassName}>{row.statusLabel || '--'}</span>
          <span className={`modern-freshness modern-freshness--${freshness.tone}`}>{freshness.label}</span>
        </div>
      </div>

      <a className="modern-link modern-kanban-card__job" href={row.jobOrderURL}>
        {row.jobOrderTitle || '--'}
      </a>

      <div className="modern-kanban-card__company">{row.companyName || '--'}</div>

      <div className="modern-kanban-card__meta">
        <span>
          <strong>Location:</strong> {row.location || '--'}
        </span>
        <span>
          <strong>Updated:</strong> {row.lastStatusChangeDisplay || '--'}
        </span>
        <span>
          <strong>Pipeline:</strong> {row.isActive === 1 ? 'Active' : 'Closed'}
        </span>
      </div>

      <div className="modern-kanban-card__actions">
        <a className="modern-btn modern-btn--ghost" href={row.candidateURL}>
          View
        </a>
        <a className="modern-btn modern-btn--ghost" href={row.jobOrderURL}>
          Details
        </a>
        <a className="modern-btn modern-btn--ghost" href={withLegacyMode(row.candidateURL)}>
          Open Legacy
        </a>
      </div>
    </article>
  );
}
