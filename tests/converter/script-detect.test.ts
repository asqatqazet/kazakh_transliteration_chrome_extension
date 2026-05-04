import { describe, expect, it } from 'vitest';
import { detectScript } from '@/lib/converter/script-detect';

describe('detectScript', () => {
  it('detects Cyrillic dominant', () => {
    expect(detectScript('Қазақстан Республикасы')).toBe('Cyrillic');
  });

  it('detects Arabic dominant', () => {
    expect(detectScript('قازاقستان رەسپۋبليكاسى')).toBe('Arabic');
  });

  it('detects Latin dominant', () => {
    expect(detectScript('Qazaqstan Respublikasy')).toBe('Latin');
  });

  it('picks majority script in mixed text', () => {
    expect(detectScript('Hello, Қазақстан!')).toBe('Cyrillic');
    expect(detectScript('Қазақстан is in Central Asia')).toBe('Latin');
  });

  it('falls back to Cyrillic for empty input', () => {
    expect(detectScript('')).toBe('Cyrillic');
  });

  it('falls back to Cyrillic for punctuation-only input', () => {
    expect(detectScript('!!! ... ???')).toBe('Cyrillic');
  });
});
