import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

export type SelectMenuOption = {
  value: string;
  label: string;
  tone?: string;
};

type SelectMenuProps = {
  label: string;
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
  className?: string;
  labelClassName?: string;
  comboClassName?: string;
  triggerClassName?: string;
  triggerValueClassName?: string;
  triggerCaretClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  optionDotClassName?: string;
  optionToneClassNamePrefix?: string;
  emptyLabel?: string;
};

function toSlug(value: string): string {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'default';
}

export function SelectMenu({
  label,
  value,
  options,
  onChange,
  className = 'modern-command-field',
  labelClassName = 'modern-command-label',
  comboClassName = 'modern-command-field__combo',
  triggerClassName = 'modern-command-field__trigger',
  triggerValueClassName = 'modern-command-field__trigger-value',
  triggerCaretClassName = 'modern-command-field__trigger-caret',
  menuClassName = 'modern-command-field__menu',
  optionClassName = 'modern-command-field__option',
  optionDotClassName = 'modern-command-field__option-dot',
  optionToneClassNamePrefix = 'modern-command-field__option--',
  emptyLabel = ''
}: SelectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const comboRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  const selectedOption = options[selectedIndex] || { value: '', label: emptyLabel };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(selectedIndex);
    menuRef.current?.focus();
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const combo = comboRef.current;
      if (!combo) {
        return;
      }

      const target = event.target as Node | null;
      if (target && combo.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    window.addEventListener('mousedown', handleOutsidePointer);
    window.addEventListener('touchstart', handleOutsidePointer);

    return () => {
      window.removeEventListener('mousedown', handleOutsidePointer);
      window.removeEventListener('touchstart', handleOutsidePointer);
    };
  }, [isOpen]);

  const selectOptionAt = (index: number) => {
    const option = options[index];
    if (!option) {
      return;
    }
    onChange(option.value);
    setIsOpen(false);
  };

  const openMenu = () => {
    if (options.length === 0) {
      return;
    }
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu();
      setActiveIndex((current) => Math.min(options.length - 1, current + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
      } else {
        selectOptionAt(activeIndex);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(options.length - 1, current + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectOptionAt(activeIndex);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <label className={className}>
      <span className={labelClassName}>{label}</span>
      <div className={`${comboClassName}${isOpen ? ' is-open' : ''}`} ref={comboRef}>
        <button
          type="button"
          className={triggerClassName}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => {
            if (isOpen) {
              closeMenu();
            } else {
              openMenu();
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={triggerValueClassName}>{selectedOption.label}</span>
          <span className={triggerCaretClassName} aria-hidden="true"></span>
        </button>
        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className={menuClassName}
            ref={menuRef}
            onKeyDown={handleMenuKeyDown}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              const tone = option.tone || toSlug(option.label);
              return (
                <button
                  type="button"
                  key={`${option.value}-${option.label}`}
                  role="option"
                  aria-selected={isSelected}
                  className={
                    `${optionClassName} ${optionToneClassNamePrefix}${tone}` +
                    `${isSelected ? ' is-selected' : ''}` +
                    `${isActive ? ' is-active' : ''}`
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOptionAt(index)}
                >
                  <span className={optionDotClassName} aria-hidden="true"></span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </label>
  );
}
