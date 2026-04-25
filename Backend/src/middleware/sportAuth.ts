import { Request, Response, NextFunction } from 'express';

/**
 * Sport Activity Manager Authorization Middleware
 * Checks if user is a Sport Activity Manager
 */
export const requireSportManager = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }

        const staffTypeCode = user.staff_type_code as string;

        if (staffTypeCode !== 'SPORT_MANAGER') {
            res.status(403).json({
                success: false,
                message: 'Only Sport Activity Managers can perform this action',
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
 * Sport Activity Specialist or Manager Authorization Middleware
 * Checks if user is either a Sport Activity Specialist or Manager
 */
export const requireSportStaff = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }

        const staffTypeCode = user.staff_type_code as string;

        if (staffTypeCode !== 'SPORT_MANAGER' && staffTypeCode !== 'SPORT_SPECIALIST') {
            res.status(403).json({
                success: false,
                message: 'Only Sport Activity staff can perform this action',
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
