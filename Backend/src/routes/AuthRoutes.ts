import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */

/**
 * POST /auth/login
 * 
 * Two login methods:
 * 
 * 1. For ADMIN and EXECUTIVE_MANAGER:
 *    - Body: { email, password }
 *    - Returns: JWT token with immediate access
 * 
 * 2. For Regular Staff (first login):
 *    - Body: { national_id, password: national_id }
 *    - Returns: Temporary JWT token + requires_credential_change = true
 *    - Must call /auth/change-credentials next
 */
router.post('/login', (req, res) => AuthController.login(req, res));

/**
 * POST /auth/change-credentials
 * 
 * For regular staff: Change email and password on first login
 * 
 * Requires: Valid JWT token (from first login)
 * Body: { new_email, new_password }
 * Returns: New JWT token with active status
 */
router.post('/change-credentials', authenticate, (req, res) =>
  AuthController.changeCredentials(req, res)
);

/**
 * GET /auth/me
 * 
 * Get current logged-in user's information
 * 
 * Requires: Valid JWT token in Authorization header
 * Returns: Current user's profile data including account info, role, privileges
 */
router.get('/me', authenticate, async (req, res) => {
  await AuthController.getCurrentUser(req, res);
});

/**
 * PUT /auth/me/profile
 * 
 * Allows a logged-in member to update their own profile (no admin privilege required).
 * 
 * Requires: Valid JWT token (role = 'member')
 * Body: { first_name_ar, last_name_ar, first_name_en, last_name_en, phone, address, birthdate }
 */
router.put('/me/profile', authenticate, async (req, res) => {
  await AuthController.updateMyProfile(req, res);
});

export default router;
