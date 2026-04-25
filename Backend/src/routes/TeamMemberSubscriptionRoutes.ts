import { Router } from 'express';
import { TeamMemberSubscriptionController } from '../controllers/TeamMemberSubscriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Team Member Subscription Routes
 * Base path: /api/team-member-subscriptions
 */

/**
 * POST /api/team-member-subscriptions/subscribe
 * Team members can subscribe themselves to a team
 * Body: { team_id: string (UUID), team_member_id: number }
 */
router.post(
  '/subscribe',
  authenticate,
  TeamMemberSubscriptionController.teamMemberSelfSubscribe
);

/**
 * POST /api/team-member-subscriptions/subscriptions/:subscriptionId/confirm-payment
 * Confirm payment for a team member subscription
 * Body: { payment_reference?: string, transaction_id?: string, payment_method?: string, gateway_response?: unknown }
 */
router.post(
  '/subscriptions/:subscriptionId/confirm-payment',
  authenticate,
  TeamMemberSubscriptionController.confirmTeamMemberSubscriptionPayment
);

/**
 * POST /api/team-members/:teamMemberId/subscriptions/teams/:teamId
 * Staff subscribes a team member to a team
 * Access: Staff only
 */
router.post(
  '/:teamMemberId/subscriptions/teams/:teamId',
  authenticate,
  TeamMemberSubscriptionController.subscribeTeamMemberToTeam
);

/**
 * DELETE /api/team-members/:teamMemberId/subscriptions/:subscriptionId
 * Unsubscribe a team member from a team
 * Access: Staff only
 */
router.delete(
  '/:teamMemberId/subscriptions/:subscriptionId',
  authenticate,
  TeamMemberSubscriptionController.unsubscribeTeamMemberFromTeam
);

/**
 * PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/approve
 * Approve a pending team member subscription
 * Access: Staff only
 */
router.patch(
  '/subscriptions/:subscriptionId/approve',
  authenticate,
  TeamMemberSubscriptionController.approveTeamMemberSubscription
);

/**
 * PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/reject
 * Reject a pending team member subscription
 * Access: Staff only
 */
router.patch(
  '/subscriptions/:subscriptionId/reject',
  authenticate,
  TeamMemberSubscriptionController.rejectTeamMemberSubscription
);

/**
 * GET /api/team-members/:teamMemberId/subscriptions
 * Get all teams a team member is subscribed to
 * Access: Public
 */
router.get(
  '/:teamMemberId/subscriptions',
  TeamMemberSubscriptionController.getTeamMemberSubscriptions
);

/**
 * GET /api/team-member-subscriptions/teams/:teamId/members
 * Get all team members subscribed to a specific team
 * Access: Public
 */
router.get(
  '/teams/:teamId/members',
  TeamMemberSubscriptionController.getTeamMembers
);

/**
 * GET /api/team-members/:teamMemberId/subscriptions/teams/:teamId/check
 * Check if team member is subscribed to a team
 * Access: Public
 */
router.get(
  '/:teamMemberId/subscriptions/teams/:teamId/check',
  TeamMemberSubscriptionController.checkTeamMemberSubscription
);

/**
 * GET /api/team-member-subscriptions/teams/:teamId/pending-subscriptions
 * Get all pending subscriptions for a team
 * Access: Staff only
 */
router.get(
  '/teams/:teamId/pending-subscriptions',
  authenticate,
  TeamMemberSubscriptionController.getPendingSubscriptions
);

/**
 * GET /api/team-members/:teamMemberId/subscription-count
 * Get number of active teams a team member is subscribed to
 * Access: Public
 */
router.get(
  '/:teamMemberId/subscription-count',
  TeamMemberSubscriptionController.getTeamMemberSubscriptionCount
);

export default router;
