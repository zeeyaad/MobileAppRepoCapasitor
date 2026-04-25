import { Router } from 'express';
import { MemberTeamController } from '../controllers/MemberTeamController';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

export const memberTeamRouter = Router();
const controller = new MemberTeamController();

/**
 * CREATE - Add a sport subscription
 * POST /api/member-teams
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.post('/', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.addSubscription);

/**
 * READ - Get all subscriptions
 * GET /api/member-teams
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
memberTeamRouter.get('/', authorizePrivilege('VIEW_TEAM_MEMBERS'), controller.getAllSubscriptions);

/**
 * READ - Get stats (count by status)
 * GET /api/member-teams/stats/count-by-status
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
memberTeamRouter.get('/stats/count-by-status', authorizePrivilege('VIEW_TEAM_MEMBERS'), controller.getCountByStatus);

/**
 * READ - Get subscriptions for a member
 * GET /api/member-teams/member/:member_id
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
memberTeamRouter.get('/member/:member_id', authorizePrivilege('VIEW_TEAM_MEMBERS'), controller.getMemberSubscriptions);

/**
 * READ - Get active subscriptions for a member
 * GET /api/member-teams/member/:member_id/active
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
memberTeamRouter.get('/member/:member_id/active', authorizePrivilege('VIEW_TEAM_MEMBERS'), controller.getActiveSubscriptions);

/**
 * READ - Get a specific subscription
 * GET /api/member-teams/:subscription_id
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
memberTeamRouter.get('/:subscription_id', authorizePrivilege('VIEW_TEAM_MEMBERS'), controller.getSubscriptionById);

/**
 * UPDATE - Update a subscription
 * PUT /api/member-teams/:subscription_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.put('/:subscription_id', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.updateSubscription);

/**
 * DELETE - Deactivate a subscription
 * PUT /api/member-teams/:subscription_id/deactivate
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.put('/:subscription_id/deactivate', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.deactivateSubscription);

/**
 * DELETE - Delete a subscription
 * DELETE /api/member-teams/:subscription_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.delete('/:subscription_id', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.deleteSubscription);

/**
 * POST - Member chooses a sport
 * POST /api/member-teams/member/:member_id/choose-sport
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.post('/member/:member_id/choose-sport', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.chooseSport);

/**
 * DELETE - Member removes a sport
 * DELETE /api/member-teams/member/:member_id/remove-sport/:team_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
memberTeamRouter.delete('/member/:member_id/remove-sport/:team_id', authorizePrivilege('ASSIGN_TEAM_MEMBERS'), controller.removeSport);
