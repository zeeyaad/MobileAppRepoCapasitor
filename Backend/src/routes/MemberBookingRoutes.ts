import { Router } from "express";
import { MemberBookingController } from "../controllers/MemberBookingController";

const router = Router();
const controller = new MemberBookingController();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEMBER BOOKING ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 * Member-focused booking flow with simplified endpoints
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 1: BROWSE BOOKABLE SPORTS & FIELDS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/members/bookings/sports
 * Get all sports that have bookable fields
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "sport_id": 1,
 *       "sport_name_en": "Football",
 *       "sport_name_ar": "كرة القدم",
 *       "fields": [
 *         {
 *           "id": "uuid",
 *           "name_en": "Field 1",
 *           "name_ar": "ملعب 1",
 *           "hourly_rate": 150.00,
 *           "booking_slot_duration": 60
 *         }
 *       ]
 *     }
 *   ],
 *   "count": 3
 * }
 */
router.get("/bookings/sports", controller.getBookableSports);

/**
 * GET /api/members/bookings/fields/:sportId
 * Get bookable fields for a specific sport
 * 
 * Response: Array of bookable fields with details
 */
router.get("/bookings/fields/:sportId", controller.getBookableFieldsBySport);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 2: VIEW CALENDAR & AVAILABLE SLOTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/members/bookings/fields/:fieldId/calendar
 * Get calendar view for a field (defaults to next 7 days)
 * 
 * Query Parameters:
 * - start_date (optional): YYYY-MM-DD (default: today)
 * - end_date (optional): YYYY-MM-DD (default: today + 7 days)
 * 
 * Response: Calendar with available/booked/training slots per day
 */
router.get("/bookings/fields/:fieldId/calendar", controller.getFieldCalendar);

/**
 * GET /api/members/bookings/fields/:fieldId/available-slots
 * Get available slots for a specific date (defaults to today)
 * 
 * Query Parameters:
 * - date (optional): YYYY-MM-DD (default: today)
 * 
 * Response: Array of time slots with availability status
 */
router.get("/bookings/fields/:fieldId/available-slots", controller.getAvailableSlots);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 3: CREATE BOOKING
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * POST /api/members/bookings/book
 * Create a new booking
 * 
 * Request Body:
 * {
 *   "memberId": 123,
 *   "sport_id": 1,
 *   "field_id": "uuid",
 *   "start_time": "2026-03-15T10:00:00Z",
 *   "end_time": "2026-03-15T11:00:00Z",
 *   "expected_participants": 10,
 *   "notes": "Team practice"
 * }
 * 
 * Response: Booking details with share_url for inviting participants
 */
router.post("/bookings/book", controller.createMemberBooking);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 4: PAYMENT
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * POST /api/members/bookings/:bookingId/confirm-payment
 * Confirm payment after payment gateway callback
 * 
 * Request Body:
 * {
 *   "paymentReference": "payment_gateway_ref_123"
 * }
 */
router.post("/bookings/:bookingId/confirm-payment", controller.confirmPayment);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MEMBER BOOKINGS MANAGEMENT
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/members/:memberId/bookings
 * Get all bookings for a member
 * 
 * Query Parameters:
 * - status (optional): Filter by status (pending_payment, confirmed, completed, cancelled)
 */
router.get("/:memberId/bookings", controller.getMemberBookings);

/**
 * GET /api/members/:memberId/bookings/upcoming
 * Get upcoming bookings (future bookings that are confirmed or pending payment)
 */
router.get("/:memberId/bookings/upcoming", controller.getUpcomingBookings);

/**
 * GET /api/members/:memberId/bookings/history
 * Get booking history (past/completed/cancelled bookings)
 */
router.get("/:memberId/bookings/history", controller.getBookingHistory);

/**
 * GET /api/members/:memberId/bookings/stats
 * Get booking statistics for a member
 * 
 * Response:
 * {
 *   "total_bookings": 10,
 *   "confirmed_bookings": 8,
 *   "total_participants": 45,
 *   "total_revenue": 1200.00
 * }
 */
router.get("/:memberId/bookings/stats", controller.getMemberStats);

/**
 * DELETE /api/members/bookings/:bookingId
 * Cancel a booking
 * 
 * Request Body (optional):
 * {
 *   "reason": "Cancellation reason"
 * }
 */
router.delete("/bookings/:bookingId", controller.cancelBooking);

export default router;
