import type { PropsWithChildren } from 'react';

export function StatChip({ children }: PropsWithChildren) {
  return <span className="modern-chip">{children}</span>;
}

