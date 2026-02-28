import type { UIModeBootstrap } from '../types';

export function decodeBootstrapFromElement(element: HTMLElement): UIModeBootstrap {
  const encoded = element.dataset.bootstrap ?? '';
  if (!encoded) {
    throw new Error('Missing bootstrap payload');
  }

  const decoded = atob(encoded);
  const parsed = JSON.parse(decoded) as Partial<UIModeBootstrap>;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid bootstrap payload');
  }

  return {
    targetModule: parsed.targetModule ?? '',
    targetAction: parsed.targetAction ?? '',
    indexName: parsed.indexName ?? 'index.php',
    requestURI: parsed.requestURI ?? '',
    siteID: Number(parsed.siteID ?? 0),
    userID: Number(parsed.userID ?? 0),
    fullName: parsed.fullName ?? '',
    mode: parsed.mode === 'legacy' ? 'legacy' : 'modern',
    legacyURL: parsed.legacyURL ?? 'index.php',
    modernURL: parsed.modernURL ?? 'index.php',
    resolvedBy: parsed.resolvedBy ?? '',
    timestampUTC: parsed.timestampUTC ?? ''
  };
}
