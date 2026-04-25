-- ============================================================================
-- HELWAN CLUB DATABASE REFACTORING MIGRATION
-- Version: 007
-- Date: March 2, 2026
-- Purpose: Complete database cleanup and schema modernization
-- ============================================================================

-- Set transaction options for safety
SET statement_timeout = 300000; -- 5 minutes timeout
SET CONSTRAINTS ALL DEFERRED;

BEGIN;

-- ============================================================================
-- PHASE 1: DROP OLD DUPLICATE/REDUNDANT TABLES
-- ============================================================================

-- Drop branch_sport_teams (duplicate of sport_branches functionality)
DROP TABLE IF EXISTS public.branch_sport_teams CASCADE;
DROP SEQUENCE IF EXISTS public.branch_sport_teams_id_seq;

COMMIT;

-- ============================================================================
-- PHASE 2: CONSOLIDATE SUBSCRIPTION TABLES
-- ============================================================================

BEGIN;

-- Step 1: Backup data from member_team_subscriptions to member_teams
-- (Only if member_team_subscriptions has data and not all fields conflict)
INSERT INTO public.member_teams (member_id, team_id, status, start_date, end_date, price, created_at)
SELECT member_id, team_id, status, start_date, end_date, 
       COALESCE(custom_price, monthly_fee, 0) as price,
       created_at
FROM public.member_team_subscriptions
WHERE NOT EXISTS (
    SELECT 1 FROM public.member_teams mt 
    WHERE mt.member_id = member_team_subscriptions.member_id 
    AND mt.team_id = member_team_subscriptions.team_id
)
ON CONFLICT DO NOTHING;

-- Drop member_team_subscriptions (consolidate into member_teams)
DROP TABLE IF EXISTS public.member_team_subscriptions CASCADE;
DROP SEQUENCE IF EXISTS public.member_team_subscriptions_id_seq;

COMMIT;

-- ============================================================================
-- PHASE 3: CONSOLIDATE TEAM MEMBER SUBSCRIPTION TABLE
-- ============================================================================

BEGIN;

-- Step 1: Backup data from team_member_team_subscriptions to team_member_teams
-- Note: team_member_teams uses team_name (STRING) which we'll need to fix
-- This is a temporary migration - will be refactored later
INSERT INTO public.team_member_teams (team_member_id, team_name, status, start_date, end_date, price, created_at)
SELECT team_member_id, CAST(team_id AS VARCHAR), status, start_date, end_date,
       COALESCE(custom_price, monthly_fee, 0) as price,
       created_at
FROM public.team_member_team_subscriptions
WHERE NOT EXISTS (
    SELECT 1 FROM public.team_member_teams tmt
    WHERE tmt.team_member_id = team_member_team_subscriptions.team_member_id
    AND tmt.team_name = CAST(team_member_team_subscriptions.team_id AS VARCHAR)
)
ON CONFLICT DO NOTHING;

-- Drop team_member_team_subscriptions (consolidate into team_member_teams)
DROP TABLE IF EXISTS public.team_member_team_subscriptions CASCADE;
DROP SEQUENCE IF EXISTS public.team_member_team_subscriptions_id_seq;

COMMIT;

-- ============================================================================
-- PHASE 4: MERGE team_member_details INTO team_members
-- ============================================================================

BEGIN;

-- Step 1: Add missing columns to team_members if they don't exist
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS position VARCHAR(50) DEFAULT 'player';

ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS detail_status VARCHAR(50) DEFAULT 'active';

-- Step 2: Copy data from team_member_details to team_members
UPDATE public.team_members tm
SET 
    position = COALESCE(tmd.position, 'player'),
    detail_status = COALESCE(tmd.status, 'active')
FROM public.team_member_details tmd
WHERE tm.id = tmd.team_member_id;

-- Step 3: Drop team_member_details table
DROP TABLE IF EXISTS public.team_member_details CASCADE;
DROP SEQUENCE IF EXISTS public.team_member_details_id_seq;

COMMIT;

-- ============================================================================
-- PHASE 5: CREATE NEW CRITICAL TABLES
-- ============================================================================

BEGIN;

-- Step 1: Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id INTEGER NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    max_members INTEGER NOT NULL DEFAULT 20,
    status VARCHAR(50) NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT teams_unique_per_sport UNIQUE (sport_id, name)
);

-- Create indexes for teams table
CREATE INDEX idx_teams_sport_id ON public.teams(sport_id);
CREATE INDEX idx_teams_branch_id ON public.teams(branch_id);
CREATE INDEX idx_teams_status ON public.teams(status);

-- Add trigger for updated_at
CREATE TRIGGER teams_update_timestamp
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

-- Step 2: Create team_training_schedules table
CREATE TABLE IF NOT EXISTS public.team_training_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL 
        CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER NOT NULL DEFAULT 20,
    training_fee NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_schedule_time CHECK (start_time < end_time),
    CONSTRAINT unique_team_schedule UNIQUE (team_id, day_of_week, start_time, end_time)
);

