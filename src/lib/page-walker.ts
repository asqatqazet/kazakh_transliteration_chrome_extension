import { convert, type ConvertOptions, type Script } from './converter';

const SKIP_TAGS = new Set([
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'KBD',
  'SAMP',
  'VAR',
]);

const SKIP_ATTR = 'data-no-translit';

function isSkipped(node: Node): boolean {
  let el: Node | null = node;
  while (el) {
    if (el instanceof Element) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.hasAttribute(SKIP_ATTR)) return true;
      if (el.getAttribute('contenteditable') === 'true') return true;
    }
    el = el.parentNode;
  }
  return false;
}

export interface PageWalkerStats {
  visited: number;
  changed: number;
}

export function convertPage(
  to: Script,
  from: Script | null,
  opts: ConvertOptions
): PageWalkerStats {
  const stats: PageWalkerStats = { visited: 0, changed: 0 };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return NodeFilter.FILTER_REJECT;
      if (isSkipped(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    stats.visited += 1;
    const original = node.nodeValue ?? '';
    const converted = convert(original, to, from, opts);
    if (converted !== original) {
      node.nodeValue = converted;
      stats.changed += 1;
      const parent = node.parentElement;
      if (parent && to === 'Arabic') {
        parent.style.direction = 'rtl';
      }
    }
  }

  return stats;
}
