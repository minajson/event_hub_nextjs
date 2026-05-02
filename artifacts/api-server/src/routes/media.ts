import { Router } from "express";
import { db } from "@workspace/db";
import { mediaTable, eventsTable } from "@workspace/db";
import { eq, and, ilike, count } from "drizzle-orm";
import { ListMediaQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/media", async (req, res) => {
  try {
    const query = ListMediaQueryParams.parse(req.query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.eventId) conditions.push(eq(mediaTable.eventId, Number(query.eventId)));
    if (query.category) conditions.push(eq(eventsTable.category, query.category));
    if (query.search) conditions.push(ilike(eventsTable.title, `%${query.search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: mediaTable.id,
          eventId: mediaTable.eventId,
          eventTitle: eventsTable.title,
          imageUrl: mediaTable.imageUrl,
          category: eventsTable.category,
          capturedAt: mediaTable.capturedAt,
        })
        .from(mediaTable)
        .leftJoin(eventsTable, eq(mediaTable.eventId, eventsTable.id))
        .where(where)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(mediaTable).leftJoin(eventsTable, eq(mediaTable.eventId, eventsTable.id)).where(where),
    ]);

    res.json({
      items: items.map((i) => ({
        ...i,
        capturedAt: i.capturedAt?.toISOString(),
        eventTitle: i.eventTitle ?? "",
        category: i.category ?? "",
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing media");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
