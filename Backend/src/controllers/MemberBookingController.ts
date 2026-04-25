import { Request, Response } from "express";
import { BookingService } from "../services/BookingService";
import { FieldService } from "../services/FieldService";
import { AppDataSource } from "../database/data-source";

/**
 * Member-focused booking controller
 * Simplified endpoints for member booking flow
 */
export class MemberBookingController {
  private bookingService: BookingService;
  private fieldService: FieldService;

  constructor() {
    this.bookingService = new BookingService(AppDataSource);
    this.fieldService = new FieldService();
  }

  /**
   * GET /api/members/bookings/sports
   * Get all sports with bookable fields
   */
  getBookableSports = async (req: Request, res: Response): Promise<void> => {
    try {
      const sportFields = await this.fieldService.getBookableFieldsBySport();

      res.json({
        success: true,
        data: sportFields,
        count: sportFields.length,
        message: "Bookable sports retrieved successfully",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get bookable sports";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/bookings/fields/:sportId
   * Get bookable fields for a specific sport
   */
  getBookableFieldsBySport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sportId } = req.params;

      if (!sportId || isNaN(Number(sportId))) {
        res.status(400).json({
          success: false,
          error: "Valid sport ID is required",
        });
        return;
      }

      const fields = await this.fieldService.getBookableFields(Number(sportId));

      res.json({
        success: true,
        data: fields,
        count: fields.length,
        message: `Found ${fields.length} bookable field(s) for sport`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get bookable fields";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/bookings/fields/:fieldId/calendar
   * Get calendar view for a field (simplified for members)
   */
  getFieldCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fieldId } = req.params;
      const { start_date, end_date } = req.query;

      if (!fieldId) {
        res.status(400).json({ success: false, error: "Field ID is required" });
        return;
      }

      // Default to next 7 days if no dates provided
      const startDate = start_date
        ? (start_date as string)
        : new Date().toISOString().split("T")[0];

      const endDateCalc = new Date();
      endDateCalc.setDate(endDateCalc.getDate() + 7);
      const endDate = end_date
        ? (end_date as string)
        : endDateCalc.toISOString().split("T")[0];

      const calendar = await this.bookingService.getCalendarView(fieldId, startDate, endDate);

      res.json({
        success: true,
        data: calendar,
        message: "Calendar view retrieved successfully",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get calendar view";
      const statusCode = error.includes("not found")
        ? 404
        : error.includes("not available")
          ? 400
          : 500;
      res.status(statusCode).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/bookings/fields/:fieldId/available-slots
   * Get available slots for a specific date
   */
  getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fieldId } = req.params;
      const { date } = req.query;

      if (!fieldId) {
        res.status(400).json({ success: false, error: "Field ID is required" });
        return;
      }

      // Default to today if no date provided
      const bookingDate = date ? (date as string) : new Date().toISOString().split("T")[0];

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(bookingDate)) {
        res.status(400).json({
          success: false,
          error: "Date must be in YYYY-MM-DD format",
        });
        return;
      }

      const slots = await this.bookingService.getAvailableSlots(fieldId, bookingDate);

      res.json({
        success: true,
        data: slots,
        message: "Available slots retrieved successfully",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get available slots";
      const statusCode = error.includes("not found")
        ? 404
        : error.includes("not available")
          ? 400
          : 500;
      res.status(statusCode).json({ success: false, error });
    }
  };

  /**
   * POST /api/members/bookings/book
   * Create a booking (member-focused)
   */
  createMemberBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId, sport_id, field_id, start_time, end_time, notes } =
        req.body;

      // Validate required fields
      if (!memberId || !sport_id || !field_id || !start_time || !end_time) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: memberId, sport_id, field_id, start_time, end_time",
        });
        return;
      }

