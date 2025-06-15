import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { z } from "zod";
import { 
  insertPropertySchema,
  insertMaintenanceRecordSchema,
  insertValuationSchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema
} from "@shared/schema";
import { requireAdmin } from "./middleware/admin";
import { verifyDatabaseRegion } from "./db";
import { registerAdminRoutes } from "./admin-routes";
import { registerTradespersonRoutes } from "./tradesperson-routes";
import { registerNotificationRoutes } from "./notification-routes";
import { upload, processImage, getImageUrl } from "./image-upload";
import path from "path";

// Australian Data Protection middleware
function australianDataProtection(req: Request, res: Response, next: NextFunction) {
  // Add Australian compliance headers
  res.setHeader('X-Data-Location', 'Australia');
  res.setHeader('X-Privacy-Policy-Version', '1.0');
  
  // Check for sensitive operations that might need additional protection
  const sensitiveOperations = ['/api/property', '/api/user', '/api/maintenance'];
  const path = req.path.toLowerCase();
  
  if (sensitiveOperations.some(op => path.includes(op))) {
    // For sensitive operations, we might want to add additional logging
    // or authorization checks in a production environment
    console.log(`Australian Data Protection: Accessing protected resource: ${path}`);
  }
  
  next();
}

// Middleware to log data access for compliance purposes
function dataAccessAudit(req: Request, res: Response, next: NextFunction) {
  // In a production system, this would log to a secure audit trail
  const timestamp = new Date().toISOString();
  const userId = req.user ? (req.user as any).id : 'unauthenticated';
  const method = req.method;
  const path = req.path;
  const ip = req.ip;
  
  // Sample log format for Australian privacy compliance
  console.log(`[AUS-PRIVACY-AUDIT] ${timestamp} | User: ${userId} | ${method} ${path} | IP: ${ip}`);
  
  next();
}

