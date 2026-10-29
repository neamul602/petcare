/**
 * Injectable time source. Every time-based rule (timeouts, reminders, payout batches)
 * reads the time through a Clock so tests and demos can move time forward.
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Manually controlled clock for tests and training demos. */
export class TestClock implements Clock {
  private current: Date;

  constructor(start: Date | string = '2026-01-01T00:00:00Z') {
    this.current = new Date(start);
  }

  now(): Date {
    return new Date(this.current);
  }

  set(to: Date | string): void {
    this.current = new Date(to);
  }

  advanceMinutes(minutes: number): void {
    if (!Number.isFinite(minutes) || minutes < 0) {
      throw new RangeError('A test clock only moves forward');
    }
    this.current = new Date(this.current.getTime() + minutes * 60_000);
  }
}
