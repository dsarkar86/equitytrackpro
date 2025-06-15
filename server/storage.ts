import { users, properties, maintenanceRecords, valuations, subscriptions, subscriptionPlans, receipts, userRoleEnum } from "@shared/schema";
import { type User, type InsertUser, type Property, type InsertProperty, type MaintenanceRecord, type InsertMaintenanceRecord, type Valuation, type InsertValuation, type Subscription, type InsertSubscription, type SubscriptionPlan, type InsertSubscriptionPlan, type Receipt, type InsertReceipt } from "@shared/schema";
import { notifications, type Notification, type InsertNotification } from "../shared/notification-types";
import { db } from "./db";
import { eq, and, inArray, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId?: string, stripeSubscriptionId?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;  
  updateUser(userId: number, userData: Partial<InsertUser>): Promise<User>;
  resetUserPassword(userId: number, newPassword: string): Promise<User>;

  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByUserId(userId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  getAllProperties(): Promise<Property[]>;

  // Maintenance record methods
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByPropertyId(propertyId: number): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordsByPropertyIds(propertyIds: number[]): Promise<MaintenanceRecord[]>;
  getMaintenanceRecordsByTradePersonId(tradePersonId: number): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord>;
  deleteMaintenanceRecord(id: number): Promise<void>;
  getAllMaintenanceRecords(): Promise<MaintenanceRecord[]>;

  // Valuation methods
  getValuationByPropertyId(propertyId: number): Promise<Valuation | undefined>;
  createValuation(valuation: InsertValuation): Promise<Valuation>;
  updateValuation(id: number, valuation: InsertValuation): Promise<Valuation>;

  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;

  // Subscription methods
  getSubscription(userId: number): Promise<Subscription | undefined>;
  getSubscriptionById(id: number): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  updateSubscriptionPropertyCount(userId: number, propertyCount: number): Promise<Subscription>;
  calculateSubscriptionPrice(planId: number, propertyCount: number): Promise<number>;
  
  // Receipt methods
  getReceipt(id: number): Promise<Receipt | undefined>;
  getReceiptsByUserId(userId: number): Promise<Receipt[]>;
  getAllReceipts(): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceiptByPaymentIntentId(paymentIntentId: string): Promise<Receipt | undefined>;
  generateReceiptNumber(): Promise<string>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(userId: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async resetUserPassword(userId: number, newPassword: string): Promise<User> {
    // In a real implementation, we would hash the password here
    // For this admin interface, we'll assume the password comes pre-hashed
    const [updatedUser] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords);
  }

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserStripeInfo(
    userId: number,
    stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(stripeInfo)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertiesByUserId(userId: number): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.userId, userId));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: InsertProperty): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({...property, updatedAt: new Date()})
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Maintenance record methods
  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record;
  }

  async getMaintenanceRecordsByPropertyId(propertyId: number): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(eq(maintenanceRecords.propertyId, propertyId));
  }

  async getMaintenanceRecordsByPropertyIds(propertyIds: number[]): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(inArray(maintenanceRecords.propertyId, propertyIds));
  }
  
  async getMaintenanceRecordsByTradePersonId(tradePersonId: number): Promise<MaintenanceRecord[]> {
    return db.select().from(maintenanceRecords).where(eq(maintenanceRecords.tradePersonId, tradePersonId));
  }

  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record).returning();
    return newRecord;
  }

  async updateMaintenanceRecord(id: number, record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [updatedRecord] = await db
      .update(maintenanceRecords)
      .set(record)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteMaintenanceRecord(id: number): Promise<void> {
    await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id));
  }

  // Valuation methods
  async getValuationByPropertyId(propertyId: number): Promise<Valuation | undefined> {
    const [valuation] = await db.select().from(valuations).where(eq(valuations.propertyId, propertyId));
    return valuation;
  }

  async createValuation(valuation: InsertValuation): Promise<Valuation> {
    const [newValuation] = await db.insert(valuations).values(valuation).returning();
    return newValuation;
  }

  async updateValuation(id: number, valuation: InsertValuation): Promise<Valuation> {
    const [updatedValuation] = await db
      .update(valuations)
      .set(valuation)
      .where(eq(valuations.id, id))
      .returning();
    return updatedValuation;
  }

  // Subscription Plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  // Subscription methods
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(subscription)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }
  
  async updateSubscriptionPropertyCount(userId: number, propertyCount: number): Promise<Subscription> {
    // Get the subscription for the user
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new Error("No subscription found for this user");
    }

    // Calculate the new price based on the property count
    const newPrice = await this.calculateSubscriptionPrice(subscription.planId, propertyCount);

    // Update the subscription with the new property count and price
    const [updatedSubscription] = await db.update(subscriptions)
      .set({ 
        propertyCount, 
        currentPrice: newPrice,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();
    
    return updatedSubscription;
  }

  async calculateSubscriptionPrice(planId: number, propertyCount: number): Promise<number> {
    // Get the subscription plan
    const plan = await this.getSubscriptionPlan(planId);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Check if property count exceeds the maximum (if a maximum is set)
    if (plan.maxProperties !== null && propertyCount > plan.maxProperties) {
      throw new Error(`This plan only supports up to ${plan.maxProperties} properties`);
    }

    // Calculate the price: base price + (propertyPrice * (propertyCount - 1))
    // The first property is included in the base price
    const additionalProperties = Math.max(0, propertyCount - 1);
    const price = plan.basePrice + (plan.propertyPrice * additionalProperties);
    
    // Round to 2 decimal places
    return Math.round(price * 100) / 100;
  }

  // Receipt methods
  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt || undefined;
  }

  async getReceiptsByUserId(userId: number): Promise<Receipt[]> {
    return db.select().from(receipts).where(eq(receipts.userId, userId));
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const [newReceipt] = await db.insert(receipts).values(receipt).returning();
    return newReceipt;
  }

  async getReceiptByPaymentIntentId(paymentIntentId: string): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.stripePaymentIntentId, paymentIntentId));
    return receipt || undefined;
  }

  async generateReceiptNumber(): Promise<string> {
    // Generate a unique receipt number with format: ET-YYYYMMDD-XXXXX
    // where XXXXX is a sequential number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `ET-${year}${month}${day}`;
    
    // Get the last receipt with this date prefix
    const receiptCount = await db
      .select({ count: sql`count(*)` })
      .from(receipts)
      .where(sql`receipt_number LIKE ${datePrefix + '-%'}`);
    
    const count = Number(receiptCount[0]?.count || 0);
    const sequential = String(count + 1).padStart(5, '0');
    
    return `${datePrefix}-${sequential}`;
  }
}

export const storage = new DatabaseStorage();
