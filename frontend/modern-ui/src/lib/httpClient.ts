export class HTTPRequestError extends Error {
  statusCode: number;
  url: string;

  constructor(message: string, statusCode: number, url: string) {
    super(message);
    this.name = 'HTTPRequestError';
    this.statusCode = statusCode;
    this.url = url;
  }
}

function compactResponsePreview(bodyText: string, maxLength = 220): string {
  return String(bodyText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function stripLeadingHTMLComments(bodyText: string): string {
  let next = String(bodyText || '')
    .replace(/^\uFEFF/, '')
    .trimStart();

  while (next.startsWith('<!--')) {
    const closingIndex = next.indexOf('-->');
    if (closingIndex < 0) {
      break;
    }
    next = next.slice(closingIndex + 3).trimStart();
  }

  return next;
}

function inferJSONFailureHint(preview: string): string {
  const normalized = String(preview || '').toLowerCase();
  if (
    normalized.includes('<!doctype') ||
    normalized.includes('<html') ||
    normalized.includes('<body') ||
    normalized.includes('commonerror')
  ) {
    return 'Server returned an HTML page instead of JSON.';
  }
  if (normalized.includes('<!-- nospa') || normalized.includes('<!-- nospacefilter')) {
    return 'Server prepended an HTML comment marker before JSON.';
  }
  return 'Server returned a non-JSON response.';
}

export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new HTTPRequestError(`Request failed (${response.status})`, response.status, url);
  }

  const rawResponseBody = await response.text();
  const sanitizedBody = stripLeadingHTMLComments(rawResponseBody);

  if (sanitizedBody !== '') {
    try {
      return JSON.parse(sanitizedBody) as T;
    } catch (_error) {
      // Fall through to richer diagnostics below.
    }
  }

  const preview = compactResponsePreview(rawResponseBody);
  const hint = inferJSONFailureHint(preview);
  if (typeof console !== 'undefined') {
    console.error('[modern-ui] json-response-parse-failed', {
      status: response.status,
      url,
      contentType: response.headers.get('content-type') || '',
      preview
    });
  }

  throw new Error(`Invalid JSON response (${response.status}). ${hint}${preview === '' ? '' : ` Response preview: ${preview}`}`);
}
