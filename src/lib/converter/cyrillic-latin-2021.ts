// 2021 Latin Kazakh standard (umlaut/cedilla variant). Adopted by
// presidential decree, January 2021. The native 28-letter alphabet maps
// 1:1 to Cyrillic. Loanword letters dropped from the 28 (Ё, Ц, Ч, Щ, Ъ,
// Ь, Э, Ю, Я) are handled per `loanwordPolicy`. И/Й/І and Х/Һ collapse
// in the official decree but the extension exposes toggles to disambiguate.

import { DEFAULT_OPTIONS, type ConvertOptions } from './types';

type Pair = readonly [string, string];

const NATIVE_PAIRS: ReadonlyArray<Pair> = [
  ['А', 'A'],
  ['а', 'a'],
  ['Ә', 'Ä'],
  ['ә', 'ä'],
  ['Б', 'B'],
  ['б', 'b'],
  ['В', 'V'],
  ['в', 'v'],
  ['Г', 'G'],
  ['г', 'g'],
  ['Ғ', 'Ğ'],
  ['ғ', 'ğ'],
  ['Д', 'D'],
  ['д', 'd'],
  ['Е', 'E'],
  ['е', 'e'],
  ['Ж', 'J'],
  ['ж', 'j'],
  ['З', 'Z'],
  ['з', 'z'],
  ['К', 'K'],
  ['к', 'k'],
  ['Қ', 'Q'],
  ['қ', 'q'],
  ['Л', 'L'],
  ['л', 'l'],
  ['М', 'M'],
  ['м', 'm'],
  ['Н', 'N'],
  ['н', 'n'],
  ['Ң', 'Ñ'],
  ['ң', 'ñ'],
  ['О', 'O'],
  ['о', 'o'],
  ['Ө', 'Ö'],
  ['ө', 'ö'],
  ['П', 'P'],
  ['п', 'p'],
  ['Р', 'R'],
  ['р', 'r'],
  ['С', 'S'],
  ['с', 's'],
  ['Т', 'T'],
  ['т', 't'],
  ['У', 'U'],
  ['у', 'u'],
  ['Ұ', 'Ū'],
  ['ұ', 'ū'],
  ['Ү', 'Ü'],
  ['ү', 'ü'],
  ['Ф', 'F'],
  ['ф', 'f'],
  ['Ш', 'Ş'],
  ['ш', 'ş'],
  ['Ы', 'Y'],
  ['ы', 'y'],
];

const IYY_COLLAPSED: ReadonlyArray<Pair> = [
  ['И', 'İ'],
  ['и', 'i'],
  ['Й', 'İ'],
  ['й', 'i'],
  ['І', 'İ'],
  ['і', 'i'],
];

const IYY_DISAMBIG: ReadonlyArray<Pair> = [
  ['И', 'İ'],
  ['и', 'i'],
  ['Й', 'İ'],
  ['й', 'i'],
  ['І', 'I'],
  ['і', 'ı'],
];

const HH_COLLAPSED: ReadonlyArray<Pair> = [
  ['Х', 'H'],
  ['х', 'h'],
  ['Һ', 'H'],
  ['һ', 'h'],
];

const HH_DISAMBIG: ReadonlyArray<Pair> = [
  ['Х', 'H'],
  ['х', 'h'],
  ['Һ', 'Ḣ'],
  ['һ', 'ḣ'],
];

const LOAN_TRANSLIT: ReadonlyArray<Pair> = [
  ['Ё', 'Io'],
  ['ё', 'io'],
  ['Ц', 'Ts'],
  ['ц', 'ts'],
  ['Ч', 'Ch'],
  ['ч', 'ch'],
  ['Щ', 'Şç'],
  ['щ', 'şç'],
  ['Ъ', ''],
  ['ъ', ''],
  ['Ь', ''],
  ['ь', ''],
  ['Э', 'E'],
  ['э', 'e'],
  ['Ю', 'Iu'],
  ['ю', 'iu'],
  ['Я', 'Ia'],
  ['я', 'ia'],
];

const LOAN_DROP: ReadonlyArray<Pair> = [
  ['Ё', ''],
  ['ё', ''],
  ['Ц', ''],
  ['ц', ''],
  ['Ч', ''],
  ['ч', ''],
  ['Щ', ''],
  ['щ', ''],
  ['Ъ', ''],
  ['ъ', ''],
  ['Ь', ''],
  ['ь', ''],
  ['Э', ''],
  ['э', ''],
  ['Ю', ''],
  ['ю', ''],
  ['Я', ''],
  ['я', ''],
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildReplacer(pairs: ReadonlyArray<Pair>): (input: string) => string {
  const filtered = pairs.filter(([from]) => from.length > 0);
  // Longest source first so digraphs (Şç) win over their prefixes.
  const sorted = [...filtered].sort((a, b) => b[0].length - a[0].length);
  const re = new RegExp(sorted.map(([from]) => escapeRegex(from)).join('|'), 'g');
  const map = new Map(filtered);
  return (input) => input.replace(re, (m) => map.get(m) ?? m);
}

function cyrToLatPairs(opts: Required<ConvertOptions>): ReadonlyArray<Pair> {
  return [
    ...NATIVE_PAIRS,
    ...(opts.collapseIyy ? IYY_COLLAPSED : IYY_DISAMBIG),
    ...(opts.collapseHh ? HH_COLLAPSED : HH_DISAMBIG),
    ...(opts.loanwordPolicy === 'transliterate' ? LOAN_TRANSLIT : LOAN_DROP),
  ];
}

function invertPairs(pairs: ReadonlyArray<Pair>): ReadonlyArray<Pair> {
  // Latin → Cyrillic: invert the mapping. Drop entries with empty Latin
  // (those are deletions; can't reverse). When two Cyrillic letters share
  // a Latin form (e.g. И and Й both → 'i' under collapse), the FIRST
  // listed Cyrillic wins on reversal — matches the policy of preferring И
  // over Й, and Х over Һ.
  const seen = new Set<string>();
  const out: Pair[] = [];
  for (const [cyr, lat] of pairs) {
    if (lat === '' || seen.has(lat)) continue;
    seen.add(lat);
    out.push([lat, cyr]);
  }
  return out;
}

export function cyrillicToLatin2021(input: string, opts?: ConvertOptions): string {
  const merged: Required<ConvertOptions> = { ...DEFAULT_OPTIONS, ...opts };
  return buildReplacer(cyrToLatPairs(merged))(input);
}

export function latin2021ToCyrillic(input: string, opts?: ConvertOptions): string {
  const merged: Required<ConvertOptions> = { ...DEFAULT_OPTIONS, ...opts };
  return buildReplacer(invertPairs(cyrToLatPairs(merged)))(input);
}
