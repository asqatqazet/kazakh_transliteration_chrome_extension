import { describe, expect, it } from 'vitest';
import baseline from './__fixtures__/cyrillic-arabic-baseline.json' with { type: 'json' };
import { arabicToCyrillic, cyrillicToArabic } from '@/lib/converter/cyrillic-arabic';
import { convert } from '@/lib/converter';

interface BaselineEntry {
  cyrillic: string;
  arabic: string;
  roundTrip: string;
}

const entries = baseline as BaselineEntry[];

describe('cyrillicToArabic — matches legacy v1.0 baseline', () => {
  for (const { cyrillic, arabic } of entries) {
    it(`converts ${JSON.stringify(cyrillic.slice(0, 40))}`, () => {
      expect(cyrillicToArabic(cyrillic)).toBe(arabic);
    });
  }
});

describe('arabicToCyrillic — matches legacy v1.0 baseline', () => {
  for (const { arabic, roundTrip } of entries) {
    it(`converts ${JSON.stringify(arabic.slice(0, 40))}`, () => {
      expect(arabicToCyrillic(arabic)).toBe(roundTrip);
    });
  }
});

describe('convert() public API', () => {
  it('routes Cyrillic → Arabic', () => {
    expect(convert('Қазақстан', 'Arabic', 'Cyrillic')).toBe('قازاقستان');
  });

  it('routes Arabic → Cyrillic', () => {
    expect(convert('قازاقستان', 'Cyrillic', 'Arabic')).toBe('Қазақстан');
  });

  it('returns input unchanged when source equals target', () => {
    expect(convert('Қазақстан', 'Cyrillic', 'Cyrillic')).toBe('Қазақстан');
  });

  it('auto-detects source script when from is null', () => {
    expect(convert('Қазақстан', 'Arabic')).toBe('قازاقستان');
    expect(convert('قازاقستان', 'Cyrillic')).toBe('Қазақстан');
  });

  it('returns empty string unchanged', () => {
    expect(convert('', 'Arabic', 'Cyrillic')).toBe('');
  });

  it('throws on non-string input', () => {
    // @ts-expect-error: testing runtime guard
    expect(() => convert(42, 'Arabic')).toThrow(TypeError);
  });
});
