import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, resolveLocale, t, ta, type MessageKey } from './index.ts';

describe('i18n', () => {
  it('defaults to Bangla', () => {
    expect(DEFAULT_LOCALE).toBe('bn');
    expect(resolveLocale(undefined)).toBe('bn');
    expect(resolveLocale('fr')).toBe('bn');
    expect(resolveLocale('en')).toBe('en');
  });

  it('translates the same key in both languages', () => {
    expect(t('bn', 'nav.pets')).toBe('পোষা প্রাণী');
    expect(t('en', 'nav.pets')).toBe('Pets');
  });

  it('admin strings are English only', () => {
    expect(ta('nav.queue')).toBe('Queue');
  });

  it('fails loudly on a missing key instead of showing a blank', () => {
    expect(() => t('en', 'no.such.key' as MessageKey)).toThrow(/Missing en message/);
  });
});
