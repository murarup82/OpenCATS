export function ensureUIURL(url: string, uiMode: 'modern' | 'legacy'): string {
  const raw = String(url || '').trim();
  if (raw === '') {
    return raw;
  }

  try {
    const parsed = new URL(raw, window.location.href);
    parsed.searchParams.set('ui', uiMode);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch (error) {
    const hasQuery = raw.includes('?');
    const hasUI = /(?:\?|&)ui=/.test(raw);
    if (hasUI) {
      return raw.replace(/([?&])ui=[^&#]*/i, `$1ui=${uiMode}`);
    }
    return `${raw}${hasQuery ? '&' : '?'}ui=${uiMode}`;
  }
}

export function ensureModernUIURL(url: string): string {
  return ensureUIURL(url, 'modern');
}
