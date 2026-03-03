import { useEffect, useMemo, useRef } from 'react';
import { Editor } from '@toast-ui/editor';
import type { Editor as ToastEditor } from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { formatRichTextToHTML } from '../../lib/richText';

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

function normalizeValue(value: string): string {
  return String(value || '');
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames
    .map((className) => String(className || '').trim())
    .filter((className) => className !== '')
    .join(' ');
}

function maybeInsertMarkdownPaste(event: ClipboardEvent): boolean {
  const clipboard = event.clipboardData;
  if (!clipboard) {
    return false;
  }

  const plain = String(clipboard.getData('text/plain') || '');
  const html = String(clipboard.getData('text/html') || '');
  if (plain.trim() === '') {
    return false;
  }

  const isLikelyPlainPaste = html.trim() === '' || html.trim() === plain.trim();
  if (!isLikelyPlainPaste || !MARKDOWN_HINT_PATTERN.test(plain)) {
    return false;
  }

  const rendered = formatRichTextToHTML(plain);
  if (rendered.trim() === '') {
    return false;
  }

  event.preventDefault();
  document.execCommand('insertHTML', false, rendered);
  return true;
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

    const proseMirrorHost = hostRef.current.querySelector('.ProseMirror') as HTMLElement | null;
    const onPaste = (rawEvent: Event) => {
      if (!(rawEvent instanceof ClipboardEvent)) {
        return;
      }
      if (syncGuardRef.current) {
        return;
      }
      maybeInsertMarkdownPaste(rawEvent);
    };
    if (proseMirrorHost) {
      proseMirrorHost.addEventListener('paste', onPaste);
    }

    return () => {
      if (proseMirrorHost) {
        proseMirrorHost.removeEventListener('paste', onPaste);
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
