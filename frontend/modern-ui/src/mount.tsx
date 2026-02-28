import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import type { UIModeBootstrap } from './types';

type ModernHost = {
  mount: (rootElement: HTMLElement, bootstrap: UIModeBootstrap) => void;
};

declare global {
  interface Window {
    OpenCATSModernApp?: ModernHost;
  }
}

export function mount(rootElement: HTMLElement, bootstrap: UIModeBootstrap): void {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App bootstrap={bootstrap} />
    </StrictMode>
  );
}

window.OpenCATSModernApp = {
  mount
};

