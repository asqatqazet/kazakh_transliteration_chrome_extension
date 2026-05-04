import type { Script } from './types';

// Codepoint ranges deliberately exclude combining-mark blocks (e.g.
// Cyrillic Extended-A, U+2DE0–U+2DFF) — they aren't used in Kazakh and
// trip eslint's no-misleading-character-class rule when written inline.
const PATTERNS: Record<Script, RegExp> = {
  Cyrillic: /[Ѐ-ӿԀ-ԯꙀ-ꚟ]/gu,
  Arabic: /[؀-ۿ]/gu,
  Latin: /[A-Za-zÀ-ÖØ-öø-ÿĀ-ſƀ-ƿ]/gu,
};

export function detectScript(input: string): Script {
  let best: Script = 'Cyrillic';
  let bestCount = -1;
  for (const script of Object.keys(PATTERNS) as Script[]) {
    const count = input.match(PATTERNS[script])?.length ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = script;
    }
  }
  return best;
}
