/**
 * One operation at a time per booking (single API process). The first action on a booking wins; a second
 * waits, re-reads the state and is refused if it is no longer allowed. The database update that checks the old
 * state is the backstop.
 */
const inFlight = new Map<string, Promise<unknown>>();

export async function exclusive<T>(bookingId: string, work: () => Promise<T>): Promise<T> {
  const previous = inFlight.get(bookingId) ?? Promise.resolve();
  const run = previous.then(work, work);
  inFlight.set(bookingId, run);
  try {
    return await run;
  } finally {
    if (inFlight.get(bookingId) === run) inFlight.delete(bookingId);
  }
}
