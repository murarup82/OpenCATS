export function buildEmbeddedLegacyURL(legacyURL: string): string {
  try {
    const url = new URL(legacyURL, window.location.href);
    url.searchParams.set('ui_embed', '1');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (_error) {
    const hasQuery = legacyURL.includes('?');
    return `${legacyURL}${hasQuery ? '&' : '?'}ui_embed=1`;
  }
}

