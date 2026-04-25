import { Router, Request, Response, NextFunction } from 'express';
import { TeamMemberController } from '../controllers/TeamMemberController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const controller = new TeamMemberController();

/**
 * Middleware to authorize users with view_team_members privilege or Admin or Staff
 */
const authorizeViewTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;

        if (!user) {
            console.error('AUTH FAILED: No user object');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        console.log('AUTH CHECK for', req.path, {
            role: user.role,
            staff_id: user.staff_id,
            staff_type_id: user.staff_type_id,
            privileges: user.privileges
        });

        // Admin users have access
        if (user.role === 'admin' || user.staff_type_id === 1) {
            console.log('AUTH PASS: User is admin');
            next();
            return;
        }

        // Staff with any role can access
        if (user.staff_id) {
            console.log('AUTH PASS: User is staff member');
            next();
            return;
        }

        // Check for view_team_members privilege
        const privileges = user.privileges as unknown;
        let hasPrivilege = false;

        if (Array.isArray(privileges)) {
            // Handle string array
            if (privileges.some(p => typeof p === 'string' && p.toUpperCase() === 'VIEW_TEAM_MEMBERS')) {
                hasPrivilege = true;
            }
            // Handle object array with code property
            if (privileges.some(p => 
                typeof p === 'object' && 
                p !== null && 
                (p as Record<string, unknown>).code === 'VIEW_TEAM_MEMBERS'
            )) {
                hasPrivilege = true;
            }
        }

        if (hasPrivilege) {
            console.log('AUTH PASS: User has VIEW_TEAM_MEMBERS privilege');
            next();
            return;
        }

        console.log('AUTH FAIL: No matching authorization');
        res.status(403).json({ 
            error: 'Access denied. Requires admin, staff, or VIEW_TEAM_MEMBERS privilege.',
            userRole: user.role,
            userStaffId: user.staff_id,
            userPrivileges: privileges
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * CRUD Operations for Team Members
 */

/**
 * CREATE - Create a new team member with account and sports
 * POST /api/team-members
 * Body: {
 *   email: string,
 *   password: string,
 *   first_name_en: string,
 *   first_name_ar: string,
 *   last_name_en: string,
 *   last_name_ar: string,
 *   national_id: string,
 *   phone?: string,
 *   gender?: string,
 *   nationality?: string,
 *   birthdate?: string (YYYY-MM-DD),
 *   address?: string,
 *   is_foreign?: boolean,
 *   sport_ids: number[] (required, array of sport IDs)
 * }
 */
router.post(
    '/',
    authenticate,
    authorizeViewTeamMembers,
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'national_id_front', maxCount: 1 },
        { name: 'national_id_back', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'proof', maxCount: 1 }
    ]),
    controller.createTeamMember
);

/**
 * READ - Get all team members
 * GET /api/team-members
 */
router.get('/', authenticate, authorizeViewTeamMembers, controller.getAllTeamMembers);

/**
 * READ - Get all pending team members
 * GET /api/team-members/pending
 */
router.get('/pending', authenticate, authorizeViewTeamMembers, controller.getPendingTeamMembers);

/**
 * APPROVE - Approve a pending team member
 * POST /api/team-members/:team_member_id/approve
 */
router.post('/:team_member_id/approve', authenticate, authorizeViewTeamMembers, controller.approveTeamMember);

/**
 * READ - Get single team member by ID
 * GET /api/team-members/:team_member_id
 */
router.get('/:team_member_id', authenticate, authorizeViewTeamMembers, controller.getTeamMember);

/**
 * ASSIGN SPORTS - Assign sports to a team member
 * POST /api/team-members/:team_member_id/sports
 * Body: { sportIds: number[] }
 */
router.post('/:team_member_id/sports', authenticate, authorizeViewTeamMembers, controller.assignSportsToTeamMember);

/**
 * UPDATE - Update team member with sports
 * PUT /api/team-members/:team_member_id
 * Body: {
 *   first_name_en?: string,
 *   first_name_ar?: string,
 *   last_name_en?: string,
 *   last_name_ar?: string,
 *   phone?: string,
 *   gender?: string,
 *   nationality?: string,
 *   birthdate?: string (YYYY-MM-DD),
 *   address?: string,
 *   sport_ids?: number[] (array of sport IDs - replaces existing)
 * }
 */
router.put('/:team_member_id', authenticate, authorizeViewTeamMembers, controller.updateTeamMember);

/**
 * DELETE (Soft) - Deactivate team member account
 * PUT /api/team-members/:team_member_id/deactivate
 * Deactivates the associated account without deleting data
 */
router.put('/:team_member_id/deactivate', authenticate, authorizeViewTeamMembers, controller.deactivateTeamMember);

/**
 * DELETE (Hard) - Permanently delete team member
 * DELETE /api/team-members/:team_member_id
 * Permanently deletes team member and associated account
 */
router.delete('/:team_member_id', authenticate, authorizeViewTeamMembers, controller.deleteTeamMember);

/**
 * GET - Get team member bookings
 * GET /api/team-members/:member_id/bookings
 */
router.get('/:member_id/bookings', authenticate, controller.getTeamMemberBookings);

export default router;
