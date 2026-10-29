/** Small in-memory limiter (sliding window) driven by the injectable clock. Fine for one training process. */
import type { Clock } from '@petcare/shared/clock';

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly clock: Clock,
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /** Records an attempt and says whether it is allowed. */
  allow(key: string): boolean {
    const now = this.clock.now().getTime();
    const recent = (this.hits.get(key) ?? []).filter((at) => now - at < this.windowMs);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  reset(): void {
    this.hits.clear();
  }
}