      // Parse ISO datetime strings
      let startDateTime: Date;
      let endDateTime: Date;
      try {
        startDateTime = new Date(start_time);
        endDateTime = new Date(end_time);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch {
        res.status(400).json({
          success: false,
          error: "start_time and end_time must be valid ISO datetime strings",
        });
        return;
      }

      // Validate booking is in the future
      if (startDateTime < new Date()) {
        res.status(400).json({
          success: false,
          error: "Cannot book a time slot in the past",
        });
        return;
      }

      // Validate end time is after start time
      if (endDateTime <= startDateTime) {
        res.status(400).json({
          success: false,
          error: "End time must be after start time",
        });
        return;
      }

      const booking = await this.bookingService.createBooking({
        userType: "member",
        userId: Number(memberId),
        sport_id: Number(sport_id),
        field_id,
        start_time: startDateTime,
        end_time: endDateTime,
        notes: notes || undefined,
        language: "ar", // Default to Arabic for members
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const details = await this.bookingService.getBookingDetails(booking.id, baseUrl);

      res.status(201).json({
        success: true,
        data: details,
        message:
          "Booking created successfully! Please proceed to payment. Share the invitation link with participants.",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to create booking";
      const statusCode = error.includes("not found")
        ? 404
        : error.includes("already booked") || error.includes("training schedule")
          ? 409
          : 400;
      res.status(statusCode).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/:memberId/bookings
   * Get all bookings for a member
   */
  getMemberBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId } = req.params;
      const { status } = req.query;

      if (!memberId || isNaN(Number(memberId))) {
        res.status(400).json({
          success: false,
          error: "Valid member ID is required",
        });
        return;
      }

      const bookings = await this.bookingService.getUserBookings("member", memberId);
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Filter by status if provided
      const filteredBookings = status
        ? bookings.filter((b) => b.status === status)
        : bookings;

      const bookingDetails = await Promise.all(
        filteredBookings.map((b) => this.bookingService.getBookingDetails(b.id, baseUrl))
      );

      res.json({
        success: true,
        data: bookingDetails,
        count: bookingDetails.length,
        message: `Found ${bookingDetails.length} booking(s)`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get member bookings";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/:memberId/bookings/upcoming
   * Get upcoming bookings for a member
   */
  getUpcomingBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId } = req.params;

      if (!memberId || isNaN(Number(memberId))) {
        res.status(400).json({
          success: false,
          error: "Valid member ID is required",
        });
        return;
      }

      const bookings = await this.bookingService.getUserBookings("member", memberId);
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Filter upcoming bookings (future and confirmed/pending)
      const now = new Date();
      const upcomingBookings = bookings.filter(
        (b) =>
          new Date(b.start_time) > now &&
          (b.status === "confirmed" || b.status === "pending_payment")
      );

      const bookingDetails = await Promise.all(
        upcomingBookings.map((b) => this.bookingService.getBookingDetails(b.id, baseUrl))
      );

      res.json({
        success: true,
        data: bookingDetails,
        count: bookingDetails.length,
        message: `Found ${bookingDetails.length} upcoming booking(s)`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get upcoming bookings";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/:memberId/bookings/history
   * Get booking history for a member (past bookings)
   */
  getBookingHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId } = req.params;

      if (!memberId || isNaN(Number(memberId))) {
        res.status(400).json({
          success: false,
          error: "Valid member ID is required",
        });
        return;
      }

      const bookings = await this.bookingService.getUserBookings("member", memberId);
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Filter past bookings
      const now = new Date();
      const pastBookings = bookings.filter(
        (b) =>
          new Date(b.start_time) <= now ||
          b.status === "completed" ||
          b.status === "cancelled"
      );

      const bookingDetails = await Promise.all(
        pastBookings.map((b) => this.bookingService.getBookingDetails(b.id, baseUrl))
      );

      res.json({
        success: true,
        data: bookingDetails,
        count: bookingDetails.length,
        message: `Found ${bookingDetails.length} past booking(s)`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get booking history";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * GET /api/members/:memberId/bookings/stats
   * Get booking statistics for a member
   */
  getMemberStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memberId } = req.params;

      if (!memberId || isNaN(Number(memberId))) {
        res.status(400).json({
          success: false,
          error: "Valid member ID is required",
        });
        return;
      }

      const stats = await this.bookingService.getBookingStats("member", memberId);

      res.json({
        success: true,
        data: stats,
        message: "Statistics retrieved successfully",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get member statistics";
      res.status(500).json({ success: false, error });
    }
  };

  /**
   * POST /api/members/bookings/:bookingId/confirm-payment
   * Confirm payment for a booking
   */
  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { paymentReference } = req.body;

      if (!bookingId || !paymentReference) {
        res.status(400).json({
          success: false,
          error: "Booking ID and payment reference are required",
        });
        return;
      }

      const booking = await this.bookingService.confirmBooking(bookingId, paymentReference);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const details = await this.bookingService.getBookingDetails(booking.id, baseUrl);

      res.json({
        success: true,
        data: details,
        message: "Payment confirmed successfully! Your booking is now confirmed.",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to confirm payment";
      const statusCode = error.includes("not found") ? 404 : 400;
      res.status(statusCode).json({ success: false, error });
    }
  };

  /**
   * DELETE /api/members/bookings/:bookingId
   * Cancel a booking
   */
  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      if (!bookingId) {
        res.status(400).json({ success: false, error: "Booking ID is required" });
        return;
      }

      await this.bookingService.cancelBooking(bookingId, reason);

      res.json({
        success: true,
        message: "Booking cancelled successfully.",
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to cancel booking";
      const statusCode = error.includes("not found") ? 404 : 400;
      res.status(statusCode).json({ success: false, error });
    }
  };
}
