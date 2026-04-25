import api from '../api/axios';

// ─── Types matching backend API ──────────────────────────────────────────────

export type UserType = "member" | "team_member";
export type BookingStatus = "pending_payment" | "confirmed" | "completed" | "cancelled";

export interface CreateBookingRequest {
  userType: UserType;
  userId: number;
  sport_id: number;
  field_id: string;
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  expected_participants?: number;
  notes?: string;
  language?: "ar" | "en";
}

export interface BookingParticipant {
  id: string;
  full_name: string;
  phone_number: string | null;
  national_id: string | null;
  email: string | null;
  is_creator: boolean;
}

export interface BookingDetails {
  id: string;
  sport_id: number;
  field_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  status: BookingStatus;
  share_token: string;
  share_url: string;
  expected_participants: number;
  participants: BookingParticipant[];
  created_at: string;
  notes?: string;
  language?: string;
}

export interface OperatingHours {
  day_of_week: number;
  opening_time: string;
  closing_time: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'training' | 'closed';
  booking_id?: string;
  training_id?: string;
  booking_status?: BookingStatus; // Actual status of the booking
  member_id?: number | null;
  team_member_id?: number | null;
}

export interface AvailableSlotsResponse {
  field_id: string;
  field_name: string;
  date: string;
  day_of_week: number;
  slots: TimeSlot[];
}

export interface CalendarDay {
  date: string;
  day_of_week: number;
  operating_hours: { opening_time: string; closing_time: string } | null;
  slots: TimeSlot[];
}

export interface CalendarViewResponse {
  field_id: string;
  field_name: string;
  start_date: string;
  end_date: string;
  days: CalendarDay[];
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  total_participants: number;
  total_revenue: number;
}

export interface RegisterParticipantRequest {
  full_name: string;
  phone_number?: string;
  national_id?: string;
  email?: string;
}

// ─── Booking Service ─────────────────────────────────────────────────────────

class BookingService {
  /**
   * Get operating hours for a field
   */
  async getFieldOperatingHours(fieldId: string): Promise<OperatingHours[]> {
    const response = await api.get(`/bookings/fields/${fieldId}/hours`);
    return response.data.data;
  }

  /**
   * Create a new booking
   */
  async createBooking(request: CreateBookingRequest): Promise<BookingDetails> {
    const response = await api.post('/bookings', request);
    return response.data.data;
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data.data;
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userType: UserType, userId: number): Promise<BookingDetails[]> {
    const response = await api.get(`/bookings/users/${userType}/${userId}`);
    return response.data.data;
  }

  /**
   * Get booking statistics for a user
   */
  async getBookingStats(userType: UserType, userId: number): Promise<BookingStats> {
    const response = await api.get(`/bookings/stats/${userType}/${userId}`);
    return response.data.data;
  }

  /**
   * Confirm booking after payment
   */
  async confirmPayment(bookingId: string, paymentReference: string): Promise<BookingDetails> {
    const response = await api.post(`/bookings/${bookingId}/confirm-payment`, {
      paymentReference,
    });
    return response.data.data;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await api.delete(`/bookings/${bookingId}`, {
      data: { reason },
    });
  }

  /**
   * Get booking details via share token (public)
   */
  async getBookingByShareToken(shareToken: string): Promise<BookingDetails> {
    const response = await api.get(`/bookings/share/${shareToken}/details`);
    return response.data.data;
  }

  /**
   * Register as a participant via shared link (public)
   */
  async registerParticipantViaLink(
    shareToken: string,
    participantData: RegisterParticipantRequest
  ): Promise<BookingParticipant> {
    const response = await api.post(`/bookings/share/${shareToken}/register`, participantData);
    return response.data.data;
  }

  /**
   * Get available slots for a field on a specific date
   */
  async getAvailableSlots(fieldId: string, date: string): Promise<AvailableSlotsResponse> {
    const response = await api.get(`/bookings/fields/${fieldId}/available-slots`, {
      params: { date },
    });
    return response.data.data;
  }

  /**
   * Get calendar view for a field
   */
  async getCalendarView(
    fieldId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarViewResponse> {
    const response = await api.get(`/bookings/fields/${fieldId}/calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  }

  /**
   * Get all bookings (admin view)
   */
  async getAllBookings(filters?: {
    field_id?: string;
    status?: BookingStatus;
    start_date?: string;
    end_date?: string;
  }): Promise<BookingDetails[]> {
    const response = await api.get('/bookings/all', { params: filters });
    return response.data.data;
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(bookingId: string): Promise<BookingDetails> {
    const response = await api.post(`/bookings/${bookingId}/complete`);
    return response.data.data;
  }
}

export const bookingService = new BookingService();
export default bookingService;
