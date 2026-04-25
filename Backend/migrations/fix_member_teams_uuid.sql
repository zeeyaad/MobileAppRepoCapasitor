-- ============================================================================
-- Migration: Fix member_teams.team_id - Convert from INTEGER to UUID
-- ============================================================================
-- This migration converts the team_id column from INTEGER to UUID to match
-- the teams table structure, allowing proper foreign key relationship

-- Step 1: Drop existing data or backup if needed
-- (Optional - uncomment if you want to keep old data)
-- CREATE TABLE member_teams_backup AS SELECT * FROM member_teams;

-- Step 2: Drop the old team_id column
ALTER TABLE member_teams DROP COLUMN team_id;

-- Step 3: Add new team_id column as UUID
ALTER TABLE member_teams ADD COLUMN team_id UUID NOT NULL;

-- Step 4: Add foreign key constraint to teams table
ALTER TABLE member_teams 
ADD CONSTRAINT fk_member_teams_team FOREIGN KEY (team_id)
REFERENCES teams(id) ON DELETE CASCADE;

-- Step 5: Create index for performance
CREATE INDEX idx_member_teams_team_id_uuid ON member_teams(team_id);

-- ============================================================================
-- End of Migration
-- ============================================================================

-- NOTE: If you have existing data with old integer team_id values,
-- you'll need to manually update those records with the correct UUID values
-- from the teams table before running this migration.
--
-- Example:
-- UPDATE member_teams mt 
-- SET team_id = (SELECT id FROM teams WHERE old_id = mt.team_id)
-- WHERE team_id IS NOT NULL;
