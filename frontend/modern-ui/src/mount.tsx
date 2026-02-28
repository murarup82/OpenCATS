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
    OpenCATSModernLastError?: {
      message: string;
      stack: string;
      componentStack: string;
      occurredAtUTC: string;
      moduleName: string;
      actionName: string;
    };
  }
}

type ErrorBoundaryProps = {
  bootstrap: UIModeBootstrap;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
  stack: string;
  componentStack: string;
  occurredAtUTC: string;
};

class ModernErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      stack: '',
      componentStack: '',
      occurredAtUTC: ''
    };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
      message: '',
      stack: '',
      componentStack: '',
      occurredAtUTC: new Date().toISOString()
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const message = error && error.message ? error.message : 'Unknown runtime error.';
    const stack = error && error.stack ? error.stack : '';
    const componentStack = info && info.componentStack ? info.componentStack : '';
    const occurredAtUTC = new Date().toISOString();

    this.setState({
      hasError: true,
      message,
      stack,
      componentStack,
      occurredAtUTC
    });

    if (typeof window !== 'undefined' && window.console && typeof window.console.error === 'function') {
      window.console.error('[modern-bundle] runtime error', {
        message,
        stack,
        componentStack,
        occurredAtUTC,
        moduleName: this.props.bootstrap.targetModule || '',
        actionName: this.props.bootstrap.targetAction || ''
      });
    }

    if (typeof window !== 'undefined') {
      window.OpenCATSModernLastError = {
        message,
        stack,
        componentStack,
        occurredAtUTC,
        moduleName: this.props.bootstrap.targetModule || '',
        actionName: this.props.bootstrap.targetAction || ''
      };
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const diagnostics = [
        `UTC: ${this.state.occurredAtUTC || new Date().toISOString()}`,
        `Route: ${this.props.bootstrap.targetModule || '--'} / ${this.props.bootstrap.targetAction || '--'}`,
        `Message: ${this.state.message || 'Unknown runtime error.'}`,
        this.state.stack ? `Stack:\n${this.state.stack}` : '',
        this.state.componentStack ? `Component stack:\n${this.state.componentStack}` : ''
      ]
        .filter((line) => line !== '')
        .join('\n\n');

      return (
        <div className="modern-state modern-state--error">
          <p>Modern UI encountered a runtime error.</p>
          <details className="modern-error-diagnostics">
            <summary>Show technical diagnostics</summary>
            <pre>{diagnostics}</pre>
          </details>
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
