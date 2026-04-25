import { AppDataSource } from '../database/data-source';
import { Field } from '../entities/Field';
import { FieldOperatingHours } from '../entities/FieldOperatingHours';
import { Sport } from '../entities/Sport';
import { Branch } from '../entities/Branch';


export interface CreateFieldInput {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  sport_id: number;
  capacity?: number;
  branch_id?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  hourly_rate?: number;
  operating_hours?: OperatingHourInput[];
}

export interface UpdateFieldInput {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  sport_id?: number;
  capacity?: number;
  branch_id?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  hourly_rate?: number;
}

export interface OperatingHourInput {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  opening_time: string; // HH:MM:SS
  closing_time: string; // HH:MM:SS
}

export class FieldService {
  private fieldRepo = AppDataSource.getRepository(Field);
  private operatingHoursRepo = AppDataSource.getRepository(FieldOperatingHours);
  private sportRepo = AppDataSource.getRepository(Sport);
  private branchRepo = AppDataSource.getRepository(Branch);

  /**
   * Create a new field with optional operating hours
   */
  async createField(data: CreateFieldInput): Promise<Field> {
    // Validate sport exists
    const sport = await this.sportRepo.findOne({ where: { id: data.sport_id } });
    if (!sport) {
      throw new Error(`Sport with ID ${data.sport_id} not found`);
    }

    // Validate branch if provided
    if (data.branch_id) {
      const branch = await this.branchRepo.findOne({ where: { id: data.branch_id } });
      if (!branch) {
        throw new Error(`Branch with ID ${data.branch_id} not found`);
      }
    }

    // Create field
    const field = this.fieldRepo.create({
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en || null,
      description_ar: data.description_ar || null,
      sport_id: data.sport_id,
      capacity: data.capacity || null,
      branch_id: data.branch_id || null,
      status: data.status || 'active',
      hourly_rate: data.hourly_rate || null,
    });

    const savedField = await this.fieldRepo.save(field);

    // Create operating hours if provided
    if (data.operating_hours && data.operating_hours.length > 0) {
      await this.addOperatingHours(savedField.id, data.operating_hours);
    }

    // Return field with relations
    return await this.getFieldById(savedField.id);
  }

  /**
   * Get all fields with optional filters
   */
  async getAllFields(filters?: {
    sport_id?: number;
    branch_id?: number;
    status?: string;
  }): Promise<Field[]> {
    const query = this.fieldRepo
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.sport', 'sport')
      .leftJoinAndSelect('field.branch', 'branch')
      .leftJoinAndSelect('field.operating_hours', 'operating_hours')
      .orderBy('field.created_at', 'DESC');

    if (filters?.sport_id) {
      query.andWhere('field.sport_id = :sport_id', { sport_id: filters.sport_id });
    }

    if (filters?.branch_id) {
      query.andWhere('field.branch_id = :branch_id', { branch_id: filters.branch_id });
    }

    if (filters?.status) {
      query.andWhere('field.status = :status', { status: filters.status });
    }

    return await query.getMany();
  }

  /**
   * Get field by ID with all relations
   */
  async getFieldById(id: string): Promise<Field> {
    const field = await this.fieldRepo.findOne({
      where: { id },
      relations: ['sport', 'branch', 'operating_hours'],
    });

    if (!field) {
      throw new Error(`Field with ID ${id} not found`);
    }

    return field;
  }

  /**
   * Update field details
   */
  async updateField(id: string, data: UpdateFieldInput): Promise<Field> {
    const field = await this.fieldRepo.findOne({ where: { id } });
    if (!field) {
      throw new Error(`Field with ID ${id} not found`);
    }

    // Validate sport if updating
    if (data.sport_id) {
      const sport = await this.sportRepo.findOne({ where: { id: data.sport_id } });
      if (!sport) {
        throw new Error(`Sport with ID ${data.sport_id} not found`);
      }
    }

    // Validate branch if updating
    if (data.branch_id) {
      const branch = await this.branchRepo.findOne({ where: { id: data.branch_id } });
      if (!branch) {
        throw new Error(`Branch with ID ${data.branch_id} not found`);
      }
    }

    // Update fields
    Object.assign(field, data);
    await this.fieldRepo.save(field);

    return await this.getFieldById(id);
  }

  /**
   * Delete a field
   */
  async deleteField(id: string): Promise<void> {
    const field = await this.fieldRepo.findOne({ where: { id } });
    if (!field) {
      throw new Error(`Field with ID ${id} not found`);
    }

    await this.fieldRepo.remove(field);
  }

  /**
   * Update field status
   */
  async updateFieldStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Field> {
    const field = await this.fieldRepo.findOne({ where: { id } });
    if (!field) {
      throw new Error(`Field with ID ${id} not found`);
    }

    field.status = status;
    await this.fieldRepo.save(field);

    return await this.getFieldById(id);
  }

