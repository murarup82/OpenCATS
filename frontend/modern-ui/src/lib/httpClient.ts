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

export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new HTTPRequestError(`Request failed (${response.status})`, response.status, url);
  }

  return (await response.json()) as T;
}

