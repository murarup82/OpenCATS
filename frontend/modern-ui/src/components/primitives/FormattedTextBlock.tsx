import { useMemo } from 'react';
import { formatRichTextToHTML } from '../../lib/richText';

type Props = {
  text: string;
  emptyMessage?: string;
  className?: string;
};

export function FormattedTextBlock({ text, emptyMessage = 'No content.', className = '' }: Props) {
  const rawValue = String(text || '');
  const html = useMemo(() => formatRichTextToHTML(rawValue), [rawValue]);

  if (rawValue.trim() === '') {
    return <div className={`avel-richtext-block ${className}`.trim()}>{emptyMessage}</div>;
  }

  return <div className={`avel-richtext-block ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}
