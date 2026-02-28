import type { UIModeBootstrap } from './types';
import { resolveModernRouteComponent } from './lib/routeRegistry';
import { ErrorState } from './components/states/ErrorState';
import { ModernOverlayHost } from './components/modals/ModernOverlayHost';

type AppProps = {
  bootstrap: UIModeBootstrap;
};

export function App({ bootstrap }: AppProps) {
  const pageComponent = resolveModernRouteComponent(
    bootstrap.targetModule || '',
    bootstrap.targetAction || ''
  );

  if (pageComponent) {
    const PageComponent = pageComponent;
    return (
      <>
        <PageComponent bootstrap={bootstrap} />
        <ModernOverlayHost bootstrap={bootstrap} />
      </>
    );
  }

  return (
    <ErrorState
      message="Route not migrated yet."
      actionLabel="Open Legacy UI"
      actionURL={bootstrap.legacyURL}
    />
  );
}
