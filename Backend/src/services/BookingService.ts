import { Repository, DataSource } from "typeorm";
import { Booking, BookingStatus, UserType } from "../entities/Booking";
import { BookingParticipant } from "../entities/BookingParticipant";
import { FieldOperatingHours } from "../entities/FieldOperatingHours";
import { Sport } from "../entities/Sport";
import { TeamTrainingSchedule } from "../entities/TeamTrainingSchedule";
import { Field } from "../entities/Field";
import crypto from "crypto";

// Re-export UserType for use in controllers
export type { UserType };

export interface CreateBookingRequest {
  userType: UserType; // 'member' or 'team_member'
  userId: number; // member_id or team_member_id (INTEGER)
  sport_id: number;
  field_id: string;
  start_time: Date; // ISO datetime
  end_time: Date; // ISO datetime
  expected_participants?: number;
  notes?: string;
  language?: "ar" | "en";
}

export interface BookingParticipantInput {
  full_name: string;
  phone_number?: string;
  national_id?: string;
  email?: string;
  national_id_front?: string; // Path to national ID front photo
  national_id_back?: string;  // Path to national ID back photo
}

export interface AvailableFieldsResponse {
  field_id: string;
  field_name: string;
  sport_id: string;
  description?: string;
}

export interface OperatingHoursResponse {
  day_of_week: number;
  opening_time: string;
  closing_time: string;
}

export interface BookingDetailsResponse {
  id: string;
  sport_id: number;
  field_id: string;
  field_name_ar: string;
  field_name_en: string;
  sport_name_ar: string;
  sport_name_en: string;
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  price: number;
  status: BookingStatus;
  share_token: string;
  share_url: string;
  expected_participants: number;
  participants: Array<{
    id: string;
    full_name: string;
    phone_number: string | null;
    national_id: string | null;
    email: string | null;
    is_creator: boolean;
  }>;
  created_at: Date;
}

export class BookingService {
  private bookingRepository: Repository<Booking>;
  private participantRepository: Repository<BookingParticipant>;
  private operatingHoursRepository: Repository<FieldOperatingHours>;
  private sportRepository: Repository<Sport>;
  private trainingScheduleRepository: Repository<TeamTrainingSchedule>;
  private fieldRepository: Repository<Field>;

  constructor(private dataSource: DataSource) {
    this.bookingRepository = dataSource.getRepository(Booking);
    this.participantRepository = dataSource.getRepository(BookingParticipant);
    this.operatingHoursRepository = dataSource.getRepository(FieldOperatingHours);
    this.sportRepository = dataSource.getRepository(Sport);
    this.trainingScheduleRepository = dataSource.getRepository(TeamTrainingSchedule);
    this.fieldRepository = dataSource.getRepository(Field);
  }

  /**
   * Check for booking conflicts
   */
  async checkBookingConflict(
    fieldId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const existingBooking = await this.bookingRepository
      .createQueryBuilder("booking")
      .where("booking.field_id = :fieldId", { fieldId })
      .andWhere("booking.status IN (:...statuses)", {
        statuses: ["pending_payment", "confirmed", "completed"],
      })
      .andWhere("booking.start_time < :endTime AND booking.end_time > :startTime", {
        startTime,
        endTime,
      })
      .getOne();

    return !!existingBooking;
  }

