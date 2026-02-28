import type { DashboardModernDataResponse } from '../../types';

export type DashboardRow = DashboardModernDataResponse['rows'][number];

export type DashboardStatusColumn = {
  statusID: number;
  statusLabel: string;
  statusSlug: string;
  rows: DashboardRow[];
};

export type FreshnessTone = 'fresh' | 'active' | 'aging' | 'stale' | 'unknown';

export type FreshnessInfo = {
  label: string;
  tone: FreshnessTone;
};
