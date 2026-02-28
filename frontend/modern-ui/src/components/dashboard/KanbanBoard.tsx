import { useRef } from 'react';
import type { WheelEvent as ReactWheelEvent } from 'react';
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

  const scrollBoardBy = (offset: number) => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    board.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    // Keep mouse-wheel scrolling vertical by default; use Shift+wheel or buttons for horizontal lane moves.
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    event.preventDefault();
    window.scrollBy({
      top: event.deltaY,
      left: 0,
      behavior: 'auto'
    });
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
        className="modern-kanban-board__viewport"
        aria-label="Candidate pipeline board"
        onWheel={handleWheel}
      >
        <div className="modern-kanban-board">
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
    </div>
  );
}
