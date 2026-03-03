import { useRef } from 'react';

type Props = {
  name: string;
  value: string;
  rows?: number;
  placeholder?: string;
  ariaLabel: string;
  onChange: (nextValue: string) => void;
};

function stripLineMarker(line: string): string {
  return line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');
}

export function MarkdownTextarea({ name, value, rows = 5, placeholder = '', ariaLabel, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applySelection = (nextValue: string, selectionStart: number, selectionEnd: number) => {
    onChange(nextValue);
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const wrapSelection = (prefix: string, suffix: string, fallbackValue: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const content = selected === '' ? fallbackValue : selected;
    const replacement = `${prefix}${content}${suffix}`;
    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    const nextStart = start + prefix.length;
    const nextEnd = nextStart + content.length;
    applySelection(nextValue, nextStart, nextEnd);
  };

  const prefixSelectedLines = (prefixFactory: (index: number) => string, fallback: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const blockStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf('\n', end);
    const blockEnd = nextBreak === -1 ? value.length : nextBreak;
    const block = value.slice(blockStart, blockEnd);
    const source = block.trim() === '' ? fallback : block;
    const lines = source.split('\n');
    const replacement = lines
      .map((line, index) => {
        if (line.trim() === '') {
          return line;
        }
        return `${prefixFactory(index)}${stripLineMarker(line)}`;
      })
      .join('\n');

    const nextValue = `${value.slice(0, blockStart)}${replacement}${value.slice(blockEnd)}`;
    const nextStart = blockStart;
    const nextEnd = blockStart + replacement.length;
    applySelection(nextValue, nextStart, nextEnd);
  };

  const applyHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const blockStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf('\n', end);
    const blockEnd = nextBreak === -1 ? value.length : nextBreak;
    const block = value.slice(blockStart, blockEnd);
    const source = block.trim() === '' ? 'Heading' : block;
    const replacement = source
      .split('\n')
      .map((line) => {
        if (line.trim() === '') {
          return line;
        }
        return `## ${line.replace(/^\s{0,3}#{1,6}\s+/, '')}`;
      })
      .join('\n');

    const nextValue = `${value.slice(0, blockStart)}${replacement}${value.slice(blockEnd)}`;
    const nextStart = blockStart;
    const nextEnd = blockStart + replacement.length;
    applySelection(nextValue, nextStart, nextEnd);
  };

  return (
    <div className="avel-markdown-field">
      <div className="avel-markdown-toolbar" role="toolbar" aria-label={`${ariaLabel} formatting tools`}>
        <button
          type="button"
          className="modern-btn modern-btn--secondary modern-btn--mini"
          onClick={() => wrapSelection('**', '**', 'bold text')}
        >
          Bold
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--secondary modern-btn--mini"
          onClick={() => wrapSelection('_', '_', 'italic text')}
        >
          Italic
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--secondary modern-btn--mini"
          onClick={applyHeading}
        >
          Heading
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--secondary modern-btn--mini"
          onClick={() => prefixSelectedLines(() => '- ', 'List item')}
        >
          Bullets
        </button>
        <button
          type="button"
          className="modern-btn modern-btn--secondary modern-btn--mini"
          onClick={() => prefixSelectedLines((index) => `${index + 1}. `, 'List item')}
        >
          Numbered
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="avel-form-control"
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="avel-markdown-hint">Supports Markdown: `**bold**`, `_italic_`, `## heading`, `- list`, `1. list`.</p>
    </div>
  );
}
