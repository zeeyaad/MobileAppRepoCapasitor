-- ============================================================================
-- Migration: Add National ID Photos to Booking Participants
-- Description: Add columns for storing national ID front and back photo paths
-- Date: 2026-03-03
-- ============================================================================

-- Add national ID photo fields to booking_participants
ALTER TABLE booking_participants
ADD COLUMN IF NOT EXISTS national_id_front VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS national_id_back VARCHAR(255) NULL;

-- Add comments to columns (PostgreSQL syntax)
COMMENT ON COLUMN booking_participants.national_id_front IS 'Path to front photo of national ID';
COMMENT ON COLUMN booking_participants.national_id_back IS 'Path to back photo of national ID';

-- Add indexes for file path searches (useful for cleanup/verification)
CREATE INDEX IF NOT EXISTS idx_booking_participants_national_id_front ON booking_participants(national_id_front);
CREATE INDEX IF NOT EXISTS idx_booking_participants_national_id_back ON booking_participants(national_id_back);

-- Update existing rows (set to NULL if not provided)
UPDATE booking_participants 
SET national_id_front = NULL, 
    national_id_back = NULL 
WHERE national_id_front IS NULL AND national_id_back IS NULL;

-- Verification query
SELECT 
    COUNT(*) as total_participants,
    COUNT(national_id_front) as with_front_photo,
    COUNT(national_id_back) as with_back_photo,
    COUNT(CASE WHEN national_id_front IS NOT NULL AND national_id_back IS NOT NULL THEN 1 END) as with_both_photos
FROM booking_participants;

COMMIT;
