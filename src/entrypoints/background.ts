import type { RuntimeMessage } from '@/lib/messages';

const MENU_TO_ARABIC = 'k-translit-to-arabic';
const MENU_TO_CYRILLIC = 'k-translit-to-cyrillic';
const MENU_TO_LATIN = 'k-translit-to-latin';

function i18n(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: MENU_TO_ARABIC,
        title: i18n('contextMenuToArabic'),
        contexts: ['selection'],
      });
      chrome.contextMenus.create({
        id: MENU_TO_CYRILLIC,
        title: i18n('contextMenuToCyrillic'),
        contexts: ['selection'],
      });
      chrome.contextMenus.create({
        id: MENU_TO_LATIN,
        title: i18n('contextMenuToLatin'),
        contexts: ['selection'],
      });
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id || !info.selectionText) return;

    const map: Record<string, RuntimeMessage> = {
      [MENU_TO_ARABIC]: {
        type: 'convert-selection',
        to: 'Arabic',
        from: 'Cyrillic',
        selectionText: info.selectionText,
      },
      [MENU_TO_CYRILLIC]: {
        type: 'convert-selection',
        to: 'Cyrillic',
        from: null,
        selectionText: info.selectionText,
      },
      [MENU_TO_LATIN]: {
        type: 'convert-selection',
        to: 'Latin',
        from: 'Cyrillic',
        selectionText: info.selectionText,
      },
    };

    const msg = map[info.menuItemId as string];
    if (msg) {
      chrome.tabs.sendMessage(tab.id, msg).catch(() => {
        // Tab may not have the content script loaded (e.g. chrome:// URLs).
      });
    }
  });
});
