import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * Extended Express Request with decoded JWT data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    account_id: number;
    email: string;
    role: string;
    staff_id?: number;
    staff_type_id?: number;
    member_id?: number;
    member_type_id?: number;
    privileges: string[];
    iat: number;
    exp: number;
  };
}

/**
 * Middleware to validate JWT token and check for required privilege
 * Must be used after express.json() middleware
 *
 * Usage:
 * app.post('/api/members', authorizePrivilege('CREATE_MEMBER'), MemberController.createMember);
 *
 * @param requiredPrivilege - The privilege code that must exist in the JWT token
 * @returns Express middleware function
 */
export function authorizePrivilege(requiredPrivilege: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

      // Verify and decode JWT token
      let decoded: Record<string, unknown>;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
      } catch (err: unknown) {
        const error = err as { name: string };
        if (error.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            message: 'Token has expired',
          });
          return;
        } else if (error.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
          return;
        }
        throw err;
      }

      // Verify this is a staff member (only staff have privilege-based access to these endpoints)
      if (!decoded.staff_id) {
        res.status(403).json({
          success: false,
          message: 'Only staff members with valid privileges can access this endpoint',
        });
        return;
      }

      // Extract privileges array from token
      const tokenPrivileges: string[] = (decoded.privileges as string[]) || [];

      // Check if required privilege exists in token
      if (!tokenPrivileges.includes(requiredPrivilege)) {
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required privilege: ${requiredPrivilege}`,
          missingPrivilege: requiredPrivilege,
        });
        return;
      }

      // Attach decoded user data to request object for use in route handlers
      req.user = decoded as AuthenticatedRequest['user'];

      // Proceed to next middleware/route handler
      next();
    } catch (error: unknown) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
      });
    }
  };
}

/**
 * Middleware to validate JWT token and check for any of multiple required privileges (OR logic)
 *
 * Usage:
 * app.post('/api/members/:id/edit', authorizeAnyPrivilege(['UPDATE_MEMBER', 'REVIEW_MEMBER']), MemberController.updateMember);
 *
 * @param requiredPrivileges - Array of privilege codes, at least one must exist in the JWT token
 * @returns Express middleware function
 */
export function authorizeAnyPrivilege(requiredPrivileges: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
        return;
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

      // Verify and decode JWT token
      let decoded: Record<string, unknown>;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
      } catch (err: unknown) {
        const error = err as { name: string };
        if (error.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            message: 'Token has expired',
          });
          return;
        } else if (error.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
          return;
        }
        throw err;
      }

      // Verify this is a staff member
      if (!decoded.staff_id) {
        res.status(403).json({
          success: false,
          message: 'Only staff members with valid privileges can access this endpoint',
        });
        return;
      }

      // Extract privileges array from token
      const tokenPrivileges: string[] = (decoded.privileges as string[]) || [];

      // Check if at least one required privilege exists in token (OR logic)
      const hasPrivilege = requiredPrivileges.some((priv) => tokenPrivileges.includes(priv));

      if (!hasPrivilege) {
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required any of: ${requiredPrivileges.join(', ')}`,
          missingPrivileges: requiredPrivileges,
        });
        return;
      }

      // Attach decoded user data to request object
      req.user = decoded as AuthenticatedRequest['user'];

      next();
    } catch (error: unknown) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
      });
    }
  };
}

/**
 * Middleware to validate JWT token and check for all required privileges (AND logic)
 *
 * Usage:
 * app.post('/api/members/:id/delete', authorizeAllPrivileges(['VIEW_MEMBERS', 'UPDATE_MEMBER']), MemberController.deleteMember);
 *
 * @param requiredPrivileges - Array of privilege codes, all must exist in the JWT token
 * @returns Express middleware function
 */
export function authorizeAllPrivileges(requiredPrivileges: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
        return;
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

      // Verify and decode JWT token
      let decoded: Record<string, unknown>;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
      } catch (err: unknown) {
        const error = err as { name: string };
        if (error.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            message: 'Token has expired',
          });
          return;
        } else if (error.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
          return;
        }
        throw err;
      }

      // Verify this is a staff member
      if (!decoded.staff_id) {
        res.status(403).json({
          success: false,
          message: 'Only staff members with valid privileges can access this endpoint',
        });
        return;
      }

      // Extract privileges array from token
      const tokenPrivileges: string[] = (decoded.privileges as string[]) || [];

      // Check if all required privileges exist in token (AND logic)
      const allPrivilegesPresent = requiredPrivileges.every((priv) => tokenPrivileges.includes(priv));

      if (!allPrivilegesPresent) {
        const missingPrivileges = requiredPrivileges.filter((priv) => !tokenPrivileges.includes(priv));
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Missing privileges: ${missingPrivileges.join(', ')}`,
          missingPrivileges: missingPrivileges,
        });
        return;
      }

      // Attach decoded user data to request object
      req.user = decoded as AuthenticatedRequest['user'];

      next();
    } catch (error: unknown) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
      });
    }
  };
}
