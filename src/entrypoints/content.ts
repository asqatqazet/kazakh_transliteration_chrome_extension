import { convert } from '@/lib/converter';
import type { RuntimeMessage, RuntimeResponse } from '@/lib/messages';
import { convertPage } from '@/lib/page-walker';
import { isDomainExcluded, loadSettings } from '@/lib/settings';
import { showModal } from '@/lib/ui/modal';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    chrome.runtime.onMessage.addListener(
      (message: RuntimeMessage, _sender, sendResponse: (r: RuntimeResponse) => void) => {
        handle(message)
          .then(sendResponse)
          .catch((err: unknown) => {
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) });
          });
        return true; // async response
      }
    );
  },
});

async function handle(message: RuntimeMessage): Promise<RuntimeResponse> {
  const settings = await loadSettings();

  if (isDomainExcluded(window.location.hostname, settings.excludedDomains)) {
    return { ok: false, error: 'domain-excluded' };
  }

  const opts = {
    collapseIyy: settings.collapseIyy,
    collapseHh: settings.collapseHh,
    loanwordPolicy: settings.loanwordPolicy,
  };

  if (message.type === 'convert-selection') {
    const converted = convert(message.selectionText, message.to, message.from, opts);
    showModal(converted, message.to === 'Arabic' ? 'rtl' : 'ltr');
    return { ok: true };
  }

  if (message.type === 'popup-convert-selection') {
    const text = window.getSelection()?.toString() ?? '';
    if (!text) return { ok: false, error: 'no-selection' };
    const converted = convert(text, message.to, message.from, opts);
    showModal(converted, message.to === 'Arabic' ? 'rtl' : 'ltr');
    return { ok: true };
  }

  if (message.type === 'convert-page') {
    const stats = convertPage(message.to, message.from, opts);
    return { ok: true, stats };
  }

  return { ok: false, error: 'unknown-message-type' };
}
