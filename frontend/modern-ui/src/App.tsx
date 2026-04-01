import { useEffect, useRef } from 'react';
import type { UIModeBootstrap } from './types';
import { resolveModernRoute } from './lib/routeRegistry';
import { recordRouteResolutionTelemetry } from './lib/routeResolutionTelemetry';
import { useModernKeyboardShortcuts } from './lib/useModernKeyboardShortcuts';
import { ModernOverlayHost } from './components/modals/ModernOverlayHost';
import { LegacyCompatPage } from './components/states/LegacyCompatPage';
import { GlobalFeedbackFooter } from './components/layout/GlobalFeedbackFooter';

type AppProps = {
  bootstrap: UIModeBootstrap;
};

export function App({ bootstrap }: AppProps) {
  useModernKeyboardShortcuts();

  const routeResolution = resolveModernRoute(
    bootstrap.targetModule || '',
    bootstrap.targetAction || '',
    bootstrap.requestURI || ''
  );
  const pageComponent = routeResolution.component;
  const resolutionSignatureRef = useRef('');

  useEffect(() => {
    const signature = [
      routeResolution.resolutionType,
      routeResolution.matchedRouteKey,
      bootstrap.requestURI || ''
    ].join('|');
    if (signature === resolutionSignatureRef.current) {
      return;
    }
    resolutionSignatureRef.current = signature;
    recordRouteResolutionTelemetry(
      bootstrap,
      routeResolution.resolutionType,
      routeResolution.matchedRouteKey
    );
  }, [bootstrap, routeResolution.matchedRouteKey, routeResolution.resolutionType]);

  const content = (() => {
    if (pageComponent) {
      const PageComponent = pageComponent;
      return <PageComponent bootstrap={bootstrap} />;
    }

    return <LegacyCompatPage bootstrap={bootstrap} />;
  })();

  const hideGlobalFeedbackFooter =
    routeResolution.matchedRouteKey === 'dashboard.my' ||
    routeResolution.matchedRouteKey === 'dashboard.(default)' ||
    routeResolution.matchedRouteKey === 'dashboard.setpipelinestatus';

  return (
    <>
      <div className="modern-app-shell">
        {content}
        {!hideGlobalFeedbackFooter ? <GlobalFeedbackFooter bootstrap={bootstrap} /> : null}
      </div>
      <ModernOverlayHost bootstrap={bootstrap} />
    </>
  );
}
