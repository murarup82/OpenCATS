import type { PropsWithChildren, ReactNode } from 'react';

type Column = {
  key: string;
  title: string;
};

type Props = PropsWithChildren<{
  columns: Column[];
  emptyMessage?: ReactNode;
  hasRows: boolean;
}>;

export function DataTable({ columns, emptyMessage, hasRows, children }: Props) {
  return (
    <div className="modern-table-wrap">
      <table className="modern-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>{hasRows ? children : <tr><td colSpan={columns.length}>{emptyMessage ?? 'No rows.'}</td></tr>}</tbody>
      </table>
    </div>
  );
}

