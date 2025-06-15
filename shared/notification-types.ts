import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const notificationTypeEnum = z.enum([
  'maintenance_due',
  'maintenance_completed',
  'subscription_renewal',
  'property_update',
  'valuation_update',
  'system_notice'
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().$type<z.infer<typeof notificationTypeEnum>>(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;