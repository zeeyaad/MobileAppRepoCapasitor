import { Request, Response } from 'express';
import { FieldService, CreateFieldInput, UpdateFieldInput, OperatingHourInput } from '../services/FieldService';

export class FieldController {
  /**
   * POST /api/fields
   * Create a new field
   */
  static async createField(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const data: CreateFieldInput = req.body;

      // Validation
      if (!data.name_en || !data.name_ar) {
        res.status(400).json({
          success: false,
          message: 'Field name (English and Arabic) is required',
        });
        return;
      }

      if (!data.sport_id) {
        res.status(400).json({
          success: false,
          message: 'Sport ID is required',
        });
        return;
      }

      const field = await fieldService.createField(data);

      res.status(201).json({
        success: true,
        message: 'Field created successfully',
        data: field,
      });
    } catch (error: unknown) {
      console.error('Error creating field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to create field',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields
   * Get all fields with optional filters
   */
  static async getAllFields(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { sport_id, branch_id, status } = req.query;

      const filters = {
        sport_id: sport_id ? parseInt(sport_id as string) : undefined,
        branch_id: branch_id ? parseInt(branch_id as string) : undefined,
        status: status as string | undefined,
      };

      const fields = await fieldService.getAllFields(filters);

      res.status(200).json({
        success: true,
        message: 'Fields retrieved successfully',
        data: fields,
        count: fields.length,
      });
    } catch (error: unknown) {
      console.error('Error fetching fields:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch fields',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/:id
   * Get field by ID
   */
  static async getFieldById(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;

      const field = await fieldService.getFieldById(id);

      res.status(200).json({
        success: true,
        message: 'Field retrieved successfully',
        data: field,
      });
    } catch (error: unknown) {
      console.error('Error fetching field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch field',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /api/fields/:id
   * Update field details
   */
  static async updateField(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;
      const data: UpdateFieldInput = req.body;

      const field = await fieldService.updateField(id, data);

      res.status(200).json({
        success: true,
        message: 'Field updated successfully',
        data: field,
      });
    } catch (error: unknown) {
      console.error('Error updating field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update field',
        error: errorMessage,
      });
    }
  }

  /**
   * DELETE /api/fields/:id
   * Delete a field
   */
  static async deleteField(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;

      await fieldService.deleteField(id);

      res.status(200).json({
        success: true,
        message: 'Field deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete field',
        error: errorMessage,
      });
    }
  }

  /**
   * PATCH /api/fields/:id/status
   * Update field status
   */
  static async updateFieldStatus(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive', 'maintenance'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Valid status is required (active, inactive, or maintenance)',
        });
        return;
      }

      const field = await fieldService.updateFieldStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Field status updated successfully',
        data: field,
      });
    } catch (error: unknown) {
      console.error('Error updating field status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update field status',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /api/fields/:id/operating-hours
   * Add operating hours to a field
   */
  static async addOperatingHours(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;
      const hours: OperatingHourInput[] = req.body.hours;

      if (!hours || !Array.isArray(hours) || hours.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Operating hours array is required',
        });
        return;
      }

      // Validate each operating hour
      for (const hour of hours) {
        if (
          typeof hour.day_of_week !== 'number' ||
          hour.day_of_week < 0 ||
          hour.day_of_week > 6
        ) {
          res.status(400).json({
            success: false,
            message: 'day_of_week must be a number between 0 (Sunday) and 6 (Saturday)',
          });
          return;
        }

        if (!hour.opening_time || !hour.closing_time) {
          res.status(400).json({
            success: false,
            message: 'opening_time and closing_time are required for each hour',
          });
          return;
        }
      }

      const operatingHours = await fieldService.addOperatingHours(id, hours);

      res.status(201).json({
        success: true,
        message: 'Operating hours added successfully',
        data: operatingHours,
      });
    } catch (error: unknown) {
      console.error('Error adding operating hours:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add operating hours',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /api/fields/:id/operating-hours
   * Update operating hours for a field (replaces all existing hours)
   */
  static async updateOperatingHours(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;
      const hours: OperatingHourInput[] = req.body.hours;

      if (!hours || !Array.isArray(hours)) {
        res.status(400).json({
          success: false,
          message: 'Operating hours array is required',
        });
        return;
      }

      const operatingHours = await fieldService.updateOperatingHours(id, hours);

      res.status(200).json({
        success: true,
        message: 'Operating hours updated successfully',
        data: operatingHours,
      });
    } catch (error: unknown) {
      console.error('Error updating operating hours:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update operating hours',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/:id/operating-hours
   * Get operating hours for a field
   */
  static async getOperatingHours(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;

      const operatingHours = await fieldService.getOperatingHours(id);

      res.status(200).json({
        success: true,
        message: 'Operating hours retrieved successfully',
        data: operatingHours,
      });
    } catch (error: unknown) {
      console.error('Error fetching operating hours:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch operating hours',
        error: errorMessage,
      });
    }
  }

  /**
   * DELETE /api/fields/:id/operating-hours/:day
   * Delete operating hours for a specific day
   */
  static async deleteOperatingHours(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id, day } = req.params;
      const dayOfWeek = parseInt(day);

      if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        res.status(400).json({
          success: false,
          message: 'Day must be a number between 0 (Sunday) and 6 (Saturday)',
        });
        return;
      }

      await fieldService.deleteOperatingHours(id, dayOfWeek);

      res.status(200).json({
        success: true,
        message: 'Operating hours deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting operating hours:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to delete operating hours',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/sport/:sport_id/available
   * Get available fields for a sport
   */
  static async getAvailableFields(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { sport_id } = req.params;

      const fields = await fieldService.getAvailableFields(parseInt(sport_id));

      res.status(200).json({
        success: true,
        message: 'Available fields retrieved successfully',
        data: fields,
        count: fields.length,
      });
    } catch (error: unknown) {
      console.error('Error fetching available fields:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available fields',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/branch/:branch_id
   * Get fields by branch
   */
  static async getFieldsByBranch(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { branch_id } = req.params;

      const fields = await fieldService.getFieldsByBranch(parseInt(branch_id));

      res.status(200).json({
        success: true,
        message: 'Branch fields retrieved successfully',
        data: fields,
        count: fields.length,
      });
    } catch (error: unknown) {
      console.error('Error fetching branch fields:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch branch fields',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /api/fields/:id/check-availability
   * Check field availability at a specific time
   */
  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const { id } = req.params;
      const { day_of_week, time } = req.body;

      if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
        res.status(400).json({
          success: false,
          message: 'day_of_week must be a number between 0 (Sunday) and 6 (Saturday)',
        });
        return;
      }

      if (!time) {
        res.status(400).json({
          success: false,
          message: 'time is required (HH:MM:SS format)',
        });
        return;
      }

      const isAvailable = await fieldService.checkAvailability(id, day_of_week, time);

      res.status(200).json({
        success: true,
        message: 'Availability checked successfully',
        data: {
          field_id: id,
          day_of_week,
          time,
          is_available: isAvailable,
        },
      });
    } catch (error: unknown) {
      console.error('Error checking availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: errorMessage,
      });
    }
  }

  /**
   * PATCH /api/fields/:id/booking-settings
   * Update field booking settings
   */
  static async updateBookingSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_available_for_booking, booking_slot_duration } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Field ID is required',
        });
        return;
      }

      // Validate at least one setting is provided
      if (is_available_for_booking === undefined && booking_slot_duration === undefined) {
        res.status(400).json({
          success: false,
          error: 'At least one booking setting must be provided (is_available_for_booking or booking_slot_duration)',
        });
        return;
      }

      // Validate types
      if (is_available_for_booking !== undefined && typeof is_available_for_booking !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'is_available_for_booking must be a boolean',
        });
        return;
      }

      if (booking_slot_duration !== undefined) {
        const duration = Number(booking_slot_duration);
        if (isNaN(duration) || !Number.isInteger(duration)) {
          res.status(400).json({
            success: false,
            error: 'booking_slot_duration must be an integer',
          });
          return;
        }
      }

      const fieldService = new FieldService();
      const updatedField = await fieldService.updateBookingSettings(id, {
        is_available_for_booking,
        booking_slot_duration: booking_slot_duration ? Number(booking_slot_duration) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Field booking settings updated successfully',
        data: updatedField,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking settings';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/bookable
   * Get all bookable fields
   */
  static async getBookableFields(req: Request, res: Response): Promise<void> {
    try {
      const { sport_id } = req.query;

      const fieldService = new FieldService();
      const fields = await fieldService.getBookableFields(
        sport_id ? Number(sport_id) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Bookable fields retrieved successfully',
        data: fields,
        count: fields.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bookable fields';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * GET /api/fields/bookable/by-sport
   * Get bookable fields grouped by sport
   */
  static async getBookableFieldsBySport(req: Request, res: Response): Promise<void> {
    try {
      const fieldService = new FieldService();
      const sportFields = await fieldService.getBookableFieldsBySport();

      res.status(200).json({
        success: true,
        message: 'Bookable fields by sport retrieved successfully',
        data: sportFields,
        count: sportFields.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bookable fields by sport';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
