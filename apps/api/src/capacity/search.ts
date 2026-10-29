/**
 * Curated shortlist (SRC-04, FR-11, DR-6). Ranked only by tier, neighbourhood density and free capacity:
 * no reviews, distance, care fit or sponsorship. Two queries however many providers match.
 */
import { and, eq, inArray } from 'drizzle-orm';
import { platformRules } from '@petcare/shared/config';
import type { Database } from '../db/client.ts';
import { nightCapacity, providers } from '../db/schema/index.ts';
import { nightsBetween } from './dates.ts';

export interface SearchInput {
  from: string;
  to: string;
  species: 'dog' | 'cat';
  areas: string[];
  /** "View all approved": every approved provider in the areas, with a flag for whether the whole window works. */
  all?: boolean;
}

export interface SearchHit {
  slug: string;
  name: { en: string; bn: string };
  tier: 'A' | 'B';
  area: string;
  species: string[];
  pricePerNightPoisha: number | null;
  availableAllNights: boolean;
  minFree: number;
  /** Why this provider is shown. Always visible on the card. */
  reason: { tier: 'A' | 'B'; area: string; everyNightFree: boolean };
}

export async function searchProviders(db: Database, input: SearchInput) {
  const launch = platformRules.launchNeighbourhoods as readonly string[];
  const approved = await db.select().from(providers).where(eq(providers.status, 'approved'));
  const inLaunch = approved.filter((p) => launch.includes(p.neighbourhoodId));
  const density = new Map<string, number>();
  for (const p of inLaunch)
    density.set(p.neighbourhoodId, (density.get(p.neighbourhoodId) ?? 0) + 1);

  const candidates = inLaunch.filter((p) => input.areas.includes(p.neighbourhoodId));
  const dates = nightsBetween(input.from, input.to);
  const rows = candidates.length
    ? await db
        .select()
        .from(nightCapacity)
        .where(
          and(
            inArray(
              nightCapacity.providerId,
              candidates.map((p) => p.id),
            ),
            inArray(nightCapacity.date, dates),
          ),
        )
    : [];
  const byKey = new Map(rows.map((r) => [`${r.providerId}|${r.date}`, r]));

  const scored = candidates.map((p) => {
    const free = dates.map((date) => {
      const row = byKey.get(`${p.id}|${date}`);
      return (row?.capacity ?? p.capacitySmall) - (row?.booked ?? 0);
    });
    const minFree = Math.max(0, Math.min(...free));
    const hostsSpecies = p.species.includes(input.species);
    const everyNightFree = hostsSpecies && minFree > 0;
    const hit: SearchHit = {
      slug: p.slug,
      name: { en: p.nameEn, bn: p.nameBn },
      tier: p.tier,
      area: p.neighbourhoodId,
      species: p.species,
      pricePerNightPoisha: p.pricePerNightPoisha,
      availableAllNights: everyNightFree,
      minFree,
      reason: { tier: p.tier, area: p.neighbourhoodId, everyNightFree },
    };
    return { hit, id: p.id, density: density.get(p.neighbourhoodId) ?? 0 };
  });

  const ranked = [...scored].sort(
    (a, b) =>
      (a.hit.tier === 'A' ? 0 : 1) - (b.hit.tier === 'A' ? 0 : 1) ||
      b.density - a.density ||
      b.hit.minFree - a.hit.minFree ||
      a.id.localeCompare(b.id),
  );

  if (input.all) return { providers: ranked.map((r) => r.hit), suggestOtherDates: false };
  const matches = ranked.filter((r) => r.hit.availableAllNights).map((r) => r.hit);
  return {
    providers: matches.slice(0, platformRules.shortlist.max),
    suggestOtherDates: matches.length < platformRules.shortlist.min,
  };
}
