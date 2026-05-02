import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const mediaTable = pgTable("media", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  imageUrl: text("image_url").notNull(),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const insertMediaSchema = createInsertSchema(mediaTable).omit({ id: true, capturedAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;
