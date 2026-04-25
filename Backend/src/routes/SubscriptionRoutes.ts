import { Router, Request } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

// Type for authenticated request
interface AuthenticatedRequest extends Request {
  user?: Record<string, unknown>;
}

const router = Router();
const controller = new SubscriptionController();

/**
 * Team Subscription Routes
 * Handles subscriptions for both Members and Team Members joining teams
 */

// ==================== MEMBER SUBSCRIPTIONS ====================

/**
 * POST /api/subscriptions/members
 * Create a new member subscription to a team
 * Body: {
 *   member_id: number,
 *   team_id: number,
 *   monthly_fee: number,
 *   registration_fee?: number,
 *   start_date?: string (ISO date),
 *   end_date?: string (ISO date)
 * }
 */
router.post(
  '/members',
  authenticate,
  (req, res) => controller.createMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/members/:memberId
 * Get all subscriptions for a specific member
 * Query params: status? (pending, approved, active, declined, cancelled)
 */
router.get(
  '/members/:memberId',
  authenticate,
  (req, res) => controller.getMemberSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/members/subscription/:subscriptionId
 * Get a specific member subscription by ID
 */
router.get(
  '/members/subscription/:subscriptionId',
  authenticate,
  (req, res) => controller.getMemberSubscriptionById(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/members/:subscriptionId/approve
 * Approve a pending member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   custom_price?: number,
 *   notes?: string
 * }
 */
router.patch(
  '/members/:subscriptionId/approve',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.approveMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/members/:subscriptionId/decline
 * Decline a pending member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason: string (required)
 * }
 */
router.patch(
  '/members/:subscriptionId/decline',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.declineMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/members/:subscriptionId/cancel
 * Cancel an approved/active member subscription
 * Requires: MANAGE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason?: string
 * }
 */
router.patch(
  '/members/:subscriptionId/cancel',
  authenticate,
  authorizePrivilege('MANAGE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.cancelMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/members/pending/all
 * Get all pending member subscriptions for approval
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 */
router.get(
  '/members/pending/all',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.getPendingMemberSubscriptions(req as AuthenticatedRequest, res)
);

// ==================== TEAM MEMBER SUBSCRIPTIONS ====================

/**
 * POST /api/subscriptions/team-members
 * Create a new team member subscription to a team
 * Body: {
 *   team_member_id: number,
 *   team_id: number,
 *   monthly_fee: number,
 *   registration_fee?: number,
 *   start_date?: string (ISO date),
 *   end_date?: string (ISO date)
 * }
 */
router.post(
  '/team-members',
  authenticate,
  (req, res) => controller.createTeamMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/team-members/:teamMemberId
 * Get all subscriptions for a specific team member
 * Query params: status? (pending, approved, active, declined, cancelled)
 */
router.get(
  '/team-members/:teamMemberId',
  authenticate,
  (req, res) => controller.getTeamMemberSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/team-members/subscription/:subscriptionId
 * Get a specific team member subscription by ID
 */
router.get(
  '/team-members/subscription/:subscriptionId',
  authenticate,
  (req, res) => controller.getTeamMemberSubscriptionById(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/approve
 * Approve a pending team member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   is_captain?: boolean,
 *   custom_price?: number,
 *   notes?: string
 * }
 */
router.patch(
  '/team-members/:subscriptionId/approve',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.approveTeamMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/decline
 * Decline a pending team member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason: string (required)
 * }
 */
router.patch(
  '/team-members/:subscriptionId/decline',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.declineTeamMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/cancel
 * Cancel an approved/active team member subscription
 * Requires: MANAGE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason?: string
 * }
 */
router.patch(
  '/team-members/:subscriptionId/cancel',
  authenticate,
  authorizePrivilege('MANAGE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.cancelTeamMemberSubscription(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/team-members/pending/all
 * Get all pending team member subscriptions for approval
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 */
router.get(
  '/team-members/pending/all',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.getPendingTeamMemberSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/subscriptions/stats
 * Get subscription statistics
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Returns: {
 *   members: { pending, approved, active, declined, cancelled },
 *   teamMembers: { pending, approved, active, declined, cancelled }
 * }
 */
router.get(
  '/stats/summary',
  authenticate,
  authorizePrivilege('APPROVE_TEAM_SUBSCRIPTION'),
  (req, res) => controller.getSubscriptionStats(req as AuthenticatedRequest, res)
);

export default router;
export const SubscriptionRoutes = router;
