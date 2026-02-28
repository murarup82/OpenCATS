import { DashboardMyReadOnlyPage } from './pages/DashboardMyReadOnlyPage';
import type { UIModeBootstrap } from './types';

type AppProps = {
  bootstrap: UIModeBootstrap;
};

export function App({ bootstrap }: AppProps) {
  const moduleName = bootstrap.targetModule || '';
  const actionName = bootstrap.targetAction || '';

  if (moduleName === 'dashboard' && (actionName === 'my' || actionName === '')) {
    return <DashboardMyReadOnlyPage bootstrap={bootstrap} />;
  }

  return (
    <div className="modern-state">
      <p>Route not migrated yet.</p>
      <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
        Open Legacy UI
      </a>
    </div>
  );
}

