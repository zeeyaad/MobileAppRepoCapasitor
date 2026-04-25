-- ============================================================================
-- DATABASE VIEWS FOR HELWAN CLUB MANAGEMENT SYSTEM
-- ============================================================================
-- Created: March 10, 2026
-- Purpose: Provide simplified access to complex data relationships
-- Usage: Run this script in Supabase SQL Editor or PostgreSQL client
-- ============================================================================

-- ============================================================================
-- 1. MEMBER VIEWS
-- ============================================================================

-- View: Complete Member Information
-- Purpose: Get full member details with account, type, and relationships
DROP VIEW IF EXISTS view_members_complete CASCADE;
CREATE OR REPLACE VIEW view_members_complete AS
SELECT 
    m.id,
    m.account_id,
    a.email,
    a.role,
    a.status as account_status,
    m.first_name_en,
    m.first_name_ar,
    m.last_name_en,
    m.last_name_ar,
    CONCAT(m.first_name_en, ' ', m.last_name_en) as full_name_en,
    CONCAT(m.first_name_ar, ' ', m.last_name_ar) as full_name_ar,
    m.national_id,
    m.gender,
    m.phone,
    m.nationality,
    m.birthdate,
    EXTRACT(YEAR FROM AGE(m.birthdate)) as age,
    m.health_status,
    m.is_foreign,
    m.medical_report,
    m.member_type_id,
    mt.name_en as member_type_en,
    mt.name_ar as member_type_ar,
    mt.description_en as member_type_description_en,
    mt.description_ar as member_type_description_ar,
    m.points_balance,
    m.status as member_status,
    m.address,
    m.photo,
    m.national_id_front,
    m.national_id_back,
    m.created_at,
    m.updated_at
FROM members m
JOIN accounts a ON m.account_id = a.id
JOIN member_types mt ON m.member_type_id = mt.id;

COMMENT ON VIEW view_members_complete IS 'Complete member information including account and type details';


-- View: Active Members Summary
-- Purpose: Quick view of active members with key information
DROP VIEW IF EXISTS view_active_members CASCADE;
CREATE OR REPLACE VIEW view_active_members AS
SELECT 
    m.id,
    CONCAT(m.first_name_en, ' ', m.last_name_en) as full_name_en,
    CONCAT(m.first_name_ar, ' ', m.last_name_ar) as full_name_ar,
    a.email,
    m.phone,
    m.national_id,
    mt.name_en as member_type,
    EXTRACT(YEAR FROM AGE(m.birthdate)) as age,
    m.points_balance,
    a.last_login,
    m.created_at
FROM members m
JOIN accounts a ON m.account_id = a.id
JOIN member_types mt ON m.member_type_id = mt.id
WHERE m.status = 'active' AND a.is_active = true;

COMMENT ON VIEW view_active_members IS 'List of active members with essential information';


-- ============================================================================
-- 2. MEMBERSHIP & SUBSCRIPTION VIEWS
-- ============================================================================

-- View: Active Memberships
-- Purpose: Current active membership subscriptions with details
DROP VIEW IF EXISTS view_active_memberships CASCADE;
CREATE OR REPLACE VIEW view_active_memberships AS
SELECT 
    mm.id as membership_id,
    m.id as member_id,
    CONCAT(m.first_name_en, ' ', m.last_name_en) as member_name_en,
    CONCAT(m.first_name_ar, ' ', m.last_name_ar) as member_name_ar,
    a.email,
    m.phone,
    mp.name_en as plan_name_en,
    mp.name_ar as plan_name_ar,
    mp.plan_code,
    mp.price,
    mp.currency,
    mp.duration_months,
    mm.start_date,
    mm.end_date,
    mm.status,
    mm.payment_status,
    CASE 
        WHEN mm.end_date < CURRENT_DATE THEN 'expired'
        WHEN mm.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'active'
    END as renewal_status,
    mm.created_at,
    mm.updated_at
