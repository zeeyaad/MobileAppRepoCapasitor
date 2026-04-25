import { Router } from 'express';
import { SportSubscriptionController } from '../controllers/SportSubscriptionController';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege, type AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * Sport Subscription Management Routes (Admin Only)
 * All routes require authentication and APPROVE_SPORT_SUBSCRIPTION privilege
 */

/**
 * GET /api/sports/subscriptions/pending
 * Privilege: VIEW_SPORT_REQUESTS (or APPROVE_SPORT_SUBSCRIPTION)
 * Get all pending sport subscription requests with pagination
 * Query params: page=1, limit=20, team_member_id?, status=pending
 */
router.get(
  '/subscriptions/pending',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.getPendingSubscriptions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/sports/subscriptions/stats/summary
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get summary statistics of all sport subscriptions
 * Returns: { pending: number, approved: number, declined: number, cancelled: number }
 */
router.get(
  '/subscriptions/stats/summary',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.getSubscriptionStats(req as AuthenticatedRequest, res)
);

/**
 * GET /api/sports/subscriptions/:subscriptionId
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get specific subscription request details
 */
router.get(
  '/subscriptions/:subscriptionId',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.getSubscriptionById(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/sports/subscriptions/:subscriptionId/approve
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Approve a pending sport subscription request
 * Body: { notes?: string }
 */
router.patch(
  '/subscriptions/:subscriptionId/approve',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.approveSportSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/sports/subscriptions/:subscriptionId/decline
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Decline a pending sport subscription request with required reason
 * Body: { reason: string (required) }
 */
router.patch(
  '/subscriptions/:subscriptionId/decline',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.declineSportSubscription(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/sports/subscriptions/:subscriptionId/cancel
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Cancel an already approved sport subscription
 * Body: { reason?: string }
 */
router.patch(
  '/subscriptions/:subscriptionId/cancel',
  authenticate,
  authorizePrivilege('APPROVE_SPORT_SUBSCRIPTION'),
  (req, res) => SportSubscriptionController.cancelSportSubscription(req as AuthenticatedRequest, res)
);

export default router;
