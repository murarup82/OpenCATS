import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type InlineModalProps = {
  isOpen: boolean;
  ariaLabel: string;
  children: ReactNode;
  dialogClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
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

export function InlineModal({
  isOpen,
  ariaLabel,
  children,
  dialogClassName = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  onClose
}: InlineModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusDialog = () => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = getFocusableElements(dialog);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog.focus();
      }
    };

    focusDialog();

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
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
  }, [closeOnEscape, isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="modern-inline-modal"
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
      <div
        className={`modern-inline-modal__dialog ${dialogClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        ref={dialogRef}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
