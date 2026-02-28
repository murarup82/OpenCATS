import { KanbanColumn } from './KanbanColumn';
import type { DashboardStatusColumn, FreshnessInfo } from './types';

type Props = {
  columns: DashboardStatusColumn[];
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
  getFreshness: (lastStatusChangeDisplay: string) => FreshnessInfo;
};

export function KanbanBoard({ columns, totalVisibleRows, getStatusClassName, getFreshness }: Props) {
  return (
    <div className="modern-kanban-board-wrap">
      <div className="modern-kanban-board__header">
        <span className="modern-kanban-board__title">Pipeline Lanes</span>
        <span className="modern-kanban-board__hint">Horizontal scroll enabled for all workflow stages</span>
      </div>
      <div className="modern-kanban-board" aria-label="Candidate pipeline board">
        {columns.map((column) => (
          <KanbanColumn
            key={`${column.statusID}-${column.statusSlug}`}
            column={column}
            totalVisibleRows={totalVisibleRows}
            getStatusClassName={getStatusClassName}
            getFreshness={getFreshness}
          />
        ))}
      </div>
    </div>
  );
}
