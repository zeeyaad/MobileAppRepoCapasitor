import { Router } from 'express';
import { SportController } from '../controllers/SportController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * All sport routes require authentication
 * Role-specific permissions are handled within the controller/service
 */

// PUBLIC: Get active sports (no authentication required for member subscription page)
router.get('/public', SportController.getActiveSports);

// --- NEW TEAM MEMBER ROUTES (must be before :id routes to avoid conflict) ---
router.get('/team-members', authenticate, SportController.getTeamMembers);
router.get('/team-members/sport/:sportName', authenticate, SportController.getTeamMembersBySport);
router.get('/team-members/user/:memberId', authenticate, SportController.getTeamMemberById);

// Create new sport
router.post('/', authenticate, SportController.createSport);

// Get all sports with optional filters
router.get('/', authenticate, SportController.getAllSports);

// Get sport by ID
router.get('/:id', authenticate, SportController.getSportById);

// Update sport
router.put('/:id', authenticate, SportController.updateSport);

// Approve or reject sport (Manager only)
router.post('/:id/approve', authenticate, SportController.approveSport);

// Delete sport (Manager only)
router.delete('/:id', authenticate, SportController.deleteSport);

// Toggle sport active status (Manager only)
router.patch('/:id/toggle-status', authenticate, SportController.toggleSportStatus);

export default router;
