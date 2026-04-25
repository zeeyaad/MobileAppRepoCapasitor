-- ============================================
-- Field Management Privileges
-- ============================================
-- This script adds 6 new privileges for field management
-- to the privileges table and assigns them to package_id 5
-- (Sport Activity Manager package)
-- ============================================

-- Insert field privileges with bilingual names and descriptions
INSERT INTO privileges (code, name_en, name_ar, description_en, description_ar, module, created_at, updated_at)
VALUES
  (
    'CREATE_FIELD',
    'Create Field',
    'إنشاء ملعب',
    'Create new sports fields',
    'إنشاء ملاعب رياضية جديدة',
    'field_management',
    NOW(),
    NOW()
  ),
  (
    'VIEW_FIELDS',
    'View Fields',
    'عرض الملاعب',
    'View sports fields and their details',
    'عرض الملاعب الرياضية وتفاصيلها',
    'field_management',
    NOW(),
    NOW()
  ),
  (
    'UPDATE_FIELD',
    'Update Field',
    'تحديث ملعب',
    'Update field information',
    'تحديث معلومات الملاعب',
    'field_management',
    NOW(),
    NOW()
  ),
  (
    'DELETE_FIELD',
    'Delete Field',
    'حذف ملعب',
    'Delete sports fields',
    'حذف الملاعب الرياضية',
    'field_management',
    NOW(),
    NOW()
  ),
  (
    'MANAGE_FIELD_STATUS',
    'Manage Field Status',
    'إدارة حالة الملعب',
    'Manage field status (active/inactive/maintenance)',
    'إدارة حالة الملاعب (نشط/غير نشط/صيانة)',
    'field_management',
    NOW(),
    NOW()
  ),
  (
    'MANAGE_FIELD_HOURS',
    'Manage Field Hours',
    'إدارة ساعات الملعب',
    'Manage field operating hours',
    'إدارة ساعات عمل الملاعب',
    'field_management',
    NOW(),
    NOW()
  )
ON CONFLICT (code) DO UPDATE
SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  module = EXCLUDED.module,
  updated_at = NOW();

-- Assign all field privileges to package_id 5 (Sport Activity Manager)
INSERT INTO staff_packages (package_id, privilege_id)
SELECT 
  5 AS package_id,
  p.id AS privilege_id
FROM privileges p
WHERE p.module = 'field_management'
ON CONFLICT (package_id, privilege_id) DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- View all field privileges
SELECT 
  code,
  name_en,
  name_ar,
  description_en,
  description_ar,
  module,
  created_at
FROM privileges
WHERE module = 'field_management'
ORDER BY code;

-- View package assignments for field privileges
SELECT 
  sp.package_id,
  p.code,
  p.name_en,
  p.name_ar,
  p.description_en
FROM staff_packages sp
JOIN privileges p ON sp.privilege_id = p.id
WHERE p.module = 'field_management'
ORDER BY sp.package_id, p.code;

-- Count field privileges by package
SELECT 
  sp.package_id,
  COUNT(*) as privilege_count
FROM staff_packages sp
JOIN privileges p ON sp.privilege_id = p.id
WHERE p.module = 'field_management'
GROUP BY sp.package_id;
