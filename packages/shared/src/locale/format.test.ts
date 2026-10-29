import { describe, expect, it } from 'vitest';
import { formatCount, formatDate, formatMoney, formatTime } from './format.ts';

describe('locale formatting (UC-13)', () => {
  it('shows money in taka with ৳, Latin digits and lakh grouping', () => {
    expect(formatMoney(2_000_000)).toBe('৳20,000');
    expect(formatMoney(61_850_000)).toBe('৳6,18,500');
    expect(formatMoney(2_050)).toBe('৳20.50');
    expect(formatMoney(-50_000)).toBe('-৳500');
  });

  it('refuses fractional poisha', () => {
    expect(() => formatMoney(10.5)).toThrow(TypeError);
  });

  it('formats counts with Latin digits', () => {
    expect(formatCount(125000)).toBe('1,25,000');
  });

  it('uses Bangla month names with Latin digits in Bangla, and English dates in English', () => {
    const date = new Date('2026-03-28T06:00:00Z');
    expect(formatDate(date, 'bn')).toContain('মার্চ');
    expect(formatDate(date, 'bn')).toMatch(/28/);
    expect(formatDate(date, 'en')).toBe('28 Mar 2026');
  });

  it('shows times in Dhaka time on a 24-hour clock', () => {
    expect(formatTime(new Date('2026-03-28T12:00:00Z'), 'en')).toBe('18:00');
  });
});