  /**
   * Check for training schedule conflicts
   */
  async checkTrainingConflict(
    fieldId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = startTime.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = dayNames[dayOfWeek];

    // Extract time portion for comparison (HH:MM:SS format)
    const bookingStartTime = startTime.toTimeString().split(' ')[0];
    const bookingEndTime = endTime.toTimeString().split(' ')[0];

    // Find active training schedules on this field and day
    const trainings = await this.trainingScheduleRepository
      .createQueryBuilder("schedule")
      .where("schedule.field_id = :fieldId", { fieldId })
      .andWhere("schedule.status = :status", { status: "active" })
      .andWhere("(LOWER(schedule.days_en) LIKE :dayEn OR LOWER(schedule.days_ar) LIKE :dayAr)", {
        dayEn: `%${targetDay}%`,
        dayAr: `%`, // Keep Arabic check for safety
      })
      .getMany();

    // Check if any training overlaps with booking time
    for (const training of trainings) {
      // Check if times overlap: (start1 < end2) AND (end1 > start2)
      if (
        bookingStartTime < training.end_time &&
        bookingEndTime > training.start_time
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflicts
  }

  /**
   * Check for all conflicts (bookings + training schedules)
   */
  async checkAllConflicts(
    fieldId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ hasConflict: boolean; conflictType?: 'booking' | 'training' }> {
    // Check booking conflicts first
    const bookingConflict = await this.checkBookingConflict(fieldId, startTime, endTime);
    if (bookingConflict) {
      return { hasConflict: true, conflictType: 'booking' };
    }

    // Check training conflicts
    const trainingConflict = await this.checkTrainingConflict(fieldId, startTime, endTime);
    if (trainingConflict) {
      return { hasConflict: true, conflictType: 'training' };
    }

    return { hasConflict: false };
  }

  /**
   * Create a new booking
   */
  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    // Fetch field details to get capacity
    const field = await this.fieldRepository.findOne({
      where: { id: request.field_id }
    });

    if (!field) {
      throw new Error("Field not found");
    }
    this.assertFieldBookable(field);

    // Check for all conflicts (bookings and training schedules)
    const conflictCheck = await this.checkAllConflicts(
      request.field_id,
      request.start_time,
      request.end_time
    );

    if (conflictCheck.hasConflict) {
      if (conflictCheck.conflictType === 'booking') {
        throw new Error("Field is already booked for this time period");
      } else if (conflictCheck.conflictType === 'training') {
        throw new Error("Field has a training schedule during this time period");
      }
    }

    // Generate 64-character share token
    const shareToken = this.generateShareToken();

    // Create booking
    const booking = new Booking();
    booking.member_id = request.userType === "member" ? request.userId : null;
    booking.team_member_id = request.userType === "team_member" ? request.userId : null;
    booking.sport_id = request.sport_id;
    booking.field_id = request.field_id;
    booking.start_time = request.start_time;
    booking.end_time = request.end_time;
    // duration_minutes is GENERATED in database
    booking.price = 0; // Should be set from pricing rules or request
    booking.status = "pending_payment";
    booking.share_token = shareToken;
    // ALWAYS use field capacity as expected_participants
    booking.expected_participants = field.capacity || 1;
    booking.notes = request.notes || null;
    booking.language = request.language || "ar";

    const savedBooking = await this.bookingRepository.save(booking);

    // Add creator as first participant (optional - don't fail if this errors)
    try {
      const creatorParticipant = new BookingParticipant();
      creatorParticipant.booking_id = savedBooking.id;
      creatorParticipant.full_name = "Creator"; // Required field - use placeholder
      creatorParticipant.is_creator = true;
      creatorParticipant.phone_number = null;
      creatorParticipant.national_id = null;
      creatorParticipant.email = null;

      await this.participantRepository.save(creatorParticipant);
      console.log('[BookingService] Creator participant added successfully');
    } catch (participantError) {
      console.error('[BookingService] Failed to create participant record:', participantError);
      // Don't throw - booking is already saved
      // The booking_participants table might not exist yet
    }

    return savedBooking;
  }

  /**
   * Get booking details with share URL
   */
  async getBookingDetails(bookingId: string, baseUrl: string): Promise<BookingDetailsResponse> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["participants"],
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Load field and its nested sport relation for names
    const field = await this.fieldRepository.findOne({
      where: { id: booking.field_id },
      relations: ["sport"],
    });

    return {
      id: booking.id,
      sport_id: booking.sport_id,
      field_id: booking.field_id,
      field_name_ar: field?.name_ar || "",
      field_name_en: field?.name_en || "",
      sport_name_ar: field?.sport?.name_ar || "",
      sport_name_en: field?.sport?.name_en || "",
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration_minutes: booking.duration_minutes,
      price: booking.price,
      status: booking.status,
      share_token: booking.share_token,
      share_url: `${baseUrl}/bookings/share/${booking.share_token}`,
      expected_participants: booking.expected_participants,
      participants: (booking.participants || []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        phone_number: p.phone_number,
        national_id: p.national_id,
        email: p.email,
        is_creator: p.is_creator,
      })),
      created_at: booking.created_at,
    };
  }

  /**
   * Validate and retrieve booking by share token
   */
  async getBookingByShareToken(shareToken: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { share_token: shareToken },
      relations: ["participants"],
    });

    if (!booking) {
      throw new Error("Invalid share token");
    }

    // Only allow registration for pending_payment or confirmed bookings
    if (!["pending_payment", "confirmed"].includes(booking.status)) {
      throw new Error("Booking is no longer accepting participants");
    }

    return booking;
  }

  /**
   * Register a participant via shared link
   */
  async registerParticipantViaLink(
    shareToken: string,
    participantData: BookingParticipantInput
  ): Promise<BookingParticipant> {
    const booking = await this.getBookingByShareToken(shareToken);

    // Validate at least one contact method is provided
    if (!participantData.phone_number && !participantData.national_id && !participantData.email) {
      throw new Error(
        "At least one contact method (phone number, national ID, or email) is required"
      );
    }

    // Get current participants count
    const currentParticipants = await this.participantRepository.count({
      where: { booking_id: booking.id }
    });

    // Check if booking has reached capacity
    if (currentParticipants >= booking.expected_participants) {
      throw new Error("This booking has reached its maximum capacity");
    }

    // Check for duplicate participant (using national_id if available)
    if (participantData.national_id) {
      const existing = await this.participantRepository.findOne({
        where: {
          booking_id: booking.id,
          national_id: participantData.national_id,
        },
      });

      if (existing) {
        throw new Error("This person is already registered for this booking");
      }
    }

    // Create new participant
    const participant = new BookingParticipant();
    participant.booking_id = booking.id;
    participant.full_name = participantData.full_name;
    participant.phone_number = participantData.phone_number || null;
    participant.national_id = participantData.national_id || null;
    participant.email = participantData.email || null;
    participant.national_id_front = participantData.national_id_front || null;
    participant.national_id_back = participantData.national_id_back || null;
    participant.is_creator = false;

    return this.participantRepository.save(participant);
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(bookingId: string, paymentReference: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.status = "confirmed";
    booking.payment_reference = paymentReference;
    booking.payment_completed_at = new Date();

    return this.bookingRepository.save(booking);
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    booking.status = "cancelled";
    booking.cancelled_at = new Date();

    if (reason) {
      booking.notes = booking.notes ? `${booking.notes}\n[Cancelled: ${reason}]` : `[Cancelled: ${reason}]`;
    }

    return this.bookingRepository.save(booking);
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userType: UserType, userId: string): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder("booking");

    if (userType === "member") {
      query.where("booking.member_id = :userId", { userId });
    } else {
      query.where("booking.team_member_id = :userId", { userId });
    }

    return query.leftJoinAndSelect("booking.participants", "participants").orderBy("booking.created_at", "DESC").getMany();
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(
    userType: UserType,
    userId: string
  ): Promise<{
    total_bookings: number;
    confirmed_bookings: number;
    total_participants: number;
    total_revenue: number;
  }> {
    const bookings = await this.getUserBookings(userType, userId);

    const totalParticipants = bookings.reduce((sum, b) => sum + (b.participants?.length || 0), 0);
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + Number(b.price), 0);

    return {
      total_bookings: bookings.length,
      confirmed_bookings: bookings.filter((b) => b.status === "confirmed").length,
      total_participants: totalParticipants,
      total_revenue: totalRevenue,
    };
  }

  /**
   * Helper: Generate 64-character unique share token
   */
  private generateShareToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private assertFieldBookable(field: Field): void {
    // Server-side safety net: prevent booking / slot browsing for fields that are not bookable.
    if (field.status !== "active" || !field.is_available_for_booking) {
      // Keep "not available" in message because controllers map it to 400s.
      throw new Error("Field is not available for booking");
    }
  }

  /**
   * Get operating hours for a field
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFieldOperatingHoursList(fieldId: string): Promise<OperatingHoursResponse[]> {
    // Return default operating hours for all 7 days (8:00 AM - 10:00 PM)
    const defaultHours: OperatingHoursResponse[] = [];
    for (let day = 0; day <= 6; day++) {
      defaultHours.push({
        day_of_week: day,
        opening_time: '08:00:00',
        closing_time: '22:00:00',
      });
    }
    return defaultHours;
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be marked as completed");
    }

    booking.status = "completed";
    booking.completed_at = new Date();

    return this.bookingRepository.save(booking);
  }

  /**
   * Get available booking slots for a specific field and date
   */
  async getAvailableSlots(
    fieldId: string,
    date: string // YYYY-MM-DD format
  ): Promise<{
    field_id: string;
    field_name: string;
    date: string;
    day_of_week: number;
    slots: Array<{
      start_time: string;
      end_time: string;
      status: 'available' | 'booked' | 'training' | 'closed';
      booking_id?: string;
      training_id?: string;
      booking_status?: BookingStatus;
      member_id?: number | null;
      team_member_id?: number | null;
      actual_booking_start?: string;
      actual_booking_end?: string;
    }>;
  }> {
    // Get field details
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId },
    });

    if (!field) {
      throw new Error("Field not found");
    }
    this.assertFieldBookable(field);

    // Parse date and get day of week
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Use default operating hours (8:00 AM - 10:00 PM)
    const openingTime = '08:00:00';
    const closingTime = '22:00:00';

    // Generate time slots based on field's slot duration (default to 60 minutes if not set)
    const slots: Array<{
      start_time: string;
      end_time: string;
      status: 'available' | 'booked' | 'training' | 'closed';
      booking_id?: string;
      training_id?: string;
      booking_status?: BookingStatus; // Add booking status for booked slots
      member_id?: number | null;
      team_member_id?: number | null;
      actual_booking_start?: string; // Actual booking start time (not slot start)
      actual_booking_end?: string;   // Actual booking end time (not slot end)
    }> = [];

    const slotDuration = field.booking_slot_duration || 60; // Default 60 minutes

    // Convert times to minutes for easier calculation
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes: number) => {
      const h = Math.floor(minutes / 60).toString().padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      return `${h}:${m}:00`;
    };

    const openMinutes = timeToMinutes(openingTime);
    const closeMinutes = timeToMinutes(closingTime);

    // Get all bookings for this field on this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.bookingRepository.find({
      where: {
        field_id: fieldId,
      },
    });

    console.log(`[BookingService] getAvailableSlots for field ${fieldId} on ${date}`);
    console.log(`[BookingService] Total bookings for this field: ${bookings.length}`);

    // Filter bookings by date (compare date strings to avoid timezone issues)
    const dayBookings = bookings.filter(b => {
      // Extract date portion from booking timestamp (YYYY-MM-DD)
      const bookingDateStr = b.start_time.toISOString().split('T')[0];
      console.log(`[BookingService] Comparing booking date ${bookingDateStr} with ${date}`);
      return bookingDateStr === date;
    });

    console.log(`[BookingService] Bookings for ${date}: ${dayBookings.length}`);

    // Get training schedules for this day
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = dayNames[dayOfWeek];

    const trainings = await this.trainingScheduleRepository.find({
      where: {
        field_id: fieldId,
        status: 'active',
      },
    });

    const dayTrainings = trainings.filter(t =>
      t.days_en && t.days_en.toLowerCase().includes(targetDay)
    );

    // Generate slots
    for (let currentMinutes = openMinutes; currentMinutes < closeMinutes; currentMinutes += slotDuration) {
      try {
        const endMinutes = Math.min(currentMinutes + slotDuration, closeMinutes);
        const startTime = minutesToTime(currentMinutes);
        const endTime = minutesToTime(endMinutes);

        // Check if slot conflicts with a non-cancelled booking
        const bookingConflict = dayBookings.find(b => {
          // Cancelled bookings do NOT block the slot
          if (b.status === 'cancelled') return false;
          if (!b.start_time || !b.end_time) return false;
          try {
            const bookingStart = b.start_time.toTimeString().split(' ')[0];
            const bookingEnd = b.end_time.toTimeString().split(' ')[0];
            return startTime < bookingEnd && endTime > bookingStart;
          } catch {
            return false;
          }
        });

        if (bookingConflict) {
          slots.push({
            start_time: startTime,
            end_time: endTime,
            status: 'booked',
            booking_id: bookingConflict.id,
            booking_status: bookingConflict.status, // Include actual booking status
            member_id: bookingConflict.member_id,
            team_member_id: bookingConflict.team_member_id,
            // Add actual booking start/end times for accurate rendering
            actual_booking_start: bookingConflict.start_time.toTimeString().split(' ')[0],
            actual_booking_end: bookingConflict.end_time.toTimeString().split(' ')[0],
          });
          continue;
        }

        // Check if slot conflicts with training
        const trainingConflict = dayTrainings.find(t => {
          if (!t.start_time || !t.end_time) return false;
          return startTime < t.end_time && endTime > t.start_time;
        });

        if (trainingConflict) {
          slots.push({
            start_time: startTime,
            end_time: endTime,
            status: 'training',
            training_id: trainingConflict.id,
          });
          continue;
        }

        // Slot is available
        slots.push({
          start_time: startTime,
          end_time: endTime,
          status: 'available',
        });
      } catch (slotError) {
        console.error(`[BookingService] Error generating slot at ${currentMinutes} minutes:`, slotError);
        // Continue to next slot instead of failing completely
        continue;
      }
    }

    return {
      field_id: fieldId,
      field_name: field.name_ar || field.name_en,
      date,
      day_of_week: dayOfWeek,
      slots,
    };
  }

  /**
   * Get calendar view for a field (multiple days)
   */
  async getCalendarView(
    fieldId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  ): Promise<{
    field_id: string;
    field_name: string;
    start_date: string;
    end_date: string;
    days: Array<{
      date: string;
      day_of_week: number;
      operating_hours: { opening_time: string; closing_time: string } | null;
      slots: Array<{
        start_time: string;
        end_time: string;
        status: 'available' | 'booked' | 'training' | 'closed';
        booking_id?: string;
        training_id?: string;
        booking_status?: BookingStatus;
        member_id?: number | null;
        team_member_id?: number | null;
        actual_booking_start?: string;
        actual_booking_end?: string;
      }>;
    }>;
  }> {
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId },
    });

    if (!field) {
      throw new Error("Field not found");
    }
    this.assertFieldBookable(field);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: Array<{
      date: string;
      day_of_week: number;
      operating_hours: { opening_time: string; closing_time: string } | null;
      slots: Array<{
        start_time: string;
        end_time: string;
        status: 'available' | 'booked' | 'training' | 'closed';
        booking_id?: string;
        training_id?: string;
        booking_status?: BookingStatus;
        member_id?: number | null;
        team_member_id?: number | null;
        actual_booking_start?: string;
        actual_booking_end?: string;
      }>;
    }> = [];

    // Use default operating hours (8:00 AM - 10:00 PM)
    const defaultOperatingHours = { opening_time: '08:00:00', closing_time: '22:00:00' };

    // Iterate through each day in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySlots = await this.getAvailableSlots(fieldId, dateStr);

      const dayOfWeek = currentDate.getDay();

      days.push({
        date: dateStr,
        day_of_week: dayOfWeek,
        operating_hours: defaultOperatingHours,
        slots: daySlots.slots,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      field_id: fieldId,
      field_name: field.name_ar || field.name_en,
      start_date: startDate,
      end_date: endDate,
      days,
    };
  }

  /**
   * Get all bookings (admin view)
   */
  async getAllBookings(filters?: {
    field_id?: string;
    status?: BookingStatus;
    start_date?: string;
    end_date?: string;
  }): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.participants', 'participants')
      .orderBy('booking.start_time', 'DESC');

    if (filters?.field_id) {
      query.andWhere('booking.field_id = :fieldId', { fieldId: filters.field_id });
    }

    if (filters?.status) {
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters?.start_date) {
      const startDate = new Date(filters.start_date);
      startDate.setHours(0, 0, 0, 0);
      query.andWhere('booking.start_time >= :startDate', { startDate });
    }

    if (filters?.end_date) {
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999);
      query.andWhere('booking.start_time <= :endDate', { endDate });
    }

    return query.getMany();
  }
}
