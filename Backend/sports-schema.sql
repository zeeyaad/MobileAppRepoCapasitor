-- ============================================================================
-- Sport Activity Management - Database Schema
-- ============================================================================

-- 1. Add Sport Staff Types to staff_types table
-- ============================================================================
INSERT INTO staff_types (code, name_en, name_ar, description_en, description_ar, is_active)
VALUES 
(
    'SPORT_MANAGER',
    'Sport Activity Manager',
    'مدير الأنشطة الرياضية',
    'Can create sports with active status, approve pending sports, set prices, and manage all sport activities',
    'يمكنه إنشاء رياضات بحالة نشطة، الموافقة على الرياضات المعلقة، تحديد الأسعار، وإدارة جميع الأنشطة الرياضية',
    TRUE
),
(
    'SPORT_SPECIALIST',
    'Sport Activity Specialist',
    'أخصائي الأنشطة الرياضية',
    'Can create sports with pending status (requires manager approval), cannot set prices',
    'يمكنه إنشاء رياضات بحالة معلقة (تتطلب موافقة المدير)، لا يمكنه تحديد الأسعار',
    TRUE
)
ON CONFLICT (code) DO NOTHING;

-- 2. Create Sports Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info (Bilingual)
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description_en VARCHAR(500),
    description_ar VARCHAR(500),
    
    -- Pricing & Capacity
    price DECIMAL(10, 2),                    -- NULL means free or TBD
    max_participants INTEGER DEFAULT 0,      -- 0 = unlimited
    
    -- Status & Workflow
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,  -- 'pending', 'active', 'inactive', 'rejected'
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Creator & Approval Tracking
    created_by_staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    approved_by_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    approval_comments TEXT,
    
    -- Media
    sport_image VARCHAR(255),                -- Path to sport image/icon
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT sports_status_check CHECK (status IN ('pending', 'active', 'inactive', 'rejected'))
);

-- 3. Create Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sports_status ON sports(status);
CREATE INDEX IF NOT EXISTS idx_sports_is_active ON sports(is_active);
CREATE INDEX IF NOT EXISTS idx_sports_created_by ON sports(created_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_sports_approved_by ON sports(approved_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_sports_created_at ON sports(created_at DESC);

-- 4. Create Updated Timestamp Trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_sports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sports_updated_at
    BEFORE UPDATE ON sports
    FOR EACH ROW
    EXECUTE FUNCTION update_sports_updated_at();

-- 5. Sample Data (Optional - for testing)
-- ============================================================================
-- Note: Run this only after creating staff members with sport roles

-- Example: Insert sample sports (uncomment to use)
/*
INSERT INTO sports (
    name_en, 
    name_ar, 
    description_en, 
    description_ar, 
    price, 
    status, 
    created_by_staff_id,
    approved_by_staff_id,
    approved_at,
    max_participants
) VALUES 
(
    'Football',
    'كرة القدم',
    'Team sport played with a ball between two teams',
    'رياضة جماعية تُلعب بالكرة بين فريقين',
    100.00,
    'active',
    1,  -- Replace with actual sport manager staff_id
    1,  -- Replace with actual sport manager staff_id
    CURRENT_TIMESTAMP,
    22
),
(
    'Basketball',
    'كرة السلة',
    'Team sport with two teams of five players each',
    'رياضة جماعية يلعبها فريقان من خمسة لاعبين',
    75.00,
    'active',
    1,  -- Replace with actual sport manager staff_id
    1,
    CURRENT_TIMESTAMP,
    10
),
(
    'Swimming',
    'السباحة',
    'Individual or team racing sport using arms and legs',
    'رياضة سباق فردية أو جماعية باستخدام الذراعين والساقين',
    50.00,
    'pending',
    2,  -- Replace with actual sport specialist staff_id
    NULL,
    NULL,
    20
),
(
    'Tennis',
    'التنس',
    'Racket sport played individually or in pairs',
    'رياضة المضرب تُلعب فردياً أو في أزواج',
    60.00,
    'active',
    1,
    1,
    CURRENT_TIMESTAMP,
    4
);
*/

-- 6. Useful Queries
-- ============================================================================

-- Get all pending sports awaiting approval
-- SELECT * FROM sports WHERE status = 'pending' ORDER BY created_at ASC;

-- Get sports created by a specific staff member
-- SELECT * FROM sports WHERE created_by_staff_id = 1;

-- Get sports with prices set
-- SELECT * FROM sports WHERE price IS NOT NULL AND price > 0;

-- Get active sports with their creator details
-- SELECT s.*, st.first_name_en, st.last_name_en
-- FROM sports s
-- JOIN staff st ON s.created_by_staff_id = st.id
-- WHERE s.status = 'active' AND s.is_active = TRUE;

-- Count sports by status
-- SELECT status, COUNT(*) as count FROM sports GROUP BY status;

-- 7. Sample Staff Creation (for testing)
-- ============================================================================
/*
-- Create a Sport Manager account
INSERT INTO accounts (email, password, role, status, is_active)
VALUES ('sport.manager@helwan.edu', 'hashed_password_here', 'staff', 'active', TRUE)
RETURNING id;

-- Use the returned account_id to create staff record
INSERT INTO staff (
    account_id, 
    staff_type_id,  -- Use ID from staff_types where code = 'SPORT_MANAGER'
    first_name_en, 
    first_name_ar,
    last_name_en,
    last_name_ar,
    national_id,
    phone,
    employment_start_date,
    status
) VALUES (
    1,  -- account_id from previous insert
    (SELECT id FROM staff_types WHERE code = 'SPORT_MANAGER'),
    'Ahmed',
    'أحمد',
    'Hassan',
    'حسن',
    '12345678901234',
    '+201234567890',
    '2024-01-01',
    'active'
);

-- Create a Sport Specialist account
INSERT INTO accounts (email, password, role, status, is_active)
VALUES ('sport.specialist@helwan.edu', 'hashed_password_here', 'staff', 'active', TRUE)
RETURNING id;

INSERT INTO staff (
    account_id,
    staff_type_id,  -- Use ID from staff_types where code = 'SPORT_SPECIALIST'
    first_name_en,
    first_name_ar,
    last_name_en,
    last_name_ar,
    national_id,
    phone,
    employment_start_date,
    status
) VALUES (
    2,  -- account_id from previous insert
    (SELECT id FROM staff_types WHERE code = 'SPORT_SPECIALIST'),
    'Sara',
    'سارة',
    'Ali',
    'علي',
    '98765432109876',
    '+201234567891',
    '2024-01-01',
    'active'
);
*/

-- ============================================================================
-- End of Sport Activity Management Schema
-- ============================================================================
