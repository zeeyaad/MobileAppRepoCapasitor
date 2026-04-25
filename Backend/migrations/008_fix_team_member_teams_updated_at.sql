-- ============================================================================
-- FIX: team_member_teams missing updated_at column used by trigger
-- Version: 008
-- Date: March 4, 2026
-- ============================================================================

BEGIN;

-- Ensure trigger function exists
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure updated_at column exists
ALTER TABLE public.team_member_teams
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS team_member_teams_update_timestamp ON public.team_member_teams;
CREATE TRIGGER team_member_teams_update_timestamp
  BEFORE UPDATE ON public.team_member_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

COMMIT;
