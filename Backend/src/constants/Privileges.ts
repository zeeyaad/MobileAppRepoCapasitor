/**
 * System Privileges Constants
 * 
 * This file contains all privileges defined in the system.
 * Privileges are used for fine-grained access control at the API and frontend levels.
 * 
 * Format: PRIVILEGE_CODE: {
 *   code: 'PRIVILEGE_CODE',
 *   name_en: 'English Name',
 *   name_ar: 'Arabic Name',
 *   description_en: 'English Description',
 *   description_ar: 'Arabic Description',
 *   module: 'Module Category'
 * }
 * 
 * Generated: 2026-02-21
 * Last Updated: Based on Backend privilege definitions
 */

export const PRIVILEGES = {
  // ============================================================
  // TEAM MANAGEMENT PRIVILEGES
  // ============================================================
  
  CREATE_TEAM: {
    code: 'CREATE_TEAM',
    name_en: 'Create Team',
    name_ar: 'إنشاء فريق',
    description_en: 'Permission to create new teams for sports',
    description_ar: 'إذن لإنشاء فرق جديدة للرياضات',
    module: 'team_management',
  },

  VIEW_TEAMS: {
    code: 'VIEW_TEAMS',
    name_en: 'View Teams',
    name_ar: 'عرض الفرق',
    description_en: 'Permission to view all teams and their details',
    description_ar: 'إذن لعرض جميع الفرق وتفاصيلها',
    module: 'team_management',
  },

  UPDATE_TEAM: {
    code: 'UPDATE_TEAM',
    name_en: 'Update Team',
    name_ar: 'تحديث الفريق',
    description_en: 'Permission to update team details and information',
    description_ar: 'إذن لتحديث تفاصيل ومعلومات الفريق',
    module: 'team_management',
  },

  DELETE_TEAM: {
    code: 'DELETE_TEAM',
    name_en: 'Delete Team',
    name_ar: 'حذف الفريق',
    description_en: 'Permission to delete teams from the system',
    description_ar: 'إذن لحذف الفرق من النظام',
    module: 'team_management',
  },

  MANAGE_TEAM_STATUS: {
    code: 'MANAGE_TEAM_STATUS',
    name_en: 'Manage Team Status',
    name_ar: 'إدارة حالة الفريق',
    description_en: 'Permission to change team status (active, inactive, suspended, archived)',
    description_ar: 'إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)',
    module: 'team_management',
  },

  VIEW_TEAM_MEMBERS: {
    code: 'VIEW_TEAM_MEMBERS',
    name_en: 'View Team Members',
    name_ar: 'عرض أعضاء الفريق',
    description_en: 'Permission to view members in teams',
    description_ar: 'إذن لعرض الأعضاء في الفرق',
    module: 'team_management',
  },

  MANAGE_TEAM_TRAINING: {
    code: 'MANAGE_TEAM_TRAINING',
    name_en: 'Manage Team Training',
    name_ar: 'إدارة تدريبات الفريق',
    description_en: 'Permission to create and manage team training schedules',
    description_ar: 'إذن لإنشاء وإدارة جداول تدريب الفريق',
    module: 'team_management',
  },

  VIEW_TEAM_TRAINING: {
    code: 'VIEW_TEAM_TRAINING',
    name_en: 'View Team Training',
    name_ar: 'عرض تدريبات الفريق',
    description_en: 'Permission to view team training schedules',
    description_ar: 'إذن لعرض جداول تدريب الفريق',
    module: 'team_management',
  },

  ASSIGN_TEAM_MEMBERS: {
    code: 'ASSIGN_TEAM_MEMBERS',
    name_en: 'Assign Team Members',
    name_ar: 'تعيين أعضاء الفريق',
    description_en: 'Permission to assign or remove members from teams',
    description_ar: 'إذن لتعيين أو إزالة الأعضاء من الفرق',
    module: 'team_management',
  },

  VIEW_AVAILABLE_SLOTS: {
    code: 'VIEW_AVAILABLE_SLOTS',
    name_en: 'View Available Slots',
    name_ar: 'عرض الأماكن المتاحة',
    description_en: 'Permission to view available slots in teams',
    description_ar: 'إذن لعرض الأماكن المتاحة في الفرق',
    module: 'team_management',
  },

  // ============================================================
  // FIELD MANAGEMENT PRIVILEGES
  // ============================================================

  CREATE_FIELD: {
    code: 'CREATE_FIELD',
    name_en: 'Create Field',
    name_ar: 'إنشاء ملعب',
    description_en: 'Create new sports fields',
    description_ar: 'إنشاء ملاعب رياضية جديدة',
    module: 'field_management',
  },

  VIEW_FIELDS: {
    code: 'VIEW_FIELDS',
    name_en: 'View Fields',
    name_ar: 'عرض الملاعب',
    description_en: 'View sports fields and their details',
    description_ar: 'عرض الملاعب الرياضية وتفاصيلها',
    module: 'field_management',
  },

  UPDATE_FIELD: {
    code: 'UPDATE_FIELD',
    name_en: 'Update Field',
    name_ar: 'تحديث ملعب',
    description_en: 'Update field information',
    description_ar: 'تحديث معلومات الملاعب',
    module: 'field_management',
  },

  DELETE_FIELD: {
    code: 'DELETE_FIELD',
    name_en: 'Delete Field',
    name_ar: 'حذف ملعب',
    description_en: 'Delete sports fields',
    description_ar: 'حذف الملاعب الرياضية',
    module: 'field_management',
  },

  // ============================================================
  // BOOKING MANAGEMENT PRIVILEGES
  // ============================================================

  VIEW_ALL_BOOKINGS: {
    code: 'VIEW_ALL_BOOKINGS',
    name_en: 'View All Bookings',
    name_ar: 'عرض جميع الحجوزات',
    description_en: 'View all field bookings across the system',
    description_ar: 'عرض جميع حجوزات الملاعب في النظام',
    module: 'bookings',
  },

  MANAGE_FIELD_BOOKINGS: {
    code: 'MANAGE_FIELD_BOOKINGS',
    name_en: 'Manage Field Bookings',
    name_ar: 'إدارة حجوزات الملاعب',
    description_en: 'Manage field booking settings and complete bookings',
    description_ar: 'إدارة إعدادات حجز الملاعب وإكمال الحجوزات',
    module: 'bookings',
  },

  // ============================================================
  // MEMBER MANAGEMENT PRIVILEGES
  // ============================================================

  VIEW_MEMBERS: {
    code: 'VIEW_MEMBERS',
    name_en: 'View Members',
    name_ar: 'عرض الأعضاء',
    description_en: 'View all club members and their profiles',
    description_ar: 'عرض جميع أعضاء النادي وملفاتهم الشخصية',
    module: 'member_management',
  },

  CREATE_MEMBER: {
    code: 'CREATE_MEMBER',
    name_en: 'Create Member',
    name_ar: 'إنشاء عضو',
    description_en: 'Create new member accounts',
    description_ar: 'إنشاء حسابات أعضاء جدد',
    module: 'member_management',
  },

  UPDATE_MEMBER: {
    code: 'UPDATE_MEMBER',
    name_en: 'Update Member',
    name_ar: 'تحديث بيانات العضو',
    description_en: 'Update member profile information',
    description_ar: 'تحديث معلومات ملف العضو الشخصي',
    module: 'member_management',
  },

  DELETE_MEMBER: {
    code: 'DELETE_MEMBER',
    name_en: 'Delete Member',
    name_ar: 'حذف عضو',
    description_en: 'Delete member accounts from system',
    description_ar: 'حذف حسابات الأعضاء من النظام',
    module: 'member_management',
  },

  // ============================================================
  // SPORTS MANAGEMENT PRIVILEGES
  // ============================================================

  VIEW_SPORTS: {
    code: 'VIEW_SPORTS',
    name_en: 'View Sports',
    name_ar: 'عرض الرياضات',
    description_en: 'View all sports offered by the club',
    description_ar: 'عرض جميع الرياضات المقدمة من النادي',
    module: 'sports_management',
  },

  CREATE_SPORT: {
    code: 'CREATE_SPORT',
    name_en: 'Create Sport',
    name_ar: 'إنشاء رياضة',
    description_en: 'Add new sports to the system',
    description_ar: 'إضافة رياضات جديدة إلى النظام',
    module: 'sports_management',
  },

  UPDATE_SPORT: {
    code: 'UPDATE_SPORT',
    name_en: 'Update Sport',
    name_ar: 'تحديث الرياضة',
    description_en: 'Update sport information and settings',
    description_ar: 'تحديث معلومات الرياضة والإعدادات',
    module: 'sports_management',
  },

  DELETE_SPORT: {
    code: 'DELETE_SPORT',
    name_en: 'Delete Sport',
    name_ar: 'حذف الرياضة',
    description_en: 'Delete sports from the system',
    description_ar: 'حذف الرياضات من النظام',
    module: 'sports_management',
  },

  // ============================================================
  // FINANCE PRIVILEGES
  // ============================================================

  VIEW_FINANCE: {
    code: 'VIEW_FINANCE',
    name_en: 'View Finance',
    name_ar: 'عرض الشؤون المالية',
    description_en: 'View financial reports and transactions',
    description_ar: 'عرض التقارير المالية والعمليات',
    module: 'finance',
  },

  MANAGE_PAYMENTS: {
    code: 'MANAGE_PAYMENTS',
    name_en: 'Manage Payments',
    name_ar: 'إدارة المدفوعات',
    description_en: 'Manage payment processing and reconciliation',
    description_ar: 'إدارة معالجة المدفوعات والتسويات',
    module: 'finance',
  },

  EXPORT_FINANCIAL_REPORTS: {
    code: 'EXPORT_FINANCIAL_REPORTS',
    name_en: 'Export Financial Reports',
    name_ar: 'تصدير التقارير المالية',
    description_en: 'Export financial data and reports',
    description_ar: 'تصدير البيانات والتقارير المالية',
    module: 'finance',
  },

  // ============================================================
  // STAFF MANAGEMENT PRIVILEGES
  // ============================================================

  STAFF_CREATE: {
    code: 'STAFF_CREATE',
    name_en: 'Create Staff',
    name_ar: 'إنشاء موظف',
    description_en: 'Create new staff member accounts',
    description_ar: 'إنشاء حسابات موظفي جدد',
    module: 'staff_management',
  },

  VIEW_STAFF: {
    code: 'VIEW_STAFF',
    name_en: 'View Staff',
    name_ar: 'عرض الموظفين',
    description_en: 'View all staff members and their details',
    description_ar: 'عرض جميع الموظفين وتفاصيلهم',
    module: 'staff_management',
  },

  UPDATE_STAFF: {
    code: 'UPDATE_STAFF',
    name_en: 'Update Staff',
    name_ar: 'تحديث بيانات الموظف',
    description_en: 'Update staff profile and role information',
    description_ar: 'تحديث ملف الموظف ومعلومات الدور',
    module: 'staff_management',
  },

  DELETE_STAFF: {
    code: 'DELETE_STAFF',
    name_en: 'Delete Staff',
    name_ar: 'حذف موظف',
    description_en: 'Remove staff members from system',
    description_ar: 'إزالة الموظفين من النظام',
    module: 'staff_management',
  },

  MANAGE_PRIVILEGES: {
    code: 'MANAGE_PRIVILEGES',
    name_en: 'Manage Privileges',
    name_ar: 'إدارة الأذونات',
    description_en: 'Assign and revoke staff privileges',
    description_ar: 'تعيين ورفع أذونات الموظفين',
    module: 'staff_management',
  },

  VIEW_PRIVILEGES: {
    code: 'VIEW_PRIVILEGES',
    name_en: 'View Privileges',
    name_ar: 'عرض الأذونات',
    description_en: 'View staff privileges and assignments',
    description_ar: 'عرض أذونات الموظفين والتعيينات',
    module: 'staff_management',
  },

  // ============================================================
  // AUDIT & ANALYTICS PRIVILEGES
  // ============================================================

  'audit.view': {
    code: 'audit.view',
    name_en: 'View Audit Logs',
    name_ar: 'عرض سجلات التدقيق',
    description_en: 'View system audit logs and activity history',
    description_ar: 'عرض سجلات تدقيق النظام وسجل النشاط',
    module: 'audit',
  },

  'audit.manage': {
    code: 'audit.manage',
    name_en: 'Manage Audit',
    name_ar: 'إدارة التدقيق',
    description_en: 'Manage audit settings and retention policies',
    description_ar: 'إدارة إعدادات التدقيق وسياسات الاحتفاظ',
    module: 'audit',
  },

  // ============================================================
  // MEDIA GALLERY PRIVILEGES
  // ============================================================

  'media.view': {
    code: 'media.view',
    name_en: 'View Media Gallery',
    name_ar: 'عرض معرض الوسائط',
    description_en: 'View media gallery and media content',
    description_ar: 'عرض معرض الوسائط ومحتوى الوسائط',
    module: 'media',
  },

  'media.create': {
    code: 'media.create',
    name_en: 'Create Media',
    name_ar: 'إنشاء وسائط',
    description_en: 'Upload and create media content',
    description_ar: 'تحميل وإنشاء محتوى وسائط',
    module: 'media',
  },

  'media.edit': {
    code: 'media.edit',
    name_en: 'Edit Media',
    name_ar: 'تعديل الوسائط',
    description_en: 'Edit media information and metadata',
    description_ar: 'تعديل معلومات الوسائط والبيانات الوصفية',
    module: 'media',
  },

  'media.delete': {
    code: 'media.delete',
    name_en: 'Delete Media',
    name_ar: 'حذف الوسائط',
    description_en: 'Delete media content from gallery',
    description_ar: 'حذف محتوى الوسائط من المعرض',
    module: 'media',
  },

  // ============================================================
  // MEMBERSHIP MANAGEMENT PRIVILEGES
  // ============================================================

  VIEW_MEMBERSHIP_PLANS: {
    code: 'VIEW_MEMBERSHIP_PLANS',
    name_en: 'View Membership Plans',
    name_ar: 'عرض خطط العضوية',
    description_en: 'View all membership plans offered',
    description_ar: 'عرض جميع خطط العضوية المقدمة',
    module: 'membership',
  },

  CREATE_MEMBERSHIP_PLAN: {
    code: 'CREATE_MEMBERSHIP_PLAN',
    name_en: 'Create Membership Plan',
    name_ar: 'إنشاء خطة عضوية',
    description_en: 'Create new membership plans',
    description_ar: 'إنشاء خطط عضوية جديدة',
    module: 'membership',
  },

  UPDATE_MEMBERSHIP_PLAN: {
    code: 'UPDATE_MEMBERSHIP_PLAN',
    name_en: 'Update Membership Plan',
    name_ar: 'تحديث خطة العضوية',
    description_en: 'Update membership plan details',
    description_ar: 'تحديث تفاصيل خطة العضوية',
    module: 'membership',
  },

  DELETE_MEMBERSHIP_PLAN: {
    code: 'DELETE_MEMBERSHIP_PLAN',
    name_en: 'Delete Membership Plan',
    name_ar: 'حذف خطة العضوية',
    description_en: 'Delete membership plans from system',
    description_ar: 'حذف خطط العضوية من النظام',
    module: 'membership',
  },

  // ============================================================
  // FACULTY MANAGEMENT PRIVILEGES
  // ============================================================

  VIEW_FACULTIES: {
    code: 'VIEW_FACULTIES',
    name_en: 'View Faculties',
    name_ar: 'عرض الكليات',
    description_en: 'View all university faculties',
    description_ar: 'عرض جميع كليات الجامعة',
    module: 'faculties',
  },

  CREATE_FACULTY: {
    code: 'CREATE_FACULTY',
    name_en: 'Create Faculty',
    name_ar: 'إنشاء كلية',
    description_en: 'Add new university faculties',
    description_ar: 'إضافة كليات جامعة جديدة',
    module: 'faculties',
  },

  UPDATE_FACULTY: {
    code: 'UPDATE_FACULTY',
    name_en: 'Update Faculty',
    name_ar: 'تحديث الكلية',
    description_en: 'Update faculty information',
    description_ar: 'تحديث معلومات الكلية',
    module: 'faculties',
  },

  DELETE_FACULTY: {
    code: 'DELETE_FACULTY',
    name_en: 'Delete Faculty',
    name_ar: 'حذف الكلية',
    description_en: 'Delete faculties from system',
    description_ar: 'حذف الكليات من النظام',
    module: 'faculties',
  },

  // ============================================================
  // SYSTEM ADMINISTRATION PRIVILEGES
  // ============================================================

  SYSTEM_ADMIN: {
    code: 'SYSTEM_ADMIN',
    name_en: 'System Administrator',
    name_ar: 'مسؤول النظام',
    description_en: 'Full system administration access',
    description_ar: 'الوصول الكامل لإدارة النظام',
    module: 'system_admin',
  },

  VIEW_SYSTEM_SETTINGS: {
    code: 'VIEW_SYSTEM_SETTINGS',
    name_en: 'View System Settings',
    name_ar: 'عرض إعدادات النظام',
    description_en: 'View system configuration and settings',
    description_ar: 'عرض إعدادات وتكوين النظام',
    module: 'system_admin',
  },

  MANAGE_SYSTEM_SETTINGS: {
    code: 'MANAGE_SYSTEM_SETTINGS',
    name_en: 'Manage System Settings',
    name_ar: 'إدارة إعدادات النظام',
    description_en: 'Modify system configuration and settings',
    description_ar: 'تعديل إعدادات وتكوين النظام',
    module: 'system_admin',
  },

  // ============================================================
  // INVITATION & ONBOARDING PRIVILEGES
  // ============================================================

  'admin.invite': {
    code: 'admin.invite',
    name_en: 'Invite Admins',
    name_ar: 'دعوة المسؤولين',
    description_en: 'Send admin invitation links to new administrators',
    description_ar: 'إرسال روابط دعوة المسؤول للمسؤولين الجدد',
    module: 'admin_management',
  },

  'admin.manage': {
    code: 'admin.manage',
    name_en: 'Manage Admins',
    name_ar: 'إدارة المسؤولين',
    description_en: 'Manage admin accounts and access levels',
    description_ar: 'إدارة حسابات المسؤولين ومستويات الوصول',
    module: 'admin_management',
  },
} as const;

