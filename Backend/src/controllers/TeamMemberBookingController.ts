import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { FieldService } from '../services/FieldService';
import { AppDataSource } from '../database/data-source';

export class TeamMemberBookingController {
  private bookingService: BookingService;
  private fieldService: FieldService;

  constructor() {
    this.bookingService = new BookingService(AppDataSource);
    this.fieldService = new FieldService();
  }

  /**
   * Get all sports with bookable fields
   */
  async getBookableSports(req: Request, res: Response): Promise<void> {
    try {
      const sports = await this.fieldService.getBookableFieldsBySport();
      
      res.status(200).json({
        success: true,
        data: sports,
        count: sports.length,
        message: 'Bookable sports retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve bookable sports'
      });
    }
  }

  /**
   * Get bookable fields for a specific sport
   */
  async getBookableFieldsBySport(req: Request, res: Response): Promise<void> {
    try {
      const sportId = parseInt(req.params.sportId);

      if (isNaN(sportId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid sport ID'
        });
        return;
      }

      const fields = await this.fieldService.getBookableFields(sportId);

      res.status(200).json({
        success: true,
        data: fields,
        count: fields.length,
        message: `Found ${fields.length} bookable field(s) for sport`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve bookable fields'
      });
    }
  }

  /**
   * Get calendar view for a field (defaults to next 7 days)
   */
  async getFieldCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId } = req.params;
      
      // Default to next 7 days
      const today = new Date();
      const startDate = req.query.start_date as string || today.toISOString().split('T')[0];
      const endDate = req.query.end_date as string || 
        new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const calendar = await this.bookingService.getCalendarView(
        fieldId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: calendar,
        message: 'Calendar view retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve calendar'
      });
    }
  }

  /**
   * Get available slots for a specific date (defaults to today)
   */
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId } = req.params;
      const date = req.query.date as string || new Date().toISOString().split('T')[0];

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
        return;
      }

      const slots = await this.bookingService.getAvailableSlots(
        fieldId,
        date
      );

      res.status(200).json({
        success: true,
        data: slots,
        message: 'Available slots retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve available slots'
      });
    }
  }

  /**
   * Create booking for team member (simplified)
   */
  async createTeamMemberBooking(req: Request, res: Response): Promise<void> {
    try {
      const { teamMemberId, sport_id, field_id, start_time, end_time, expected_participants, notes } = req.body;

      // Validate required fields
      if (!teamMemberId || !sport_id || !field_id || !start_time || !end_time) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: teamMemberId, sport_id, field_id, start_time, end_time'
        });
        return;
      }

      // Validate team member ID is a number
      if (typeof teamMemberId !== 'number' || teamMemberId <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid team member ID'
        });
        return;
      }

      // Check if booking is in the past
      const bookingStartTime = new Date(start_time);
      if (bookingStartTime < new Date()) {
        res.status(400).json({
          success: false,
          error: 'Cannot book a time slot in the past'
        });
        return;
      }

      // Create booking with userType set to "team_member"
      const booking = await this.bookingService.createBooking({
        userType: 'team_member',
        userId: teamMemberId,
        sport_id,
        field_id,
        start_time,
        end_time,
        expected_participants: expected_participants || 1,
        notes,
        language: 'ar' // Default to Arabic for team members
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully! Please proceed to payment. Share the invitation link with participants.'
      });
    } catch (error) {
      const statusCode = (error instanceof Error ? error.message : String(error)).includes('already booked') || 
                         (error instanceof Error ? error.message : String(error)).includes('training schedule') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to create booking'
      });
    }
  }

  /**
   * Get all bookings for a team member
   */
  async getTeamMemberBookings(req: Request, res: Response): Promise<void> {
    try {
      const teamMemberId = parseInt(req.params.teamMemberId);

      if (isNaN(teamMemberId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid team member ID'
        });
        return;
      }

      const bookings = await this.bookingService.getUserBookings('team_member', teamMemberId.toString());

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length,
        message: `Found ${bookings.length} booking(s)`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve bookings'
      });
    }
  }

  /**
   * Get upcoming bookings for team member
   */
  async getUpcomingBookings(req: Request, res: Response): Promise<void> {
    try {
      const teamMemberId = parseInt(req.params.teamMemberId);

      if (isNaN(teamMemberId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid team member ID'
        });
        return;
      }

      const allBookings = await this.bookingService.getUserBookings('team_member', teamMemberId.toString());
      const now = new Date();
      
      // Filter for future bookings that are confirmed or pending payment
      const upcomingBookings = allBookings.filter(booking => 
        new Date(booking.start_time) > now &&
        (booking.status === 'confirmed' || booking.status === 'pending_payment')
      );

      res.status(200).json({
        success: true,
        data: upcomingBookings,
        count: upcomingBookings.length,
        message: `Found ${upcomingBookings.length} upcoming booking(s)`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve upcoming bookings'
      });
    }
  }

  /**
   * Get booking history for team member
   */
  async getBookingHistory(req: Request, res: Response): Promise<void> {
    try {
      const teamMemberId = parseInt(req.params.teamMemberId);

      if (isNaN(teamMemberId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid team member ID'
        });
        return;
      }

      const allBookings = await this.bookingService.getUserBookings('team_member', teamMemberId.toString());
      const now = new Date();
      
      // Filter for past bookings or cancelled/completed ones
      const historyBookings = allBookings.filter(booking => 
        new Date(booking.start_time) <= now ||
        booking.status === 'completed' ||
        booking.status === 'cancelled'
      );

      res.status(200).json({
        success: true,
        data: historyBookings,
        count: historyBookings.length,
        message: `Found ${historyBookings.length} past booking(s)`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve booking history'
      });
    }
  }

  /**
   * Get booking statistics for team member
   */
  async getTeamMemberStats(req: Request, res: Response): Promise<void> {
    try {
      const teamMemberId = parseInt(req.params.teamMemberId);

      if (isNaN(teamMemberId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid team member ID'
        });
        return;
      }

      const stats = await this.bookingService.getBookingStats('team_member', teamMemberId.toString());

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to retrieve statistics'
      });
    }
  }

  /**
   * Confirm payment for booking
   */
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { paymentReference } = req.body;

      if (!paymentReference) {
        res.status(400).json({
          success: false,
          error: 'Payment reference is required'
        });
        return;
      }

      const booking = await this.bookingService.confirmBooking(bookingId, paymentReference);

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Payment confirmed successfully! Your booking is now confirmed.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to confirm payment'
      });
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      await this.bookingService.cancelBooking(bookingId, reason);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error instanceof Error ? error.message : String(error)) || 'Failed to cancel booking'
      });
    }
  }
}

