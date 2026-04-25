-- ============================================
-- INSERT TEAM MANAGEMENT PRIVILEGES
-- PostgreSQL Compatible Script
-- ============================================
-- Run this script to add team-related privileges to your database

-- 1. CREATE_TEAM - Permission to create new teams
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Create Team', 'إنشاء فريق', 'CREATE_TEAM', 'Permission to create new teams for sports', 'إذن لإنشاء فرق جديدة للرياضات', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 2. VIEW_TEAMS - Permission to view all teams
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('View Teams', 'عرض الفرق', 'VIEW_TEAMS', 'Permission to view all teams and their details', 'إذن لعرض جميع الفرق وتفاصيلها', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 3. UPDATE_TEAM - Permission to update team information
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Update Team', 'تحديث الفريق', 'UPDATE_TEAM', 'Permission to update team details and information', 'إذن لتحديث تفاصيل ومعلومات الفريق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 4. DELETE_TEAM - Permission to delete teams
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Delete Team', 'حذف الفريق', 'DELETE_TEAM', 'Permission to delete teams from the system', 'إذن لحذف الفرق من النظام', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 5. MANAGE_TEAM_STATUS - Permission to change team status
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Manage Team Status', 'إدارة حالة الفريق', 'MANAGE_TEAM_STATUS', 'Permission to change team status (active, inactive, suspended, archived)', 'إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 6. VIEW_TEAM_MEMBERS - Permission to view team members
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('View Team Members', 'عرض أعضاء الفريق', 'VIEW_TEAM_MEMBERS', 'Permission to view members in teams', 'إذن لعرض الأعضاء في الفرق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 7. MANAGE_TEAM_TRAINING - Permission to manage team training schedules
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Manage Team Training', 'إدارة تدريبات الفريق', 'MANAGE_TEAM_TRAINING', 'Permission to create and manage team training schedules', 'إذن لإنشاء وإدارة جداول تدريب الفريق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 8. VIEW_TEAM_TRAINING - Permission to view team training schedules
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('View Team Training', 'عرض تدريبات الفريق', 'VIEW_TEAM_TRAINING', 'Permission to view team training schedules', 'إذن لعرض جداول تدريب الفريق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 9. ASSIGN_TEAM_MEMBERS - Permission to assign members to teams
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('Assign Team Members', 'تعيين أعضاء الفريق', 'ASSIGN_TEAM_MEMBERS', 'Permission to assign or remove members from teams', 'إذن لتعيين أو إزالة الأعضاء من الفرق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- 10. VIEW_AVAILABLE_SLOTS - Permission to view available team slots
INSERT INTO privileges (name_en, name_ar, code, description_en, description_ar, created_at, updated_at)
VALUES 
    ('View Available Slots', 'عرض الأماكن المتاحة', 'VIEW_AVAILABLE_SLOTS', 'Permission to view available slots in teams', 'إذن لعرض الأماكن المتاحة في الفرق', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFY INSERTIONS
-- ============================================
-- Run this query to verify all privileges were added
SELECT 
    id, 
    name_en, 
    name_ar, 
    code, 
    description_en,
    description_ar,
    created_at
FROM privileges 
WHERE code IN (
    'CREATE_TEAM',
    'VIEW_TEAMS',
    'UPDATE_TEAM',
    'DELETE_TEAM',
    'MANAGE_TEAM_STATUS',
    'VIEW_TEAM_MEMBERS',
    'MANAGE_TEAM_TRAINING',
    'VIEW_TEAM_TRAINING',
    'ASSIGN_TEAM_MEMBERS',
    'VIEW_AVAILABLE_SLOTS'
)
ORDER BY code;

-- ============================================
-- OPTIONAL: ASSIGN PRIVILEGES TO EXISTING ROLES
-- ============================================
-- Example: Assign all team privileges to Sport Activity Manager staff type
-- Uncomment and modify the staff_type_id as needed

/*
-- Step 1: Get the ID of the Sport Activity Manager staff type
SELECT id, name_en FROM staff_types WHERE name_en LIKE '%Sport%';

-- Step 2: Assign privileges to all staff of a specific staff type (replace 'YOUR_STAFF_TYPE_ID' with actual ID)
INSERT INTO staff_privileges_override (staff_id, privilege_id, is_granted, created_at, updated_at)
SELECT 
    s.id as staff_id,
    p.id as privilege_id,
    true as is_granted,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM staff s
CROSS JOIN privileges p
WHERE s.staff_type_id = YOUR_STAFF_TYPE_ID  -- Replace with your staff type ID (e.g., 1, 2, 3)
AND p.code IN (
    'CREATE_TEAM',
    'VIEW_TEAMS',
    'UPDATE_TEAM',
    'DELETE_TEAM',
    'MANAGE_TEAM_STATUS',
    'VIEW_TEAM_MEMBERS',
    'MANAGE_TEAM_TRAINING',
    'VIEW_TEAM_TRAINING',
    'ASSIGN_TEAM_MEMBERS',
    'VIEW_AVAILABLE_SLOTS'
)
ON CONFLICT (staff_id, privilege_id) DO NOTHING;
*/

-- ============================================
-- ALTERNATIVE: ASSIGN TO PACKAGE
-- ============================================
-- Assign all team privileges to package with ID = 5

-- Step 1: Verify the package exists
SELECT id, name_en, name_ar FROM packages WHERE id = 5;

-- Step 2: Insert all team privileges into the package in one query
INSERT INTO staff_packages (privilege_id, package_id, created_at, updated_at)
SELECT 
    p.id as privilege_id,
    5 as package_id,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM privileges p
WHERE p.code IN (
    'CREATE_TEAM',
    'VIEW_TEAMS',
    'UPDATE_TEAM',
    'DELETE_TEAM',
    'MANAGE_TEAM_STATUS',
    'VIEW_TEAM_MEMBERS',
    'MANAGE_TEAM_TRAINING',
    'VIEW_TEAM_TRAINING',
    'ASSIGN_TEAM_MEMBERS',
    'VIEW_AVAILABLE_SLOTS'
)
ON CONFLICT (privilege_id, package_id) DO NOTHING;

-- Step 3: Verify the privileges were added to the package
SELECT 
    sp.id,
    sp.privilege_id,
    sp.package_id,
    p.name_en as privilege_name_en,
    p.name_ar as privilege_name_ar,
    p.code as privilege_code,
    pk.name_en as package_name_en,
    pk.name_ar as package_name_ar
FROM staff_packages sp
JOIN privileges p ON sp.privilege_id = p.id
JOIN packages pk ON sp.package_id = pk.id
WHERE sp.package_id = 5
AND p.code IN (
    'CREATE_TEAM',
    'VIEW_TEAMS',
    'UPDATE_TEAM',
    'DELETE_TEAM',
    'MANAGE_TEAM_STATUS',
    'VIEW_TEAM_MEMBERS',
    'MANAGE_TEAM_TRAINING',
    'VIEW_TEAM_TRAINING',
    'ASSIGN_TEAM_MEMBERS',
    'VIEW_AVAILABLE_SLOTS'
)
ORDER BY p.code;
