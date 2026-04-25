import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { ParticipantRegistrationController } from "../controllers/ParticipantRegistrationController";

const router = Router();
const bookingController = new BookingController();
const participantController = new ParticipantRegistrationController();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BOOKING INFORMATION ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SPECIFIC ROUTES (MUST BE BEFORE GENERIC /:bookingId)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ADMIN INVITATION MANAGEMENT ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/bookings/admin/invitations
 * Get all invitation links with booker and participants info
 * Auth: Required (admin/staff)
 * Query Params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - status: "pending_payment" | "payment_completed" | "in_progress" | "completed" | "cancelled"
 *   - search: string (search by booking ID or booker name)
 */
router.get("/admin/invitations", participantController.getAllInvitations.bind(participantController));

/**
 * GET /api/bookings/:bookingId/participants
 * Get all participants for a specific booking (admin view)
 * Auth: Required (admin/staff)
 */
router.get("/:bookingId/participants", participantController.getBookingParticipants.bind(participantController));

/**
 * GET /api/bookings/:bookingId/invitation
 * Get detailed invitation information for a specific booking
 * Auth: Required (admin/staff)
 */
router.get("/:bookingId/invitation", participantController.getInvitationDetails.bind(participantController));

/**
 * DELETE /api/bookings/:bookingId/participants/:participantId
 * Remove a participant from a booking
 * Auth: Required (admin/staff)
 * Request Body:
 * {
 *   "reason": "Optional removal reason"
 * }
 */
router.delete("/:bookingId/participants/:participantId", participantController.removeParticipant.bind(participantController));

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SPECIFIC ROUTES (MUST BE BEFORE GENERIC /:bookingId)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/bookings/all
 * Get all bookings across all fields (admin view)
 * Auth: Required (admin/staff)
 */
router.get("/all", bookingController.getAllBookings);

/**
 * GET /api/bookings/fields/:fieldId/hours
 * Get operating hours for a field
 */
router.get("/fields/:fieldId/hours", bookingController.getFieldOperatingHours);

/**
 * GET /api/bookings/fields/:fieldId/available-slots
 * Get available booking slots for a specific field and date
 */
router.get("/fields/:fieldId/available-slots", bookingController.getAvailableSlots);

/**
 * GET /api/bookings/fields/:fieldId/calendar
 * Get calendar view with available and booked slots for a date range
 */
router.get("/fields/:fieldId/calendar", bookingController.getCalendarView);

/**
 * GET /api/bookings/users/:userType/:userId
 * Get all bookings for a specific user
 */
router.get("/users/:userType/:userId", bookingController.getUserBookings);

/**
 * GET /api/bookings/stats/:userType/:userId
 * Get booking statistics for a user
 */
router.get("/stats/:userType/:userId", bookingController.getBookingStats);

/**
 * GET /api/bookings/share/:shareToken/details
 * Get booking details via shared link (public endpoint)
 */
router.get("/share/:shareToken/details", bookingController.getBookingByShareToken);

/**
 * POST /api/bookings/share/:shareToken/register
 * Register as a participant via shared booking link
 */
router.post("/share/:shareToken/register", bookingController.registerParticipantViaLink);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BOOKING CREATION & MANAGEMENT
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * POST /api/bookings
 * Create a new booking (for members or team members)
 * Auth: Required
 *
 * Request Body:
 * {
 *   "userType": "member" | "team_member",
 *   "userId": "uuid",
 *   "sport_id": 1,
 *   "field_id": "uuid",
 *   "start_time": "2025-03-15T10:00:00Z",
 *   "end_time": "2025-03-15T11:00:00Z",
 *   "expected_participants": 1,
 *   "notes": "Optional notes",
 *   "language": "ar" | "en"
 * }
 *
 * Response: (201 Created)
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "sport_id": 1,
 *     "field_id": "uuid",
 *     "start_time": "2025-03-15T10:00:00Z",
 *     "end_time": "2025-03-15T11:00:00Z",
 *     "duration_minutes": 60,
 *     "price": 150.00,
 *     "status": "pending_payment",
 *     "share_token": "abc123...",
 *     "share_url": "http://localhost:3000/bookings/share/abc123...",
 *     "expected_participants": 1,
 *     "participants": [
 *       {
 *         "id": "uuid",
 *         "full_name": "علي أحمد",
 *         "phone_number": "+201001234567",
 *         "national_id": "29001011234567",
 *         "email": "ali@example.com",
 *         "is_creator": true
 *       }
 *     ],
 *     "created_at": "2025-03-01T10:00:00Z"
 *   },
 *   "message": "Booking created successfully. Please proceed to payment."
 * }
 */
router.post("/", bookingController.createBooking);

/**
 * GET /api/bookings/:bookingId
 * Get detailed information about a booking
 * Auth: Required (owner or admin)
 *
 * Params: bookingId (uuid)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { ... booking details ... }
 * }
 */
router.get("/:bookingId", bookingController.getBookingDetails);

/**
 * POST /api/bookings/:bookingId/confirm-payment
 * Confirm booking after successful payment
 * Auth: Required (owner or admin)
 *
 * Params: bookingId (uuid)
 *
 * Request Body:
 * {
 *   "paymentReference": "payment_id_from_gateway"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { ... updated booking details ... },
 *   "message": "Payment confirmed. Booking is now confirmed."
 * }
 */
router.post("/:bookingId/confirm-payment", bookingController.confirmPayment);

/**
 * DELETE /api/bookings/:bookingId
 * Cancel a booking
 * Auth: Required (owner or admin)
 *
 * Params: bookingId (uuid)
 *
 * Request Body:
 * {
 *   "reason": "Optional cancellation reason"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Booking cancelled successfully."
 * }
 */
router.delete("/:bookingId", bookingController.cancelBooking);

/**
 * POST /api/bookings/:bookingId/complete
 * Mark a booking as completed
 * Auth: Required (admin/staff)
 *
 * Params: bookingId (uuid)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { ... updated booking details ... },
 *   "message": "Booking marked as completed"
 * }
 */
router.post("/:bookingId/complete", bookingController.completeBooking);


export default router;
