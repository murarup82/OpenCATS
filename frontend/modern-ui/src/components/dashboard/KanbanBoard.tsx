import { useRef } from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { DashboardStatusColumn } from './types';

type Props = {
  columns: DashboardStatusColumn[];
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
};

export function KanbanBoard({ columns, totalVisibleRows, getStatusClassName }: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scrollStep = 320;

  const handleBoardWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    if (board.scrollWidth <= board.clientWidth) {
      return;
    }

    board.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  const scrollBoardBy = (offset: number) => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    board.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="modern-kanban-board-wrap">
      <div className="modern-kanban-board__header">
        <span className="modern-kanban-board__title">Pipeline Lanes</span>
        <div className="modern-kanban-board__header-actions">
          <span className="modern-kanban-board__hint">Horizontal scroll enabled for all workflow stages</span>
          <button
            type="button"
            className="modern-kanban-board__scroll-btn"
            onClick={() => scrollBoardBy(-scrollStep)}
            aria-label="Scroll lanes left"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            type="button"
            className="modern-kanban-board__scroll-btn"
            onClick={() => scrollBoardBy(scrollStep)}
            aria-label="Scroll lanes right"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
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
          />
        ))}
      </div>
    </div>
  );
}
