/** Settings: change name and language (ACC-05). The verified phone is shown but never changed here. */
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Database } from '../db/client.ts';
import { adminUsers, users } from '../db/schema/index.ts';
import { recordAdminAction } from './audit.ts';
import type { Authenticator } from './guards.ts';

const name = z.string().trim().min(1).max(60);
const userSchema = z.strictObject({ name, language: z.enum(['bn', 'en']) });

export function registerSettingsRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator },
) {
  const { db, authn } = deps;

  app.get(
    '/me/settings',
    { preHandler: authn.requireRole('owner', 'provider') },
    async (request) => {
      const u = request.currentUser!;
      return {
        settings: { name: u.name, phone: u.phone, language: u.language ?? 'bn', role: u.role },
      };
    },
  );

  app.put(
    '/me/settings',
    { preHandler: authn.requireRole('owner', 'provider') },
    async (request) => {
      const input = userSchema.parse(request.body);
      const [saved] = await db
        .update(users)
        .set({ name: input.name, language: input.language })
        .where(eq(users.id, request.currentUser!.id))
        .returning();
      return { settings: { name: saved!.name, phone: saved!.phone, language: saved!.language } };
    },
  );

  app.put('/admin/me', { preHandler: authn.requireRole('admin') }, async (request) => {
    const input = z.strictObject({ name }).parse(request.body);
    const adminId = request.currentUser!.id;
    await db.update(adminUsers).set({ name: input.name }).where(eq(adminUsers.id, adminId));
    await recordAdminAction(db, {
      adminId,
      action: 'admin.name_changed',
      targetType: 'admin',
      targetId: adminId,
      payload: { name: input.name },
    });
    return { admin: { name: input.name } };
  });
}
