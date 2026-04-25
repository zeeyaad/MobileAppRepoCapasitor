-- ============================================================================
-- MIGRATION SCRIPT: Bilingual Teams with Training Schedules
-- ============================================================================
-- This script updates the database schema to support:
-- 1. Bilingual team names (name_en, name_ar)
-- 2. Training schedules with flexible day scheduling (days_en, days_ar)
-- 3. Field associations for training (field_id)
-- ============================================================================

-- ============================================================================
-- STEP 1: TEAMS TABLE - Add New Columns
-- ============================================================================

-- Add English team name
ALTER TABLE teams 
ADD COLUMN name_en VARCHAR(255);

-- Add Arabic team name
ALTER TABLE teams 
ADD COLUMN name_ar VARCHAR(255);

-- Add new max_participants column
ALTER TABLE teams 
ADD COLUMN max_participants INT DEFAULT 20;

-- ============================================================================
-- STEP 2: TEAMS TABLE - Migrate Data
-- ============================================================================

-- Migrate existing team names to name_en (preserving existing data)
UPDATE teams 
SET name_en = name 
WHERE name_en IS NULL AND name IS NOT NULL;

-- Set name_ar to same value as name_en (you can edit manually afterward)
UPDATE teams 
SET name_ar = name_en 
WHERE name_ar IS NULL AND name_en IS NOT NULL;

-- Migrate max_members to max_participants
UPDATE teams 
SET max_participants = max_members 
WHERE max_members IS NOT NULL;

-- Make new columns NOT NULL after migration
ALTER TABLE teams 
MODIFY COLUMN name_en VARCHAR(255) NOT NULL;

ALTER TABLE teams 
MODIFY COLUMN name_ar VARCHAR(255) NOT NULL;

-- ============================================================================
-- STEP 3: TEAMS TABLE - Drop Old Columns (CAREFUL: Only do this after backup!)
-- ============================================================================

-- Uncomment these lines only AFTER you've verified the migration was successful
-- ALTER TABLE teams DROP COLUMN name;
-- ALTER TABLE teams DROP COLUMN max_members;

-- ============================================================================
-- STEP 4: TEAM_TRAINING_SCHEDULES TABLE - Add New Columns
-- ============================================================================

-- Add English day names
ALTER TABLE team_training_schedules 
ADD COLUMN days_en VARCHAR(255);

-- Add Arabic day names
ALTER TABLE team_training_schedules 
ADD COLUMN days_ar VARCHAR(255);

-- Add field_id for field association
ALTER TABLE team_training_schedules 
ADD COLUMN field_id INT;

-- Add sport_id for sport association
ALTER TABLE team_training_schedules 
ADD COLUMN sport_id INT;

-- Add status column
ALTER TABLE team_training_schedules 
ADD COLUMN status VARCHAR(50) DEFAULT 'active';

-- Create foreign key for field_id (if fields table exists)
-- ALTER TABLE team_training_schedules 
-- ADD CONSTRAINT fk_team_training_schedule_field 
-- FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 5: TEAM_TRAINING_SCHEDULES TABLE - Migrate Data
-- ============================================================================

-- Migrate day_of_week to days_en (map enum values to English names)
UPDATE team_training_schedules 
SET days_en = 'Monday' 
WHERE days_en IS NULL AND day_of_week = 'MONDAY';

UPDATE team_training_schedules 
SET days_en = 'Tuesday' 
WHERE days_en IS NULL AND day_of_week = 'TUESDAY';

UPDATE team_training_schedules 
SET days_en = 'Wednesday' 
WHERE days_en IS NULL AND day_of_week = 'WEDNESDAY';

UPDATE team_training_schedules 
SET days_en = 'Thursday' 
WHERE days_en IS NULL AND day_of_week = 'THURSDAY';

UPDATE team_training_schedules 
SET days_en = 'Friday' 
WHERE days_en IS NULL AND day_of_week = 'FRIDAY';

