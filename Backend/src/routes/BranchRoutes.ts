import { Router } from 'express';
import BranchController from '../controllers/BranchController';
import { authorizePrivilege, AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * GET /api/branches/public/list
 * Get all branches (PUBLIC - No authentication required)
 * Used by registration forms to populate branch dropdown
 * @returns {Object} { success: boolean, data: Branch[], count: number }
 */
router.get('/public/list', (req, res) =>
  BranchController.getAllBranches(req as AuthenticatedRequest, res)
);

/**
 * Branch Management Routes
 * ========================
 * All endpoints require valid JWT token and appropriate privilege codes.
 * 
 * Authorization Flow:
 * 1. Client includes Authorization header: "Bearer <jwt_token>"
 * 2. authorizePrivilege middleware validates token signature
 * 3. Extracts staff_id and privileges array from token
 * 4. Verifies required privilege exists in token's privileges array
 * 5. Returns 403 Forbidden if privilege is missing
 * 6. If authorized, proceeds to controller
 * 
 * Privileges Table:
 * - VIEW_BRANCHES (72): Allows viewing branches list and details
 * - CREATE_BRANCH (73): Allows creating new branches
 * - UPDATE_BRANCH (74): Allows editing branch information
 * - DELETE_BRANCH (75): Allows deleting branches
 * - ASSIGN_BRANCH_TO_MEMBER (76): Allows assigning branches to members
 */

/**
 * GET /api/branches
 * View all branches
 * @requires VIEW_BRANCHES privilege
 * @returns {Object} { success: boolean, data: Branch[], count: number }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "code": "MAIN", "name_en": "Main Branch", "name_ar": "الفرع الرئيسي", "location_en": "Cairo", "location_ar": "القاهرة", "phone": "555-0001", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" },
 *     { "id": 2, "code": "GIZA", "name_en": "Giza Branch", "name_ar": "فرع الجيزة", "location_en": "Giza", "location_ar": "الجيزة", "phone": "555-0002", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" }
 *   ],
 *   "count": 2,
 *   "staff_id": 1
 * }
 */
router.get('/', authorizePrivilege('VIEW_BRANCHES'), (req, res) =>
  BranchController.getAllBranches(req as AuthenticatedRequest, res)
);

/**
 * GET /api/branches/:id
 * View specific branch details
 * @requires VIEW_BRANCHES privilege
 * @param {number} id - Branch ID
 * @returns {Object} { success: boolean, data: Branch }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "code": "MAIN",
 *     "name_en": "Main Branch",
 *     "name_ar": "الفرع الرئيسي",
 *     "location_en": "Cairo",
 *     "location_ar": "القاهرة",
 *     "phone": "555-0001",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (403 Forbidden):
 * {
 *   "success": false,
 *   "message": "Insufficient permissions. Required privilege: VIEW_BRANCHES",
 *   "missingPrivilege": "VIEW_BRANCHES"
 * }
 */
router.get('/:id', authorizePrivilege('VIEW_BRANCHES'), (req, res) =>
  BranchController.getBranchById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/branches
 * Create new branch
 * @requires CREATE_BRANCH privilege
 * @body {string} code - Unique branch code (max 50 chars)
 * @body {string} name_en - Branch name in English (max 100 chars)
 * @body {string} name_ar - Branch name in Arabic (max 100 chars)
 * @body {string} [location_en] - Branch location in English (optional, max 100 chars)
 * @body {string} [location_ar] - Branch location in Arabic (optional, max 100 chars)
 * @body {string} [phone] - Branch phone number (optional, max 20 chars)
 * @returns {Object} { success: boolean, message: string, data: Branch }
 * 
 * Example Request:
 * POST /api/branches
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "code": "MAIN",
 *   "name_en": "Main Branch",
 *   "name_ar": "الفرع الرئيسي",
 *   "location_en": "Cairo",
 *   "location_ar": "القاهرة",
 *   "phone": "555-0001"
 * }
 * 
 * Example Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Branch created successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "MAIN",
 *     "name_en": "Main Branch",
 *     "name_ar": "الفرع الرئيسي",
 *     "location_en": "Cairo",
 *     "location_ar": "القاهرة",
 *     "phone": "555-0001",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (409 Conflict):
 * {
 *   "success": false,
 *   "message": "Branch with this code already exists"
 * }
 */
router.post('/', authorizePrivilege('CREATE_BRANCH'), (req, res) =>
  BranchController.createBranch(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/branches/:id
 * Update existing branch
 * @requires UPDATE_BRANCH privilege
 * @param {number} id - Branch ID to update
 * @body {string} [code] - New branch code (optional, max 50 chars)
 * @body {string} [name_en] - New branch name in English (optional, max 100 chars)
 * @body {string} [name_ar] - New branch name in Arabic (optional, max 100 chars)
 * @body {string} [location_en] - New branch location in English (optional, max 100 chars)
 * @body {string} [location_ar] - New branch location in Arabic (optional, max 100 chars)
 * @body {string} [phone] - New branch phone (optional, max 20 chars)
 * @returns {Object} { success: boolean, message: string, data: Branch }
 * 
 * Example Request:
 * PUT /api/branches/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "location_en": "New Cairo",
 *   "location_ar": "القاهرة الجديدة",
 *   "phone": "555-0099"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Branch updated successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "MAIN",
 *     "name_en": "Main Branch",
 *     "name_ar": "الفرع الرئيسي",
 *     "location_en": "New Cairo",
 *     "location_ar": "القاهرة الجديدة",
 *     "phone": "555-0099",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:05:00Z"
 *   }
 * }
 */
router.put('/:id', authorizePrivilege('UPDATE_BRANCH'), (req, res) =>
  BranchController.updateBranch(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/branches/:id
 * Delete a branch
 * @requires DELETE_BRANCH privilege
 * @param {number} id - Branch ID to delete
 * @returns {Object} { success: boolean, message: string }
 * 
 * Example Request:
 * DELETE /api/branches/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Branch deleted successfully"
 * }
 * 
 * Example Error Response (409 Conflict - has associated records):
 * {
 *   "success": false,
 *   "message": "Cannot delete branch. It has 2 associated sport team record(s)"
 * }
 */
router.delete('/:id', authorizePrivilege('DELETE_BRANCH'), (req, res) =>
  BranchController.deleteBranch(req as AuthenticatedRequest, res)
);

/**
 * POST /api/branches/:branchId/assign-to-member/:memberId
 * Assign branch to a member
 * @requires ASSIGN_BRANCH_TO_MEMBER privilege
 * @param {number} branchId - Branch ID to assign
 * @param {number} memberId - Member ID to assign branch to
 * @returns {Object} { success: boolean, message: string, data: Object }
 * 
 * Example Request:
 * POST /api/branches/1/assign-to-member/42
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {}
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Branch assigned to member successfully",
 *   "data": {
 *     "member_id": 42,
 *     "branch_id": 1,
 *     "branch_code": "MAIN",
 *     "branch_name": "Main Branch"
 *   }
 * }
 * 
 * Example Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Member not found"
 * }
 */
router.post('/:branchId/assign-to-member/:memberId', authorizePrivilege('ASSIGN_BRANCH_TO_MEMBER'), (req, res) =>
  BranchController.assignBranchToMember(req as AuthenticatedRequest, res)
);

export default router;
