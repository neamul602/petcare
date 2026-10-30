/** A provider may see a pet's care summary only while the pet has a request or stay with them (FR-9, A-4). */
import { and, eq, inArray } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import { bookings, providers } from '../db/schema/index.ts';
import type { PetAccessPolicy } from '../pets/care-summary.ts';

export function bookingPetAccess(db: Database): PetAccessPolicy {
  return {
    async canProviderView(providerUserId, petId) {
      const rows = await db
        .select({ id: bookings.id })
        .from(bookings)
        .innerJoin(providers, eq(bookings.providerId, providers.id))
        .where(
          and(
            eq(providers.userId, providerUserId),
            eq(bookings.petId, petId),
            inArray(bookings.state, ['authorized', 'captured', 'in_stay', 'completed']),
          ),
        )
        .limit(1);
      return rows.length > 0;
    },
  };
}
