import { Router } from 'express';
import ProfessionController from '../controllers/ProfessionController';
import { authorizePrivilege, AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * Profession Management Routes
 * ============================
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
 * - VIEW_PROFESSIONS (67): Allows viewing professions list and details
 * - CREATE_PROFESSION (68): Allows creating new professions
 * - UPDATE_PROFESSION (69): Allows editing profession information
 * - DELETE_PROFESSION (70): Allows deleting professions
 * - ASSIGN_PROFESSION_TO_MEMBER (71): Allows assigning professions to working members
 */

/**
 * GET /api/professions
 * View all professions
 * @requires VIEW_PROFESSIONS privilege
 * @returns {Object} { success: boolean, data: Profession[], count: number }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "code": "DOC", "name_en": "Doctor", "name_ar": "طبيب", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" },
 *     { "id": 2, "code": "ENG", "name_en": "Engineer", "name_ar": "مهندس", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" }
 *   ],
 *   "count": 2,
 *   "staff_id": 1
 * }
 */
router.get('/', authorizePrivilege('VIEW_PROFESSIONS'), (req, res) =>
  ProfessionController.getAllProfessions(req as AuthenticatedRequest, res)
);

/**
 * GET /api/professions/:id
 * View specific profession details
 * @requires VIEW_PROFESSIONS privilege
 * @param {number} id - Profession ID
 * @returns {Object} { success: boolean, data: Profession }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "code": "DOC",
 *     "name_en": "Doctor",
 *     "name_ar": "طبيب",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (403 Forbidden):
 * {
 *   "success": false,
 *   "message": "Insufficient permissions. Required privilege: VIEW_PROFESSIONS",
 *   "missingPrivilege": "VIEW_PROFESSIONS"
 * }
 */
router.get('/:id', authorizePrivilege('VIEW_PROFESSIONS'), (req, res) =>
  ProfessionController.getProfessionById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/professions
 * Create new profession
 * @requires CREATE_PROFESSION privilege
 * @body {string} code - Unique profession code (max 50 chars)
 * @body {string} name_en - Profession name in English (max 100 chars)
 * @body {string} name_ar - Profession name in Arabic (max 100 chars)
 * @returns {Object} { success: boolean, message: string, data: Profession }
 * 
 * Example Request:
 * POST /api/professions
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "code": "DOC",
 *   "name_en": "Doctor",
 *   "name_ar": "طبيب"
 * }
 * 
 * Example Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Profession created successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "DOC",
 *     "name_en": "Doctor",
 *     "name_ar": "طبيب",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (409 Conflict):
 * {
 *   "success": false,
 *   "message": "Profession with this code already exists"
 * }
 */
router.post('/', authorizePrivilege('CREATE_PROFESSION'), (req, res) =>
  ProfessionController.createProfession(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/professions/:id
 * Update existing profession
 * @requires UPDATE_PROFESSION privilege
 * @param {number} id - Profession ID to update
 * @body {string} [code] - New profession code (optional, max 50 chars)
 * @body {string} [name_en] - New profession name in English (optional, max 100 chars)
 * @body {string} [name_ar] - New profession name in Arabic (optional, max 100 chars)
 * @returns {Object} { success: boolean, message: string, data: Profession }
 * 
 * Example Request:
 * PUT /api/professions/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "name_en": "Medical Doctor",
 *   "name_ar": "طبيب متخصص"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Profession updated successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "DOC",
 *     "name_en": "Medical Doctor",
 *     "name_ar": "طبيب متخصص",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:05:00Z"
 *   }
 * }
 */
router.put('/:id', authorizePrivilege('UPDATE_PROFESSION'), (req, res) =>
  ProfessionController.updateProfession(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/professions/:id
 * Delete a profession
 * @requires DELETE_PROFESSION privilege
 * @param {number} id - Profession ID to delete
 * @returns {Object} { success: boolean, message: string }
 * 
 * Example Request:
 * DELETE /api/professions/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Profession deleted successfully"
 * }
 * 
 * Example Error Response (409 Conflict - has associated records):
 * {
 *   "success": false,
 *   "message": "Cannot delete profession. It has 8 associated employee record(s)"
 * }
 */
router.delete('/:id', authorizePrivilege('DELETE_PROFESSION'), (req, res) =>
  ProfessionController.deleteProfession(req as AuthenticatedRequest, res)
);

/**
 * POST /api/professions/:professionId/assign-to-member/:memberId
 * Assign profession to a member
 * @requires ASSIGN_PROFESSION_TO_MEMBER privilege
 * @param {number} professionId - Profession ID to assign
 * @param {number} memberId - Member ID to assign profession to (must be working member)
 * @returns {Object} { success: boolean, message: string, data: Object }
 * 
 * Example Request:
 * POST /api/professions/1/assign-to-member/42
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {}
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Profession assigned to member successfully",
 *   "data": {
 *     "member_id": 42,
 *     "profession_id": 1,
 *     "profession_code": "DOC",
 *     "profession_name": "Doctor"
 *   }
 * }
 * 
 * Example Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Member or employee detail record not found. Member must be a working member."
 * }
 */
router.post('/:professionId/assign-to-member/:memberId', authorizePrivilege('ASSIGN_PROFESSION_TO_MEMBER'), (req, res) =>
  ProfessionController.assignProfessionToMember(req as AuthenticatedRequest, res)
);

export default router;
