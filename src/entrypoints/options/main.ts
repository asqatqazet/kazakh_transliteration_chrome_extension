import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '@/lib/settings';

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el as T;
}

function i18n(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

function localize(): void {
  $('title').textContent = i18n('optionsTitle');
  $('latinLegend').textContent = i18n('optionsLatinVariant');
  $('collapseIyyLabel').textContent = i18n('optionsCollapseIyy');
  $('collapseHhLabel').textContent = i18n('optionsCollapseHh');
  $('loanwordLabel').textContent = i18n('optionsLoanwordPolicy');
  $('loanTranslitOpt').textContent = i18n('optionsLoanwordTransliterate');
  $('loanDropOpt').textContent = i18n('optionsLoanwordDrop');
  $('exclusionLegend').textContent = i18n('optionsExclusionList');
  $('exclusionLabel').textContent = i18n('optionsExclusionList');
  $('save').textContent = i18n('optionsSave');
}

function applyToForm(settings: Settings): void {
  $<HTMLInputElement>('collapseIyy').checked = settings.collapseIyy;
  $<HTMLInputElement>('collapseHh').checked = settings.collapseHh;
  $<HTMLSelectElement>('loanwordPolicy').value = settings.loanwordPolicy;
  $<HTMLTextAreaElement>('excludedDomains').value = settings.excludedDomains.join('\n');
}

function readForm(): Settings {
  return {
    collapseIyy: $<HTMLInputElement>('collapseIyy').checked,
    collapseHh: $<HTMLInputElement>('collapseHh').checked,
    loanwordPolicy: $<HTMLSelectElement>('loanwordPolicy').value as Settings['loanwordPolicy'],
    excludedDomains: $<HTMLTextAreaElement>('excludedDomains')
      .value.split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  localize();
  applyToForm({ ...DEFAULT_SETTINGS, ...(await loadSettings()) });

  $('save').addEventListener('click', async () => {
    await saveSettings(readForm());
    const status = $('status');
    status.textContent = i18n('optionsSaved');
    window.setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
});
