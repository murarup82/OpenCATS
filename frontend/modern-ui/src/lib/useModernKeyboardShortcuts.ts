import { useEffect } from 'react';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }

  return target.isContentEditable;
}

function focusPrimarySearchInput(): boolean {
  const selector = [
    '.modern-dashboard input[type="search"]',
    '.modern-page input[type="search"]',
    'input[type="search"]'
  ].join(', ');
  const target = document.querySelector<HTMLInputElement>(selector);
  if (!target) {
    return false;
  }
  target.focus();
  target.select();
  return true;
}

export function useModernKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        !isTypingTarget(event.target)
      ) {
        if (focusPrimarySearchInput()) {
          event.preventDefault();
        }
        return;
      }

      if (
        (event.key === 'R' || event.key === 'r') &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent('opencats:modern-page:refresh', {
            cancelable: true,
            detail: {
              source: 'keyboard-shortcut'
            }
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
