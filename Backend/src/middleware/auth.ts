import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches staff information to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret) as Record<string, unknown>;
    
    // Attach user info to request
    (req as unknown as Record<string, unknown>).user = decoded;
    
    next();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: errorMessage,
    });
  }
};

/**
 * Admin Authorization Middleware
 * Checks if the authenticated user is an admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user is admin (staff_type_id = 1 for ADMIN)
    const staffTypeId = user.staff_type_id as number;
    
    if (staffTypeId !== 1) {
      res.status(403).json({
        success: false,
        message: 'Only administrators can perform this action',
      });
      return;
    }

    next();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authorization check failed';
    res.status(500).json({
      success: false,
      message: 'Authorization check error',
      error: errorMessage,
    });
  }
};

/**
 * Executive Manager Authorization Middleware
 * Checks if user is admin or executive manager
 */
export const requireExecutiveOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const staffTypeId = user.staff_type_id as number;
    
    // Staff type ID: 1 = Admin, 2 = Executive Manager
    if (staffTypeId !== 1 && staffTypeId !== 2) {
      res.status(403).json({
        success: false,
        message: 'Only administrators and executive managers can perform this action',
      });
      return;
    }

    next();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authorization check failed';
    res.status(500).json({
      success: false,
      message: 'Authorization check error',
      error: errorMessage,
    });
  }
};
