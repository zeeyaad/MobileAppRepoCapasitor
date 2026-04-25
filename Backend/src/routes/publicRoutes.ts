import { Router } from 'express';
import { SportController } from '../controllers/SportController';

const router = Router();

/**
 * Public Routes - No authentication required
 * These endpoints are accessible to all users, including unauthenticated ones
 */

// Get all active sports (for registration form)
router.get('/sports', SportController.getActiveSports);

export default router;
