import type { ConvertOptions } from './converter';

export interface Settings extends Required<ConvertOptions> {
  excludedDomains: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  collapseIyy: true,
  collapseHh: true,
  loanwordPolicy: 'transliterate',
  excludedDomains: [],
};

const STORAGE_KEY = 'settings';

function getArea(): chrome.storage.StorageArea {
  // Prefer sync (cross-device) but fall back to local on quota errors.
  return chrome.storage.sync ?? chrome.storage.local;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await getArea().get(STORAGE_KEY);
    const stored = raw[STORAGE_KEY] as Partial<Settings> | undefined;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await getArea().set({ [STORAGE_KEY]: settings });
  } catch {
    // Sync quota exceeded — fall back to local.
    await chrome.storage.local.set({ [STORAGE_KEY]: settings });
  }
}

export function isDomainExcluded(hostname: string, excluded: string[]): boolean {
  const host = hostname.toLowerCase();
  return excluded.some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (!rule) return false;
    return host === rule || host.endsWith(`.${rule}`);
  });
}
