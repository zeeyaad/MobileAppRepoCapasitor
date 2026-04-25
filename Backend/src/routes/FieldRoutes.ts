import { Router } from 'express';
import { FieldController } from '../controllers/FieldController';
import { authorizePrivilege } from '../middleware/authorizePrivilege';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * All field routes require authentication and appropriate privileges
 * Privileges are enforced through authorizePrivilege middleware
 */

// ==================== FIELD MANAGEMENT ====================

/**
 * POST /api/fields
 * Create a new field
 * Required Privilege: CREATE_FIELD
 * Body: {
 *   name_en: string,
 *   name_ar: string,
 *   description_en?: string,
 *   description_ar?: string,
 *   sport_id: number,
 *   capacity?: number,
 *   branch_id?: number,
 *   status?: 'active' | 'inactive' | 'maintenance',
 *   hourly_rate?: number,
 *   operating_hours?: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.post('/', authorizePrivilege('CREATE_FIELD'), FieldController.createField);

/**
 * GET /api/fields
 * Get all fields with optional filters
 * Requires authentication only
 * Query: sport_id?, branch_id?, status?
 */
router.get('/', authenticate, FieldController.getAllFields);

/**
 * GET /api/fields/sport/:sport_id/available
 * Get available fields for a sport
 * Requires authentication only
 */
router.get('/sport/:sport_id/available', authenticate, FieldController.getAvailableFields);

/**
 * GET /api/fields/branch/:branch_id
 * Get fields by branch
 * Requires authentication only
 */
router.get('/branch/:branch_id', authenticate, FieldController.getFieldsByBranch);

router.get('/bookable/by-sport/auth', authenticate, FieldController.getBookableFieldsBySport);

/**
 * GET /api/fields/:id
 * Get field by ID with full details
 * Requires authentication only
 */
router.get('/:id', authenticate, FieldController.getFieldById);

/**
 * PUT /api/fields/:id
 * Update field details
 * Required Privilege: UPDATE_FIELD
 */
router.put('/:id', authorizePrivilege('UPDATE_FIELD'), FieldController.updateField);

/**
 * DELETE /api/fields/:id
 * Delete a field
 * Required Privilege: DELETE_FIELD
 */
router.delete('/:id', authorizePrivilege('DELETE_FIELD'), FieldController.deleteField);

/**
 * PATCH /api/fields/:id/status
 * Update field status (active, inactive, maintenance)
 * Required Privilege: MANAGE_FIELD_STATUS
 */
router.patch('/:id/status', authorizePrivilege('MANAGE_FIELD_STATUS'), FieldController.updateFieldStatus);

// ==================== OPERATING HOURS ====================

/**
 * POST /api/fields/:id/operating-hours
 * Add operating hours to a field
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   hours: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.post('/:id/operating-hours', authorizePrivilege('MANAGE_FIELD_HOURS'), FieldController.addOperatingHours);

/**
 * PUT /api/fields/:id/operating-hours
 * Update operating hours for a field (replaces all existing)
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   hours: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.put('/:id/operating-hours', authorizePrivilege('MANAGE_FIELD_HOURS'), FieldController.updateOperatingHours);

/**
 * GET /api/fields/:id/operating-hours
 * Get operating hours for a field
 * Requires authentication only
 */
router.get('/:id/operating-hours', authenticate, FieldController.getOperatingHours);

/**
 * DELETE /api/fields/:id/operating-hours/:day
 * Delete operating hours for a specific day
 * Required Privilege: MANAGE_FIELD_HOURS
 */
router.delete('/:id/operating-hours/:day', authorizePrivilege('MANAGE_FIELD_HOURS'), FieldController.deleteOperatingHours);

// ==================== AVAILABILITY ====================

/**
 * POST /api/fields/:id/check-availability
 * Check field availability at a specific time
 * Requires authentication only
 * Body: {
 *   day_of_week: number (0-6),
 *   time: string (HH:MM:SS)
 * }
 */
router.post('/:id/check-availability', authenticate, FieldController.checkAvailability);

// ==================== BOOKING SETTINGS ====================

/**
 * PATCH /api/fields/:id/booking-settings
 * Update field booking settings
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   is_available_for_booking?: boolean,
 *   booking_slot_duration?: number (in minutes, 15-480)
 * }
 */
router.patch('/:id/booking-settings', authorizePrivilege('MANAGE_FIELD_HOURS'), FieldController.updateBookingSettings);

/**
 * GET /api/fields/bookable
 * Get all bookable fields (active and available for booking)
 * Requires authentication only
 * Query Params: sport_id (optional)
 */
router.get('/bookable', authenticate, FieldController.getBookableFields);

/**
 * GET /api/fields/bookable/by-sport
 * Get bookable fields grouped by sport
 * Requires authentication only
 */
router.get('/bookable/by-sport', authenticate, FieldController.getBookableFieldsBySport);

export default router;
