import { Router } from 'express';
import { MemberSubscriptionController } from '../controllers/MemberSubscriptionController';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege, type AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * POST /api/member-subscriptions/:subscriptionId/confirm-payment
 * Confirm member subscription after successful payment
 */
router.post(
  '/:subscriptionId/confirm-payment',
  authenticate,
  (req, res) => MemberSubscriptionController.confirmPayment(req, res)
);

/**
 * Member Sport Subscription Routes
 * All routes require authentication and APPROVE_SPORT_SUBSCRIPTION privilege (except subscribe)
 *
 * Base path: /api/member-subscriptions
 */

/**
 * POST /api/member-subscriptions/subscribe
 * Members can subscribe to a team
 * Body: { team_id: string, member_id: number }
 */
router.post(
  '/subscribe',
  authenticate,
  (req, res) => MemberSubscriptionController.subscribeToTeam(req as AuthenticatedRequest, res)
);

/**
 * GET /api/member-subscriptions/:memberId/subscriptions
 * Get all subscriptions for a specific member (public access for member's own data)
 */
router.get(
  '/:memberId/subscriptions',
  (req, res) => MemberSubscriptionController.getMemberSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/member-subscriptions/pending
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get all pending member sport subscription requests with pagination
 * Query params: page=1, limit=20, member_id?
 */
router.get(
  '/pending',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.getPendingSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/member-subscriptions/stats/summary
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get summary statistics of all member sport subscriptions
 * Returns: { pending: number, approved: number, declined: number, cancelled: number }
 */
router.get(
  '/stats/summary',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.getSubscriptionStats(req as AuthenticatedRequest, res)
);

/**
 * GET /api/member-subscriptions/:subscriptionId
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get specific member subscription request details
 */
router.get(
  '/:subscriptionId',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.getSubscriptionById(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/member-subscriptions/:subscriptionId/approve
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Approve a pending member sport subscription request
 * Body: { notes?: string }
 */
router.patch(
  '/:subscriptionId/approve',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.approveSportSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/member-subscriptions/:subscriptionId/decline
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Decline a pending member sport subscription request
 * Body: { reason: string (required) }
 */
router.patch(
  '/:subscriptionId/decline',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.declineSportSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/member-subscriptions/:subscriptionId/cancel
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Cancel an approved member sport subscription
 * Body: { reason?: string }
 */
router.patch(
  '/:subscriptionId/cancel',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => MemberSubscriptionController.cancelSportSubscription(req as AuthenticatedRequest, res)
);

export default router;
