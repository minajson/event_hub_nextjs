import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, usersTable, registrationsTable, reviewsTable, mediaTable } from "@workspace/db";
import { eq, like, and, or, count, avg, sql, desc, ilike } from "drizzle-orm";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  UpdateEventBody,
  DeleteEventParams,
  ApproveEventBody,
  ApproveEventParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/events", async (req, res) => {
  try {
    const query = ListEventsQueryParams.parse(req.query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.category) conditions.push(eq(eventsTable.category, query.category));
    if (query.search) conditions.push(ilike(eventsTable.title, `%${query.search}%`));
    if (query.format) conditions.push(eq(eventsTable.format, query.format as "in_person" | "online"));
    if (query.department) conditions.push(eq(eventsTable.department, query.department));
    if (query.status) conditions.push(eq(eventsTable.status, query.status as any));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [events, [{ total }]] = await Promise.all([
      db
        .select({
          id: eventsTable.id,
          title: eventsTable.title,
          description: eventsTable.description,
          category: eventsTable.category,
          department: eventsTable.department,
          venue: eventsTable.venue,
          format: eventsTable.format,
          startDate: eventsTable.startDate,
          endDate: eventsTable.endDate,
          capacity: eventsTable.capacity,
          registeredCount: eventsTable.registeredCount,
          status: eventsTable.status,
          isFeatured: eventsTable.isFeatured,
          price: eventsTable.price,
          imageUrl: eventsTable.imageUrl,
          organizerId: eventsTable.organizerId,
          organizerName: usersTable.fullName,
          organizerDept: usersTable.department,
          createdAt: eventsTable.createdAt,
        })
        .from(eventsTable)
        .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
        .where(where)
        .orderBy(desc(eventsTable.startDate))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(eventsTable).where(where),
    ]);

    res.json({
      events: events.map((e) => ({
        ...e,
        price: Number(e.price),
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        createdAt: e.createdAt?.toISOString(),
        organizerName: e.organizerName ?? "",
        organizerDept: e.organizerDept ?? "",
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const body = CreateEventBody.parse(req.body);
    const [event] = await db
      .insert(eventsTable)
      .values({
        ...body,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        price: body.price?.toString() ?? "0",
        status: "pending",
        registeredCount: 0,
      })
      .returning();

    const organizer = await db.select().from(usersTable).where(eq(usersTable.id, event.organizerId)).limit(1);
    res.status(201).json({
      ...event,
      price: Number(event.price),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      organizerName: organizer[0]?.fullName ?? "",
      organizerDept: organizer[0]?.department ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/featured", async (req, res) => {
  try {
    const events = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        description: eventsTable.description,
        category: eventsTable.category,
        department: eventsTable.department,
        venue: eventsTable.venue,
        format: eventsTable.format,
        startDate: eventsTable.startDate,
        endDate: eventsTable.endDate,
        capacity: eventsTable.capacity,
        registeredCount: eventsTable.registeredCount,
        status: eventsTable.status,
        isFeatured: eventsTable.isFeatured,
        price: eventsTable.price,
        imageUrl: eventsTable.imageUrl,
        organizerId: eventsTable.organizerId,
        organizerName: usersTable.fullName,
        organizerDept: usersTable.department,
        createdAt: eventsTable.createdAt,
      })
      .from(eventsTable)
      .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
      .where(eq(eventsTable.isFeatured, true))
      .limit(6);

    res.json(
      events.map((e) => ({
        ...e,
        price: Number(e.price),
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        createdAt: e.createdAt?.toISOString(),
        organizerName: e.organizerName ?? "",
        organizerDept: e.organizerDept ?? "",
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting featured events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/categories", async (req, res) => {
  try {
    const rows = await db
      .select({ category: eventsTable.category, count: count() })
      .from(eventsTable)
      .groupBy(eventsTable.category);

    const iconMap: Record<string, string> = {
      Technical: "code",
      Cultural: "music",
      Sports: "trophy",
      Workshops: "book",
      Hackathons: "zap",
      Seminars: "mic",
    };

    res.json(
      rows.map((r) => ({
        name: r.category,
        slug: r.category.toLowerCase().replace(/\s+/g, "-"),
        eventCount: r.count,
        icon: iconMap[r.category] ?? "star",
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error getting categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = GetEventParams.parse({ eventId: Number(req.params.eventId) });

    const [event] = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        description: eventsTable.description,
        category: eventsTable.category,
        department: eventsTable.department,
        venue: eventsTable.venue,
        format: eventsTable.format,
        startDate: eventsTable.startDate,
        endDate: eventsTable.endDate,
        capacity: eventsTable.capacity,
        registeredCount: eventsTable.registeredCount,
        status: eventsTable.status,
        isFeatured: eventsTable.isFeatured,
        price: eventsTable.price,
        imageUrl: eventsTable.imageUrl,
        organizerId: eventsTable.organizerId,
        organizerName: usersTable.fullName,
        organizerDept: usersTable.department,
        createdAt: eventsTable.createdAt,
      })
      .from(eventsTable)
      .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!event) return res.status(404).json({ error: "Event not found" });

    const [reviewRows, mediaRows, ratingRows] = await Promise.all([
      db
        .select({
          id: reviewsTable.id,
          userId: reviewsTable.userId,
          userName: usersTable.fullName,
          avatarUrl: usersTable.avatarUrl,
          rating: reviewsTable.rating,
          comment: reviewsTable.comment,
          createdAt: reviewsTable.createdAt,
        })
        .from(reviewsTable)
        .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
        .where(eq(reviewsTable.eventId, eventId))
        .limit(10),
      db.select().from(mediaTable).where(eq(mediaTable.eventId, eventId)).limit(6),
      db
        .select({ avg: avg(reviewsTable.rating) })
        .from(reviewsTable)
        .where(eq(reviewsTable.eventId, eventId)),
    ]);

    res.json({
      ...event,
      price: Number(event.price),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      organizerName: event.organizerName ?? "",
      organizerDept: event.organizerDept ?? "",
      mediaGallery: mediaRows.map((m) => m.imageUrl),
      reviews: reviewRows.map((r) => ({
        ...r,
        rating: Number(r.rating),
        createdAt: r.createdAt?.toISOString(),
        avatarUrl: r.avatarUrl ?? null,
      })),
      averageRating: Number(ratingRows[0]?.avg ?? 0),
      reviewCount: reviewRows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = UpdateEventBody.parse ? { eventId: Number(req.params.eventId) } : { eventId: Number(req.params.eventId) };
    const body = UpdateEventBody.parse(req.body);

    const [event] = await db
      .update(eventsTable)
      .set({
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        price: body.price?.toString(),
      })
      .where(eq(eventsTable.id, Number(req.params.eventId)))
      .returning();

    const organizer = await db.select().from(usersTable).where(eq(usersTable.id, event.organizerId)).limit(1);
    res.json({
      ...event,
      price: Number(event.price),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      organizerName: organizer[0]?.fullName ?? "",
      organizerDept: organizer[0]?.department ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error updating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/events/:eventId", async (req, res) => {
  try {
    await db.delete(eventsTable).where(eq(eventsTable.id, Number(req.params.eventId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events/:eventId/approve", async (req, res) => {
  try {
    const { eventId } = ApproveEventParams.parse({ eventId: Number(req.params.eventId) });
    const body = ApproveEventBody.parse(req.body);

    const newStatus = body.action === "approve" ? "approved" : "rejected";
    const [event] = await db
      .update(eventsTable)
      .set({ status: newStatus })
      .where(eq(eventsTable.id, eventId))
      .returning();

    const organizer = await db.select().from(usersTable).where(eq(usersTable.id, event.organizerId)).limit(1);
    res.json({
      ...event,
      price: Number(event.price),
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      organizerName: organizer[0]?.fullName ?? "",
      organizerDept: organizer[0]?.department ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error approving event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
