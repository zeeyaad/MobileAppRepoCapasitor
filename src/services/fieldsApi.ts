import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Field {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  sport_id: number;
  capacity: number | null;
  branch_id: number | null;
  status: 'active' | 'inactive' | 'maintenance';
  hourly_rate: number | null;
  is_available_for_booking: boolean;
  booking_slot_duration: number;
  created_at: string;
  updated_at: string;
  sport?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  branch?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  operating_hours?: OperatingHour[];
}

export interface OperatingHour {
  id: string;
  field_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  opening_time: string; // HH:MM:SS
  closing_time: string; // HH:MM:SS
}

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
  is_available_for_booking?: boolean;
  booking_slot_duration?: number;
  operating_hours?: {
    day_of_week: number;
    opening_time: string;
    closing_time: string;
  }[];
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

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Get all fields with optional filters
 */
export const getAllFields = async (filters?: {
  sport_id?: number;
  branch_id?: number;
  status?: string;
}): Promise<Field[]> => {
  const params = new URLSearchParams();
  if (filters?.sport_id) params.append('sport_id', filters.sport_id.toString());
  if (filters?.branch_id) params.append('branch_id', filters.branch_id.toString());
  if (filters?.status) params.append('status', filters.status);

  const response = await api.get(`/fields?${params.toString()}`);
  return response.data.data;
};

/**
 * Get field by ID
 */
export const getFieldById = async (id: string): Promise<Field> => {
  const response = await api.get(`/fields/${id}`);
  return response.data.data;
};

/**
 * Create a new field
 */
export const createField = async (data: CreateFieldInput): Promise<Field> => {
  const response = await api.post('/fields', data);
  return response.data.data;
};

/**
 * Update field details
 */
export const updateField = async (id: string, data: UpdateFieldInput): Promise<Field> => {
  const response = await api.put(`/fields/${id}`, data);
  return response.data.data;
};

/**
 * Delete a field
 */
export const deleteField = async (id: string): Promise<void> => {
  await api.delete(`/fields/${id}`);
};

/**
 * Update field status
 */
export const updateFieldStatus = async (
  id: string,
  status: 'active' | 'inactive' | 'maintenance'
): Promise<Field> => {
  const response = await api.patch(`/fields/${id}/status`, { status });
  return response.data.data;
};

/**
 * Update field booking settings
 */
export const updateBookingSettings = async (
  id: string,
  settings: {
    is_available_for_booking?: boolean;
    booking_slot_duration?: number;
  }
): Promise<Field> => {
  const response = await api.patch(`/fields/${id}/booking-settings`, settings);
  return response.data.data;
};

/**
 * Get bookable fields grouped by sport
 */
export const getBookableFieldsBySport = async (): Promise<{
  sport_id: number;
  sport_name_en: string;
  sport_name_ar: string;
  fields: Field[];
}[]> => {
  const response = await api.get('/fields/bookable/by-sport');
  return response.data.data;
};

/**
 * Get available fields for a sport
 */
export const getAvailableFieldsForSport = async (sportId: number): Promise<Field[]> => {
  const response = await api.get(`/fields/sport/${sportId}/available`);
  return response.data.data;
};

/**
 * Get fields by branch
 */
export const getFieldsByBranch = async (branchId: number): Promise<Field[]> => {
  const response = await api.get(`/fields/branch/${branchId}`);
  return response.data.data;
};

/**
 * Add operating hours to a field
 */
export const addOperatingHours = async (
  fieldId: string,
  hours: {
    day_of_week: number;
    opening_time: string;
    closing_time: string;
  }[]
): Promise<OperatingHour[]> => {
  const response = await api.post(`/fields/${fieldId}/operating-hours`, { hours });
  return response.data.data;
};

/**
 * Update operating hours for a field
 */
export const updateOperatingHours = async (
  fieldId: string,
  hours: {
    day_of_week: number;
    opening_time: string;
    closing_time: string;
  }[]
): Promise<OperatingHour[]> => {
  const response = await api.put(`/fields/${fieldId}/operating-hours`, { hours });
  return response.data.data;
};

/**
 * Get operating hours for a field
 */
export const getOperatingHours = async (fieldId: string): Promise<OperatingHour[]> => {
  const response = await api.get(`/fields/${fieldId}/operating-hours`);
  return response.data.data;
};

/**
 * Check field availability at a specific time
 */
export const checkAvailability = async (
  fieldId: string,
  dayOfWeek: number,
  time: string
): Promise<boolean> => {
  const response = await api.post(`/fields/${fieldId}/check-availability`, {
    day_of_week: dayOfWeek,
    time,
  });
  return response.data.available;
};
