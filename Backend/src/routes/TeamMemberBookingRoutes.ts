import { Router } from 'express';
import { TeamMemberBookingController } from '../controllers/TeamMemberBookingController';

const router = Router();
const controller = new TeamMemberBookingController();

// Browse sports and fields
router.get('/bookings/sports', (req, res) => controller.getBookableSports(req, res));
router.get('/bookings/fields/:sportId', (req, res) => controller.getBookableFieldsBySport(req, res));

// Calendar and slots
router.get('/bookings/fields/:fieldId/calendar', (req, res) => controller.getFieldCalendar(req, res));
router.get('/bookings/fields/:fieldId/available-slots', (req, res) => controller.getAvailableSlots(req, res));

// Create and manage bookings
router.post('/bookings/book', (req, res) => controller.createTeamMemberBooking(req, res));
router.post('/bookings/:bookingId/confirm-payment', (req, res) => controller.confirmPayment(req, res));

// Team member bookings
router.get('/:teamMemberId/bookings', (req, res) => controller.getTeamMemberBookings(req, res));
router.get('/:teamMemberId/bookings/upcoming', (req, res) => controller.getUpcomingBookings(req, res));
router.get('/:teamMemberId/bookings/history', (req, res) => controller.getBookingHistory(req, res));
router.get('/:teamMemberId/bookings/stats', (req, res) => controller.getTeamMemberStats(req, res));

// Cancel booking
router.delete('/bookings/:bookingId', (req, res) => controller.cancelBooking(req, res));

export default router;
