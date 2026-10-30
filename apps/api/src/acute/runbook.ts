/** The acute-event runbook, owner messages, templates and the post-mortem (ACU-03, ACU-04). Admin only. */
import { randomUUID } from 'node:crypto';
import { asc, desc, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { RUNBOOK_STEPS } from '../db/schema/acute.ts';
import {
  acuteEvents,
  acuteMessages,
  acutePostMortems,
  acuteSteps,
  acuteTemplates,
  bookings,
  providers,
  vetClinics,
} from '../db/schema/index.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

export const DEFAULT_TEMPLATES = {
  bn: '{pet}-এর সঙ্গে একটি ঘটনা ঘটেছে। PetCare বিষয়টি দেখছে এবং আপনার সঙ্গে যোগাযোগ রাখবে। প্রোভাইডার ও পশু চিকিৎসকের সঙ্গে কথা বলা হচ্ছে।',
  en: 'Something has happened with {pet}. PetCare is looking into it and will stay in touch. We are in contact with the provider and a vet.',
} as const;
const POST_MORTEM_REMINDER_HOURS = 48;

const note = z.string().trim().max(500).default('');
const text = z.string().trim().min(3).max(2000);

export function registerRunbookRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  const templateFor = async (language: 'bn' | 'en') => {
    const [row] = await db
      .select()
      .from(acuteTemplates)
      .where(eq(acuteTemplates.language, language));
    return row?.text ?? DEFAULT_TEMPLATES[language];
  };

  async function detail(eventId: string) {
    const [event] = await db.select().from(acuteEvents).where(eq(acuteEvents.id, eventId));
    if (!event) return null;
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, event.bookingId));
    const [provider] = booking
      ? await db.select().from(providers).where(eq(providers.id, booking.providerId))
      : [];
    const steps = await db
      .select()
      .from(acuteSteps)
      .where(eq(acuteSteps.eventId, eventId))
      .orderBy(asc(acuteSteps.at));
    const messages = await db
      .select()
      .from(acuteMessages)
      .where(eq(acuteMessages.eventId, eventId))
      .orderBy(asc(acuteMessages.sentAt));
    const clinics = provider
      ? await db
          .select()
          .from(vetClinics)
          .where(eq(vetClinics.neighbourhoodId, provider.neighbourhoodId))
      : [];
    const [postMortem] = await db
      .select()
      .from(acutePostMortems)
      .where(eq(acutePostMortems.eventId, eventId));
    const now = clock.now();
    const first = steps[0]?.at ?? messages[0]?.sentAt ?? null;
    return {
      event: {
        id: event.id,
        bookingId: event.bookingId,
        type: event.type,
        severity: event.severity,
        observation: event.observation,
        status: event.status,
        triggeredAt: event.triggeredAt,
        ownerNotifiedAt: event.ownerNotifiedAt,
        resolvedAt: event.resolvedAt,
      },
      booking: booking && {
        id: booking.id,
        state: booking.state,
        pet: booking.petSnapshot,
        startDate: booking.startDate,
        endDate: booking.endDate,
      },
      provider: provider && {
        id: provider.id,
        name: provider.nameEn,
        tier: provider.tier,
        status: provider.status,
      },
      steps: RUNBOOK_STEPS.map((step) => {
        const row = steps.find((s) => s.step === step);
        return {
          step,
          status: row?.status ?? 'pending',
          note: row?.note ?? '',
          by: row?.by ?? null,
          at: row?.at ?? null,
        };
      }),
      timeline: steps.map((s) => ({
        step: s.step,
        status: s.status,
        note: s.note,
        by: s.by,
        at: s.at,
      })),
      messages: messages.map((m) => ({ language: m.language, text: m.text, sentAt: m.sentAt })),
      vetClinics: clinics.map((c) => ({ name: c.nameEn, phone: c.phone, hours: c.hoursEn })),
      timers: {
        elapsedSeconds: Math.round(
          ((event.resolvedAt ?? now).getTime() - event.triggeredAt.getTime()) / 1000,
        ),
        secondsToFirstAdminEntry: first
          ? Math.round((first.getTime() - event.triggeredAt.getTime()) / 1000)
          : null,
      },
      postMortem: postMortem ?? null,
    };
  }

  app.get('/admin/acute-events/:id', admin, async (request, reply) => {
    const found = await detail((request.params as { id: string }).id);
    return found ?? refuse(reply, 404, 'event_not_found', 'No such event');
  });

  app.post('/admin/acute-events/:id/steps', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({ step: z.enum(RUNBOOK_STEPS), status: z.enum(['done', 'skipped']), note })
      .parse(request.body);
    if (input.status === 'skipped' && input.note.length < 3)
      return refuse(reply, 422, 'skip_needs_note', 'A skipped step needs a note');
    const [event] = await db.select().from(acuteEvents).where(eq(acuteEvents.id, id));
    if (!event) return refuse(reply, 404, 'event_not_found', 'No such event');
    const adminId = request.currentUser!.id;
    // The latest entry for a step wins; the timeline keeps every change.
    await db.insert(acuteSteps).values({
      id: `as_${randomUUID()}`,
      eventId: id,
      step: input.step,
      status: input.status,
      note: input.note,
      by: `admin:${adminId}`,
      at: clock.now(),
    });
    await recordAdminAction(db, {
      adminId,
      action: 'acute.step',
      reasonCode: input.status,
      targetType: 'acute_event',
      targetId: id,
      payload: { step: input.step, note: input.note },
    });
    return { step: input.step, status: input.status };
  });

  /** Sends the template (or an edited text) to the owner as an in-app message and records the time. */
  app.post('/admin/acute-events/:id/owner-message', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({ language: z.enum(['bn', 'en']), text: text.optional() })
      .parse(request.body);
    const [event] = await db.select().from(acuteEvents).where(eq(acuteEvents.id, id));
    if (!event) return refuse(reply, 404, 'event_not_found', 'No such event');
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, event.bookingId));
    const petName = (booking?.petSnapshot as { name?: string } | undefined)?.name ?? '';
    const body = (input.text ?? (await templateFor(input.language))).replaceAll('{pet}', petName);
    const adminId = request.currentUser!.id;
    const at = clock.now();
    await db.insert(acuteMessages).values({
      id: `am_${randomUUID()}`,
      eventId: id,
      language: input.language,
      text: body,
      sentBy: `admin:${adminId}`,
      sentAt: at,
    });
    await db.insert(acuteSteps).values({
      id: `as_${randomUUID()}`,
      eventId: id,
      step: 'owner_notification',
      status: 'done',
      note: `sent in ${input.language}`,
      by: `admin:${adminId}`,
      at,
    });
    await recordAdminAction(db, {
      adminId,
      action: 'acute.owner_message',
      targetType: 'acute_event',
      targetId: id,
      payload: { language: input.language },
    });
    return reply.code(201).send({ sentAt: at, text: body });
  });

  app.get('/admin/acute-templates', admin, async () => ({
    templates: { bn: await templateFor('bn'), en: await templateFor('en') },
  }));

  app.put('/admin/acute-templates/:language', admin, async (request) => {
    const { language } = request.params as { language: 'bn' | 'en' };
    const input = z.strictObject({ text }).parse(request.body);
    const lang = z.enum(['bn', 'en']).parse(language);
    const adminId = request.currentUser!.id;
    await db
      .insert(acuteTemplates)
      .values({
        language: lang,
        text: input.text,
        updatedBy: `admin:${adminId}`,
        updatedAt: clock.now(),
      })
      .onConflictDoUpdate({
        target: acuteTemplates.language,
        set: { text: input.text, updatedBy: `admin:${adminId}`, updatedAt: clock.now() },
      });
    await recordAdminAction(db, {
      adminId,
      action: 'acute.template_edited',
      targetType: 'acute_template',
      targetId: lang,
      payload: { text: input.text },
    });
    return { saved: true };
  });

  app.post('/admin/acute-events/:id/resolve', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [event] = await db.select().from(acuteEvents).where(eq(acuteEvents.id, id));
    if (!event) return refuse(reply, 404, 'event_not_found', 'No such event');
    if (event.status === 'resolved') return { resolved: true, already: true };
    await db
      .update(acuteEvents)
      .set({ status: 'resolved', resolvedAt: clock.now() })
      .where(eq(acuteEvents.id, id));
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'acute.resolved',
      targetType: 'acute_event',
      targetId: id,
    });
    return { resolved: true, already: false };
  });

  app.post('/admin/acute-events/:id/post-mortem', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({
        timelineAccuracy: text,
        roles: text,
        ownerCommunication: text,
        directoryUse: text,
        gaps: text,
        lessons: text,
      })
      .parse(request.body);
    const [event] = await db.select().from(acuteEvents).where(eq(acuteEvents.id, id));
    if (!event) return refuse(reply, 404, 'event_not_found', 'No such event');
    if (event.status !== 'resolved')
      return refuse(reply, 409, 'not_resolved', 'Resolve the event before writing the post-mortem');
    const [existing] = await db
      .select()
      .from(acutePostMortems)
      .where(eq(acutePostMortems.eventId, id));
    if (existing)
      return refuse(reply, 409, 'already_written', 'A post-mortem already exists for this event');
    const adminId = request.currentUser!.id;
    await db
      .insert(acutePostMortems)
      .values({ eventId: id, ...input, writtenBy: `admin:${adminId}`, writtenAt: clock.now() });
    await db.insert(acuteSteps).values({
      id: `as_${randomUUID()}`,
      eventId: id,
      step: 'post_mortem',
      status: 'done',
      note: 'post-mortem written',
      by: `admin:${adminId}`,
      at: clock.now(),
    });
    await recordAdminAction(db, {
      adminId,
      action: 'acute.post_mortem',
      targetType: 'acute_event',
      targetId: id,
    });
    return reply.code(201).send({ written: true });
  });

  app.get('/admin/post-mortems', admin, async () => {
    const rows = await db
      .select({ pm: acutePostMortems, e: acuteEvents })
      .from(acutePostMortems)
      .innerJoin(acuteEvents, eq(acutePostMortems.eventId, acuteEvents.id))
      .orderBy(desc(acutePostMortems.writtenAt));
    return {
      postMortems: rows.map(({ pm, e }) => ({
        type: e.type,
        severity: e.severity,
        ...pm,
      })),
    };
  });

  /** Resolved events still waiting for a post-mortem after 48 hours (shown when the queue loads). */
  app.get('/admin/acute-events-reminders', admin, async () => {
    const resolved = await db.select().from(acuteEvents).where(eq(acuteEvents.status, 'resolved'));
    const written = new Set(
      (await db.select({ id: acutePostMortems.eventId }).from(acutePostMortems)).map((r) => r.id),
    );
    const cutoff = clock.now().getTime() - POST_MORTEM_REMINDER_HOURS * 3_600_000;
    return {
      reminders: resolved
        .filter((e) => !written.has(e.id) && e.resolvedAt && e.resolvedAt.getTime() <= cutoff)
        .map((e) => ({ eventId: e.id, bookingId: e.bookingId, resolvedAt: e.resolvedAt })),
    };
  });
}
