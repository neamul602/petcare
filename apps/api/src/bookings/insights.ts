/** Bookings per launch neighbourhood per month (SRC-06). Counts only; expansion stays an admin decision. */
import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { platformRules } from '@petcare/shared/config';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';

export function registerInsightsRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator },
) {
  const { db, authn } = deps;

  app.get(
    '/admin/insights/neighbourhoods',
    { preHandler: authn.requireRole('admin') },
    async () => {
      const result = await db.execute(sql`
      SELECT to_char(b.completed_at AT TIME ZONE 'Asia/Dhaka', 'YYYY-MM') AS month,
             p.neighbourhood_id AS neighbourhood, count(*)::int AS count
      FROM bookings b JOIN providers p ON p.id = b.provider_id
      WHERE b.completed_at IS NOT NULL
      GROUP BY 1, 2 ORDER BY 1 DESC, 2`);
      const rows = result.rows as Array<{ month: string; neighbourhood: string; count: number }>;
      const months = [...new Set(rows.map((r) => r.month))].map((month) => ({
        month,
        counts: Object.fromEntries(
          platformRules.launchNeighbourhoods.map((n) => [
            n,
            rows.find((r) => r.month === month && r.neighbourhood === n)?.count ?? 0,
          ]),
        ),
      }));
      return {
        neighbourhoods: platformRules.launchNeighbourhoods,
        months,
        note: 'Counts of completed bookings. Expanding to a new neighbourhood is an admin decision only; nothing expands automatically.',
      };
    },
  );
}