FROM member_memberships mm
JOIN members m ON mm.member_id = m.id
JOIN accounts a ON m.account_id = a.id
JOIN membership_plans mp ON mm.membership_plan_id = mp.id
WHERE mm.status = 'active';

COMMENT ON VIEW view_active_memberships IS 'Active membership subscriptions with expiration tracking';


-- View: Membership Revenue Summary
-- Purpose: Calculate revenue by membership plan
DROP VIEW IF EXISTS view_membership_revenue CASCADE;
CREATE OR REPLACE VIEW view_membership_revenue AS
SELECT 
    mp.id as plan_id,
    mp.name_en as plan_name_en,
    mp.name_ar as plan_name_ar,
    mp.plan_code,
    mp.price,
    mp.currency,
    COUNT(mm.id) as total_subscriptions,
    COUNT(CASE WHEN mm.status = 'active' THEN 1 END) as active_subscriptions,
    SUM(CASE WHEN mm.status = 'active' THEN mp.price ELSE 0 END) as active_revenue,
    SUM(mp.price) as total_revenue,
    MIN(mm.start_date) as first_subscription_date,
    MAX(mm.start_date) as latest_subscription_date
FROM membership_plans mp
LEFT JOIN member_memberships mm ON mp.id = mm.membership_plan_id
GROUP BY mp.id, mp.name_en, mp.name_ar, mp.plan_code, mp.price, mp.currency;

COMMENT ON VIEW view_membership_revenue IS 'Revenue analysis by membership plan';


-- ============================================================================
-- 3. TEAM & SPORTS VIEWS
-- ============================================================================

-- View: Teams with Members Count
-- Purpose: Team information with current member statistics
DROP VIEW IF EXISTS view_teams_summary CASCADE;
CREATE OR REPLACE VIEW view_teams_summary AS
SELECT 
    t.id as team_id,
    t.name_en as team_name_en,
    t.name_ar as team_name_ar,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    s.id as sport_id,
    b.name_en as branch_name_en,
    b.name_ar as branch_name_ar,
    t.max_participants as capacity,
    COUNT(DISTINCT mt.member_id) as member_count,
    COUNT(DISTINCT tmt.team_member_id) as team_member_count,
    COUNT(DISTINCT mt.member_id) + COUNT(DISTINCT tmt.team_member_id) as total_count,
    t.max_participants - (COUNT(DISTINCT mt.member_id) + COUNT(DISTINCT tmt.team_member_id)) as available_slots,
    t.status,
    t.created_at,
    t.updated_at
FROM teams t
JOIN sports s ON t.sport_id = s.id
LEFT JOIN branches b ON t.branch_id = b.id
LEFT JOIN member_teams mt ON t.id = mt.team_id AND mt.status = 'active'
LEFT JOIN team_member_teams tmt ON t.id = tmt.team_id AND tmt.status = 'active'
GROUP BY t.id, t.name_en, t.name_ar, s.name_en, s.name_ar, s.id, 
         b.name_en, b.name_ar, t.max_participants, t.status, t.created_at, t.updated_at;

COMMENT ON VIEW view_teams_summary IS 'Team information with member counts and capacity';


-- View: Team Members Complete
-- Purpose: All team members (both regular members and team_members) unified
DROP VIEW IF EXISTS view_team_members_complete CASCADE;
CREATE OR REPLACE VIEW view_team_members_complete AS
-- Regular Members in Teams
SELECT 
    'member' as member_type,
    mt.id as enrollment_id,
    m.id as person_id,
    CONCAT(m.first_name_en, ' ', m.last_name_en) as full_name_en,
    CONCAT(m.first_name_ar, ' ', m.last_name_ar) as full_name_ar,
    a.email,
    m.phone,
    m.national_id,
    t.id as team_id,
    t.name_en as team_name_en,
    t.name_ar as team_name_ar,
    s.id as sport_id,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    mt.status,
    mt.subscription_status,
    mt.price,
    mt.start_date as joined_at,
    mt.created_at,
    mt.updated_at
FROM member_teams mt
JOIN members m ON mt.member_id = m.id
JOIN accounts a ON m.account_id = a.id
JOIN teams t ON mt.team_id = t.id
JOIN sports s ON t.sport_id = s.id

