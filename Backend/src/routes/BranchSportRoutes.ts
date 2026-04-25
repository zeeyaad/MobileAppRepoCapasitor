import { Router } from 'express';
import BranchSportController from '../controllers/BranchSportController';
import { authorizePrivilege, AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * Branch-Sport Relationship Routes
 * ================================
 * Manages the many-to-many relationship between branches and sports
 * Allows filtering sports by branch and branches by sport
 */

/**
 * GET /api/branches/:branchId/sports
 * Get all sports available in a specific branch (for UI filtering)
 * No authentication required
 * @param {number} branchId - Branch ID
 * @returns {Object} { success: boolean, data: Sport[], count: number }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "code": "FOOTBALL",
 *       "name_en": "Football",
 *       "name_ar": "كرة القدم",
 *       "description_en": "Soccer sport",
 *       "description_ar": "رياضة كرة القدم",
 *       "price": 500,
 *       "status": "active",
 *       "branch_sport_id": 10,
 *       "branch_sport_status": "active"
 *     },
 *     {
 *       "id": 2,
 *       "code": "BASKETBALL",
 *       "name_en": "Basketball",
 *       "name_ar": "كرة السلة",
 *       "description_en": "Basketball sport",
 *       "description_ar": "رياضة كرة السلة",
 *       "price": 450,
 *       "status": "active",
 *       "branch_sport_id": 11,
 *       "branch_sport_status": "active"
 *     }
 *   ],
 *   "count": 2,
 *   "branch_id": 1
 * }
 */
router.get('/branches/:branchId/sports', (req, res) =>
  BranchSportController.getSportsByBranch(req as AuthenticatedRequest, res)
);

/**
 * GET /api/sports/:sportId/branches
 * Get all branches where a specific sport is available (for UI filtering)
 * No authentication required
 * @param {number} sportId - Sport ID
 * @returns {Object} { success: boolean, data: Branch[], count: number }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "code": "MAIN",
 *       "name_en": "Main Branch",
 *       "name_ar": "الفرع الرئيسي",
 *       "location_en": "Cairo",
 *       "location_ar": "القاهرة",
 *       "phone": "555-0001",
 *       "branch_sport_id": 10,
 *       "branch_sport_status": "active"
 *     },
 *     {
 *       "id": 3,
 *       "code": "GIZA",
 *       "name_en": "Giza Branch",
 *       "name_ar": "فرع الجيزة",
 *       "location_en": "Giza",
 *       "location_ar": "الجيزة",
 *       "phone": "555-0003",
 *       "branch_sport_id": 15,
 *       "branch_sport_status": "active"
 *     }
 *   ],
 *   "count": 2,
 *   "sport_id": 1
 * }
 */
router.get('/sports/:sportId/branches', (req, res) =>
  BranchSportController.getBranchesBySport(req as AuthenticatedRequest, res)
);

/**
 * POST /api/branch-sports
 * Associate a sport with a branch
 * @requires CREATE_BRANCH privilege
 * @body {number} branch_id - Branch ID to associate
 * @body {number} sport_id - Sport ID to associate
 * @returns {Object} { success: boolean, message: string, data: BranchSport }
 * 
 * Example Request:
 * POST /api/branch-sports
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * 
 * {
 *   "branch_id": 1,
 *   "sport_id": 2
 * }
 * 
 * Example Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Sport associated with branch successfully",
 *   "data": {
 *     "id": 10,
 *     "branch_id": 1,
 *     "sport_id": 2,
 *     "status": "active",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (409 Conflict):
 * {
 *   "success": false,
 *   "message": "This sport is already associated with this branch"
 * }
 */
router.post('/', authorizePrivilege('CREATE_BRANCH'), (req, res) =>
  BranchSportController.createBranchSport(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/branch-sports/:id
 * Update branch-sport association status
 * @requires UPDATE_BRANCH privilege
 * @param {number} id - Branch-Sport association ID
 * @body {string} status - New status ('active' or 'inactive')
 * @returns {Object} { success: boolean, message: string, data: BranchSport }
 * 
 * Example Request:
 * PUT /api/branch-sports/10
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * 
 * {
 *   "status": "inactive"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Branch-sport association updated successfully",
 *   "data": {
 *     "id": 10,
 *     "branch_id": 1,
 *     "sport_id": 2,
 *     "status": "inactive",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:05:00Z"
 *   }
 * }
 */
router.put('/:id', authorizePrivilege('UPDATE_BRANCH'), (req, res) =>
  BranchSportController.updateBranchSport(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/branch-sports/:id
 * Remove a sport from a branch
 * @requires DELETE_BRANCH privilege
 * @param {number} id - Branch-Sport association ID
 * @returns {Object} { success: boolean, message: string }
 * 
 * Example Request:
 * DELETE /api/branch-sports/10
 * Authorization: Bearer <token>
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Sport removed from branch successfully"
 * }
 */
router.delete('/:id', authorizePrivilege('DELETE_BRANCH'), (req, res) =>
  BranchSportController.deleteBranchSport(req as AuthenticatedRequest, res)
);

export default router;
