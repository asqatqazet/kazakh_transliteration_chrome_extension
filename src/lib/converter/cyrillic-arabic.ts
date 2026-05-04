const TOTE_REG = /([،؟؛ءابتجحدر-شعف-نو-يپچڭگھۆۇۋە]+)/g;

const HAMZA = 'ء';
const HAMZA_SUPPRESSOR = /[گكە]/;
const HAMZA_TRIGGERS = /[ءەگك]/;

const CYR_TO_ARABIC: ReadonlyArray<readonly [string, string]> = [
  ['А', 'ا'],
  ['Ә', 'ءا'],
  ['Б', 'ب'],
  ['В', 'ۆ'],
  ['Г', 'گ'],
  ['Ғ', 'ع'],
  ['Д', 'د'],
  ['Е', 'ە'],
  ['Ё', 'يو'],
  ['Ж', 'ج'],
  ['З', 'ز'],
  ['И', 'ي'],
  ['Й', 'ي'],
  ['К', 'ك'],
  ['Қ', 'ق'],
  ['Л', 'ل'],
  ['М', 'م'],
  ['Н', 'ن'],
  ['Ң', 'ڭ'],
  ['О', 'و'],
  ['Ө', 'ءو'],
  ['П', 'پ'],
  ['Р', 'ر'],
  ['С', 'س'],
  ['Т', 'ت'],
  ['У', 'ۋ'],
  ['Ұ', 'ۇ'],
  ['Ү', 'ءۇ'],
  ['Ф', 'ف'],
  ['Х', 'ح'],
  ['Һ', 'ھ'],
  ['Ц', 'س'],
  ['Ч', 'چ'],
  ['Ш', 'ش'],
  ['Щ', 'شش'],
  ['Ъ', ''],
  ['Ы', 'ى'],
  ['І', 'ءى'],
  ['Ь', ''],
  ['Э', 'ە'],
  ['Ю', 'يۋ'],
  ['Я', 'يا'],
  [',', '،'],
  [';', '؛'],
  ['?', '؟'],
];

const AR_TO_CYR: ReadonlyArray<readonly [string, string]> = [
  ['ا', 'а'],
  ['ب', 'б'],
  ['ۆ', 'в'],
  ['گ', 'г'],
  ['ع', 'ғ'],
  ['د', 'д'],
  ['ە', 'е'],
  ['ج', 'ж'],
  ['ز', 'з'],
  ['ي', 'и'],
  ['ك', 'к'],
  ['ق', 'қ'],
  ['ل', 'л'],
  ['م', 'м'],
  ['ن', 'н'],
  ['ڭ', 'ң'],
  ['و', 'о'],
  ['پ', 'п'],
  ['ر', 'р'],
  ['س', 'с'],
  ['ت', 'т'],
  ['ۋ', 'у'],
  ['ۇ', 'ұ'],
  ['ف', 'ф'],
  ['ح', 'х'],
  ['ھ', 'һ'],
  ['چ', 'ч'],
  ['ش', 'ш'],
  ['ى', 'ы'],
  ['،', ','],
  ['؛', ';'],
  ['؟', '?'],
];

const SENTENCE_INITIAL = /([\n!.?]+|^\s*)([\s!-@[-`{-~¡-¿×÷]*)./g;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CYR_TO_ARABIC_RULES: ReadonlyArray<readonly [RegExp, string]> = CYR_TO_ARABIC.map(
  ([from, to]) => [new RegExp(escapeRegex(from), 'gi'), to] as const
);

const AR_TO_CYR_RULES: ReadonlyArray<readonly [RegExp, string]> = AR_TO_CYR.map(
  ([from, to]) => [new RegExp(escapeRegex(from), 'g'), to] as const
);

export function cyrillicToArabic(input: string): string {
  let out = input;
  for (const [re, to] of CYR_TO_ARABIC_RULES) {
    out = out.replace(re, to);
  }
  out = out.replace(/ييا/g, 'يا');
  return out.replace(TOTE_REG, (chunk) => {
    const stripped = chunk.replace(/ء/g, '');
    const hasHamza = chunk.includes(HAMZA);
    const suppress = HAMZA_SUPPRESSOR.test(chunk);
    return hasHamza && !suppress ? HAMZA + stripped : stripped;
  });
}

function convertArabicChunk(chunk: string): string {
  let out = chunk;
  const hasTriggers = HAMZA_TRIGGERS.test(chunk);
  for (const [re, to] of AR_TO_CYR_RULES) {
    out = out.replace(re, to);
  }
  if (hasTriggers) {
    // The legacy heuristic: in a chunk containing hamza or its triggers,
    // promote the first occurrence of each soft-vowel partner to its
    // hamza-marked Cyrillic form. Single .replace() (no /g) is intentional.
    out = out.replace(/а/, 'Ә');
    out = out.replace(/о/, 'Ө');
    out = out.replace(/ы/, 'І');
    out = out.replace(/ұ/, 'Ү');
    out = out.replace(/ء/g, '');
  }
  return out;
}

function capitalizeSentenceInitials(s: string): string {
  return s.toLowerCase().replace(SENTENCE_INITIAL, (m) => m.toUpperCase());
}

export function arabicToCyrillic(input: string): string {
  const replaced = input.replace(TOTE_REG, convertArabicChunk);
  return capitalizeSentenceInitials(replaced);
}
