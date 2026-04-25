import { Request } from 'express';

/**
 * Extended Express Request type with authenticated user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    staff_id?: number;
    id?: number;
    email?: string;
    role?: string;
    staff_type_id?: number;
    [key: string]: unknown;
  };
}
