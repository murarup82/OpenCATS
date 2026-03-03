const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z][^>]*>/i;
const UNSAFE_URL_PATTERN = /^\s*(javascript|data|vbscript):/i;
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'a'
]);

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(rawLine: string): string {
  let rendered = escapeHTML(rawLine);

  rendered = rendered.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  rendered = rendered.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  rendered = rendered.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  rendered = rendered.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  return rendered;
}

function toMarkdownHTML(input: string): string {
  const normalized = input.replace(/\r\n?/g, '\n').trim();
  if (normalized === '') {
    return '';
  }

  const blocks = normalized.split(/\n{2,}/).filter((block) => block.trim() !== '');
  const renderedBlocks = blocks.map((block) => {
    const lines = block.split('\n');
    const contentLines = lines.filter((line) => line.trim() !== '');
    const isBulletList =
      contentLines.length > 0 && contentLines.every((line) => /^\s*[-*+]\s+/.test(line));
    if (isBulletList) {
      const items = contentLines
        .map((line) => line.replace(/^\s*[-*+]\s+/, ''))
        .map((line) => `<li>${renderInlineMarkdown(line)}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    const isNumberedList =
      contentLines.length > 0 && contentLines.every((line) => /^\s*\d+\.\s+/.test(line));
    if (isNumberedList) {
      const items = contentLines
        .map((line) => line.replace(/^\s*\d+\.\s+/, ''))
        .map((line) => `<li>${renderInlineMarkdown(line)}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    }

    if (contentLines.length === 1) {
      const headingMatch = contentLines[0].match(/^\s{0,3}(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = Math.min(6, Math.max(1, headingMatch[1].length));
        return `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
      }
    }

    return `<p>${lines.map((line) => renderInlineMarkdown(line)).join('<br />')}</p>`;
  });

  return renderedBlocks.join('');
}

function unwrapElement(element: Element): void {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function sanitizeLegacyHTMLNode(root: Node): void {
  const childNodes = Array.from(root.childNodes);
  childNodes.forEach((node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      root.removeChild(node);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as Element;
    sanitizeLegacyHTMLNode(element);

    const tagName = element.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      unwrapElement(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      if (tagName === 'a' && attributeName === 'href') {
        const hrefValue = String(element.getAttribute('href') || '').trim();
        if (hrefValue === '' || UNSAFE_URL_PATTERN.test(hrefValue)) {
          element.removeAttribute('href');
        }
        return;
      }
      element.removeAttribute(attribute.name);
    });

    if (tagName === 'a' && element.hasAttribute('href')) {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noreferrer noopener');
    }
  });
}

function sanitizeLegacyHTML(input: string): string {
  if (typeof document === 'undefined') {
    return escapeHTML(input).replace(/\r\n?/g, '\n').replace(/\n/g, '<br />');
  }

  const template = document.createElement('template');
  template.innerHTML = input;
  sanitizeLegacyHTMLNode(template.content);
  return template.innerHTML;
}

export function formatRichTextToHTML(input: string): string {
  const normalized = String(input || '');
  if (normalized.trim() === '') {
    return '';
  }

  if (HTML_TAG_PATTERN.test(normalized)) {
    return sanitizeLegacyHTML(normalized);
  }

  return toMarkdownHTML(normalized);
}