UNION ALL

-- Team Members in Teams
SELECT 
    'team_member' as member_type,
    tmt.id as enrollment_id,
    tm.id as person_id,
    CONCAT(tm.first_name_en, ' ', tm.last_name_en) as full_name_en,
    CONCAT(tm.first_name_ar, ' ', tm.last_name_ar) as full_name_ar,
    tma.email,
    tm.phone,
    tm.national_id,
    t.id as team_id,
    t.name_en as team_name_en,
    t.name_ar as team_name_ar,
    s.id as sport_id,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    tmt.status,
    tmt.subscription_status,
    tmt.price,
    tmt.start_date as joined_at,
    tmt.created_at,
    tmt.updated_at
FROM team_member_teams tmt
JOIN team_members tm ON tmt.team_member_id = tm.id
JOIN accounts tma ON tm.account_id = tma.id
JOIN teams t ON tmt.team_id = t.id
JOIN sports s ON t.sport_id = s.id;

COMMENT ON VIEW view_team_members_complete IS 'Unified view of all team members from both members and team_members tables';


-- ============================================================================
-- 4. BOOKING & FIELD VIEWS
-- ============================================================================

-- View: Booking Details Complete
-- Purpose: Comprehensive booking information with all related data
DROP VIEW IF EXISTS view_bookings_complete CASCADE;
CREATE OR REPLACE VIEW view_bookings_complete AS
SELECT 
    b.id as booking_id,
    b.share_token,
    -- Member/Team Member Info
    CASE 
        WHEN b.member_id IS NOT NULL THEN 'member'
        WHEN b.team_member_id IS NOT NULL THEN 'team_member'
    END as booker_type,
    COALESCE(b.member_id, b.team_member_id) as booker_id,
    CASE 
        WHEN b.member_id IS NOT NULL THEN CONCAT(m.first_name_en, ' ', m.last_name_en)
        WHEN b.team_member_id IS NOT NULL THEN CONCAT(tm.first_name_en, ' ', tm.last_name_en)
    END as booker_name_en,
    CASE 
        WHEN b.member_id IS NOT NULL THEN CONCAT(m.first_name_ar, ' ', m.last_name_ar)
        WHEN b.team_member_id IS NOT NULL THEN CONCAT(tm.first_name_ar, ' ', tm.last_name_ar)
    END as booker_name_ar,
    COALESCE(ma.email, tma.email) as booker_email,
    COALESCE(m.phone, tm.phone) as booker_phone,
    -- Field & Sport Info
    f.id as field_id,
    f.name_en as field_name_en,
    f.name_ar as field_name_ar,
    s.id as sport_id,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    -- Booking Details
    b.start_time,
    b.end_time,
    b.duration_minutes,
    b.price,
    b.status,
    b.payment_reference,
    b.payment_completed_at,
    b.expected_participants,
    COUNT(bp.id) as actual_participants,
    b.notes,
    b.language,
    b.created_at,
    b.updated_at,
    b.completed_at,
    b.cancelled_at,
    -- Status Indicators
    CASE 
        WHEN b.status = 'completed' THEN 'completed'
        WHEN b.status = 'cancelled' THEN 'cancelled'
        WHEN b.end_time < CURRENT_TIMESTAMP THEN 'expired'
        WHEN b.start_time <= CURRENT_TIMESTAMP AND b.end_time > CURRENT_TIMESTAMP THEN 'in_progress'
        WHEN b.start_time > CURRENT_TIMESTAMP THEN 'upcoming'
        ELSE 'unknown'
    END as booking_state
