import api from '../api/axios';

// ─── Types matching backend API ──────────────────────────────────────────────

export interface Field {
  id: string;
  name_en: string;
  name_ar: string;
  sport_id: number;
  description_en?: string;
  description_ar?: string;
  capacity?: number;
  status?: string;
  hourly_rate?: number;
  is_available_for_booking?: boolean;
  booking_slot_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface FieldOperatingHours {
  id: string;
  field_id: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
}

export interface FieldWithOperatingHours extends Field {
  operating_hours: FieldOperatingHours[];
}

// ─── Field Service ───────────────────────────────────────────────────────────

class FieldService {
  /**
   * Get all fields
   */
  async getAllFields(): Promise<Field[]> {
    const response = await api.get('/fields');
    return response.data.data;
  }

  /**
   * Get field by ID with operating hours
   */
  async getFieldById(fieldId: string): Promise<FieldWithOperatingHours> {
    const response = await api.get(`/fields/${fieldId}`);
    return response.data.data;
  }

  /**
   * Get fields by sport ID
   */
  async getFieldsBySport(sportId: number): Promise<Field[]> {
    const response = await api.get('/fields', {
      params: { sport_id: sportId },
    });
    return response.data.data;
  }
}

export const fieldService = new FieldService();
export default fieldService;
