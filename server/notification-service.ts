import { storage } from "./storage";
import { InsertNotification } from "../shared/notification-types";

/**
 * Service for managing user notifications
 */
export class NotificationService {
  /**
   * Create a new notification for a user
   */
  async createNotification(notification: InsertNotification) {
    return await storage.createNotification(notification);
  }

  /**
   * Create a maintenance due notification
   */
  async createMaintenanceDueNotification(userId: number, propertyId: number, description: string) {
    const property = await storage.getProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    return await this.createNotification({
      userId,
      title: "Maintenance Due",
      message: `Scheduled maintenance is due for your property: ${property.address || "Property " + propertyId}. ${description}`,
      type: "maintenance_due",
      isRead: false,
      relatedEntityId: propertyId,
      relatedEntityType: "property"
    });
  }

  /**
   * Create a maintenance completed notification
   */
  async createMaintenanceCompletedNotification(userId: number, maintenanceId: number) {
    const maintenance = await storage.getMaintenanceRecord(maintenanceId);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }
    
    const property = await storage.getProperty(maintenance.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    return await this.createNotification({
      userId,
      title: "Maintenance Completed",
      message: `Maintenance task has been marked as completed for ${property.address || "your property"}. Category: ${maintenance.category}`,
      type: "maintenance_completed",
      isRead: false,
      relatedEntityId: maintenanceId,
      relatedEntityType: "maintenance"
    });
  }

  /**
   * Create a subscription renewal notification
   */
  async createSubscriptionRenewalNotification(userId: number, daysUntilRenewal: number) {
    return await this.createNotification({
      userId,
      title: "Subscription Renewal",
      message: `Your subscription will renew in ${daysUntilRenewal} days. Please ensure your payment method is up to date.`,
      type: "subscription_renewal",
      isRead: false,
      relatedEntityType: "subscription"
    });
  }

  /**
   * Create a property update notification
   */
  async createPropertyUpdateNotification(userId: number, propertyId: number, updateType: string) {
    const property = await storage.getProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    return await this.createNotification({
      userId,
      title: "Property Update",
      message: `An update has been made to your property at ${property.address || "Property " + propertyId}. Update type: ${updateType}`,
      type: "property_update",
      isRead: false,
      relatedEntityId: propertyId,
      relatedEntityType: "property"
    });
  }

  /**
   * Create a valuation update notification
   */
  async createValuationUpdateNotification(userId: number, propertyId: number, newValue: number) {
    const property = await storage.getProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    const formattedValue = new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD' 
    }).format(newValue);
    
    return await this.createNotification({
      userId,
      title: "Property Valuation Update",
      message: `A new valuation has been calculated for your property at ${property.address || "Property " + propertyId}. New estimated value: ${formattedValue}`,
      type: "valuation_update",
      isRead: false,
      relatedEntityId: propertyId,
      relatedEntityType: "property"
    });
  }

  /**
   * Create a system notification for all users or a specific user
   */
  async createSystemNotification(message: string, title: string = "System Notice", userId?: number) {
    if (userId) {
      // Create notification for a specific user
      return await this.createNotification({
        userId,
        title,
        message,
        type: "system_notice",
        isRead: false
      });
    } else {
      // Create notification for all users
      const users = await storage.getAllUsers();
      
      const promises = users.map(user => 
        this.createNotification({
          userId: user.id,
          title,
          message,
          type: "system_notice",
          isRead: false
        })
      );
      
      return await Promise.all(promises);
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();