FROM bookings b
JOIN fields f ON b.field_id = f.id
JOIN sports s ON b.sport_id = s.id
LEFT JOIN members m ON b.member_id = m.id
LEFT JOIN accounts ma ON m.account_id = ma.id
LEFT JOIN team_members tm ON b.team_member_id = tm.id
LEFT JOIN accounts tma ON tm.account_id = tma.id
LEFT JOIN booking_participants bp ON b.id = bp.booking_id
GROUP BY b.id, b.share_token, b.member_id, b.team_member_id, 
         m.first_name_en, m.first_name_ar, m.last_name_en, m.last_name_ar, ma.email, m.phone,
         tm.first_name_en, tm.first_name_ar, tm.last_name_en, tm.last_name_ar, tma.email, tm.phone,
         f.id, f.name_en, f.name_ar,
         s.id, s.name_en, s.name_ar,
         b.start_time, b.end_time, b.duration_minutes, b.price, b.status, 
         b.payment_reference, b.payment_completed_at, b.expected_participants,
         b.notes, b.language, b.created_at, b.updated_at, b.completed_at, b.cancelled_at;

COMMENT ON VIEW view_bookings_complete IS 'Complete booking information with member, field, sport, and participant details';


-- View: Field Utilization
-- Purpose: Track field usage and availability
DROP VIEW IF EXISTS view_field_utilization CASCADE;
CREATE OR REPLACE VIEW view_field_utilization AS
SELECT 
    f.id as field_id,
    f.name_en as field_name_en,
    f.name_ar as field_name_ar,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    f.capacity,
    f.hourly_rate,
    f.status as field_status,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
    SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.duration_minutes ELSE 0 END) as total_booked_minutes,
    SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.price ELSE 0 END) as total_revenue,
    AVG(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.price ELSE NULL END) as avg_booking_price
FROM fields f
JOIN sports s ON f.sport_id = s.id
LEFT JOIN bookings b ON f.id = b.field_id
GROUP BY f.id, f.name_en, f.name_ar, s.name_en, s.name_ar, 
         f.capacity, f.hourly_rate, f.status;

COMMENT ON VIEW view_field_utilization IS 'Field usage statistics and revenue tracking';


-- View: Upcoming Bookings
-- Purpose: Future bookings for scheduling and planning
DROP VIEW IF EXISTS view_upcoming_bookings CASCADE;
CREATE OR REPLACE VIEW view_upcoming_bookings AS
SELECT 
    b.id as booking_id,
    b.start_time,
    b.end_time,
    b.duration_minutes,
    CASE 
        WHEN b.member_id IS NOT NULL THEN CONCAT(m.first_name_en, ' ', m.last_name_en)
        WHEN b.team_member_id IS NOT NULL THEN CONCAT(tm.first_name_en, ' ', tm.last_name_en)
    END as booker_name,
    COALESCE(m.phone, tm.phone) as contact_phone,
    f.name_en as field_name_en,
    f.name_ar as field_name_ar,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    b.price,
    b.status,
    b.expected_participants,
    EXTRACT(EPOCH FROM (b.start_time - CURRENT_TIMESTAMP))/3600 as hours_until_start,
    b.created_at
FROM bookings b
JOIN fields f ON b.field_id = f.id
JOIN sports s ON b.sport_id = s.id
LEFT JOIN members m ON b.member_id = m.id
LEFT JOIN team_members tm ON b.team_member_id = tm.id
WHERE b.start_time > CURRENT_TIMESTAMP 
  AND b.status IN ('confirmed', 'pending_payment')
ORDER BY b.start_time ASC;

COMMENT ON VIEW view_upcoming_bookings IS 'List of future bookings for scheduling purposes';


-- ============================================================================
-- 5. PAYMENT & FINANCIAL VIEWS
-- ============================================================================

-- View: Payment Summary
-- Purpose: Comprehensive payment tracking across all entities
DROP VIEW IF EXISTS view_payments_summary CASCADE;
CREATE OR REPLACE VIEW view_payments_summary AS
SELECT 
    p.id as payment_id,
    p.entity_type,
    p.entity_id,
    -- Entity Details
    CASE p.entity_type
        WHEN 'member' THEN CONCAT(m.first_name_en, ' ', m.last_name_en)
        WHEN 'team_member' THEN CONCAT(tm.first_name_en, ' ', tm.last_name_en)
        WHEN 'staff' THEN CONCAT(st.first_name_en, ' ', st.last_name_en)
        ELSE 'Unknown'
    END as payer_name,
    -- Payment Details
    p.amount,
    p.currency,
    p.payment_method,
    p.payment_type,
    p.status as payment_status,
    p.payment_reference,
    p.related_entity_type,
    p.related_entity_id,
    p.description,
    p.notes,
    p.created_at,
    p.completed_at,
    p.updated_at,
    -- Time Analysis
    CASE 
        WHEN p.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (p.completed_at - p.created_at))/60 
        ELSE NULL 
    END as completion_time_minutes
