export function parseRequestQueryParams(requestURI: string): URLSearchParams {
  const rawURI = String(requestURI || '').trim();
  if (rawURI === '') {
    return new URLSearchParams();
  }

  try {
    const parsed = new URL(rawURI, window.location.origin);
    return new URLSearchParams(parsed.search);
  } catch (_error) {
    const questionIndex = rawURI.indexOf('?');
    if (questionIndex < 0 || questionIndex === rawURI.length - 1) {
      return new URLSearchParams();
    }
    return new URLSearchParams(rawURI.substring(questionIndex + 1));
  }
}

export function hasPositiveIntegerQueryParam(query: URLSearchParams, key: string): boolean {
  const value = Number(query.get(key) || 0);
  return Number.isFinite(value) && value > 0;
}

export function isCapabilityEnabled(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}
