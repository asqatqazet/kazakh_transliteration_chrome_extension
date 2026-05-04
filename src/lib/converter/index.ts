import { arabicToCyrillic, cyrillicToArabic } from './cyrillic-arabic';
import { cyrillicToLatin2021, latin2021ToCyrillic } from './cyrillic-latin-2021';
import { detectScript } from './script-detect';
import type { ConvertOptions, Script } from './types';

export type { ConvertOptions, Script } from './types';
export { DEFAULT_OPTIONS, SCRIPTS } from './types';
export { detectScript } from './script-detect';

export function convert(
  text: string,
  to: Script,
  from: Script | null = null,
  opts: ConvertOptions = {}
): string {
  if (typeof text !== 'string') {
    throw new TypeError('convert(text, …): text must be a string');
  }
  if (text.length === 0) return text;

  const source = from ?? detectScript(text);
  if (source === to) return text;

  if (source === 'Cyrillic' && to === 'Arabic') return cyrillicToArabic(text);
  if (source === 'Arabic' && to === 'Cyrillic') return arabicToCyrillic(text);
  if (source === 'Cyrillic' && to === 'Latin') return cyrillicToLatin2021(text, opts);
  if (source === 'Latin' && to === 'Cyrillic') return latin2021ToCyrillic(text, opts);

  // Arabic↔Latin transitively via Cyrillic.
  if (source === 'Arabic' && to === 'Latin') {
    return cyrillicToLatin2021(arabicToCyrillic(text), opts);
  }
  if (source === 'Latin' && to === 'Arabic') {
    return cyrillicToArabic(latin2021ToCyrillic(text, opts));
  }

  return text;
}
