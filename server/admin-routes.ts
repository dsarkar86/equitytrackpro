import { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { storage } from "./storage";
import { requireAdmin } from "./middleware/admin";
import Stripe from "stripe";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : undefined;

const scryptAsync = promisify(scrypt);

/**
 * Register admin routes for the admin dashboard
 */
export function registerAdminRoutes(app: Express) {
  // Get all users
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get single user
  app.get("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user
  app.patch("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Reset user password
  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Generate a random temporary password
      const temporaryPassword = randomBytes(8).toString("hex");
      
      // Hash the password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(temporaryPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      
      await storage.resetUserPassword(userId, hashedPassword);
      
      res.json({ success: true, temporaryPassword });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Get all subscriptions
  app.get("/api/admin/subscriptions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Get single subscription
  app.get("/api/admin/subscriptions/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscriptionById(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Update subscription
  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscriptionById(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      // If this is a Stripe subscription, we may need to update it in Stripe as well
      if (subscription.stripeSubscriptionId && stripe) {
        try {
          // Update the Stripe subscription if status or price changes
          if ('isActive' in req.body || 'currentPrice' in req.body) {
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
              // Add Stripe-specific updates here
              // You might want to handle price changes or status changes differently
            });
          }
        } catch (stripeError) {
          console.error("Error updating Stripe subscription:", stripeError);
          // Continue anyway - we'll update our local record
        }
      }
      
      const updatedSubscription = await storage.updateSubscription(subscriptionId, req.body);
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Get all properties
  app.get("/api/admin/properties", requireAdmin, async (req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // Get single property
  app.get("/api/admin/properties/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // Update property
  app.patch("/api/admin/properties/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // Get all maintenance records
  app.get("/api/admin/maintenance", requireAdmin, async (req: Request, res: Response) => {
    try {
      const records = await storage.getAllMaintenanceRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
  });

  // Get single maintenance record
  app.get("/api/admin/maintenance/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      
      if (!record) {
        return res.status(404).json({ error: "Maintenance record not found" });
      }
      
      res.json(record);
    } catch (error) {
      console.error("Error fetching maintenance record:", error);
      res.status(500).json({ error: "Failed to fetch maintenance record" });
    }
  });

  // Update maintenance record
  app.patch("/api/admin/maintenance/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      
      if (!record) {
        return res.status(404).json({ error: "Maintenance record not found" });
      }
      
      const updatedRecord = await storage.updateMaintenanceRecord(recordId, req.body);
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating maintenance record:", error);
      res.status(500).json({ error: "Failed to update maintenance record" });
    }
  });

  // Get all receipts
  app.get("/api/admin/receipts", requireAdmin, async (req: Request, res: Response) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      res.status(500).json({ error: "Failed to fetch receipts" });
    }
  });

  // Get single receipt
  app.get("/api/admin/receipts/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const receiptId = parseInt(req.params.id);
      const receipt = await storage.getReceipt(receiptId);
      
      if (!receipt) {
        return res.status(404).json({ error: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      res.status(500).json({ error: "Failed to fetch receipt" });
    }
  });

  // Generate a new receipt (useful for admin corrections)
  app.post("/api/admin/receipts/generate", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, amount, description, type } = req.body;
      
      if (!userId || !amount || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const receiptNumber = await storage.generateReceiptNumber();
      
      const receiptData = {
        userId: parseInt(userId),
        receiptNumber,
        amount: parseFloat(amount),
        paymentStatus: "paid",
        type: type || "one_time",
        description,
        currency: "AUD",
        paymentMethod: "manual_admin"
      };
      
      const receipt = await storage.createReceipt(receiptData);
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error generating receipt:", error);
      res.status(500).json({ error: "Failed to generate receipt" });
    }
  });

  // Get admin dashboard stats
  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const properties = await storage.getAllProperties();
      const subscriptions = await storage.getAllSubscriptions();
      const maintenanceRecords = await storage.getAllMaintenanceRecords();
      const receipts = await storage.getAllReceipts();

      // Calculate statistics
      const totalUsers = users.length;
      const totalProperties = properties.length;
      const activeSubscriptions = subscriptions.filter(s => s.isActive).length;
      const totalSubscriptions = subscriptions.length;
      const totalRevenue = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
      
      // Calculate property types distribution
      const propertiesByType = properties.reduce((acc, property) => {
        const type = property.propertyType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate maintenance by category
      const maintenanceByCategory = maintenanceRecords.reduce((acc, record) => {
        const category = record.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate maintenance status distribution
      const maintenanceByStatus = maintenanceRecords.reduce((acc, record) => {
        const status = record.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats = {
        totalUsers,
        totalProperties,
        activeSubscriptions,
        totalSubscriptions,
        totalRevenue,
        propertiesByType,
        maintenanceByCategory,
        maintenanceByStatus,
        receiptCount: receipts.length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });
}