FROM payments p
LEFT JOIN members m ON p.entity_type = 'member' AND p.entity_id = m.id
LEFT JOIN team_members tm ON p.entity_type = 'team_member' AND p.entity_id = tm.id
LEFT JOIN staff st ON p.entity_type = 'staff' AND p.entity_id = st.id;

COMMENT ON VIEW view_payments_summary IS 'Unified payment tracking across all entity types';


-- View: Revenue by Payment Type
-- Purpose: Financial analysis by payment category
DROP VIEW IF EXISTS view_revenue_by_type CASCADE;
CREATE OR REPLACE VIEW view_revenue_by_type AS
SELECT 
    p.payment_type,
    p.currency,
    COUNT(p.id) as transaction_count,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as average_amount,
    MIN(p.amount) as min_amount,
    MAX(p.amount) as max_amount,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as completed_revenue,
    MIN(p.created_at) as first_transaction,
    MAX(p.created_at) as latest_transaction
FROM payments p
GROUP BY p.payment_type, p.currency;

COMMENT ON VIEW view_revenue_by_type IS 'Revenue analysis grouped by payment type';


-- View: Daily Revenue
-- Purpose: Daily financial performance tracking
DROP VIEW IF EXISTS view_daily_revenue CASCADE;
CREATE OR REPLACE VIEW view_daily_revenue AS
SELECT 
    DATE(p.completed_at) as payment_date,
    p.currency,
    COUNT(p.id) as transaction_count,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as average_amount,
    COUNT(DISTINCT p.entity_id) as unique_payers,
    SUM(CASE WHEN p.payment_type = 'membership' THEN p.amount ELSE 0 END) as membership_revenue,
    SUM(CASE WHEN p.payment_type = 'booking' THEN p.amount ELSE 0 END) as booking_revenue,
    SUM(CASE WHEN p.payment_type = 'sport_subscription' THEN p.amount ELSE 0 END) as sport_revenue,
    SUM(CASE WHEN p.payment_method = 'cash' THEN p.amount ELSE 0 END) as cash_revenue,
    SUM(CASE WHEN p.payment_method = 'card' THEN p.amount ELSE 0 END) as card_revenue,
    SUM(CASE WHEN p.payment_method = 'bank_transfer' THEN p.amount ELSE 0 END) as transfer_revenue
FROM payments p
WHERE p.status = 'completed' AND p.completed_at IS NOT NULL
GROUP BY DATE(p.completed_at), p.currency
ORDER BY payment_date DESC;

COMMENT ON VIEW view_daily_revenue IS 'Daily revenue breakdown by type and payment method';


-- ============================================================================
-- 6. STAFF & ACTIVITY VIEWS
-- ============================================================================

-- View: Staff Complete Information
-- Purpose: Full staff details with accounts and types
DROP VIEW IF EXISTS view_staff_complete CASCADE;
CREATE OR REPLACE VIEW view_staff_complete AS
SELECT 
    s.id as staff_id,
    s.account_id,
    a.email,
    a.role,
    a.status as account_status,
    a.last_login,
    s.first_name_en,
    s.first_name_ar,
    s.last_name_en,
    s.last_name_ar,
    CONCAT(s.first_name_en, ' ', s.last_name_en) as full_name_en,
    CONCAT(s.first_name_ar, ' ', s.last_name_ar) as full_name_ar,
    s.national_id,
    s.phone,
    s.address,
    s.employment_start_date,
    s.employment_end_date,
    s.staff_type_id,
    st.name_en as staff_type_en,
    st.name_ar as staff_type_ar,
    s.is_active as staff_active,
    s.status as staff_status,
    s.created_at,
    s.updated_at
