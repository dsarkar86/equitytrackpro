import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { notificationService } from "./notification-service";
import { insertNotificationSchema } from "../shared/notification-types";

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function registerNotificationRoutes(app: Express) {
  // Get all notifications for the current user
  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", requireAuth, async (req, res, next) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });

  // Mark a notification as read
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", requireAuth, async (req, res, next) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Create a test notification (for development)
  app.post("/api/notifications/test", requireAuth, async (req, res, next) => {
    try {
      const { type = "system_notice", title = "Test Notification", message = "This is a test notification" } = req.body;
      
      const notification = await storage.createNotification({
        userId: req.user!.id,
        title,
        message,
        type,
        isRead: false
      });
      
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Delete a notification
  app.delete("/api/notifications/:id", requireAuth, async (req, res, next) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
}