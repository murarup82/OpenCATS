import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface RowActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  triggerLabel: string;
  menuLabel: string;
  actionCount: number;
  children: ReactNode;
}

export function RowActionMenu({
  isOpen,
  onToggle,
  onClose,
  triggerLabel,
  menuLabel,
  actionCount,
  children
}: RowActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const spaceBelow = Math.max(0, vh - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);
    const estimatedHeight = 18 + Math.max(1, actionCount) * 36;
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    if (openUp) {
      setPanelStyle({ bottom: vh - rect.top + 6, right: Math.max(0, vw - rect.right) });
    } else {
      setPanelStyle({ top: rect.bottom + 6, right: Math.max(0, vw - rect.right) });
    }
  }, [actionCount]);

  useEffect(() => {
    if (!isOpen) return;

    computePosition();

    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);
    return () => {
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isOpen, computePosition]);

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