FROM staff s
JOIN accounts a ON s.account_id = a.id
JOIN staff_types st ON s.staff_type_id = st.id;

COMMENT ON VIEW view_staff_complete IS 'Complete staff information with account and type details';


-- View: Active Staff by Type
-- Purpose: Staff distribution analysis
DROP VIEW IF EXISTS view_staff_by_type CASCADE;
CREATE OR REPLACE VIEW view_staff_by_type AS
SELECT 
    st.id as staff_type_id,
    st.name_en as staff_type_en,
    st.name_ar as staff_type_ar,
    COUNT(s.id) as total_staff,
    COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_staff,
    COUNT(CASE WHEN s.is_active = false THEN 1 END) as inactive_staff
FROM staff_types st
LEFT JOIN staff s ON st.id = s.staff_type_id
GROUP BY st.id, st.name_en, st.name_ar;

COMMENT ON VIEW view_staff_by_type IS 'Staff headcount and salary analysis by type';


-- ============================================================================
-- 7. AUDIT & ACTIVITY TRACKING VIEWS
-- ============================================================================

-- View: Recent Activity Logs
-- Purpose: Track recent system activities
DROP VIEW IF EXISTS view_recent_activity CASCADE;
CREATE OR REPLACE VIEW view_recent_activity AS
SELECT 
    al.id,
    al."userName" as user_name,
    al.role,
    al.action,
    al.module,
    al.description,
    al.status,
    al."ipAddress" as ip_address,
    al."dateTime" as activity_time,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - al."dateTime"))/3600 as hours_ago
FROM audit_logs al
ORDER BY al."dateTime" DESC
LIMIT 1000;

COMMENT ON VIEW view_recent_activity IS 'Recent 1000 audit log entries for activity monitoring';


-- View: Activity Summary by Module
-- Purpose: System usage analytics
DROP VIEW IF EXISTS view_activity_by_module CASCADE;
CREATE OR REPLACE VIEW view_activity_by_module AS
SELECT 
    module,
    COUNT(id) as total_actions,
    COUNT(DISTINCT "userName") as unique_users,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN status = 'failure' THEN 1 END) as failure_count,
    ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END)::numeric / 
          NULLIF(COUNT(id), 0) * 100, 2) as success_rate,
    MIN("dateTime") as first_activity,
    MAX("dateTime") as latest_activity
FROM audit_logs
GROUP BY module
ORDER BY total_actions DESC;

COMMENT ON VIEW view_activity_by_module IS 'System activity statistics grouped by module';


-- ============================================================================
-- 8. SPORTS & TRAINING VIEWS
-- ============================================================================

-- View: Sports Summary
-- Purpose: Overview of sports activities and participation
DROP VIEW IF EXISTS view_sports_summary CASCADE;
CREATE OR REPLACE VIEW view_sports_summary AS
SELECT 
    s.id as sport_id,
    s.name_en as sport_name_en,
    s.name_ar as sport_name_ar,
    s.description_en,
    s.description_ar,
    s.is_active,
    -- Teams Count
    COUNT(DISTINCT t.id) as teams_count,
    COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) as active_teams_count,
    -- Members Count
    COUNT(DISTINCT mt.member_id) as member_count,
    COUNT(DISTINCT tmt.team_member_id) as team_member_count,
    -- Fields Count
    COUNT(DISTINCT f.id) as fields_count,
    -- Bookings Count
    COUNT(DISTINCT b.id) as bookings_count,
    SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.price ELSE 0 END) as booking_revenue,
    s.created_at,
    s.updated_at
FROM sports s
LEFT JOIN teams t ON s.id = t.sport_id
LEFT JOIN member_teams mt ON t.id = mt.team_id AND mt.status = 'active'
LEFT JOIN team_member_teams tmt ON t.id = tmt.team_id AND tmt.status = 'active'
LEFT JOIN fields f ON s.id = f.sport_id
LEFT JOIN bookings b ON s.id = b.sport_id
GROUP BY s.id, s.name_en, s.name_ar, s.description_en, s.description_ar, 
         s.is_active, s.created_at, s.updated_at;

