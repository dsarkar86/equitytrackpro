import { Request, Response } from "express";
import { Express } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { maintenanceCategoryEnum } from "@shared/schema";

// Middleware to ensure user is a tradesperson
function requireTradesperson(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "tradesperson") {
    return res.status(403).json({ message: "Access denied. Tradesperson role required." });
  }

  next();
}

// Set up multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const workImagesDir = path.join(uploadsDir, 'work-images');
if (!fs.existsSync(workImagesDir)) {
  fs.mkdirSync(workImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, workImagesDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any, false);
    }
  }
});

// Work record schema for validation
const workRecordSchema = z.object({
  propertyId: z.number().int().positive(),
  workType: z.enum(maintenanceCategoryEnum.enumValues),
  workDescription: z.string().min(10),
  completionDate: z.string(), // Date will come as ISO string
  cost: z.number().optional(),
});

export function registerTradespersonRoutes(app: Express) {
  // Get all tradespeople (for property owners to select from)
  app.get("/api/tradespeople", async (req: Request, res: Response) => {
    try {
      // Get all users with tradesperson role
      const allUsers = await dbStorage.getAllUsers();
      const tradespeople = allUsers.filter(user => user.role === "tradesperson");
      
      // Map to return only necessary information
      const tradespeopleList = tradespeople.map(person => ({
        id: person.id,
        username: person.username,
        name: person.name,
        email: person.email,
        specialty: person.specialty,
        phoneNumber: person.phoneNumber,
        experience: person.experience,
        rating: person.rating,
        verified: person.verified,
        profileImageUrl: person.profileImageUrl
      }));
      
      res.json(tradespeopleList);
    } catch (error) {
      console.error("Error fetching tradespeople:", error);
      res.status(500).json({ message: "Failed to fetch tradespeople" });
    }
  });
  
  // Get available properties for tradesperson
  app.get("/api/tradesperson/properties", requireTradesperson, async (req: Request, res: Response) => {
    try {
      // Get all properties (in a real application, you might want to filter this)
      const properties = await dbStorage.getAllProperties();
      
      // Return only the necessary property information
      const propertyList = properties.map(property => ({
        id: property.id,
        name: property.name,
        address: property.address,
      }));
      
      res.json(propertyList);
    } catch (error) {
      console.error("Error fetching properties for tradesperson:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Submit work record with images
  app.post(
    "/api/tradesperson/work-records",
    requireTradesperson,
    upload.array('images', 5), // Accept up to 5 images
    async (req: Request, res: Response) => {
      try {
        // Parse work record data
        const workRecordData = JSON.parse(req.body.workRecord);
        
        // Validate the data
        const validatedData = workRecordSchema.parse({
          ...workRecordData,
          // Convert back to Date object if needed
          completionDate: new Date(workRecordData.completionDate).toISOString(),
        });
        
        // Get uploaded files
        const files = req.files as Express.Multer.File[];
        const imageUrls = files.map(file => ({
          fileName: file.filename,
          url: `/uploads/work-images/${file.filename}`,
        }));
        
        // Create maintenance record in the database
        const maintenanceRecord = await dbStorage.createMaintenanceRecord({
          propertyId: validatedData.propertyId,
          title: `Maintenance: ${validatedData.workType}`,
          category: validatedData.workType,
          description: validatedData.workDescription,
          completedDate: new Date(validatedData.completionDate),
          cost: validatedData.cost || 0,
          status: "completed",
          priority: "medium", // Default priority
          tradePersonId: req.user.id,
          imageUrls: JSON.stringify(imageUrls),
        });
        
        // Get property details to include in response
        const property = await dbStorage.getProperty(validatedData.propertyId);
        
        if (!property) {
          return res.status(404).json({ message: "Property not found" });
        }
        
        // Format response
        const response = {
          id: maintenanceRecord.id,
          propertyId: maintenanceRecord.propertyId,
          propertyName: property.name,
          workType: maintenanceRecord.category,
          workDescription: maintenanceRecord.description,
          completionDate: maintenanceRecord.date.toISOString(),
          cost: maintenanceRecord.cost,
          images: imageUrls
        };
        
        res.status(201).json(response);
      } catch (error) {
        console.error("Error creating work record:", error);
        res.status(400).json({ message: "Failed to create work record", error: (error as Error).message });
      }
    }
  );

  // Get tradesperson's work records
  app.get("/api/tradesperson/work-records", requireTradesperson, async (req: Request, res: Response) => {
    try {
      // Get maintenance records submitted by this tradesperson
      const maintenanceRecords = await dbStorage.getMaintenanceRecordsByTradePersonId(req.user.id);
      
      // Get all relevant property IDs
      const propertyIds = maintenanceRecords.map(record => record.propertyId);
      
      // Get property details
      const properties = await Promise.all(
        propertyIds.map(async (id) => await dbStorage.getProperty(id))
      );
      
      // Build property map for quick lookup
      const propertyMap = properties.reduce((acc, property) => {
        if (property) {
          acc[property.id] = property;
        }
        return acc;
      }, {} as Record<number, any>);
      
      // Format response
      const workRecords = maintenanceRecords.map(record => {
        const property = propertyMap[record.propertyId];
        const imageUrls = record.imageUrls ? JSON.parse(record.imageUrls) : [];
        
        return {
          id: record.id.toString(),
          propertyId: record.propertyId,
          propertyName: property ? property.name : "Unknown Property",
          workType: record.category,
          workDescription: record.description,
          completionDate: record.completedDate.toISOString(),
          cost: record.cost,
          images: imageUrls
        };
      });
      
      res.json(workRecords);
    } catch (error) {
      console.error("Error fetching work records:", error);
      res.status(500).json({ message: "Failed to fetch work records" });
    }
  });
}