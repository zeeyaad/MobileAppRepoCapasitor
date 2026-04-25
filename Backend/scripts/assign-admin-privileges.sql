-- ========================================
-- Assign Administrator Package to Admin Staff (staff_id=1)
-- ========================================
-- This script assigns all privileges to the first staff member (admin@club.com)
-- by linking them to the Administrator package through the staff_packages table

-- Step 1: Find the Administrator package
-- SELECT id FROM packages WHERE code = 'ADMIN_FULL';

-- Step 2: Assign the Administrator package to staff_id=1
-- Insert only if not already assigned
INSERT INTO staff_packages (staff_id, package_id, assigned_by)
SELECT 1, p.id, NULL
FROM packages p
WHERE p.code = 'ADMIN_FULL' AND p.is_active = TRUE
AND NOT EXISTS (
  SELECT 1 FROM staff_packages sp WHERE sp.staff_id = 1 AND sp.package_id = p.id
);

-- Verify assignment
SELECT sp.staff_id, sp.package_id, p.code, p.name_en, COUNT(pp.privilege_id) as privilege_count
FROM staff_packages sp
JOIN packages p ON sp.package_id = p.id
LEFT JOIN privileges_packages pp ON p.id = pp.package_id
WHERE sp.staff_id = 1
GROUP BY sp.staff_id, sp.package_id, p.code, p.name_en;

-- View all privileges that will be granted to staff_id=1
SELECT DISTINCT p.code, p.name_en, p.module
FROM privileges p
JOIN privileges_packages pp ON p.id = pp.privilege_id
JOIN staff_packages sp ON pp.package_id = sp.package_id
WHERE sp.staff_id = 1 AND p.is_active = TRUE
ORDER BY p.module, p.code;
