import { Router } from 'express';
import { BranchSportTeamController } from '../controllers/BranchSportTeamController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new BranchSportTeamController();

/**
 * Team Management Routes
 * All routes require authentication
 */

// ========== PUBLIC ROUTES ==========

/**
 * GET /api/teams/available/branch/:branchId
 * Get available teams for a branch (public)
 */
router.get('/available/branch/:branchId', controller.getAvailableTeams);

/**
 * GET /api/teams/branch/:branchId/sport/:sportId
 * Get teams for a specific branch and sport (public)
 */
router.get('/branch/:branchId/sport/:sportId', controller.getTeamsByBranchAndSport);

/**
 * GET /api/teams/:teamId
 * Get a team by ID (public)
 */
router.get('/:teamId', controller.getTeamById);

// ========== ADMIN ROUTES ==========
// All admin routes require authentication
// In production, also add authorization middleware like authorizePrivilege('MANAGE_TEAMS')

/**
 * POST /api/teams
 * Create a new team
 * Admin only
 */
router.post('/', authenticate, controller.createTeam);

/**
 * GET /api/teams
 * Get all teams with optional filters
 * Admin only
 */
router.get('/', authenticate, controller.getAllTeams);

/**
 * PUT /api/teams/:teamId
 * Update a team
 * Admin only
 */
router.put('/:teamId', authenticate, controller.updateTeam);

/**
 * PATCH /api/teams/:teamId/approve
 * Approve a team (change status to active)
 * Admin only
 */
router.patch('/:teamId/approve', authenticate, controller.approveTeam);

/**
 * PATCH /api/teams/:teamId/decline
 * Decline a team
 * Admin only
 */
router.patch('/:teamId/decline', authenticate, controller.declineTeam);

/**
 * PATCH /api/teams/:teamId/archive
 * Archive a team
 * Admin only
 */
router.patch('/:teamId/archive', authenticate, controller.archiveTeam);

/**
 * DELETE /api/teams/:teamId
 * Delete a team
 * Admin only
 */
router.delete('/:teamId', authenticate, controller.deleteTeam);

export const BranchSportTeamRoutes = router;
export default router;
