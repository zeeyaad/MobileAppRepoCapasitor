import { Router } from 'express';
import FacultyController from '../controllers/FacultyController';
import { authorizePrivilege, AuthenticatedRequest } from '../middleware/authorizePrivilege';

const router = Router();

/**
 * GET /api/faculties/public/list
 * Get all faculties (PUBLIC - No authentication required)
 * Used by student registration form to populate faculty dropdown
 * @returns {Object} { success: boolean, data: Faculty[], count: number }
 */
router.get('/public/list', (req, res) =>
  FacultyController.getAllFaculties(req as AuthenticatedRequest, res)
);

/**
 * Faculty Management Routes
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
 * - VIEW_FACULTIES (62): Allows viewing faculties list and details
 * - CREATE_FACULTY (63): Allows creating new faculties
 * - UPDATE_FACULTY (64): Allows editing faculty information
 * - DELETE_FACULTY (65): Allows deleting faculties
 * - ASSIGN_FACULTY_TO_MEMBER (66): Allows assigning faculties to student members
 */

/**
 * GET /api/faculties
 * View all faculties
 * @requires VIEW_FACULTIES privilege
 * @returns {Object} { success: boolean, data: Faculty[], count: number }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "code": "ENG", "name_en": "Engineering", "name_ar": "الهندسة", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" },
 *     { "id": 2, "code": "MED", "name_en": "Medicine", "name_ar": "الطب", "created_at": "2026-02-10T10:00:00Z", "updated_at": "2026-02-10T10:00:00Z" }
 *   ],
 *   "count": 2,
 *   "staff_id": 1
 * }
 */
router.get('/', authorizePrivilege('VIEW_FACULTIES'), (req, res) =>
  FacultyController.getAllFaculties(req as AuthenticatedRequest, res)
);

/**
 * GET /api/faculties/:id
 * View specific faculty details
 * @requires VIEW_FACULTIES privilege
 * @param {number} id - Faculty ID
 * @returns {Object} { success: boolean, data: Faculty }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "code": "ENG",
 *     "name_en": "Engineering",
 *     "name_ar": "الهندسة",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (403 Forbidden):
 * {
 *   "success": false,
 *   "message": "Insufficient permissions. Required privilege: VIEW_FACULTIES",
 *   "missingPrivilege": "VIEW_FACULTIES"
 * }
 */
router.get('/:id', authorizePrivilege('VIEW_FACULTIES'), (req, res) =>
  FacultyController.getFacultyById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/faculties
 * Create new faculty
 * @requires CREATE_FACULTY privilege
 * @body {string} code - Unique faculty code (max 50 chars)
 * @body {string} name_en - Faculty name in English (max 100 chars)
 * @body {string} name_ar - Faculty name in Arabic (max 100 chars)
 * @returns {Object} { success: boolean, message: string, data: Faculty }
 * 
 * Example Request:
 * POST /api/faculties
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "code": "ENG",
 *   "name_en": "Engineering",
 *   "name_ar": "الهندسة"
 * }
 * 
 * Example Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Faculty created successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "ENG",
 *     "name_en": "Engineering",
 *     "name_ar": "الهندسة",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:00:00Z"
 *   }
 * }
 * 
 * Example Error Response (409 Conflict):
 * {
 *   "success": false,
 *   "message": "Faculty with this code already exists"
 * }
 */
router.post('/', authorizePrivilege('CREATE_FACULTY'), (req, res) =>
  FacultyController.createFaculty(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/faculties/:id
 * Update existing faculty
 * @requires UPDATE_FACULTY privilege
 * @param {number} id - Faculty ID to update
 * @body {string} [code] - New faculty code (optional, max 50 chars)
 * @body {string} [name_en] - New faculty name in English (optional, max 100 chars)
 * @body {string} [name_ar] - New faculty name in Arabic (optional, max 100 chars)
 * @returns {Object} { success: boolean, message: string, data: Faculty }
 * 
 * Example Request:
 * PUT /api/faculties/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {
 *   "name_en": "Engineering & Technology",
 *   "name_ar": "الهندسة والتكنولوجيا"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Faculty updated successfully",
 *   "data": {
 *     "id": 1,
 *     "code": "ENG",
 *     "name_en": "Engineering & Technology",
 *     "name_ar": "الهندسة والتكنولوجيا",
 *     "created_at": "2026-02-10T10:00:00Z",
 *     "updated_at": "2026-02-10T10:05:00Z"
 *   }
 * }
 */
router.put('/:id', authorizePrivilege('UPDATE_FACULTY'), (req, res) =>
  FacultyController.updateFaculty(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/faculties/:id
 * Delete a faculty
 * @requires DELETE_FACULTY privilege
 * @param {number} id - Faculty ID to delete
 * @returns {Object} { success: boolean, message: string }
 * 
 * Example Request:
 * DELETE /api/faculties/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Faculty deleted successfully"
 * }
 * 
 * Example Error Response (409 Conflict - has associated records):
 * {
 *   "success": false,
 *   "message": "Cannot delete faculty. It has 5 associated student record(s)"
 * }
 */
router.delete('/:id', authorizePrivilege('DELETE_FACULTY'), (req, res) =>
  FacultyController.deleteFaculty(req as AuthenticatedRequest, res)
);

/**
 * POST /api/faculties/:facultyId/assign-to-member/:memberId
 * Assign faculty to a member
 * @requires ASSIGN_FACULTY_TO_MEMBER privilege
 * @param {number} facultyId - Faculty ID to assign
 * @param {number} memberId - Member ID to assign faculty to (must be student member)
 * @returns {Object} { success: boolean, message: string, data: Object }
 * 
 * Example Request:
 * POST /api/faculties/1/assign-to-member/42
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Content-Type: application/json
 * 
 * {}
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Faculty assigned to member successfully",
 *   "data": {
 *     "member_id": 42,
 *     "faculty_id": 1,
 *     "faculty_code": "ENG",
 *     "faculty_name": "Engineering"
 *   }
 * }
 * 
 * Example Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Member or university student record not found. Member must be a student member."
 * }
 */
router.post('/:facultyId/assign-to-member/:memberId', authorizePrivilege('ASSIGN_FACULTY_TO_MEMBER'), (req, res) =>
  FacultyController.assignFacultyToMember(req as AuthenticatedRequest, res)
);

export default router;
