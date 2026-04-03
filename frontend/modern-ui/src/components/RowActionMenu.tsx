import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface RowActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  triggerLabel: string;
  menuLabel: string;
  children: ReactNode;
}

const GAP = 6;
const VIEWPORT_MARGIN = 8;

export function RowActionMenu({
  isOpen,
  onToggle,
  onClose,
  triggerLabel,
  menuLabel,
  children
}: RowActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const reposition = () => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const panelHeight = panel.scrollHeight;
    const rightOffset = Math.max(0, vw - rect.right);
    const spaceBelow = vh - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;

    if (spaceBelow >= panelHeight) {
      setPanelStyle({ top: rect.bottom + GAP, right: rightOffset });
    } else if (spaceAbove >= panelHeight) {
      setPanelStyle({ bottom: vh - rect.top + GAP, right: rightOffset });
    } else if (spaceBelow >= spaceAbove) {
      setPanelStyle({
        top: rect.bottom + GAP,
        right: rightOffset,
        maxHeight: spaceBelow - VIEWPORT_MARGIN,
        overflowY: 'auto'
      });
    } else {
      setPanelStyle({
        bottom: vh - rect.top + GAP,
        right: rightOffset,
        maxHeight: spaceAbove - VIEWPORT_MARGIN,
        overflowY: 'auto'
      });
    }
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setPanelStyle({ visibility: 'hidden' });
      return;
    }
    reposition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onCloseRef.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="avel-candidate-row-menu">
      <button
        ref={triggerRef}
        type="button"
        className="avel-candidate-row-menu__trigger"
        onClick={onToggle}
        aria-label={triggerLabel}
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <circle cx="8" cy="3" r="1.25" fill="currentColor" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
          <circle cx="8" cy="13" r="1.25" fill="currentColor" />
        </svg>
      </button>
      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              className="avel-row-action-portal"
              role="menu"
              aria-label={menuLabel}
              style={{ position: 'fixed', ...panelStyle }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
