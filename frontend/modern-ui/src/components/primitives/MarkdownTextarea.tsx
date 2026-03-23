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
const EXTENDED_BULLET_MARKER_PATTERN = /^\s*[\u2022\u00b7\u25aa\u25e6\u25cf\u25cb\u2023]\s+/;
const BOLD_STYLE_PATTERN = /font-weight\s*:\s*(bold|[6-9]00)/i;
const ITALIC_STYLE_PATTERN = /font-style\s*:\s*italic/i;
const ORDERED_LIST_PATTERN = /^\s*(\d+)[\.\)]\s+/;
const LIST_CONTINUATION_PATTERN = /^\s{2,}\S/;
const TOOLBAR_CLASS_LABELS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bheading\b/i, label: 'Heading' },
  { pattern: /\bbold\b/i, label: 'Bold' },
  { pattern: /\bitalic\b/i, label: 'Italic' },
  { pattern: /\bstrike\b/i, label: 'Strike' },
  { pattern: /\bquote\b/i, label: 'Quote' },
  { pattern: /\bul\b/i, label: 'Bullets' },
  { pattern: /\bol\b/i, label: 'Numbered' },
  { pattern: /\btask\b/i, label: 'Checklist' },
  { pattern: /\btable\b/i, label: 'Table' },
  { pattern: /\blink\b/i, label: 'Link' },
  { pattern: /\bcodeblock\b/i, label: 'Code Block' },
  { pattern: /\bcode\b/i, label: 'Code' }
];

function normalizeValue(value: string): string {
  return String(value || '');
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames
    .map((className) => String(className || '').trim())
    .filter((className) => className !== '')
    .join(' ');
}

function normalizeClipboardText(input: string): string {
  return String(input || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '  ');
}

function normalizePlainTextMarkers(input: string): string {
  return normalizeClipboardText(input)
    .split('\n')
    .map((line) => {
      if (BULLET_MARKER_PATTERN.test(line) || EXTENDED_BULLET_MARKER_PATTERN.test(line)) {
        return line.replace(BULLET_MARKER_PATTERN, '- ').replace(EXTENDED_BULLET_MARKER_PATTERN, '- ');
      }
      if (ORDERED_LIST_PATTERN.test(line)) {
        return line.replace(ORDERED_LIST_PATTERN, '$1. ');
      }
      if (ORDERED_PAREN_PATTERN.test(line)) {
        return line.replace(ORDERED_PAREN_PATTERN, '$1. ');
      }
      return line;
    })
    .join('\n');
}

function nextNonEmptyLine(lines: string[], startIndex: number): string {
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }
  return '';
}

function looksLikeSectionHeading(line: string, upcomingLine: string): boolean {
  const compact = line.trim();
  if (compact === '' || compact.length > 72) {
    return false;
  }
  if (/^\d+[\.\)]\s+/.test(compact) || /^[-*+]\s+/.test(compact) || EXTENDED_BULLET_MARKER_PATTERN.test(compact)) {
    return false;
  }
  if (/[.!?]$/.test(compact)) {
    return false;
  }
  if (compact.endsWith(':')) {
    return true;
  }

  const wordCount = compact.split(/\s+/).length;
  if (wordCount > 8) {
    return false;
  }
  if (upcomingLine === '') {
    return false;
  }
  return BULLET_MARKER_PATTERN.test(upcomingLine) || EXTENDED_BULLET_MARKER_PATTERN.test(upcomingLine) || ORDERED_LIST_PATTERN.test(upcomingLine);
}

