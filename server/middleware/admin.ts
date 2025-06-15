import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require admin role for protected routes
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Then check if the user has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  // If all checks pass, proceed
  next();
}