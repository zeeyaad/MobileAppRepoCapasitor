-- ========================================
-- DIAGNOSTIC: Check Privilege Setup Status
-- ========================================

-- 1. Check if Administrator Package exists
SELECT id, code, name_en FROM packages WHERE code = 'ADMIN_FULL';

-- 2. Check if staff_id=1 has any packages assigned
SELECT sp.staff_id, sp.package_id, p.code, p.name_en
FROM staff_packages sp
JOIN packages p ON sp.package_id = p.id
WHERE sp.staff_id = 1;

-- 3. Count privileges in ADMIN_FULL package
SELECT COUNT(*) as privilege_count
FROM privileges_packages pp
JOIN packages p ON pp.package_id = p.id
WHERE p.code = 'ADMIN_FULL';

-- 4. List all privileges in ADMIN_FULL package
SELECT p.id, p.code, p.name_en, p.module
FROM privileges p
JOIN privileges_packages pp ON p.id = pp.privilege_id
JOIN packages p2 ON pp.package_id = p2.id
WHERE p2.code = 'ADMIN_FULL'
ORDER BY p.module, p.code;

-- 5. Check if any packages exist at all
SELECT id, code, name_en, is_active FROM packages LIMIT 10;

-- 6. Check if any privileges exist
SELECT id, code, name_en, module FROM privileges LIMIT 10;

-- 7. Check privileges_packages table
SELECT COUNT(*) as total_mappings FROM privileges_packages;
