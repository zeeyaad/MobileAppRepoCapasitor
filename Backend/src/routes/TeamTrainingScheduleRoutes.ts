import { Router } from 'express';
import { TeamTrainingScheduleController } from '../controllers/TeamTrainingScheduleController';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

const router = Router();
const controller = new TeamTrainingScheduleController();

/**
 * POST /teams/:teamId/schedules
 * Create training schedule for a team
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.post('/teams/:teamId/schedules', authorizePrivilege('MANAGE_TEAM_TRAINING'), (req, res) => controller.createSchedule(req, res));

/**
 * GET /teams/:teamId/schedules
 * Get all schedules for a team
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/teams/:teamId/schedules', authorizePrivilege('VIEW_TEAM_TRAINING'), (req, res) => controller.getTeamSchedules(req, res));

/**
 * GET /schedules/:scheduleId
 * Get specific schedule
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/schedules/:scheduleId', authorizePrivilege('VIEW_TEAM_TRAINING'), (req, res) => controller.getScheduleById(req, res));

/**
 * PUT /schedules/:scheduleId
 * Update schedule
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.put('/schedules/:scheduleId', authorizePrivilege('MANAGE_TEAM_TRAINING'), (req, res) => controller.updateSchedule(req, res));

/**
 * DELETE /schedules/:scheduleId
 * Delete schedule
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.delete('/schedules/:scheduleId', authorizePrivilege('MANAGE_TEAM_TRAINING'), (req, res) => controller.deleteSchedule(req, res));

/**
 * GET /sports/:sportId/schedules
 * Get all schedules for a sport
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/sports/:sportId/schedules', authorizePrivilege('VIEW_TEAM_TRAINING'), (req, res) => controller.getSportSchedules(req, res));

/**
 * GET /schedules/:scheduleId/availability
 * Check availability
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/schedules/:scheduleId/availability', authorizePrivilege('VIEW_TEAM_TRAINING'), (req, res) => controller.checkAvailability(req, res));

export default router;
