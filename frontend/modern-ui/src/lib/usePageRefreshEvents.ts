import { useEffect } from 'react';

type RefreshHandler = () => void;

// Keep modern pages in sync with embedded legacy dialogs without forcing full reloads.
export function usePageRefreshEvents(onRefresh: RefreshHandler): void {
  useEffect(() => {
    const handleRefreshRequest = (rawEvent: Event) => {
      rawEvent.preventDefault();
      onRefresh();
    };

    window.addEventListener('opencats:legacy-popup:refresh-request', handleRefreshRequest as EventListener);
    window.addEventListener('opencats:modern-page:refresh', handleRefreshRequest as EventListener);

    return () => {
      window.removeEventListener('opencats:legacy-popup:refresh-request', handleRefreshRequest as EventListener);
      window.removeEventListener('opencats:modern-page:refresh', handleRefreshRequest as EventListener);
    };
  }, [onRefresh]);
}
