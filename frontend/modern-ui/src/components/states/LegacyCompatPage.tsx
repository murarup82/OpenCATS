import type { UIModeBootstrap } from '../../types';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function LegacyCompatPage({ bootstrap }: Props) {
  const moduleName = bootstrap.targetModule || '--';
  const actionName = bootstrap.targetAction || '(default)';

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
        <a className="modern-btn modern-btn--secondary modern-btn--emphasis" href={bootstrap.modernURL}>
          Reload Modern Shell
        </a>
      </div>

      <div className="modern-compat-page__frame-wrap">
        <iframe
          title={`Legacy compatibility route ${moduleName}/${actionName}`}
          className="modern-compat-page__frame"
          src={bootstrap.legacyURL}
        />
      </div>
    </section>
  );
}