UPDATE team_training_schedules 
SET days_en = 'Saturday' 
WHERE days_en IS NULL AND day_of_week = 'SATURDAY';

UPDATE team_training_schedules 
SET days_en = 'Sunday' 
WHERE days_en IS NULL AND day_of_week = 'SUNDAY';

-- Map English days to Arabic
UPDATE team_training_schedules 
SET days_ar = 'الاثنين' 
WHERE days_ar IS NULL AND days_en = 'Monday';

UPDATE team_training_schedules 
SET days_ar = 'الثلاثاء' 
WHERE days_ar IS NULL AND days_en = 'Tuesday';

UPDATE team_training_schedules 
SET days_ar = 'الأربعاء' 
WHERE days_ar IS NULL AND days_en = 'Wednesday';

UPDATE team_training_schedules 
SET days_ar = 'الخميس' 
WHERE days_ar IS NULL AND days_en = 'Thursday';

UPDATE team_training_schedules 
SET days_ar = 'الجمعة' 
WHERE days_ar IS NULL AND days_en = 'Friday';

UPDATE team_training_schedules 
SET days_ar = 'السبت' 
WHERE days_ar IS NULL AND days_en = 'Saturday';

UPDATE team_training_schedules 
SET days_ar = 'الأحد' 
WHERE days_ar IS NULL AND days_en = 'Sunday';

-- Set default status for existing records
UPDATE team_training_schedules 
SET status = 'active' 
WHERE status IS NULL;

-- ============================================================================
-- STEP 6: TEAM_TRAINING_SCHEDULES TABLE - Drop Old Columns (CAREFUL!)
-- ============================================================================

-- Uncomment these lines only AFTER you've verified the migration was successful
-- ALTER TABLE team_training_schedules DROP COLUMN day_of_week;
-- ALTER TABLE team_training_schedules DROP COLUMN location;
-- ALTER TABLE team_training_schedules DROP COLUMN max_participants;

-- ============================================================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the migration:

-- Check teams table
-- SELECT id, name_en, name_ar, max_participants, status 
-- FROM teams 
-- LIMIT 5;

-- Check team_training_schedules table
-- SELECT id, team_id, sport_id, days_en, days_ar, start_time, end_time, field_id, training_fee, status 
-- FROM team_training_schedules 
-- LIMIT 5;

-- Count records
-- SELECT COUNT(*) as total_teams FROM teams;
-- SELECT COUNT(*) as total_schedules FROM team_training_schedules;

-- ============================================================================
-- STEP 8: REVERTING (IF NEEDED)
-- ============================================================================

-- If you need to revert, keep the old columns and update code to read from them
-- Do NOT execute the DROP COLUMN statements in STEP 3 and STEP 6
-- Instead, just update your code to handle both old and new column names

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================
/*

TEAMS TABLE CHANGES:
  OLD COLUMNS              NEW COLUMNS             ACTION
  ───────────────────────────────────────────────────────────
  name                  → name_en                Migrated (keep for now)
                        → name_ar                New (migrated from name_en)
  max_members           → max_participants       Migrated (keep for now)

TEAM_TRAINING_SCHEDULES TABLE CHANGES:
  OLD COLUMNS              NEW COLUMNS             ACTION
  ───────────────────────────────────────────────────────────
  day_of_week           → days_en                Migrated (keep for now)
                        → days_ar                New (mapped from days_en)
  location              → (removed)              No longer needed
  max_participants      → (removed)              Moved to Team entity
                        → field_id               New (associates with field)
                        → sport_id               New (associates with sport)
                        → status                 New (active/inactive/archived)

MIGRATION SAFETY:
  ✅ All data migration is non-destructive
  ✅ Old columns are preserved for now
  ✅ Can be reverted by commenting out DROP statements
  ⚠️  Only drop old columns after verifying new columns work

*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
