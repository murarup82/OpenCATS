import { useCallback, useState } from 'react';

export function useServerQueryState(indexName: string): {
  serverQueryString: string;
  applyServerQuery: (nextQuery: URLSearchParams | string) => void;
} {
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());

  const applyServerQuery = useCallback(
    (nextQuery: URLSearchParams | string) => {
      const nextQueryString = typeof nextQuery === 'string' ? nextQuery : nextQuery.toString();
      window.history.replaceState({}, '', `${indexName}?${nextQueryString}`);
      setServerQueryString((current) => (current === nextQueryString ? current : nextQueryString));
    },
    [indexName]
  );

  return {
    serverQueryString,
    applyServerQuery
  };
}
