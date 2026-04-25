import { Request, Response } from "express";
import { BookingService } from "../services/BookingService";
import { AppDataSource } from "../database/data-source";
import { saveToLocalStorage, DocumentType, UserType } from "../utils/localFileStorage";

/**
 * Public Participant Registration Controller
 * Handles participant registration via booking invitation links
 * NO AUTHENTICATION REQUIRED - Anyone with valid share token can register
 */
export class ParticipantRegistrationController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService(AppDataSource);
  }

  /**
   * GET /api/bookings/join/:shareToken
   * Get booking details by share token (public endpoint)
   */
  async getBookingByShareToken(req: Request, res: Response): Promise<void> {
    try {
      const { shareToken } = req.params;

      if (!shareToken || shareToken.length !== 64) {
        res.status(400).json({
          success: false,
          error: "Invalid share token format"
        });
        return;
      }

      const booking = await this.bookingService.getBookingByShareToken(shareToken);

      // Get current participant count
      const participantCount = await AppDataSource.getRepository("BookingParticipant").count({
        where: { booking_id: booking.id }
      });

      // Get field and sport details
      const field = await AppDataSource.getRepository("Field").findOne({
        where: { id: booking.field_id }
      });

      const sport = await AppDataSource.getRepository("Sport").findOne({
        where: { id: booking.sport_id },
        select: ["id", "name_ar", "name_en"]
      });

      // Prefer Arabic field name, then English, then any generic name
      const fieldName =
        (field && (field.name_ar || field.name_en || field.name)) ||
        "Unknown Field";

      res.status(200).json({
        success: true,
        data: {
          booking_id: booking.id,
          sport_name_ar: sport?.name_ar || "Unknown Sport",
          sport_name_en: sport?.name_en || "Unknown Sport",
          field_name: fieldName,
          start_time: booking.start_time,
          end_time: booking.end_time,
          duration_minutes: booking.duration_minutes,
          location: field?.location || "Helwan Sports Club",
          expected_participants: booking.expected_participants,
          registered_participants: participantCount,
          is_full: participantCount >= booking.expected_participants,
          available_slots: Math.max(0, booking.expected_participants - participantCount),
          status: booking.status,
          notes: booking.notes,
          language: booking.language
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid share token") {
        res.status(404).json({
          success: false,
          error: "Booking not found or link is invalid"
        });
      } else if (error instanceof Error && error.message.includes("no longer accepting")) {
        res.status(400).json({
          success: false,
          error: "This booking is no longer accepting new participants"
        });
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Failed to retrieve booking details"
        });
      }
    }
  }

  /**
   * POST /api/bookings/join/:shareToken
   * Register participant via share token (public endpoint with file upload)
   * 
   * Form-data fields:
   * - full_name: string (required)
   * - phone_number: string (optional)
   * - national_id: string (optional)
   * - email: string (optional)
   * - national_id_front: file (optional - national ID front photo)
   * - national_id_back: file (optional - national ID back photo)
   */
  async registerParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { shareToken } = req.params;
      const { full_name, phone_number, national_id, email } = req.body;

      if (!shareToken || shareToken.length !== 64) {
        res.status(400).json({
          success: false,
          error: "Invalid share token format"
        });
        return;
      }

      if (!full_name || full_name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Full name is required"
        });
        return;
      }

      // Validate Full Name: At least 2 words, only letters and spaces
      const fullNameTrimmed = full_name.trim();
      const nameParts = fullNameTrimmed.split(/\s+/);
      if (nameParts.length < 2) {
        res.status(400).json({
          success: false,
          error: "يرجى إدخال الاسم بالكامل (الاسم الأول واسم العائلة على الأقل)"
        });
        return;
      }

      // Validate Phone Number: 11 digits, strictly starts with 010, 011, 012, 015
      if (phone_number && !/^01[0125]\d{8}$/.test(phone_number.trim())) {
        res.status(400).json({
          success: false,
          error: "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم)"
        });
        return;
      }

      // Validate Email: Standard format
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        res.status(400).json({
          success: false,
          error: "البريد الإلكتروني غير صحيح"
        });
        return;
      }

      // Validate National ID: 14 digits, MUST NOT start with 0
      if (national_id) {
        const natIdTrimmed = national_id.trim();
        if (!/^\d{14}$/.test(natIdTrimmed)) {
          res.status(400).json({
            success: false,
            error: "الرقم القومي يجب أن يتكون من 14 رقم"
          });
          return;
        }
        if (natIdTrimmed.startsWith("0")) {
          res.status(400).json({
            success: false,
            error: "الرقم القومي غير صحيح (لا يمكن أن يبدأ برقم 0)"
          });
          return;
        }
      }

      // Upload files to local storage if provided
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let national_id_front_url: string | undefined;
      let national_id_back_url: string | undefined;

      try {
        // Upload front photo if provided
        if (files?.national_id_front?.[0]) {
          const frontFile = files.national_id_front[0];
          national_id_front_url = await saveToLocalStorage(
            frontFile.buffer,
            frontFile.originalname,
            DocumentType.NATIONAL_ID,
            UserType.PARTICIPANT
          );
          console.log(`✅ Uploaded front ID locally: ${national_id_front_url}`);
        }

        // Upload back photo if provided
        if (files?.national_id_back?.[0]) {
          const backFile = files.national_id_back[0];
          national_id_back_url = await saveToLocalStorage(
            backFile.buffer,
            backFile.originalname,
            DocumentType.NATIONAL_ID,
            UserType.PARTICIPANT
          );
          console.log(`✅ Uploaded back ID locally: ${national_id_back_url}`);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        const errorMessage = uploadError instanceof Error ? uploadError.message : "خطأ غير معروف أثناء رفع الصور";
        res.status(500).json({
          success: false,
          error: `فشل رفع صور البطاقة: ${errorMessage}. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.`
        });
        return;
      }

      // Register participant
      const participant = await this.bookingService.registerParticipantViaLink(
        shareToken,
        {
          full_name: full_name.trim(),
          phone_number: phone_number?.trim() || undefined,
          national_id: national_id?.trim() || undefined,
          email: email?.trim() || undefined,
          national_id_front: national_id_front_url,
          national_id_back: national_id_back_url
        }
      );

      res.status(201).json({
        success: true,
        data: {
          participant_id: participant.id,
          full_name: participant.full_name,
          phone_number: participant.phone_number,
          national_id: participant.national_id,
          email: participant.email,
          national_id_front: participant.national_id_front,
          national_id_back: participant.national_id_back,
          has_national_id_photos: !!(participant.national_id_front && participant.national_id_back),
          registered_at: participant.created_at
        },
        message: "Registration successful! See you at the field."
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid share token") {
          res.status(404).json({
            success: false,
            error: "Booking not found or link is invalid"
          });
        } else if (error.message.includes("no longer accepting")) {
          res.status(400).json({
            success: false,
            error: "This booking is no longer accepting new participants"
          });
        } else if (error.message.includes("reached its maximum capacity")) {
          res.status(400).json({
            success: false,
            error: "Sorry, this booking is full. Maximum capacity has been reached."
          });
        } else if (error.message.includes("already registered")) {
          res.status(409).json({
            success: false,
            error: "You are already registered for this booking"
          });
        } else if (error.message.includes("At least one contact method")) {
          res.status(400).json({
            success: false,
            error: "Please provide at least one contact method (phone, national ID, or email)"
          });
        } else {
          res.status(500).json({
            success: false,
            error: error.message || "Failed to register participant"
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to register participant"
        });
      }
    }
  }

  /**
   * GET /api/admin/bookings/:bookingId/participants
   * Get all participants for a booking (admin endpoint)
   * Requires authentication and admin privileges
   */
  async getBookingParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      const booking = await AppDataSource.getRepository("Booking").findOne({
        where: { id: bookingId },
        relations: ["participants", "sport"]
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          error: "Booking not found"
        });
        return;
      }

      // Get field details
      const field = await AppDataSource.getRepository("Field").findOne({
        where: { id: booking.field_id }
      });

      // Get booker details
      let bookerDetails: { type: string; id: number; name: string; phone: string; email: string } | null = null;
      if (booking.member_id) {
        const member = await AppDataSource.getRepository("Member").findOne({
          where: { id: booking.member_id },
          select: ["id", "first_name_ar", "last_name_ar", "phone"]
        });
        if (member) {
          bookerDetails = {
            type: "member",
            id: member.id,
            name: `${member.first_name_ar || ''} ${member.last_name_ar || ''}`.trim() || 'Unknown',
            phone: member.phone || '',
            email: ''
          };
        }
      } else if (booking.team_member_id) {
        const teamMember = await AppDataSource.getRepository("TeamMember").findOne({
          where: { id: booking.team_member_id },
          select: ["id", "first_name_ar", "last_name_ar", "phone"]
        });
        if (teamMember) {
          bookerDetails = {
            type: "team_member",
            id: teamMember.id,
            name: `${teamMember.first_name_ar || ''} ${teamMember.last_name_ar || ''}`.trim() || 'Unknown',
            phone: teamMember.phone || '',
            email: ''
          };
        }
      }

      res.status(200).json({
        success: true,
        data: {
          booking: {
            id: booking.id,
            status: booking.status,
            created_by: bookerDetails,
            sport: booking.sport?.name_ar || "Unknown Sport",
            field: field?.name || "Unknown Field",
            start_time: booking.start_time,
            end_time: booking.end_time,
            duration_minutes: booking.duration_minutes,
            price: booking.price,
            payment_reference: booking.payment_reference,
            payment_completed_at: booking.payment_completed_at,
            share_token: booking.share_token
          },
          participants: booking.participants.map(p => ({
            id: p.id,
            full_name: p.full_name,
            phone_number: p.phone_number,
            national_id: p.national_id,
            email: p.email,
            national_id_front: p.national_id_front,
            national_id_back: p.national_id_back,
            is_creator: p.is_creator,
            registered_at: p.created_at
          })),
          stats: {
            expected: booking.expected_participants,
            registered: booking.participants.length,
            remaining: Math.max(0, booking.expected_participants - booking.participants.length)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve participants"
      });
    }
  }

  /**
   * GET /api/admin/bookings/invitations
   * Get all invitation links with booker and participants info
   * Requires authentication and admin privileges
   */
  async getAllInvitations(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const skip = ((Number(page) - 1) * Number(limit)) || 0;

      const bookingRepo = AppDataSource.getRepository("Booking");
      const queryBuilder = bookingRepo.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.participants', 'participants')
        .leftJoinAndSelect('booking.sport', 'sport')
        .leftJoin('Member', 'member', 'member.id = booking.member_id')
        .leftJoin('TeamMember', 'team_member', 'team_member.id = booking.team_member_id')
        .orderBy('booking.created_at', 'DESC');

      // Filter by status if provided
      if (status) {
        queryBuilder.andWhere('booking.status = :status', { status });
      }

      // Search by booker name or booking ID
      if (search) {
        queryBuilder.andWhere(
          '(CAST(booking.id AS TEXT) LIKE :search OR ' +
          'member.first_name_ar LIKE :search OR member.last_name_ar LIKE :search OR ' +
          'team_member.first_name_ar LIKE :search OR team_member.last_name_ar LIKE :search)',
          { search: `%${search}%` }
        );
      }

      const [bookings, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      // Fetch booker and field details for each booking
      const invitations = await Promise.all(bookings.map(async (booking) => {
        let bookerName = "Unknown";
        let bookerType: string | null = null;
        let bookerPhone: string | null = null;
        let bookerEmail: string | null = null;
        
        // Fetch field manually since it's not a relation on Booking
        const field = await AppDataSource.getRepository("Field").findOne({
          where: { id: booking.field_id },
          select: ["name_ar", "name_en"]
        });

        if (booking.member_id) {
          const member = await AppDataSource.getRepository("Member").findOne({
            where: { id: booking.member_id },
            select: ["id", "first_name_ar", "last_name_ar", "phone"]
          });
          if (member) {
            bookerName = `${member.first_name_ar || ''} ${member.last_name_ar || ''}`.trim() || 'Unknown';
            bookerType = "member";
            bookerPhone = member.phone || null;
            bookerEmail = null;
          }
        } else if (booking.team_member_id) {
          const teamMember = await AppDataSource.getRepository("TeamMember").findOne({
            where: { id: booking.team_member_id },
            select: ["id", "first_name_ar", "last_name_ar", "phone"]
          });
          if (teamMember) {
            bookerName = `${teamMember.first_name_ar || ''} ${teamMember.last_name_ar || ''}`.trim() || 'Unknown';
            bookerType = "team_member";
            bookerPhone = teamMember.phone || null;
            bookerEmail = null;
          }
        }

        return {
          booking_id: booking.id,
          share_token: booking.share_token,
          share_url: `${req.protocol}://${req.get('host')}/bookings/join/${booking.share_token}`,
          booker: {
            name: bookerName,
            type: bookerType,
            phone: bookerPhone,
            email: bookerEmail
          },
          booking_date: booking.start_time,
          booking_time: {
            start: booking.start_time,
            end: booking.end_time,
            duration_minutes: booking.duration_minutes
          },
          sport: {
            name_ar: booking.sport?.name_ar,
            name_en: booking.sport?.name_en
          },
          field: {
            name_ar: field?.name_ar,
            name_en: field?.name_en
          },
          participants: booking.participants.map(p => ({
            id: p.id,
            full_name: p.full_name,
            phone_number: p.phone_number,
            email: p.email,
            is_creator: p.is_creator,
            registered_at: p.created_at
          })),
          stats: {
            expected_participants: booking.expected_participants,
            registered_count: booking.participants.length,
            remaining_slots: Math.max(0, booking.expected_participants - booking.participants.length),
            is_full: booking.participants.length >= booking.expected_participants
          },
          status: booking.status,
          payment_status: booking.payment_completed_at ? 'completed' : 'pending',
          created_at: booking.created_at
        };
      }));

      res.status(200).json({
        success: true,
        data: invitations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve invitations"
      });
    }
  }

  /**
   * GET /api/admin/bookings/:bookingId/invitation
   * Get specific invitation details
   * Requires authentication and admin privileges
   */
  async getInvitationDetails(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      const booking = await AppDataSource.getRepository("Booking").findOne({
        where: { id: bookingId },
        relations: ["participants", "sport", "field"]
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          error: "Booking not found"
        });
        return;
      }

      // Get booker details
      let bookerDetails: {
        type: string;
        id: string;
        name: string;
        phone: string;
        email: string;
        membership_number?: string;
      } | null = null;
      if (booking.member_id) {
        const member = await AppDataSource.getRepository("Member").findOne({
          where: { id: booking.member_id },
          select: ["id", "first_name_ar", "last_name_ar", "phone", "membership_number"]
        });
        if (member) {
          bookerDetails = {
            type: "member",
            id: member.id.toString(),
            name: `${member.first_name_ar || ''} ${member.last_name_ar || ''}`.trim() || 'Unknown',
            phone: member.phone || '',
            email: '',
            membership_number: member.membership_number
          };
        }
      } else if (booking.team_member_id) {
        const teamMember = await AppDataSource.getRepository("TeamMember").findOne({
          where: { id: booking.team_member_id },
          select: ["id", "first_name_ar", "last_name_ar", "phone"]
        });
        if (teamMember) {
          bookerDetails = {
            type: "team_member",
            id: teamMember.id.toString(),
            name: `${teamMember.first_name_ar || ''} ${teamMember.last_name_ar || ''}`.trim() || 'Unknown',
            phone: teamMember.phone || '',
            email: ''
          };
        }
      }

      res.status(200).json({
        success: true,
        data: {
          booking_id: booking.id,
          share_token: booking.share_token,
          share_url: `${req.protocol}://${req.get('host')}/bookings/join/${booking.share_token}`,
          booker: bookerDetails,
          booking_details: {
            sport: {
              name_ar: booking.sport?.name_ar,
              name_en: booking.sport?.name_en
            },
            field: {
              name_ar: booking.field?.name_ar,
              name_en: booking.field?.name_en
            },
            date: booking.start_time,
            start_time: booking.start_time,
            end_time: booking.end_time,
            duration_minutes: booking.duration_minutes,
            status: booking.status,
            price: booking.price,
            payment_reference: booking.payment_reference,
            payment_completed_at: booking.payment_completed_at
          },
          participants: booking.participants.map(p => ({
            id: p.id,
            full_name: p.full_name,
            phone_number: p.phone_number,
            national_id: p.national_id,
            email: p.email,
            national_id_front: p.national_id_front,
            national_id_back: p.national_id_back,
            is_creator: p.is_creator,
            registered_at: p.created_at
          })),
          stats: {
            expected_participants: booking.expected_participants,
            registered_count: booking.participants.length,
            remaining_slots: Math.max(0, booking.expected_participants - booking.participants.length),
            is_full: booking.participants.length >= booking.expected_participants
          },
          created_at: booking.created_at,
          updated_at: booking.updated_at
        }
      });
    } catch (error) {
      console.error('Error fetching invitation details:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve invitation details"
      });
    }
  }

  /**
   * DELETE /api/admin/bookings/:bookingId/participants/:participantId
   * Remove a participant from a booking
   * Requires authentication and admin privileges
   */
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, participantId } = req.params;
      const { reason } = req.body;

      const participantRepo = AppDataSource.getRepository("BookingParticipant");
      
      // Find participant
      const participant = await participantRepo.findOne({
        where: {
          id: Number(participantId),
          booking_id: bookingId
        }
      });

      if (!participant) {
        res.status(404).json({
          success: false,
          error: "Participant not found in this booking"
        });
        return;
      }

      // Don't allow removing the creator
      if (participant.is_creator) {
        res.status(400).json({
          success: false,
          error: "Cannot remove the booking creator. Cancel the booking instead."
        });
        return;
      }

      // Store participant info before deletion
      const participantInfo = {
        id: participant.id,
        full_name: participant.full_name,
        phone_number: participant.phone_number,
        email: participant.email,
        removed_at: new Date(),
        removed_reason: reason || "Removed by admin"
      };

      // Delete participant
      await participantRepo.remove(participant);

      res.status(200).json({
        success: true,
        message: "Participant removed successfully",
        data: participantInfo
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove participant"
      });
    }
  }
}
