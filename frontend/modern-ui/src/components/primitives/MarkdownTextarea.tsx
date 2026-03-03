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

function normalizeValue(value: string): string {
  return String(value || '');
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames
    .map((className) => String(className || '').trim())
    .filter((className) => className !== '')
    .join(' ');
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
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
      usageStatistics: false,
      hideModeSwitch: false,
      initialValue: '',
      placeholder,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
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

    return () => {
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
      <p className="avel-markdown-hint">WYSIWYG + Markdown supported. You can switch modes from the editor tabs.</p>
    </div>
  );
}
