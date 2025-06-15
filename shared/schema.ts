import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['owner', 'tradesperson', 'investor', 'admin']);

// Property type enum
export const propertyTypeEnum = pgEnum('property_type', ['single_family', 'condominium', 'townhouse', 'multi_family', 'commercial']);

// Maintenance category enum
export const maintenanceCategoryEnum = pgEnum('maintenance_category', [
  'roof', 'plumbing', 'electrical', 'hvac', 'appliances', 'flooring',
  'kitchen', 'bathroom', 'exterior', 'landscaping', 'other'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  fullName: text("full_name"),
  specialtyType: text("specialty_type"),
  licenseNumber: text("license_number"),
  propertyCount: integer("property_count"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: real("bathrooms"),
  squareFeet: integer("square_feet"),
  yearBuilt: integer("year_built"),
  lotSize: real("lot_size"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance records table
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  title: text("title").notNull(),
  category: maintenanceCategoryEnum("category").notNull(),
  description: text("description"),
  cost: real("cost").notNull(),
  contractor: text("contractor"),
  completedDate: timestamp("completed_date").notNull(),
  estimatedValueAdded: real("estimated_value_added"),
  documentsUrls: text("documents_urls").array(),
  tradePersonId: integer("trade_person_id").references(() => users.id),
  imageUrls: text("image_urls"),
  status: text("status").default("completed"),
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Valuations table
export const valuations = pgTable("valuations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  comparableSalesValue: real("comparable_sales_value"),
  perSquareFootValue: real("per_square_foot_value"),
  automatedModelValue: real("automated_model_value"),
  costApproachValue: real("cost_approach_value"),
  incomeApproachValue: real("income_approach_value"),
  maintenanceAddedValue: real("maintenance_added_value"),
  equitystekValue: real("equitystek_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans table (for base pricing configuration)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  basePrice: real("base_price").notNull(), // Base price for one property
  propertyPrice: real("property_price").notNull(), // Additional price per property
  maxProperties: integer("max_properties"), // Maximum properties allowed (null for unlimited)
  features: json("features"), // JSON object of features included in this plan
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  propertyCount: integer("property_count").notNull().default(1), // Number of properties covered
  currentPrice: real("current_price").notNull(), // Calculated price based on plan and property count
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const userRelations = {
  properties: (user: any) => user.id,
  subscriptions: (user: any) => user.id
};

export const propertyRelations = {
  user: (property: any) => property.userId,
  maintenanceRecords: (property: any) => property.id,
  valuations: (property: any) => property.id
};

export const maintenanceRecordRelations = {
  property: (record: any) => record.propertyId
};

export const valuationRelations = {
  property: (valuation: any) => valuation.propertyId
};

export const subscriptionPlanRelations = {
  subscriptions: (plan: any) => plan.id
};

export const subscriptionRelations = {
  user: (subscription: any) => subscription.userId,
  plan: (subscription: any) => subscription.planId
};

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true
});

export const insertValuationSchema = createInsertSchema(valuations).omit({
  id: true,
  createdAt: true
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type Valuation = typeof valuations.$inferSelect;
export type InsertValuation = z.infer<typeof insertValuationSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Receipts table
export const receiptsTypeEnum = pgEnum('receipt_type', ['subscription', 'one_time']);

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  receiptNumber: text("receipt_number").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  description: text("description"),
  type: receiptsTypeEnum("type").notNull().default('one_time'),
  items: json("items").default({}),  // JSON field to store line items
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  pdfUrl: text("pdf_url"),  // URL to download receipt PDF if needed later
});

// Relations
export const receiptRelations = relations(receipts, ({ one }) => ({
  user: one(users, {
    fields: [receipts.userId],
    references: [users.id],
  }),
}));

// Insert schema for receipts
export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
});

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
