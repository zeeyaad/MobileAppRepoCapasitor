-- ============================================================================
-- Migration: Create Team Training Schedules, Member Teams, and Attendance Tables
-- ============================================================================
-- This migration adds support for team training schedules, member team assignments,
-- and attendance tracking.

-- ============================================================================
-- 1. team_training_schedules Table
-- ============================================================================
CREATE TABLE team_training_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id INTEGER NOT NULL,
  day_of_week VARCHAR(20) NOT NULL 
    CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 20,
  training_fee DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_team_training_team FOREIGN KEY (team_id) 
    REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT check_valid_time_range CHECK (start_time < end_time),
  CONSTRAINT check_positive_participants CHECK (max_participants > 0),
  CONSTRAINT check_positive_fee CHECK (training_fee >= 0)
);

-- Indexes for performance
CREATE INDEX idx_team_training_team_id ON team_training_schedules(team_id);
CREATE INDEX idx_team_training_day_time ON team_training_schedules(team_id, day_of_week, start_time);

-- ============================================================================
-- 2. member_teams Table
-- ============================================================================
CREATE TABLE member_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  left_at TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_member_teams_member FOREIGN KEY (member_id)
    REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_teams_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Unique constraint: One membership per member per team
  CONSTRAINT uq_member_team UNIQUE (member_id, team_id)
);

-- Indexes for performance
CREATE INDEX idx_member_teams_member_id ON member_teams(member_id);
CREATE INDEX idx_member_teams_team_id ON member_teams(team_id);
CREATE INDEX idx_member_teams_status ON member_teams(status);

-- ============================================================================
-- 3. attendance Table
-- ============================================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  training_schedule_id UUID NOT NULL,
  member_team_id UUID,
  attendance_date DATE NOT NULL,
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_attendance_member FOREIGN KEY (member_id)
    REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_schedule FOREIGN KEY (training_schedule_id)
    REFERENCES team_training_schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_member_team FOREIGN KEY (member_team_id)
    REFERENCES member_teams(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_team_id ON attendance(team_id);
CREATE INDEX idx_attendance_training_schedule_id ON attendance(training_schedule_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_member_team ON attendance(member_team_id);

-- ============================================================================
-- 4. Update teams table (add missing columns if needed)
-- ============================================================================
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 20;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_training_schedule_timestamp
BEFORE UPDATE ON team_training_schedules
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