COMMENT ON VIEW view_sports_summary IS 'Comprehensive sports activity and participation statistics';


-- ============================================================================
-- 9. DASHBOARD & REPORTING VIEWS
-- ============================================================================

-- View: System Statistics Dashboard
-- Purpose: High-level KPIs for dashboard
DROP VIEW IF EXISTS view_dashboard_stats CASCADE;
CREATE OR REPLACE VIEW view_dashboard_stats AS
SELECT 
    -- Member Statistics
    (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members_count,
    (SELECT COUNT(*) FROM team_members WHERE status = 'active') as active_team_members_count,
    (SELECT COUNT(*) FROM staff WHERE is_active = true) as active_staff_count,
    
    -- Membership Statistics
    (SELECT COUNT(*) FROM member_memberships WHERE status = 'active') as active_memberships_count,
    (SELECT COUNT(*) FROM member_memberships 
     WHERE status = 'active' AND end_date <= CURRENT_DATE + INTERVAL '30 days') as expiring_memberships_count,
    
    -- Teams & Sports
    (SELECT COUNT(*) FROM teams WHERE status = 'active') as active_teams_count,
    (SELECT COUNT(*) FROM sports WHERE is_active = true) as active_sports_count,
    
    -- Bookings
    (SELECT COUNT(*) FROM bookings 
     WHERE start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '1 day'
     AND status IN ('confirmed', 'pending_payment')) as today_bookings_count,
    (SELECT COUNT(*) FROM bookings 
     WHERE start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '7 days'
     AND status IN ('confirmed', 'pending_payment')) as week_bookings_count,
    
    -- Revenue (Today)
    (SELECT COALESCE(SUM(amount), 0) FROM payments 
     WHERE status = 'completed' 
     AND DATE(completed_at) = CURRENT_DATE) as today_revenue,
    
    -- Revenue (This Month)
    (SELECT COALESCE(SUM(amount), 0) FROM payments 
     WHERE status = 'completed' 
     AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)) as month_revenue,
    
    -- Fields
    (SELECT COUNT(*) FROM fields WHERE status = 'active') as active_fields_count,
    
    -- Pending Items
    (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments_count,
    (SELECT COUNT(*) FROM member_teams WHERE status = 'pending') as pending_team_requests_count;

COMMENT ON VIEW view_dashboard_stats IS 'High-level KPI statistics for dashboard display';


-- View: Monthly Performance
-- Purpose: Monthly financial and activity trends
DROP VIEW IF EXISTS view_monthly_performance CASCADE;
CREATE OR REPLACE VIEW view_monthly_performance AS
WITH monthly_payments AS (
    SELECT 
        DATE_TRUNC('month', p.completed_at)::date as month,
        COUNT(DISTINCT p.id) as total_transactions,
        SUM(p.amount) as total_revenue,
        COUNT(DISTINCT p.entity_id) as unique_payers,
        AVG(p.amount) as average_transaction,
        SUM(CASE WHEN p.payment_type = 'membership' THEN p.amount ELSE 0 END) as membership_revenue,
        SUM(CASE WHEN p.payment_type = 'booking' THEN p.amount ELSE 0 END) as booking_revenue,
        SUM(CASE WHEN p.payment_type = 'sport_subscription' THEN p.amount ELSE 0 END) as sport_revenue
    FROM payments p
    WHERE p.status = 'completed' AND p.completed_at IS NOT NULL
    GROUP BY DATE_TRUNC('month', p.completed_at)
),
monthly_members AS (
    SELECT 
        DATE_TRUNC('month', m.created_at)::date as month,
        COUNT(*) as new_members_count
    FROM members m
    GROUP BY DATE_TRUNC('month', m.created_at)
),
monthly_bookings AS (
    SELECT 
        DATE_TRUNC('month', b.created_at)::date as month,
        COUNT(*) as completed_bookings_count
    FROM bookings b
    WHERE status IN ('confirmed', 'completed')
    GROUP BY DATE_TRUNC('month', b.created_at)
)
SELECT 
    mp.month,
    mp.total_transactions,
    mp.total_revenue,
    mp.unique_payers,
    mp.average_transaction,
    mp.membership_revenue,
    mp.booking_revenue,
    mp.sport_revenue,
    COALESCE(mm.new_members_count, 0) as new_members_count,
    COALESCE(mb.completed_bookings_count, 0) as completed_bookings_count
FROM monthly_payments mp
LEFT JOIN monthly_members mm ON mp.month = mm.month
LEFT JOIN monthly_bookings mb ON mp.month = mb.month
ORDER BY mp.month DESC;

COMMENT ON VIEW view_monthly_performance IS 'Monthly financial and operational performance metrics';


-- ============================================================================
-- 10. MEDIA CENTER VIEWS
-- ============================================================================

-- View: Media Posts Summary
-- Purpose: Content management overview
DROP VIEW IF EXISTS view_media_posts_summary CASCADE;
CREATE OR REPLACE VIEW view_media_posts_summary AS
SELECT 
    mp.id as post_id,
    mp.title,
    mp.description,
    mp.category,
    mp.images,
    mp."videoUrl" as video_url,
    mp."videoDuration" as video_duration,
    mp.date as post_date,
    mp.created_at,
    mp.updated_at
FROM media_posts mp;

COMMENT ON VIEW view_media_posts_summary IS 'Media center posts with publication status';


-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant SELECT permissions on all views to authenticated users
GRANT SELECT ON view_members_complete TO authenticated;
GRANT SELECT ON view_active_members TO authenticated;
GRANT SELECT ON view_active_memberships TO authenticated;
GRANT SELECT ON view_membership_revenue TO authenticated;
GRANT SELECT ON view_teams_summary TO authenticated;
GRANT SELECT ON view_team_members_complete TO authenticated;
GRANT SELECT ON view_bookings_complete TO authenticated;
GRANT SELECT ON view_field_utilization TO authenticated;
GRANT SELECT ON view_upcoming_bookings TO authenticated;
GRANT SELECT ON view_payments_summary TO authenticated;
GRANT SELECT ON view_revenue_by_type TO authenticated;
GRANT SELECT ON view_daily_revenue TO authenticated;
GRANT SELECT ON view_staff_complete TO authenticated;
GRANT SELECT ON view_staff_by_type TO authenticated;
GRANT SELECT ON view_recent_activity TO authenticated;
GRANT SELECT ON view_activity_by_module TO authenticated;
GRANT SELECT ON view_sports_summary TO authenticated;
GRANT SELECT ON view_dashboard_stats TO authenticated;
GRANT SELECT ON view_monthly_performance TO authenticated;
GRANT SELECT ON view_media_posts_summary TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATABASE VIEWS CREATED SUCCESSFULLY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Total Views Created: 23';
    RAISE NOTICE '';
    RAISE NOTICE 'Categories:';
    RAISE NOTICE '  - Member Views: 2';
    RAISE NOTICE '  - Membership & Subscription Views: 2';
    RAISE NOTICE '  - Team & Sports Views: 3';
    RAISE NOTICE '  - Booking & Field Views: 3';
    RAISE NOTICE '  - Payment & Financial Views: 3';
    RAISE NOTICE '  - Staff & Activity Views: 2';
    RAISE NOTICE '  - Audit & Activity Tracking Views: 2';
    RAISE NOTICE '  - Sports & Training Views: 1';
    RAISE NOTICE '  - Dashboard & Reporting Views: 2';
    RAISE NOTICE '  - Media Center Views: 1';
    RAISE NOTICE '';
    RAISE NOTICE 'Usage: Query these views like regular tables';
    RAISE NOTICE 'Example: SELECT * FROM view_active_members;';
    RAISE NOTICE '============================================================================';
END $$;
