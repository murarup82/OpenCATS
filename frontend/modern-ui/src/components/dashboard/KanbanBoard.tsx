import { useRef } from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { DashboardStatusColumn, FreshnessInfo } from './types';

type Props = {
  columns: DashboardStatusColumn[];
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
  getFreshness: (lastStatusChangeDisplay: string) => FreshnessInfo;
};

export function KanbanBoard({ columns, totalVisibleRows, getStatusClassName, getFreshness }: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const handleBoardWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    board.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  return (
    <div className="modern-kanban-board-wrap">
      <div className="modern-kanban-board__header">
        <span className="modern-kanban-board__title">Pipeline Lanes</span>
        <span className="modern-kanban-board__hint">Horizontal scroll enabled for all workflow stages</span>
      </div>
      <div className="modern-kanban-board__legend" aria-label="Freshness color guide">
        <span className="modern-kanban-board__legend-label">Name Color:</span>
        <span className="modern-kanban-board__legend-item modern-kanban-board__legend-item--fresh">Fresh</span>
        <span className="modern-kanban-board__legend-item modern-kanban-board__legend-item--active">Active</span>
        <span className="modern-kanban-board__legend-item modern-kanban-board__legend-item--aging">Aging</span>
        <span className="modern-kanban-board__legend-item modern-kanban-board__legend-item--stale">Stalling</span>
      </div>
      <div
        ref={boardRef}
        className="modern-kanban-board"
        aria-label="Candidate pipeline board"
        onWheel={handleBoardWheel}
      >
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
