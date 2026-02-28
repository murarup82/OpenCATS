import type { UIModeBootstrap } from '../types';

export function decodeBootstrapFromElement(element: HTMLElement): UIModeBootstrap {
  const encoded = element.dataset.bootstrap ?? '';
  if (!encoded) {
    throw new Error('Missing bootstrap payload');
  }

  const decoded = atob(encoded);
  return JSON.parse(decoded) as UIModeBootstrap;
}

