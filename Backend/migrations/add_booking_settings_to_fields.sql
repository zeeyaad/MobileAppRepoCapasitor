-- ============================================================================
-- DATABASE MIGRATION: Add Booking Settings to Fields Table
-- ============================================================================
-- Purpose: Add booking availability and slot duration settings to fields
-- Date: 2026-03-03
-- Author: GitHub Copilot
-- ============================================================================

BEGIN;

-- Add booking settings columns to fields table
ALTER TABLE fields 
ADD COLUMN IF NOT EXISTS is_available_for_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_slot_duration INTEGER DEFAULT 60;

-- Add comments for documentation
COMMENT ON COLUMN fields.is_available_for_booking IS 'Whether this field can be booked by members/team members';
COMMENT ON COLUMN fields.booking_slot_duration IS 'Booking time slot duration in minutes (e.g., 60 for 1-hour slots)';

-- Create index for faster queries on bookable fields
CREATE INDEX IF NOT EXISTS idx_fields_bookable ON fields(is_available_for_booking) WHERE is_available_for_booking = true;

-- Optional: Set existing fields as not bookable by default (safe approach)
-- If you want some fields to be immediately bookable, update them manually after running this script
UPDATE fields SET is_available_for_booking = false WHERE is_available_for_booking IS NULL;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that columns were added successfully
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'fields' 
  AND column_name IN ('is_available_for_booking', 'booking_slot_duration')
ORDER BY ordinal_position;

-- View all fields with their booking settings
SELECT 
    id,
    name_en,
    name_ar,
    status,
    is_available_for_booking,
    booking_slot_duration,
    hourly_rate
FROM fields
ORDER BY created_at DESC
LIMIT 10;

-- Count bookable vs non-bookable fields
SELECT 
    is_available_for_booking,
    COUNT(*) as field_count
FROM fields
GROUP BY is_available_for_booking;

-- ============================================================================
-- ROLLBACK SCRIPT (Use if needed)
-- ============================================================================
-- Run this if you need to undo the migration:
/*
BEGIN;
DROP INDEX IF EXISTS idx_fields_bookable;
ALTER TABLE fields DROP COLUMN IF EXISTS is_available_for_booking;
ALTER TABLE fields DROP COLUMN IF EXISTS booking_slot_duration;
COMMIT;
*/
