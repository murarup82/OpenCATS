import { useEffect, useMemo, useRef } from 'react';
import { Editor } from '@toast-ui/editor';
import type { Editor as ToastEditor } from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

type Props = {
  name: string;
  value: string;
  rows?: number;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  onChange: (nextValue: string) => void;
};

const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z][^>]*>/i;
const MARKDOWN_HINT_PATTERN =
  /(^|\n)\s{0,3}(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)|\*\*[^*\n]+\*\*|_[^_\n]+_|`[^`\n]+`/m;
const BULLET_MARKER_PATTERN = /^\s*[•·▪◦]\s+/;
const ORDERED_PAREN_PATTERN = /^\s*(\d+)\)\s+/;

function normalizeValue(value: string): string {
  return String(value || '');
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames
    .map((className) => String(className || '').trim())
    .filter((className) => className !== '')
    .join(' ');
}

function normalizePlainTextPaste(input: string): string {
  return String(input || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      if (BULLET_MARKER_PATTERN.test(line)) {
        return line.replace(BULLET_MARKER_PATTERN, '- ');
      }
      if (ORDERED_PAREN_PATTERN.test(line)) {
        return line.replace(ORDERED_PAREN_PATTERN, '$1. ');
      }
      return line;
    })
    .join('\n');
}

function collapseMarkdownSpacing(input: string): string {
  return String(input || '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function convertHTMLNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return String(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const childrenText = Array.from(element.childNodes).map((child) => convertHTMLNodeToMarkdown(child)).join('');

  if (tagName === 'br') {
    return '\n';
  }

  if (tagName === 'strong' || tagName === 'b') {
    const content = childrenText.trim();
    return content === '' ? '' : `**${content}**`;
  }

  if (tagName === 'em' || tagName === 'i') {
    const content = childrenText.trim();
    return content === '' ? '' : `_${content}_`;
  }

  if (tagName === 'code') {
    const content = childrenText.trim();
    return content === '' ? '' : `\`${content}\``;
  }

  if (tagName === 'a') {
    const text = childrenText.trim();
    const href = String(element.getAttribute('href') || '').trim();
    if (href === '') {
      return text;
    }
    const safeText = text === '' ? href : text;
    return `[${safeText}](${href})`;
  }

  if (tagName === 'li') {
    return collapseMarkdownSpacing(childrenText);
  }

  if (tagName === 'ul') {
    const items = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((child) => `- ${collapseMarkdownSpacing(convertHTMLNodeToMarkdown(child))}`);
    return items.join('\n') + '\n\n';
  }

  if (tagName === 'ol') {
    const items = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((child, index) => `${index + 1}. ${collapseMarkdownSpacing(convertHTMLNodeToMarkdown(child))}`);
    return items.join('\n') + '\n\n';
  }

  if (tagName.match(/^h[1-6]$/)) {
    const level = Number(tagName.slice(1));
    const content = collapseMarkdownSpacing(childrenText);
    if (content === '') {
      return '';
    }
    return `${'#'.repeat(level)} ${content}\n\n`;
  }

  if (tagName === 'p' || tagName === 'div' || tagName === 'section' || tagName === 'article' || tagName === 'blockquote') {
    const content = collapseMarkdownSpacing(childrenText);
    if (content === '') {
      return '\n';
    }
    if (tagName === 'blockquote') {
      return content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') + '\n\n';
    }
    return `${content}\n\n`;
  }

  return childrenText;
}

function convertHTMLToMarkdown(input: string): string {
  const html = String(input || '').trim();
  if (html === '' || typeof document === 'undefined') {
    return '';
  }

  const template = document.createElement('template');
  template.innerHTML = html;
  const markdown = Array.from(template.content.childNodes)
    .map((node) => convertHTMLNodeToMarkdown(node))
    .join('');

  return collapseMarkdownSpacing(
    markdown
      .replace(/\u00a0/g, ' ')
      .replace(/\r\n?/g, '\n')
  );
}