  /**
   * Add operating hours to a field
   */
  async addOperatingHours(fieldId: string, hours: OperatingHourInput[]): Promise<FieldOperatingHours[]> {
    const field = await this.fieldRepo.findOne({ where: { id: fieldId } });
    if (!field) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    const operatingHours = hours.map(hour => 
      this.operatingHoursRepo.create({
        field_id: fieldId,
        day_of_week: hour.day_of_week,
        opening_time: hour.opening_time,
        closing_time: hour.closing_time,
      })
    );

    return await this.operatingHoursRepo.save(operatingHours);
  }

  /**
   * Update operating hours for a field
   */
  async updateOperatingHours(fieldId: string, hours: OperatingHourInput[]): Promise<FieldOperatingHours[]> {
    const field = await this.fieldRepo.findOne({ where: { id: fieldId } });
    if (!field) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    // Delete existing operating hours
    await this.operatingHoursRepo.delete({ field_id: fieldId });

    // Add new operating hours
    return await this.addOperatingHours(fieldId, hours);
  }

  /**
   * Get operating hours for a field
   */
  async getOperatingHours(fieldId: string): Promise<FieldOperatingHours[]> {
    const field = await this.fieldRepo.findOne({ where: { id: fieldId } });
    if (!field) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    return await this.operatingHoursRepo.find({
      where: { field_id: fieldId },
      order: { day_of_week: 'ASC' },
    });
  }

  /**
   * Delete operating hours for a specific day
   */
  async deleteOperatingHours(fieldId: string, dayOfWeek: number): Promise<void> {
    await this.operatingHoursRepo.delete({
      field_id: fieldId,
      day_of_week: dayOfWeek,
    });
  }

  /**
   * Get available fields for a sport
   */
  async getAvailableFields(sportId: number): Promise<Field[]> {
    return await this.fieldRepo.find({
      where: {
        sport_id: sportId,
        status: 'active',
        is_available_for_booking: true,
      },
      relations: ['sport', 'branch', 'operating_hours'],
    });
  }

  /**
   * Get fields by branch
   */
  async getFieldsByBranch(branchId: number): Promise<Field[]> {
    return await this.fieldRepo.find({
      where: { branch_id: branchId },
      relations: ['sport', 'branch', 'operating_hours'],
    });
  }

  /**
   * Check field availability at a specific time
   */
  async checkAvailability(fieldId: string, dayOfWeek: number, time: string): Promise<boolean> {
    const operatingHours = await this.operatingHoursRepo.findOne({
      where: {
        field_id: fieldId,
        day_of_week: dayOfWeek,
      },
    });

    if (!operatingHours) {
      return false; // Field not operating on this day
    }

    // Check if time is within operating hours
    return time >= operatingHours.opening_time && time <= operatingHours.closing_time;
  }

  /**
   * Update field booking settings
   */
  async updateBookingSettings(
    fieldId: string, 
    settings: {
      is_available_for_booking?: boolean;
      booking_slot_duration?: number;
    }
  ): Promise<Field> {
    const field = await this.fieldRepo.findOne({ where: { id: fieldId } });
    if (!field) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    // Validate slot duration if provided
    if (settings.booking_slot_duration !== undefined) {
      if (settings.booking_slot_duration < 15 || settings.booking_slot_duration > 480) {
        throw new Error('Booking slot duration must be between 15 minutes and 8 hours (480 minutes)');
      }
    }

    // Update settings
    if (settings.is_available_for_booking !== undefined) {
      field.is_available_for_booking = settings.is_available_for_booking;
    }
    if (settings.booking_slot_duration !== undefined) {
      field.booking_slot_duration = settings.booking_slot_duration;
    }

    await this.fieldRepo.save(field);
    return await this.getFieldById(fieldId);
  }

  /**
   * Get all bookable fields (active and available for booking)
   */
  async getBookableFields(sportId?: number): Promise<Field[]> {
    const query = this.fieldRepo
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.sport', 'sport')
      .leftJoinAndSelect('field.branch', 'branch')
      .leftJoinAndSelect('field.operating_hours', 'operating_hours')
      .where('field.status = :status', { status: 'active' })
      .andWhere('field.is_available_for_booking = :bookable', { bookable: true })
      .orderBy('field.name_en', 'ASC');

    if (sportId) {
      query.andWhere('field.sport_id = :sportId', { sportId });
    }

    return await query.getMany();
  }

  /**
   * Get bookable fields grouped by sport
   */
  async getBookableFieldsBySport(): Promise<{ sport_id: number; sport_name_en: string; sport_name_ar: string; fields: Field[] }[]> {
    const fields = await this.getBookableFields();
    
    // Group fields by sport
    const sportMap = new Map<number, { sport_id: number; sport_name_en: string; sport_name_ar: string; fields: Field[] }>();
    
    for (const field of fields) {
      if (!sportMap.has(field.sport_id)) {
        sportMap.set(field.sport_id, {
          sport_id: field.sport_id,
          sport_name_en: field.sport.name_en || '',
          sport_name_ar: field.sport.name_ar || '',
          fields: []
        });
      }
      sportMap.get(field.sport_id)!.fields.push(field);
    }
    
    return Array.from(sportMap.values());
  }
}

