import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * All team routes require authentication and appropriate privileges
 * Privileges are enforced through authorizePrivilege middleware
 */

// ==================== TEAM MANAGEMENT ====================

/**
 * POST /api/teams
 * Create a new team
 * Required Privilege: CREATE_TEAM
 */
router.post('/', authorizePrivilege('CREATE_TEAM'), TeamController.createTeam);

/**
 * GET /api/teams
 * Get all teams with optional filters
 * Required Privilege: VIEW_TEAMS
 * Query: sport_id?, status?, branch_id?
 */
router.get('/', authorizePrivilege('VIEW_TEAMS'), TeamController.getAllTeams);

/**
 * GET /api/teams/sport/:sport_id/with-members
 * Get all teams for a specific sport with their members
 * Required Privilege: VIEW_TEAMS
 * Returns teams with member count and full member details
 * Query: team_id? (optional - filter to specific team)
 */
router.get('/sport/:sport_id/with-members', authorizePrivilege('VIEW_TEAMS'), TeamController.getTeamsBySportWithMembers);

/**
 * GET /api/teams/:id
 * Get team by ID with full details
 * Required Privilege: VIEW_TEAMS
 */
router.get('/:id', authorizePrivilege('VIEW_TEAMS'), TeamController.getTeamById);

/**
 * PUT /api/teams/:id
 * Update team details
 * Required Privilege: UPDATE_TEAM
 */
router.put('/:id', authorizePrivilege('UPDATE_TEAM'), TeamController.updateTeam);

/**
 * DELETE /api/teams/:id
 * Delete a team
 * Required Privilege: DELETE_TEAM
 */
router.delete('/:id', authorizePrivilege('DELETE_TEAM'), TeamController.deleteTeam);

/**
 * PATCH /api/teams/:id/status
 * Update team status (active, inactive, suspended, archived)
 * Required Privilege: MANAGE_TEAM_STATUS
 */
router.patch('/:id/status', authorizePrivilege('MANAGE_TEAM_STATUS'), TeamController.updateTeamStatus);

/**
 * GET /api/teams/:id/members
 * Get all members in a team (both regular members and team members)
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
router.get('/:id/members', authorizePrivilege('VIEW_TEAM_MEMBERS'), TeamController.getTeamMembers);

/**
 * GET /api/teams/:id/available-slots
 * Get available slots in a team
 * Required Privilege: VIEW_AVAILABLE_SLOTS
 */
router.get('/:id/available-slots', authorizePrivilege('VIEW_AVAILABLE_SLOTS'), TeamController.getAvailableSlots);

export default router;
