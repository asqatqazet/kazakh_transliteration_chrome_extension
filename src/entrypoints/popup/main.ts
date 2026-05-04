import type { Script } from '@/lib/converter';
import type { RuntimeMessage, RuntimeResponse } from '@/lib/messages';

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
}

function i18n(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

function localize(): void {
  $('title').textContent = i18n('popupTitle');
  $('targetLabel').textContent = i18n('popupTargetLabel');
  $('convertSelection').textContent = i18n('popupConvertSelection');
  $('convertPage').textContent = i18n('popupConvertPage');
  $('openOptions').textContent = i18n('popupOpenOptions');

  const target = $('target') as HTMLSelectElement;
  const labels: Record<string, string> = {
    Cyrillic: i18n('scriptCyrillic'),
    Arabic: i18n('scriptArabic'),
    Latin: i18n('scriptLatin'),
  };
  for (const opt of Array.from(target.options)) {
    opt.textContent = labels[opt.value] ?? opt.value;
  }
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function send(msg: RuntimeMessage): Promise<RuntimeResponse> {
  const id = await activeTabId();
  if (id === undefined) return { ok: false, error: 'no-active-tab' };
  try {
    return await chrome.tabs.sendMessage(id, msg);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function setStatus(text: string): void {
  $('status').textContent = text;
}

document.addEventListener('DOMContentLoaded', () => {
  localize();

  const target = $('target') as HTMLSelectElement;

  $('convertSelection').addEventListener('click', async () => {
    setStatus('…');
    const r = await send({
      type: 'popup-convert-selection',
      to: target.value as Script,
      from: null,
    });
    setStatus(r.ok ? '' : r.error === 'no-selection' ? 'No text selected' : `Error: ${r.error}`);
    if (r.ok) window.close();
  });

  $('convertPage').addEventListener('click', async () => {
    setStatus('…');
    const r = await send({
      type: 'convert-page',
      to: target.value as Script,
      from: null,
    });
    if (r.ok && r.stats) {
      setStatus(`Converted ${r.stats.changed} of ${r.stats.visited} text nodes`);
    } else {
      setStatus(`Error: ${r.error ?? 'unknown'}`);
    }
  });

  $('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
