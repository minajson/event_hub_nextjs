import { pgTable, serial, text, timestamp, pgEnum, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const eventFormatEnum = pgEnum("event_format", ["in_person", "online"]);
export const eventStatusEnum = pgEnum("event_status", ["draft", "pending", "approved", "rejected", "ongoing", "completed"]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  department: text("department"),
  venue: text("venue").notNull(),
  format: eventFormatEnum("format").notNull().default("in_person"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  capacity: integer("capacity").notNull(),
  registeredCount: integer("registered_count").notNull().default(0),
  status: eventStatusEnum("status").notNull().default("pending"),
  isFeatured: boolean("is_featured").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  imageUrl: text("image_url"),
  organizerId: integer("organizer_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, registeredCount: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
