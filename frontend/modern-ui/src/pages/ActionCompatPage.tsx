import { ModuleBridgePage } from './ModuleBridgePage';
import type { UIModeBootstrap } from '../types';

type Props = {
  bootstrap: UIModeBootstrap;
};

// Dedicated compatibility wrapper for explicit action routes.
// Keeps legacy-safe behavior while allowing action-level modernization tracking.
export function ActionCompatPage({ bootstrap }: Props) {
  return <ModuleBridgePage bootstrap={bootstrap} />;
}