function normalizeStructuredPlainTextPaste(input: string): string {
  const normalized = normalizePlainTextMarkers(input);
  const lines = normalized.split('\n');
  const hasListLikeLines = lines.some((line) => BULLET_MARKER_PATTERN.test(line.trim()) || ORDERED_LIST_PATTERN.test(line.trim()));
  const hasHeadingCandidate = lines.some((line, index) => looksLikeSectionHeading(line.trim(), nextNonEmptyLine(lines, index + 1)));
  const hasLikelyWrappedParagraph = lines.some((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.length < 70) {
      return false;
    }
    if (BULLET_MARKER_PATTERN.test(trimmed) || ORDERED_LIST_PATTERN.test(trimmed)) {
      return false;
    }
    const upcoming = nextNonEmptyLine(lines, index + 1);
    return upcoming !== '' && !BULLET_MARKER_PATTERN.test(upcoming) && !ORDERED_LIST_PATTERN.test(upcoming);
  });

  if (!hasListLikeLines && !hasHeadingCandidate && !hasLikelyWrappedParagraph) {
    return normalized.trim();
  }

  const output: string[] = [];
  const paragraphParts: string[] = [];

  const flushParagraph = () => {
    if (paragraphParts.length === 0) {
      return;
    }
    const paragraph = paragraphParts.join(' ').replace(/\s+/g, ' ').trim();
    paragraphParts.length = 0;
    if (paragraph !== '') {
      output.push(paragraph);
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index].replace(/\s+$/g, '');
    const trimmed = rawLine.trim();
    const upcoming = nextNonEmptyLine(lines, index + 1);

    if (trimmed === '') {
      flushParagraph();
      if (output.length > 0 && output[output.length - 1] !== '') {
        output.push('');
      }
      continue;
    }

    if (LIST_CONTINUATION_PATTERN.test(rawLine) && output.length > 0) {
      const previousLine = output[output.length - 1];
      if (BULLET_MARKER_PATTERN.test(previousLine) || ORDERED_LIST_PATTERN.test(previousLine)) {
        output[output.length - 1] = `${previousLine} ${trimmed}`.replace(/\s+/g, ' ');
        continue;
      }
    }

    if (BULLET_MARKER_PATTERN.test(trimmed)) {
      flushParagraph();
      output.push(`- ${trimmed.replace(BULLET_MARKER_PATTERN, '').trim()}`);
      continue;
    }

    if (ORDERED_LIST_PATTERN.test(trimmed)) {
      flushParagraph();
      output.push(trimmed.replace(ORDERED_LIST_PATTERN, '$1. ').trim());
      continue;
    }

    if (looksLikeSectionHeading(trimmed, upcoming)) {
      flushParagraph();
      output.push(`## ${trimmed.replace(/:\s*$/, '').trim()}`);
      if (output[output.length - 1] !== '') {
        output.push('');
      }
      continue;
    }

    paragraphParts.push(trimmed);
  }

  flushParagraph();
  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function collapseMarkdownSpacing(input: string): string {
  return String(input || '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function wrapWithMarkersPreservingWhitespace(input: string, marker: string): string {
  const value = String(input || '');
  const leadingMatch = value.match(/^\s*/);
  const trailingMatch = value.match(/\s*$/);
  const leading = leadingMatch ? leadingMatch[0] : '';
  const trailing = trailingMatch ? trailingMatch[0] : '';
  const core = value.slice(leading.length, Math.max(leading.length, value.length - trailing.length));

  if (core === '') {
    return value;
  }

  return `${leading}${marker}${core}${marker}${trailing}`;
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

  const inlineStyle = String(element.getAttribute('style') || '');
  let inlineText = childrenText;

  if (BOLD_STYLE_PATTERN.test(inlineStyle) && tagName !== 'strong' && tagName !== 'b') {
    inlineText = wrapWithMarkersPreservingWhitespace(inlineText, '**');
  }

  if (ITALIC_STYLE_PATTERN.test(inlineStyle) && tagName !== 'em' && tagName !== 'i') {
    inlineText = wrapWithMarkersPreservingWhitespace(inlineText, '_');
  }

  return inlineText;
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

function resolveToolbarLabel(button: HTMLButtonElement): string {
  const explicitLabel = String(button.getAttribute('aria-label') || button.getAttribute('title') || '').trim();
  if (explicitLabel !== '') {
    return explicitLabel;
  }

  const className = String(button.className || '');
  for (let index = 0; index < TOOLBAR_CLASS_LABELS.length; index += 1) {
    if (TOOLBAR_CLASS_LABELS[index].pattern.test(className)) {
      return TOOLBAR_CLASS_LABELS[index].label;
    }
  }

  return 'Editor Action';
}

function applyToolbarAccessibilityLabels(hostElement: HTMLElement): void {
  const toolbarButtons = hostElement.querySelectorAll('.toastui-editor-toolbar-icons');
  toolbarButtons.forEach((node) => {
    if (!(node instanceof HTMLButtonElement)) {
      return;
    }
    const label = resolveToolbarLabel(node);
    node.setAttribute('aria-label', label);
    node.setAttribute('title', label);
    node.setAttribute('data-avel-label', label);
    node.classList.add('avel-markdown-toolbar-button');
  });
}

function isElementTarget(target: EventTarget | null): target is Element {
  return target instanceof Element;
}

function isInsideEditorPopup(target: EventTarget | null): boolean {
  if (!isElementTarget(target)) {
    return false;
  }
  return target.closest('.toastui-editor-popup') !== null;
}

function isHeadingPopupItemTarget(target: EventTarget | null): boolean {
  if (!isElementTarget(target)) {
    return false;
  }
  return target.closest('.toastui-editor-popup-add-heading li') !== null;
}

function isEditorSurfaceTarget(target: EventTarget | null): boolean {
  if (!isElementTarget(target)) {
    return false;
  }
  return (
    target.closest('.toastui-editor-md-container') !== null ||
    target.closest('.toastui-editor-ww-container') !== null ||
    target.closest('.toastui-editor-md-preview') !== null
  );
}

function isOutsideHostAndPopup(target: EventTarget | null, hostElement: HTMLElement): boolean {
  if (!isElementTarget(target)) {
    return false;
  }
  if (hostElement.contains(target)) {
    return false;
  }
  return !isInsideEditorPopup(target);
}

function closeEditorPopups(editor: ToastEditor): void {
  const editorWithEmitter = editor as unknown as {
    eventEmitter?: {
      emit?: (eventName: string) => void;
    };
  };
  if (editorWithEmitter.eventEmitter && typeof editorWithEmitter.eventEmitter.emit === 'function') {
    editorWithEmitter.eventEmitter.emit('closePopup');
  }
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
    return normalizePlainTextMarkers(plain);
  }

  const normalizedPlain = normalizeClipboardText(plain);
  const smartNormalizedPlain = normalizeStructuredPlainTextPaste(plain);
  if (smartNormalizedPlain !== normalizedPlain.trim()) {
    return smartNormalizedPlain;
  }

  const markerNormalizedPlain = normalizePlainTextMarkers(plain);
  if (markerNormalizedPlain !== normalizedPlain) {
    return markerNormalizedPlain;
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
  const popupCloseTimerRef = useRef<number | null>(null);

  const editorHeight = useMemo(() => `${Math.max(220, rows * 28 + 96)}px`, [rows]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const clearPopupCloseTimer = () => {
    if (popupCloseTimerRef.current === null) {
      return;
    }
    window.clearTimeout(popupCloseTimerRef.current);
    popupCloseTimerRef.current = null;
  };

  const schedulePopupClose = (editor: ToastEditor) => {
    clearPopupCloseTimer();
    popupCloseTimerRef.current = window.setTimeout(() => {
      popupCloseTimerRef.current = null;
      closeEditorPopups(editor);
    }, 0);
  };

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
    const hostElement = hostRef.current;

    const editor = new Editor({
      el: hostElement,
      height: editorHeight,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      usageStatistics: false,
      hideModeSwitch: true,
      initialValue: '',
      placeholder,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['quote'],
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
    applyToolbarAccessibilityLabels(hostElement);

    const onHeadingPopupActivationCapture = (rawEvent: Event) => {
      if (!isHeadingPopupItemTarget(rawEvent.target)) {
        return;
      }
      schedulePopupClose(editor);
    };
    hostElement.addEventListener('click', onHeadingPopupActivationCapture, true);

    const onHostMouseDownCapture = (rawEvent: Event) => {
      if (!isEditorSurfaceTarget(rawEvent.target) || isInsideEditorPopup(rawEvent.target)) {
        return;
      }
      window.requestAnimationFrame(() => {
        closeEditorPopups(editor);
      });
    };
    hostElement.addEventListener('mousedown', onHostMouseDownCapture, true);

    const onHostFocusIn = (rawEvent: Event) => {
      if (!isEditorSurfaceTarget(rawEvent.target) || isInsideEditorPopup(rawEvent.target)) {
        return;
      }
      closeEditorPopups(editor);
    };
    hostElement.addEventListener('focusin', onHostFocusIn);

    const onHostKeyDownCapture = (rawEvent: Event) => {
      if (!(rawEvent instanceof KeyboardEvent)) {
        return;
      }
      if (rawEvent.key === 'Escape') {
        closeEditorPopups(editor);
        return;
      }
      if ((rawEvent.key === 'Enter' || rawEvent.key === ' ') && isHeadingPopupItemTarget(rawEvent.target)) {
        schedulePopupClose(editor);
        return;
      }
      if (!isEditorSurfaceTarget(rawEvent.target) || isInsideEditorPopup(rawEvent.target)) {
        return;
      }
      closeEditorPopups(editor);
    };
    hostElement.addEventListener('keydown', onHostKeyDownCapture, true);

    const onDocumentMouseDownCapture = (rawEvent: Event) => {
      if (!isOutsideHostAndPopup(rawEvent.target, hostElement)) {
        return;
      }
      closeEditorPopups(editor);
    };
    document.addEventListener('mousedown', onDocumentMouseDownCapture, true);

    const onDocumentFocusIn = (rawEvent: Event) => {
      if (!isOutsideHostAndPopup(rawEvent.target, hostElement)) {
        return;
      }
      closeEditorPopups(editor);
    };
    document.addEventListener('focusin', onDocumentFocusIn, true);

    const markdownPasteTarget = hostElement.querySelector(
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
      clearPopupCloseTimer();
      hostElement.removeEventListener('click', onHeadingPopupActivationCapture, true);
      hostElement.removeEventListener('keydown', onHostKeyDownCapture, true);
      hostElement.removeEventListener('mousedown', onHostMouseDownCapture, true);
      hostElement.removeEventListener('focusin', onHostFocusIn);
      document.removeEventListener('mousedown', onDocumentMouseDownCapture, true);
      document.removeEventListener('focusin', onDocumentFocusIn, true);
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
      <p className="avel-markdown-hint">Markdown editor with live preview. Smart paste normalizes common heading/list patterns automatically.</p>
    </div>
  );
}
