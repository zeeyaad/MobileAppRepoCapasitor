-- ============================================================================
-- ADD BOOKING MANAGEMENT PRIVILEGES
-- ============================================================================
-- Purpose: Add privileges for managing field bookings and viewing all bookings
-- Date: 2026-03-03
-- Author: GitHub Copilot
-- ============================================================================

BEGIN;

-- Add new booking privileges
INSERT INTO privileges (
    name_en,
    name_ar,
    description_en,
    description_ar,
    module,
    created_at,
    updated_at
) VALUES
(
    'VIEW_ALL_BOOKINGS',
    'عرض جميع الحجوزات',
    'View all field bookings across the system',
    'عرض جميع حجوزات الملاعب في النظام',
    'bookings',
    NOW(),
    NOW()
),
(
    'MANAGE_FIELD_BOOKINGS',
    'إدارة حجوزات الملاعب',
    'Manage field booking settings and complete bookings',
    'إدارة إعدادات حجز الملاعب وإكمال الحجوزات',
    'bookings',
    NOW(),
    NOW()
)
ON CONFLICT (name_en) DO NOTHING;

-- Assign privileges to Director of Sports Affairs (package_id = 5)
-- This is the role that manages fields and bookings
INSERT INTO staff_packages (package_id, privilege_id)
SELECT 
    5, -- Director of Sports Affairs package ID
    p.id
FROM privileges p
WHERE p.name_en IN ('VIEW_ALL_BOOKINGS', 'MANAGE_FIELD_BOOKINGS')
AND NOT EXISTS (
    SELECT 1 
    FROM staff_packages sp 
    WHERE sp.package_id = 5 
    AND sp.privilege_id = p.id
);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that privileges were added
SELECT 
    id,
    name_en,
    name_ar,
    description_en,
    module,
    created_at
FROM privileges
WHERE name_en IN ('VIEW_ALL_BOOKINGS', 'MANAGE_FIELD_BOOKINGS')
ORDER BY created_at DESC;

-- Check privilege assignments for Director of Sports Affairs
SELECT 
    sp.package_id,
    p.name_en as privilege_name,
    p.name_ar as privilege_name_ar,
    p.module
FROM staff_packages sp
JOIN privileges p ON sp.privilege_id = p.id
WHERE sp.package_id = 5
AND p.module IN ('fields', 'bookings')
ORDER BY p.module, p.name_en;

-- Count total privileges per package
SELECT 
    sp.package_id,
    COUNT(*) as total_privileges,
    COUNT(CASE WHEN p.module = 'fields' THEN 1 END) as field_privileges,
    COUNT(CASE WHEN p.module = 'bookings' THEN 1 END) as booking_privileges
FROM staff_packages sp
JOIN privileges p ON sp.privilege_id = p.id
WHERE sp.package_id = 5
GROUP BY sp.package_id;

-- ============================================================================
-- ROLLBACK SCRIPT (Use if needed)
-- ============================================================================
-- Run this if you need to undo the privilege additions:
/*
BEGIN;

-- Remove privilege assignments
DELETE FROM staff_packages
WHERE privilege_id IN (
    SELECT id FROM privileges 
    WHERE name_en IN ('VIEW_ALL_BOOKINGS', 'MANAGE_FIELD_BOOKINGS')
);

-- Remove privileges
DELETE FROM privileges
WHERE name_en IN ('VIEW_ALL_BOOKINGS', 'MANAGE_FIELD_BOOKINGS');

COMMIT;
*/
