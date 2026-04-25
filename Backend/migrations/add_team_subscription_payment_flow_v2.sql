-- Migration: Add Team Subscription Payment Flow (Enhanced with Payments Table Integration)
-- Description: Adds approval_required flag to teams and payment tracking columns to subscriptions
-- Note: This migration works with the central payments table (create_payments_table.sql)

-- Add approval_required and subscription_price to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10, 2) DEFAULT NULL;

COMMENT ON COLUMN teams.approval_required IS 'If true, team subscriptions require admin approval after payment';
COMMENT ON COLUMN teams.subscription_price IS 'Default subscription price for this team';

-- Add payment and approval tracking columns to team_member_teams
ALTER TABLE team_member_teams
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_id INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_by_staff_id INTEGER DEFAULT NULL;

COMMENT ON COLUMN team_member_teams.subscription_status IS 'Payment flow status: pending_payment, pending_admin_approval, active, cancelled, expired';
COMMENT ON COLUMN team_member_teams.payment_id IS 'Foreign key reference to payments table';
COMMENT ON COLUMN team_member_teams.payment_reference IS 'Payment reference (duplicated from payments table for quick access)';
COMMENT ON COLUMN team_member_teams.payment_completed_at IS 'Timestamp when payment was confirmed';
COMMENT ON COLUMN team_member_teams.admin_approved_at IS 'Timestamp when admin approved the subscription';
COMMENT ON COLUMN team_member_teams.approved_by_staff_id IS 'Staff ID who approved the subscription';

-- Add payment and approval tracking columns to member_teams
ALTER TABLE member_teams
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_id INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_by_staff_id INTEGER DEFAULT NULL;

COMMENT ON COLUMN member_teams.subscription_status IS 'Payment flow status: pending_payment, pending_admin_approval, active, cancelled, expired';
COMMENT ON COLUMN member_teams.payment_id IS 'Foreign key reference to payments table';
COMMENT ON COLUMN member_teams.payment_reference IS 'Payment reference (duplicated from payments table for quick access)';
COMMENT ON COLUMN member_teams.payment_completed_at IS 'Timestamp when payment was confirmed';
COMMENT ON COLUMN member_teams.admin_approved_at IS 'Timestamp when admin approved the subscription';
COMMENT ON COLUMN member_teams.approved_by_staff_id IS 'Staff ID who approved the subscription';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_member_teams_subscription_status ON team_member_teams(subscription_status);
CREATE INDEX IF NOT EXISTS idx_team_member_teams_payment_id ON team_member_teams(payment_id);
CREATE INDEX IF NOT EXISTS idx_member_teams_subscription_status ON member_teams(subscription_status);
CREATE INDEX IF NOT EXISTS idx_member_teams_payment_id ON member_teams(payment_id);
CREATE INDEX IF NOT EXISTS idx_teams_approval_required ON teams(approval_required);

-- Add foreign key constraints (if payments table exists)
-- Note: Run create_payments_table.sql first, then run this migration
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        -- Add foreign key for team_member_teams
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_team_member_teams_payment'
        ) THEN
            ALTER TABLE team_member_teams
            ADD CONSTRAINT fk_team_member_teams_payment
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
        END IF;

        -- Add foreign key for member_teams
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_member_teams_payment'
        ) THEN
            ALTER TABLE member_teams
            ADD CONSTRAINT fk_member_teams_payment
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;
