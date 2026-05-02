import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, eventsTable, usersTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import { GetEventRegistrationsParams, GetEventRegistrationsQueryParams, RegisterForEventParams, RegisterForEventBody, CancelRegistrationParams } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();

router.get("/events/:eventId/registrations", async (req, res) => {
  try {
    const { eventId } = GetEventRegistrationsParams.parse({ eventId: Number(req.params.eventId) });
    const query = GetEventRegistrationsQueryParams.parse(req.query);

    const conditions = [eq(registrationsTable.eventId, eventId)];
    if (query.search) {
      conditions.push(ilike(usersTable.fullName, `%${query.search}%`));
    }

    const rows = await db
      .select({
        id: registrationsTable.id,
        eventId: registrationsTable.eventId,
        eventTitle: eventsTable.title,
        userId: registrationsTable.userId,
        userName: usersTable.fullName,
        userEmail: usersTable.email,
        ticketType: registrationsTable.ticketType,
        status: registrationsTable.status,
        passCode: registrationsTable.passCode,
        registeredAt: registrationsTable.registeredAt,
      })
      .from(registrationsTable)
      .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
      .leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
      .where(and(...conditions));

    res.json(
      rows.map((r) => ({
        ...r,
        registeredAt: r.registeredAt?.toISOString(),
        eventTitle: r.eventTitle ?? "",
        userName: r.userName ?? "",
        userEmail: r.userEmail ?? "",
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting registrations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events/:eventId/register", async (req, res) => {
  try {
    const { eventId } = RegisterForEventParams.parse({ eventId: Number(req.params.eventId) });
    const body = RegisterForEventBody.parse(req.body);

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const passCode = `TN-${randomBytes(3).toString("hex").toUpperCase()}`;
    const isWaitlist = event.registeredCount >= event.capacity;

    const [registration] = await db
      .insert(registrationsTable)
      .values({
        eventId,
        userId: body.userId,
        ticketType: body.ticketType,
        status: isWaitlist ? "waitlist" : "registered",
        passCode,
      })
      .returning();

    if (!isWaitlist) {
      await db
        .update(eventsTable)
        .set({ registeredCount: event.registeredCount + 1 })
        .where(eq(eventsTable.id, eventId));
    }

    const [eventRow] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    const [userRow] = await db.select().from(usersTable).where(eq(usersTable.id, body.userId)).limit(1);

    res.status(201).json({
      ...registration,
      registeredAt: registration.registeredAt?.toISOString(),
      eventTitle: eventRow?.title ?? "",
      userName: userRow?.fullName ?? "",
      userEmail: userRow?.email ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error registering for event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/events/:eventId/register", async (req, res) => {
  try {
    const { eventId } = CancelRegistrationParams.parse({ eventId: Number(req.params.eventId) });
    await db
      .update(registrationsTable)
      .set({ status: "cancelled" })
      .where(eq(registrationsTable.eventId, eventId));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error cancelling registration");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
