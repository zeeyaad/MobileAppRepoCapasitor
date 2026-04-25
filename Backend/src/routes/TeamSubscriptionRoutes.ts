import { Router } from 'express';
import { TeamSubscriptionController } from '../controllers/TeamSubscriptionController';

const router = Router();
const controller = new TeamSubscriptionController();

// Validation endpoint (optional - can be called before creating subscription)
router.post('/validate', (req, res) => controller.validateSubscription(req, res));

// Create subscription (validates automatically and creates pending_payment record)
router.post('/subscribe', (req, res) => controller.createSubscription(req, res));

// Confirm payment (webhook or manual confirmation)
router.post('/:subscriptionId/confirm-payment', (req, res) => controller.confirmPayment(req, res));

// Admin endpoints
router.get('/pending-approvals', (req, res) => controller.getPendingApprovals(req, res));
router.post('/:subscriptionId/approve', (req, res) => controller.approveSubscription(req, res));

export default router;