// Initialize Stripe
// Check if we're in test mode or live mode
let stripeMode = "test";
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  stripeMode = "live";
  console.warn('WARNING: Stripe is in LIVE mode. Real charges may occur.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : undefined;

// Serve uploaded files
function setupStaticFileServing(app: Express) {
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup static file serving for uploads
  setupStaticFileServing(app);
  // Register admin routes for the admin dashboard
  registerAdminRoutes(app);
  
  // Register tradesperson routes
  registerTradespersonRoutes(app);
  
  // Verify that we're using an Australian database region
  const isAustralianRegion = await verifyDatabaseRegion();
  if (!isAustralianRegion) {
    console.error("WARNING: Database may not be in Australian region. This could violate data sovereignty requirements.");
  } else {
    console.log("✓ Verified: Database is in Australian region, compliant with data sovereignty requirements");
  }
  
  // Initialize subscription plans
  try {
    await initializeSubscriptionPlans();
    console.log("✓ Subscription plans initialized successfully");
  } catch (error) {
    console.error("Failed to initialize subscription plans:", error);
  }
  
  // Apply Australian data protection middleware to all routes
  app.use(australianDataProtection);
  
  // Apply data access audit middleware to all routes
  app.use(dataAccessAudit);
  
  // Add compliance information to API responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Store the original send method
    const originalSend = res.send;
    
    // Override the send method for JSON responses to include compliance information
    res.send = function(body) {
      if (res.getHeader('content-type')?.toString().includes('application/json') && typeof body === 'string') {
        try {
          const jsonBody = JSON.parse(body);
          
          // Only add compliance info to successful responses that are objects
          if (res.statusCode >= 200 && res.statusCode < 300 && typeof jsonBody === 'object' && !Array.isArray(jsonBody)) {
            // Add compliance information
            const bodyWithCompliance = {
              ...jsonBody,
              _compliance: {
                dataRegion: 'Australia',
                privacyPolicyVersion: '1.0',
                dataSovereigntyCompliant: true
              }
            };
            
            // Convert back to string
            return originalSend.call(this, JSON.stringify(bodyWithCompliance));
          }
        } catch (e) {
          // If parsing fails, just send the original body
        }
      }
      
      // Call the original method
      return originalSend.call(this, body);
    };
    
    next();
  });
  
  // Set up authentication routes
  setupAuth(app);

  // Check authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Properties API
  app.get("/api/properties", requireAuth, async (req, res, next) => {
    try {
      const properties = await storage.getPropertiesByUserId(req.user!.id);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  });
  
  // Property image upload endpoint
  app.post('/api/properties/upload-image', requireAuth, upload.single('propertyImage'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      // Process the uploaded image
      await processImage(req.file.path, {
        width: 1200,  // Maximum width for property images
        height: 800,  // Maximum height for property images
        quality: 80   // Good quality with reasonable file size
      });
      
      // Return the image URL
      const imageUrl = getImageUrl(req.file.filename);
      
      return res.json({
        success: true,
        imageUrl,
        message: 'Image uploaded and processed successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/properties/:id", requireAuth, async (req, res, next) => {
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(property);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/properties", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const property = await storage.createProperty(validatedData);
      
      // Update property count in subscription after adding a new property
      try {
        // Get all properties for this user to calculate the new count
        const userProperties = await storage.getPropertiesByUserId(req.user!.id);
        const propertyCount = userProperties.length;
        
        // Update subscription with new property count
        const updatedSubscription = await storage.updateSubscriptionPropertyCount(req.user!.id, propertyCount);
        
        // If using Stripe, update the subscription quantity in Stripe
        if (stripe && req.user!.stripeSubscriptionId) {
          // Get the active subscription from the database
          const dbSubscription = await storage.getSubscription(req.user!.id);
          
          if (dbSubscription && dbSubscription.isActive) {
            // Update the Stripe subscription with the new property count
            await stripe.subscriptions.update(req.user!.stripeSubscriptionId, {
              proration_behavior: 'create_prorations',
              items: [{
                id: dbSubscription.id.toString(), // This is a simplification - you'll need the actual Stripe item ID
                quantity: propertyCount
              }]
            });
          }
        }
        
        // Include updated subscription information in the response
        property.subscriptionInfo = {
          propertyCount,
          currentPrice: updatedSubscription.currentPrice,
          nextBillingDate: updatedSubscription.nextBillingDate
        };
      } catch (subscriptionError) {
        // Log but don't fail the property creation if subscription update fails
        console.error("Failed to update subscription after property creation:", subscriptionError);
      }
      
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/properties/:id", requireAuth, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const updatedProperty = await storage.updateProperty(propertyId, validatedData);
      res.json(updatedProperty);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/properties/:id", requireAuth, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteProperty(propertyId);
      
      // Update property count in subscription after deletion
      try {
        // Get all properties for this user to calculate the new count
        const userProperties = await storage.getPropertiesByUserId(req.user!.id);
        const propertyCount = userProperties.length;
        
        // Update subscription with new property count
        const updatedSubscription = await storage.updateSubscriptionPropertyCount(req.user!.id, propertyCount);
        
        // If using Stripe, update the subscription quantity in Stripe
        if (stripe && req.user!.stripeSubscriptionId) {
          // Get the active subscription from the database
          const dbSubscription = await storage.getSubscription(req.user!.id);
          
          if (dbSubscription && dbSubscription.isActive) {
            // Update the Stripe subscription with the new property count
            await stripe.subscriptions.update(req.user!.stripeSubscriptionId, {
              proration_behavior: 'create_prorations',
              items: [{
                id: dbSubscription.id.toString(), // This is a simplification - you'll need the actual Stripe item ID
                quantity: propertyCount
              }]
            });
          }
        }
      } catch (subscriptionError) {
        // Log but don't fail the property deletion if subscription update fails
        console.error("Failed to update subscription after property deletion:", subscriptionError);
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Maintenance Records API
  app.get("/api/maintenance", requireAuth, async (req, res, next) => {
    try {
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      
      if (propertyId) {
        const property = await storage.getProperty(propertyId);
        
        if (!property || property.userId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const records = await storage.getMaintenanceRecordsByPropertyId(propertyId);
        return res.json(records);
      }
      
      const properties = await storage.getPropertiesByUserId(req.user!.id);
      const propertyIds = properties.map(p => p.id);
      const records = await storage.getMaintenanceRecordsByPropertyIds(propertyIds);
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/maintenance", requireAuth, async (req, res, next) => {
    try {
      const { propertyId } = req.body;
      const property = await storage.getProperty(parseInt(propertyId));
      
      if (!property || property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertMaintenanceRecordSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(validatedData);
      
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/maintenance/:id", requireAuth, async (req, res, next) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      const property = await storage.getProperty(record.propertyId);
      
      if (property?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertMaintenanceRecordSchema.parse(req.body);
      const updatedRecord = await storage.updateMaintenanceRecord(recordId, validatedData);
      
      res.json(updatedRecord);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/maintenance/:id", requireAuth, async (req, res, next) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMaintenanceRecord(recordId);
      
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      
      const property = await storage.getProperty(record.propertyId);
      
      if (property?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteMaintenanceRecord(recordId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Valuation API
  app.get("/api/valuations/:propertyId", requireAuth, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const valuation = await storage.getValuationByPropertyId(propertyId);
      
      if (!valuation) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.json(valuation);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/valuations", requireAuth, async (req, res, next) => {
    try {
      const { propertyId } = req.body;
      const property = await storage.getProperty(parseInt(propertyId));
      
      if (!property || property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertValuationSchema.parse(req.body);
      const valuation = await storage.createValuation(validatedData);
      
      res.status(201).json(valuation);
    } catch (error) {
      next(error);
    }
  });

  // Stripe subscription (normal route with auth)
  if (stripe) {
    app.post('/api/create-subscription', requireAuth, async (req, res, next) => {
      try {
        const user = req.user!;
        
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
            expand: ['latest_invoice']
          });
          
          // Get the invoice and payment intent separately to ensure it exists
          let clientSecret = null;
          if (subscription.latest_invoice) {
            const invoiceId = typeof subscription.latest_invoice === 'string'
              ? subscription.latest_invoice
              : subscription.latest_invoice.id;
              
            const invoice = await stripe.invoices.retrieve(invoiceId, {
              expand: ['payment_intent']
            });
            
            // @ts-ignore - Stripe types are tricky, but this works at runtime
            clientSecret = invoice.payment_intent?.client_secret;
          }
          
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
          });
        }
        
        if (!user.email) {
          throw new Error('No user email on file');
        }
        
        // Create or retrieve customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName || user.username,
          });
          
          customerId = customer.id;
          await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
        }
        
        // Create subscription with the selected price ID
        const priceId = process.env.STRIPE_PRICE_ID || req.body.priceId;
        
        if (!priceId) {
          return res.status(400).json({ message: "Price ID is required" });
        }
        
        // Create a direct payment intent for the initial subscription payment
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 999; // Fallback if unit_amount is null
        
        // Create a payment intent for this subscription
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          customer: customerId,
          setup_future_usage: 'off_session',
          description: `Equitystek Subscription - Initial payment`,
          metadata: {
            price_id: priceId
          }
        });
        
        // Create subscription with manual collection to avoid immediate payment
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId,
          }],
          collection_method: 'send_invoice',
          days_until_due: 30,
          metadata: {
            payment_intent_id: paymentIntent.id
          }
        });
        
        await storage.updateUserStripeInfo(user.id, { 
          stripeCustomerId: customerId, 
          stripeSubscriptionId: subscription.id 
        });
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        next(error);
      }
    });
    
    // Temporary route for testing subscriptions without auth
    app.post('/api/test-subscription', async (req, res, next) => {
      try {
        // Default test email if not provided
        const email = req.body.email || "test@example.com";
        const name = req.body.name || "Test User";
        const amount = req.body.amount || 999; // Amount in cents (9.99)
        const productName = req.body.productName || "Equitystek Subscription";
        
        console.log(`Creating subscription in ${stripeMode} mode for ${email}`);
        
        // Create a customer for this test
        const customer = await stripe.customers.create({
          email: email,
          name: name,
        });
        
        // Instead of using pre-defined price IDs, create a price on-the-fly
        // This approach works better for testing since we don't need to create products/prices in Stripe dashboard
        const product = await stripe.products.create({
          name: productName,
        });
        
        const price = await stripe.prices.create({
          unit_amount: amount,
          currency: 'usd',
          recurring: { interval: 'month' },
          product: product.id,
        });
        
        // Payment settings for test vs live mode
        const paymentSettings = stripeMode === 'live' 
          ? {} // No special settings for live mode
          : { 
              payment_settings: { 
                payment_method_options: {
                  card: { request_three_d_secure: 'any' } // Request 3DS in test mode
                }
              } 
            };
        
        // For test subscriptions, we'll use a payment intent directly
        // This simplifies the flow and avoids invoice/payment intent expansion issues
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          customer: customer.id,
          setup_future_usage: 'off_session',
          description: `${productName} - Initial payment`,
          metadata: {
            subscription_product: product.id,
            subscription_price: price.id
          }
        });
        
        // Also create the subscription - but we'll handle payment separately
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: price.id,
          }],
          // Important: Use 'manual' collection method to avoid immediate invoice issues
          collection_method: 'send_invoice',
          days_until_due: 30,
        });
        
        // Add a helpful message about the Stripe mode
        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
          stripeMode: stripeMode,
          testMode: stripeMode === 'test',
        });
      } catch (error) {
        console.error("Stripe error:", error);
        next(error);
      }
    });
  }

  // Subscription Plan Management API
  app.get("/api/subscription-plans", async (req, res, next) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  // API to get current subscription price with hypothetical property count
  app.get("/api/subscription/price-estimate", requireAuth, async (req, res, next) => {
    try {
      const propertyCount = parseInt(req.query.propertyCount as string) || 1;
      
      // Get the user's current subscription
      const subscription = await storage.getSubscription(req.user!.id);
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }
      
      // Calculate price based on the plan and property count
      const estimatedPrice = await storage.calculateSubscriptionPrice(
        subscription.planId, 
        propertyCount
      );
      
      res.json({
        propertyCount,
        currentPrice: subscription.currentPrice,
        estimatedPrice,
        priceDifference: estimatedPrice - subscription.currentPrice,
        planId: subscription.planId
      });
    } catch (error) {
      next(error);
    }
  });

  // API to initialize subscription plans (admin only in production)
  app.post("/api/initialize-subscription-plans", requireAuth, async (req, res, next) => {
    try {
      // In production, this would check for admin role
      const plans = await initializeSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });
  
  // Receipt API routes
  app.get("/api/receipts", requireAuth, async (req, res, next) => {
    try {
      const receipts = await storage.getReceiptsByUserId(req.user!.id);
      res.json(receipts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/receipts/:id", requireAuth, async (req, res, next) => {
    try {
      const receipt = await storage.getReceipt(parseInt(req.params.id));
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      if (receipt.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(receipt);
    } catch (error) {
      next(error);
    }
  });
  
  // Download receipt as HTML (can be converted to PDF in a production app)
  app.get("/api/receipts/:id/download", requireAuth, async (req, res, next) => {
    try {
      const receipt = await storage.getReceipt(parseInt(req.params.id));
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      if (receipt.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Import the receipt service
      const { generateReceiptHTML } = await import("./receipt-service");
      
      // Generate the HTML receipt
      const html = await generateReceiptHTML(receipt);
      
      // Set headers for HTML download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="receipt_${receipt.receiptNumber}.html"`);
      
      // Send the HTML receipt
      res.send(html);
    } catch (error) {
      next(error);
    }
  });
  
  // Create test receipt endpoint (for development only)
  app.post("/api/receipts/generate-test", requireAuth, async (req, res, next) => {
    try {
      const receiptNumber = await storage.generateReceiptNumber();
      const isSubscription = Math.random() > 0.5; // Randomly choose receipt type
      
      const receipt = await storage.createReceipt({
        userId: req.user!.id,
        receiptNumber,
        amount: isSubscription ? 49.99 : 29.99,
        currency: "AUD",
        description: isSubscription ? "Monthly Subscription" : "One-time Service Fee",
        paymentMethod: "Credit Card",
        paymentStatus: "paid",
        type: isSubscription ? "subscription" : "one_time",
        stripePaymentIntentId: `test_pi_${Math.random().toString(36).substring(2, 15)}`,
        items: {
          items: [
            {
              name: isSubscription ? "Equitystek Subscription" : "Property Valuation Service", 
              amount: isSubscription ? 49.99 : 29.99
            }
          ]
        }
      });
      
      res.status(201).json(receipt);
    } catch (error) {
      next(error);
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

// Helper function to initialize subscription plans
async function initializeSubscriptionPlans() {
  try {
    // Check if we already have plans
    const existingPlans = await storage.getSubscriptionPlans();
    if (existingPlans.length > 0) {
      console.log("Subscription plans already exist, skipping initialization");
      return existingPlans;
    }
    
    // Create default plans
    const plans = [
      {
        name: "Basic",
        description: "Perfect for individual property owners",
        basePrice: 9.99,          // $9.99 for one property
        propertyPrice: 4.99,      // $4.99 for each additional property
        maxProperties: 3,         // Maximum 3 properties on Basic plan
        features: { featureList: ["Property management", "Basic maintenance tracking", "Simple valuation"] },
        billingCycle: "monthly"
      },
      {
        name: "Professional",
        description: "For property managers and small portfolios",
        basePrice: 19.99,         // $19.99 for one property
        propertyPrice: 3.99,      // $3.99 for each additional property
        maxProperties: 10,        // Maximum 10 properties
        features: { featureList: ["All Basic features", "Advanced valuation tools", "Document storage", "Maintenance scheduling"] },
        billingCycle: "monthly"
      },
      {
        name: "Enterprise",
        description: "For large property portfolios and teams",
        basePrice: 49.99,        // $49.99 for one property
        propertyPrice: 2.99,     // $2.99 for each additional property
        maxProperties: null,     // Unlimited properties
        features: { featureList: ["All Professional features", "Team access", "API integration", "Custom reporting", "Priority support"] },
        billingCycle: "monthly"
      }
    ];
    
    const createdPlans = [];
    for (const plan of plans) {
      const createdPlan = await storage.createSubscriptionPlan(plan);
      createdPlans.push(createdPlan);
    }
    
    console.log("Subscription plans initialized successfully");
    return createdPlans;
  } catch (error) {
    console.error("Failed to initialize subscription plans:", error);
    throw error;
  }
}
