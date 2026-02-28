import { CandidateKanbanCard } from './CandidateKanbanCard';
import type { DashboardStatusColumn, FreshnessInfo } from './types';

type Props = {
  column: DashboardStatusColumn;
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
  getFreshness: (lastStatusChangeDisplay: string) => FreshnessInfo;
};

export function KanbanColumn({ column, totalVisibleRows, getStatusClassName, getFreshness }: Props) {
  const columnShare = totalVisibleRows > 0
    ? Math.round((column.rows.length / totalVisibleRows) * 100)
    : 0;

  return (
    <section
      className={`modern-kanban-column modern-kanban-column--${column.statusSlug}`}
      aria-label={`Status column ${column.statusLabel}`}
    >
      <header className="modern-kanban-column__header">
        <div className="modern-kanban-column__title-wrap">
          <h4 className="modern-kanban-column__title">{column.statusLabel}</h4>
          <span className="modern-kanban-column__subtitle">{columnShare}% of visible</span>
        </div>
        <span className="modern-kanban-column__count">{column.rows.length}</span>
      </header>

      <div className="modern-kanban-column__body">
        {column.rows.length === 0 ? (
          <div className="modern-kanban-column__empty">
            <span className="modern-kanban-column__empty-icon" aria-hidden="true">
              O
            </span>
            <span>No candidates in this stage.</span>
          </div>
        ) : (
          <div className="modern-kanban-column__cards">
            {column.rows.map((row) => (
              <CandidateKanbanCard
                key={`${row.candidateID}-${row.jobOrderID}-${row.statusID}`}
                row={row}
                statusClassName={getStatusClassName(row.statusLabel || '')}
                freshness={getFreshness(row.lastStatusChangeDisplay || '')}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
