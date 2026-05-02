import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventsTable } from "./events";

export const ticketTypeEnum = pgEnum("ticket_type", ["general", "vip"]);
export const registrationStatusEnum = pgEnum("registration_status", ["registered", "waitlist", "checked_in", "cancelled"]);

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  ticketType: ticketTypeEnum("ticket_type").notNull().default("general"),
  status: registrationStatusEnum("status").notNull().default("registered"),
  passCode: text("pass_code").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({ id: true, registeredAt: true });
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
