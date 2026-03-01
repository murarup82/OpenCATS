import type { UIModeBootstrap } from '../../types';
import { buildEmbeddedLegacyURL } from '../../lib/embeddedLegacy';
import { useEmbeddedLegacyFrame } from '../../lib/useEmbeddedLegacyFrame';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function LegacyCompatPage({ bootstrap }: Props) {
  const moduleName = bootstrap.targetModule || '--';
  const actionName = bootstrap.targetAction || '(default)';
  const embedLegacyURL = buildEmbeddedLegacyURL(bootstrap.legacyURL);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

  return (
    <section className="modern-compat-page">
      <header className="modern-compat-page__header">
        <div>
          <h2 className="modern-compat-page__title">Compatibility View</h2>
          <p className="modern-compat-page__subtitle">
            This route is not migrated yet. Legacy page is rendered inline for continuity.
          </p>
        </div>
        <div className="modern-compat-page__meta">
          <span>Route: {moduleName} / {actionName}</span>
        </div>
      </header>

      <div className="modern-compat-page__actions">
        <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
          Open Legacy UI
        </a>
        <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
          Reload Workspace
        </button>
        <a
          className="modern-btn modern-btn--secondary modern-btn--emphasis"
          href={bootstrap.modernURL}
        >
          Reload Modern Shell
        </a>
      </div>

      <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
        {frameLoading ? (
          <div className="modern-compat-page__frame-loader" aria-live="polite">
            Loading legacy workspace...
          </div>
        ) : null}
        <iframe
          key={frameReloadToken}
          title={`Legacy compatibility route ${moduleName}/${actionName}`}
          className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
          src={embedLegacyURL}
          onLoad={handleFrameLoad}
        />
      </div>
    </section>
  );
}
