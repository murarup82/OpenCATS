import { useEffect, useRef } from 'react';

type RefreshHandler = () => void;
type RefreshEventOptions = {
  debounceMS?: number;
};

// Keep modern pages in sync with embedded legacy dialogs without forcing full reloads.
export function usePageRefreshEvents(onRefresh: RefreshHandler, options: RefreshEventOptions = {}): void {
  const debounceMS = Number(options.debounceMS || 120);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleRefreshRequest = (rawEvent: Event) => {
      rawEvent.preventDefault();

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        onRefresh();
      }, debounceMS);
    };

    window.addEventListener('opencats:legacy-popup:refresh-request', handleRefreshRequest as EventListener);
    window.addEventListener('opencats:modern-page:refresh', handleRefreshRequest as EventListener);

    return () => {
      window.removeEventListener('opencats:legacy-popup:refresh-request', handleRefreshRequest as EventListener);
      window.removeEventListener('opencats:modern-page:refresh', handleRefreshRequest as EventListener);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [debounceMS, onRefresh]);
}