/**
 * Get all privilege codes as an array
 * Useful for validation and checking if a privilege exists
 */
export const PRIVILEGE_CODES = Object.keys(PRIVILEGES) as Array<keyof typeof PRIVILEGES>;

/**
 * Get all privileges grouped by module
 * Useful for displaying privileges organized by category
 */
export function getPrivilegesByModule(module?: string) {
  if (!module) {
    return PRIVILEGES;
  }

  return Object.fromEntries(
    Object.entries(PRIVILEGES).filter(([_, priv]) => priv.module === module)
  );
}

/**
 * Get a single privilege by code
 */
export function getPrivilege(code: string) {
  return PRIVILEGES[code as keyof typeof PRIVILEGES];
}

/**
 * Check if a privilege exists
 */
export function hasPrivilege(code: string): code is keyof typeof PRIVILEGES {
  return code in PRIVILEGES;
}

/**
 * Get all modules used in the system
 */
export function getAllModules() {
  const modules = new Set<string>();
  Object.values(PRIVILEGES).forEach((priv) => {
    modules.add(priv.module);
  });
  return Array.from(modules).sort();
}

/**
 * Export summary statistics
 */
export const PRIVILEGES_SUMMARY = {
  total_privileges: PRIVILEGE_CODES.length,
  modules: getAllModules(),
  modules_count: getAllModules().length,
  by_module: Object.fromEntries(
    getAllModules().map((module) => [
      module,
      Object.values(PRIVILEGES).filter((p) => p.module === module).length,
    ])
  ),
} as const;