function resolvePasteAsMarkdown(event: ClipboardEvent): string | null {
  const clipboard = event.clipboardData;
  if (!clipboard) {
    return null;
  }

  const html = String(clipboard.getData('text/html') || '');
  const plain = String(clipboard.getData('text/plain') || '');

  if (html.trim() !== '' && HTML_TAG_PATTERN.test(html)) {
    const markdownFromHTML = convertHTMLToMarkdown(html);
    if (markdownFromHTML !== '') {
      return markdownFromHTML;
    }
  }

  if (plain.trim() === '') {
    return null;
  }

  if (MARKDOWN_HINT_PATTERN.test(plain)) {
    return normalizePlainTextPaste(plain);
  }

  const normalizedPlain = normalizePlainTextPaste(plain);
  if (normalizedPlain !== plain) {
    return normalizedPlain;
  }

  return null;
}

export function MarkdownTextarea({
  name,
  value,
  rows = 5,
  placeholder = '',
  ariaLabel,
  className = '',
  onChange
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const syncGuardRef = useRef(false);
  const lastSyncedValueRef = useRef<string>(normalizeValue(value));

  const editorHeight = useMemo(() => `${Math.max(220, rows * 28 + 96)}px`, [rows]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const syncValueToEditor = (editor: ToastEditor, nextRawValue: string, moveCursorToEnd: boolean) => {
    const nextValue = normalizeValue(nextRawValue);
    const currentMarkdown = normalizeValue(editor.getMarkdown());
    if (currentMarkdown === nextValue) {
      lastSyncedValueRef.current = nextValue;
      return;
    }

    syncGuardRef.current = true;
    if (HTML_TAG_PATTERN.test(nextValue)) {
      editor.setHTML(nextValue, moveCursorToEnd);
    } else {
      editor.setMarkdown(nextValue, moveCursorToEnd);
    }
    lastSyncedValueRef.current = nextValue;

    window.setTimeout(() => {
      syncGuardRef.current = false;
    }, 0);
  };

  useEffect(() => {
    if (!hostRef.current || editorRef.current) {
      return;
    }

    const editor = new Editor({
      el: hostRef.current,
      height: editorHeight,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      usageStatistics: false,
      hideModeSwitch: true,
      initialValue: '',
      placeholder,
      toolbarItems: [
        ['bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task'],
        ['table', 'link'],
        ['code', 'codeblock']
      ],
      events: {
        change: () => {
          if (syncGuardRef.current) {
            return;
          }
          const editorInstance = editorRef.current;
          if (!editorInstance) {
            return;
          }
          const nextValue = normalizeValue(editorInstance.getMarkdown());
          if (nextValue === lastSyncedValueRef.current) {
            return;
          }
          lastSyncedValueRef.current = nextValue;
          onChangeRef.current(nextValue);
        }
      }
    });

    editorRef.current = editor;
    syncValueToEditor(editor, normalizeValue(value), true);

    const markdownPasteTarget = hostRef.current.querySelector(
      '.toastui-editor-md-container .CodeMirror textarea, .toastui-editor-md-container textarea'
    ) as HTMLTextAreaElement | null;

    const onPaste = (rawEvent: Event) => {
      if (!(rawEvent instanceof ClipboardEvent)) {
        return;
      }
      if (syncGuardRef.current) {
        return;
      }

      const markdown = resolvePasteAsMarkdown(rawEvent);
      if (!markdown) {
        return;
      }

      rawEvent.preventDefault();
      editor.replaceSelection(markdown);
    };

    if (markdownPasteTarget) {
      markdownPasteTarget.addEventListener('paste', onPaste);
    }

    return () => {
      if (markdownPasteTarget) {
        markdownPasteTarget.removeEventListener('paste', onPaste);
      }
      editorRef.current = null;
      editor.destroy();
    };
  }, [editorHeight, placeholder]);

  useEffect(() => {
    const nextValue = normalizeValue(value);
    if (nextValue === lastSyncedValueRef.current) {
      return;
    }

    const editor = editorRef.current;
    if (!editor) {
      lastSyncedValueRef.current = nextValue;
      return;
    }

    syncValueToEditor(editor, nextValue, false);
  }, [value]);

  return (
    <div className={joinClassNames('avel-markdown-field', className)}>
      <div ref={hostRef} className="avel-markdown-editor-shell" aria-label={ariaLabel} />
      <textarea className="avel-markdown-hidden-input" name={name} value={value} readOnly tabIndex={-1} aria-hidden="true" />
      <p className="avel-markdown-hint">Markdown editor with live preview. Backspace and empty-line behavior match plain text editing.</p>
    </div>
  );
}
