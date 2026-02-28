import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  size?: ModalSize;
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
  );
}

export function Modal({
  isOpen,
  title,
  children,
  footer,
  closeLabel = 'Close',
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = 'md',
  onClose
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusPanel = () => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const focusable = getFocusableElements(panel);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    };

    focusPanel();

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [closeOnEscape, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (!closeOnBackdrop) {
          return;
        }

        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`ui-modal ui-modal--${size}`}>
        <div className="ui-modal__panel" role="dialog" aria-modal="true" aria-label={title || 'Dialog'} ref={panelRef} tabIndex={-1}>
          <header className="ui-modal__header">
            {title ? <h2 className="ui-modal__title">{title}</h2> : <span />}
            <button type="button" className="ui-modal__close" onClick={onClose}>
              {closeLabel}
            </button>
          </header>
          <div className="ui-modal__body">{children}</div>
          {footer ? <footer className="ui-modal__footer">{footer}</footer> : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
