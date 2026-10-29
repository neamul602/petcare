import { describe, expect, it } from 'vitest';
import { SystemClock, TestClock } from './clock.ts';

describe('clock', () => {
  it('system clock returns the current time', () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
  });

  it('test clock starts where told and moves forward on demand', () => {
    const clock = new TestClock('2026-03-28T00:00:00Z');
    clock.advanceMinutes(90);
    expect(clock.now().toISOString()).toBe('2026-03-28T01:30:00.000Z');
  });

  it('test clock never moves backwards', () => {
    expect(() => new TestClock().advanceMinutes(-1)).toThrow(RangeError);
  });

  it('returns copies so callers cannot change the clock', () => {
    const clock = new TestClock('2026-01-01T00:00:00Z');
    clock.now().setFullYear(2030);
    expect(clock.now().getUTCFullYear()).toBe(2026);
  });
});
