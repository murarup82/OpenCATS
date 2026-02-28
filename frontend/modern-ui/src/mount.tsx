import React, { StrictMode } from 'react';
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

type ErrorBoundaryProps = {
  bootstrap: UIModeBootstrap;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ModernErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    if (typeof window !== 'undefined' && window.console && typeof window.console.error === 'function') {
      window.console.error('[modern-bundle] runtime error', {
        message: error.message
      });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="modern-state modern-state--error">
          <p>Modern UI encountered an unexpected error.</p>
          <a className="modern-btn modern-btn--secondary" href={this.props.bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export function mount(rootElement: HTMLElement, bootstrap: UIModeBootstrap): void {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ModernErrorBoundary bootstrap={bootstrap}>
        <App bootstrap={bootstrap} />
      </ModernErrorBoundary>
    </StrictMode>
  );
}

window.OpenCATSModernApp = {
  mount
};
