import { describe, expect, it } from 'vitest';
import { cyrillicToLatin2021, latin2021ToCyrillic } from '@/lib/converter/cyrillic-latin-2021';
import { convert } from '@/lib/converter';

// Native 28-letter sentences using NONE of И/Й/І. These should round-trip
// exactly under default options because every character maps unambiguously.
const NATIVE_28_CORPUS = [
  'Қазақстан',
  'Алматы',
  'Астана',
  'Жаңа жыл',
  'Ұлы дала',
  'Ғылым жолы',
  'Көк аспан',
  'Үлкен тас',
  'Жаз ыстық',
  'Дала',
];

// Sentences that include И, Й, or І. Under the default collapse, round-trip
// is lossy: all three map to 'i' and reverse picks И. The test only asserts
// that the round-trip preserves the character count.
const IYY_SENTENCES = [
  'Тіл — халықтың жаны',
  'Менің атым Қожа',
  'Қойшы',
  'Бір ел, бір тағдыр',
  'Сөз — күміс',
  'Ана тілі',
];

// Sentences with loan letters (Ё, Ц, Ч, Щ, Ъ, Ь, Э, Ю, Я). Cyr→Lat is exact;
// Lat→Cyr is fuzzy because digraphs are ambiguous (e.g. 'ia' could be Я or
// 'и'+'а'). The test only asserts Cyr→Lat for these.
const LOANWORD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['Цемент', 'Tsement'],
  ['чай', 'chai'],
  ['щётка', 'şçiotka'],
  ['объект', 'obekt'],
  ['эссе', 'esse'],
  ['юрист', 'iurist'],
  ['январь', 'ianvar'],
  ['ёлка', 'iolka'],
];

describe('cyrillicToLatin2021 — native 28-letter set', () => {
  it.each(NATIVE_28_CORPUS)('round-trips %j exactly under default options', (text) => {
    const latin = cyrillicToLatin2021(text);
    expect(latin2021ToCyrillic(latin)).toBe(text);
  });

  it('produces the documented umlaut letters', () => {
    expect(cyrillicToLatin2021('Әә Ғғ Ңң Өө Ұұ Үү Шш')).toBe('Ää Ğğ Ññ Öö Ūū Üü Şş');
  });

  it('maps Қ/Ы/І correctly', () => {
    expect(cyrillicToLatin2021('Қазақ')).toBe('Qazaq');
    expect(cyrillicToLatin2021('Алматы')).toBe('Almaty');
    expect(cyrillicToLatin2021('тіл')).toBe('til');
  });
});

describe('cyrillicToLatin2021 — И/Й/І collapse policy', () => {
  it('collapses И, Й, І to "i" by default', () => {
    expect(cyrillicToLatin2021('и й і')).toBe('i i i');
    expect(cyrillicToLatin2021('И Й І')).toBe('İ İ İ');
  });

  it('disambiguates І to ı when collapseIyy=false', () => {
    expect(cyrillicToLatin2021('и й і', { collapseIyy: false })).toBe('i i ı');
    expect(cyrillicToLatin2021('И Й І', { collapseIyy: false })).toBe('İ İ I');
  });

  it.each(IYY_SENTENCES)(
    'reverses %j to a Cyrillic string of the same length under collapse',
    (text) => {
      const latin = cyrillicToLatin2021(text);
      const back = latin2021ToCyrillic(latin);
      expect([...back].length).toBe([...text].length);
    }
  );
});

describe('cyrillicToLatin2021 — Х/Һ collapse policy', () => {
  it('collapses both to H by default', () => {
    expect(cyrillicToLatin2021('Хан Һақ')).toBe('Han Haq');
  });

  it('disambiguates Һ to Ḣ when collapseHh=false', () => {
    expect(cyrillicToLatin2021('Хан Һақ', { collapseHh: false })).toBe('Han Ḣaq');
  });
});

describe('cyrillicToLatin2021 — loanword policy', () => {
  it.each(LOANWORD_PAIRS)('transliterates %j → %j by default', (cyr, expected) => {
    expect(cyrillicToLatin2021(cyr)).toBe(expected);
  });

  it('drops loan letters under loanwordPolicy=drop', () => {
    expect(cyrillicToLatin2021('Цемент', { loanwordPolicy: 'drop' })).toBe('ement');
    expect(cyrillicToLatin2021('чай', { loanwordPolicy: 'drop' })).toBe('ai');
    expect(cyrillicToLatin2021('юрист', { loanwordPolicy: 'drop' })).toBe('rist');
  });

  it('always drops Ъ and Ь regardless of policy', () => {
    expect(cyrillicToLatin2021('объект')).toBe('obekt');
    expect(cyrillicToLatin2021('болью')).toBe('boliu');
  });
});

describe('latin2021ToCyrillic — fuzzy reverse on loanwords', () => {
  // Reverse direction picks the most common pre-image. Document it.
  it('maps "ia" → "я" (preferring loanword over и+а)', () => {
    expect(latin2021ToCyrillic('ianvar')).toBe('январ');
  });

  it('maps "ts" → "ц" (preferring loanword over т+с)', () => {
    expect(latin2021ToCyrillic('Tsement')).toBe('Цемент');
  });

  it('maps "ch" → "ч"', () => {
    expect(latin2021ToCyrillic('chai')).toBe('чаи');
  });

  it('maps "şç" → "щ"', () => {
    expect(latin2021ToCyrillic('şçotka')).toBe('щотка');
  });

  it('maps "İ" → "И" (preferring И over Й/І under collapse)', () => {
    expect(latin2021ToCyrillic('İ')).toBe('И');
    expect(latin2021ToCyrillic('i')).toBe('и');
  });
});

describe('convert() — Latin direction routing', () => {
  it('Cyrillic → Latin via convert()', () => {
    expect(convert('Қазақстан', 'Latin', 'Cyrillic')).toBe('Qazaqstan');
  });

  it('Latin → Cyrillic via convert()', () => {
    expect(convert('Qazaqstan', 'Cyrillic', 'Latin')).toBe('Қазақстан');
  });

  it('autodetects Latin source when from is null', () => {
    expect(convert('Almaty 2026', 'Cyrillic')).toBe('Алматы 2026');
  });

  it('passes options through to Latin converter', () => {
    expect(convert('Хан Һақ', 'Latin', 'Cyrillic', { collapseHh: false })).toBe('Han Ḣaq');
  });

  it('routes Arabic → Latin transitively via Cyrillic', () => {
    // 'قازاقستان' → arabicToCyrillic → 'Қазақстан' → cyrillicToLatin2021 → 'Qazaqstan'
    expect(convert('قازاقستان', 'Latin', 'Arabic')).toBe('Qazaqstan');
  });
});
