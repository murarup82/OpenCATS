import type { UIModeBootstrap } from './types';
import { resolveModernRouteComponent } from './lib/routeRegistry';
import { ModernOverlayHost } from './components/modals/ModernOverlayHost';
import { LegacyCompatPage } from './components/states/LegacyCompatPage';

type AppProps = {
  bootstrap: UIModeBootstrap;
};

export function App({ bootstrap }: AppProps) {
  const pageComponent = resolveModernRouteComponent(
    bootstrap.targetModule || '',
    bootstrap.targetAction || ''
  );

  const content = (() => {
    if (pageComponent) {
      const PageComponent = pageComponent;
      return <PageComponent bootstrap={bootstrap} />;
    }

    return <LegacyCompatPage bootstrap={bootstrap} />;
  })();

  return (
    <>
      {content}
      <ModernOverlayHost bootstrap={bootstrap} />
    </>
  );
}