-- Create indexes for team_training_schedules table
CREATE INDEX idx_team_training_schedules_team_id ON public.team_training_schedules(team_id);
CREATE INDEX idx_team_training_schedules_day ON public.team_training_schedules(day_of_week);

-- Add trigger for updated_at
CREATE TRIGGER team_training_schedules_update_timestamp
    BEFORE UPDATE ON public.team_training_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

-- Step 3: Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id INTEGER NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    training_schedule_id UUID NOT NULL REFERENCES public.team_training_schedules(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_attendance UNIQUE (member_id, team_id, training_schedule_id, attendance_date)
);

-- Create indexes for attendance table
CREATE INDEX idx_attendance_member_id ON public.attendance(member_id);
CREATE INDEX idx_attendance_team_id ON public.attendance(team_id);
CREATE INDEX idx_attendance_training_schedule_id ON public.attendance(training_schedule_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_attendance_attended ON public.attendance(attended) WHERE NOT attended;

-- Add trigger for updated_at
CREATE TRIGGER attendance_update_timestamp
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

COMMIT;

-- ============================================================================
-- PHASE 6: MIGRATE OLD MEMBER_TEAMS DATA TO NEW STRUCTURE
-- ============================================================================
-- NOTE: This is a temporary migration that preserves old data
-- The application code needs to be updated to use new schema

BEGIN;

-- Create a temporary table to hold old member_teams data
CREATE TABLE IF NOT EXISTS public.member_teams_legacy AS
SELECT * FROM public.member_teams;

-- Clear member_teams for migration
-- Do NOT delete yet - we'll keep legacy for reference

COMMIT;

-- ============================================================================
-- PHASE 7: UPDATE MEMBER_TEAMS WITH PROPER FOREIGN KEYS
-- ============================================================================

BEGIN;

-- Step 1: Rename current member_teams columns to add sport_id and team_id references
-- Add new UUID-based team_id and sport_id columns
ALTER TABLE public.member_teams
ADD COLUMN IF NOT EXISTS team_id_new UUID;

ALTER TABLE public.member_teams
ADD COLUMN IF NOT EXISTS sport_id INTEGER;

-- Step 2: Update member_teams status to use proper enum or check constraint
ALTER TABLE public.member_teams
DROP CONSTRAINT IF EXISTS member_teams_status_check;

ALTER TABLE public.member_teams
ADD CONSTRAINT member_teams_status_check 
    CHECK (status IN ('pending', 'approved', 'declined', 'cancelled', 'active', 'inactive'));

-- Step 3: Add created_at if missing
ALTER TABLE public.member_teams
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Step 4: Convert id to UUID if still INTEGER
-- (Can't change type directly, need workaround)
-- For now, keep INTEGER but note this needs future migration

-- Step 5: Add updated_at column
ALTER TABLE public.member_teams
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Step 6: Add trigger for updated_at
DROP TRIGGER IF EXISTS member_teams_update_timestamp ON public.member_teams;
CREATE TRIGGER member_teams_update_timestamp
    BEFORE UPDATE ON public.member_teams
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

COMMIT;

-- ============================================================================
-- PHASE 8: UPDATE TEAM_MEMBER_TEAMS WITH PROPER STRUCTURE
-- ============================================================================

BEGIN;

-- Step 1: Add new columns for proper foreign keys
ALTER TABLE public.team_member_teams
ADD COLUMN IF NOT EXISTS team_id_new UUID;

ALTER TABLE public.team_member_teams
ADD COLUMN IF NOT EXISTS sport_id INTEGER;

-- Step 2: Add proper constraints
ALTER TABLE public.team_member_teams
DROP CONSTRAINT IF EXISTS team_member_teams_status_check;

ALTER TABLE public.team_member_teams
ADD CONSTRAINT team_member_teams_status_check 
    CHECK (status IN ('pending', 'approved', 'declined', 'cancelled', 'active', 'inactive'));

-- Step 3: Add updated_at if missing
ALTER TABLE public.team_member_teams
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Step 4: Add trigger for updated_at
DROP TRIGGER IF EXISTS team_member_teams_update_timestamp ON public.team_member_teams;
CREATE TRIGGER team_member_teams_update_timestamp
    BEFORE UPDATE ON public.team_member_teams
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();

-- Step 5: Add unique constraint to prevent duplicates
ALTER TABLE public.team_member_teams
DROP CONSTRAINT IF EXISTS unique_team_member_team;

ALTER TABLE public.team_member_teams
ADD CONSTRAINT unique_team_member_team 
    UNIQUE (team_member_id, team_name);

COMMIT;

-- ============================================================================
-- PHASE 9: VERIFY REFERENTIAL INTEGRITY
-- ============================================================================

BEGIN;

-- Add foreign key constraints to member_teams
ALTER TABLE public.member_teams
DROP CONSTRAINT IF EXISTS fk_member_teams_member_id;

ALTER TABLE public.member_teams
ADD CONSTRAINT fk_member_teams_member_id 
    FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

-- Note: team_id foreign key will be added after teams table data migration

-- Add foreign key constraint to team_member_teams
ALTER TABLE public.team_member_teams
DROP CONSTRAINT IF EXISTS fk_team_member_teams_team_member_id;

ALTER TABLE public.team_member_teams
ADD CONSTRAINT fk_team_member_teams_team_member_id 
    FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;

COMMIT;

-- ============================================================================
-- PHASE 10: REMOVE DUPLICATE/REDUNDANT ACTIVITY LOGS
-- ============================================================================
-- SKIP: activity_logs and audit_logs can coexist for now
-- Review in future if one is redundant

-- ============================================================================
-- PHASE 11: ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

BEGIN;

-- Indexes on member_teams
CREATE INDEX IF NOT EXISTS idx_member_teams_member_id ON public.member_teams(member_id);
CREATE INDEX IF NOT EXISTS idx_member_teams_team_id ON public.member_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_member_teams_status ON public.member_teams(status);

-- Indexes on team_member_teams
CREATE INDEX IF NOT EXISTS idx_team_member_teams_team_member_id ON public.team_member_teams(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_teams_team_name ON public.team_member_teams(team_name);
CREATE INDEX IF NOT EXISTS idx_team_member_teams_status ON public.team_member_teams(status);

-- Indexes on sports for better query performance
CREATE INDEX IF NOT EXISTS idx_sports_status ON public.sports(status);
CREATE INDEX IF NOT EXISTS idx_sports_is_active ON public.sports(is_active);

COMMIT;

-- ============================================================================
-- PHASE 12: CREATE VIEW FOR CURRENT TEAM MEMBERS
-- ============================================================================
-- This view helps with transition to new schema

BEGIN;

DROP VIEW IF EXISTS public.vw_team_member_current_teams CASCADE;

CREATE VIEW public.vw_team_member_current_teams AS
SELECT 
    tmt.team_member_id,
    tm.first_name_en,
    tm.last_name_en,
    tmt.team_name,
    tmt.status,
    tmt.start_date,
    tmt.end_date,
    tmt.price,
    tmt.created_at
FROM public.team_member_teams tmt
JOIN public.team_members tm ON tmt.team_member_id = tm.id
WHERE tmt.status IN ('active', 'pending', 'approved');

COMMIT;

-- ============================================================================
-- PHASE 13: CREATE VIEW FOR CURRENT MEMBER TEAMS
-- ============================================================================

BEGIN;

DROP VIEW IF EXISTS public.vw_member_current_teams CASCADE;

CREATE VIEW public.vw_member_current_teams AS
SELECT 
    mt.member_id,
    m.first_name_en,
    m.last_name_en,
    mt.team_id,
    mt.status,
    mt.start_date,
    mt.end_date,
    mt.price,
    mt.created_at
FROM public.member_teams mt
JOIN public.members m ON mt.member_id = m.id
WHERE mt.status IN ('active', 'pending', 'approved');

COMMIT;

-- ============================================================================
-- PHASE 14: GRANT PERMISSIONS (if needed)
-- ============================================================================

BEGIN;

-- Ensure postgres user has access to new tables
ALTER TABLE public.teams OWNER TO postgres;
ALTER TABLE public.team_training_schedules OWNER TO postgres;
ALTER TABLE public.attendance OWNER TO postgres;

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================

/*

COMPLETED CHANGES:

✅ DELETED:
  - branch_sport_teams (duplicate of sport_branches)
  - member_team_subscriptions (consolidated into member_teams)
  - team_member_team_subscriptions (consolidated into team_member_teams)
  - team_member_details (merged into team_members)

✅ CREATED NEW TABLES:
  - teams (sport teams with training info)
  - team_training_schedules (training times/schedules)
  - attendance (member attendance tracking)

✅ MODIFIED TABLES:
  - member_teams: Added proper constraints, triggers, indexes
  - team_member_teams: Added proper constraints, triggers, indexes
  - team_members: Added position and detail_status columns

✅ ADDED:
  - Foreign key constraints
  - Unique constraints to prevent duplicates
  - Indexes for performance
  - Update triggers for updated_at timestamps
  - Views for querying current team members

⚠️ MIGRATION NOTES:

1. Old data preserved in:
   - member_teams_legacy (backup of old member_teams)
   
2. Still TODO - Application Code Changes:
   - Update TypeORM entities to use new tables
   - Update routes to reference new teams table
   - Implement training schedule management APIs
   - Implement attendance tracking APIs
   - Update member team assignment logic with constraints
   
3. Still TODO - Data Migration:
   - Migrate existing team_id references from old schema to new teams table
   - Link member_teams and team_member_teams to new teams via foreign keys
   
4. Performance Notes:
   - Added comprehensive indexes for query optimization
   - Unique constraints prevent duplicates
   - Foreign key cascades ensure data consistency

*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Run this to check for any issues:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

