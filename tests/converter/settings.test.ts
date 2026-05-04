import { describe, expect, it } from 'vitest';
import { isDomainExcluded } from '@/lib/settings';

describe('isDomainExcluded', () => {
  it('matches exact hostname', () => {
    expect(isDomainExcluded('example.com', ['example.com'])).toBe(true);
  });

  it('matches subdomain', () => {
    expect(isDomainExcluded('docs.example.com', ['example.com'])).toBe(true);
  });

  it('does not match unrelated domain', () => {
    expect(isDomainExcluded('example.org', ['example.com'])).toBe(false);
  });

  it('does not match suffix collision', () => {
    expect(isDomainExcluded('notexample.com', ['example.com'])).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isDomainExcluded('EXAMPLE.com', ['Example.COM'])).toBe(true);
  });

  it('ignores empty rules and trims whitespace', () => {
    expect(isDomainExcluded('example.com', ['  ', 'example.com  '])).toBe(true);
  });

  it('returns false for empty exclusion list', () => {
    expect(isDomainExcluded('example.com', [])).toBe(false);
  });
});
