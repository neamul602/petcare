/** Predictable ids for training data: prefix plus a per-service sequence (reset with the service). */
export class Sequence {
  private counters = new Map<string, number>();

  next(prefix: string, width = 4): string {
    const value = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, value);
    return `${prefix}_${String(value).padStart(width, '0')}`;
  }

  reset(): void {
    this.counters.clear();
  }
}
