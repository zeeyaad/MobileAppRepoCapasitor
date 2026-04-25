import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';
import { Staff } from '../entities/Staff';
import { StaffType } from '../entities/StaffType';
import { Privilege } from '../entities/Privilege';
import { StaffPackage } from '../entities/StaffPackage';
import { StaffPrivilegeOverride } from '../entities/StaffPrivilegeOverride';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';
import PrivilegeCalculationService from './PrivilegeCalculationService';

/**
 * Staff Management Service
 * 
 * Handles staff registration, profile management, and privilege assignment
 * using the privilege package system with per-individual overrides.
 */
export class StaffService {
  private staffRepository: Repository<Staff>;
  private staffTypeRepository: Repository<StaffType>;
  private privilegeRepository: Repository<Privilege>;
  private staffPackageRepository: Repository<StaffPackage>;
  private staffPrivilegeOverrideRepository: Repository<StaffPrivilegeOverride>;
  private accountRepository: Repository<Account>;

  constructor() {
    this.staffRepository = AppDataSource.getRepository(Staff);
    this.staffTypeRepository = AppDataSource.getRepository(StaffType);
    this.privilegeRepository = AppDataSource.getRepository(Privilege);
    this.staffPackageRepository = AppDataSource.getRepository(StaffPackage);
    this.staffPrivilegeOverrideRepository = AppDataSource.getRepository(StaffPrivilegeOverride);
    this.accountRepository = AppDataSource.getRepository(Account);
  }

  /**
   * Get all staff types
   */
  async getAllStaffTypes() {
    return await this.staffTypeRepository.find({
      where: { is_active: true },
    });
  }

  /**
   * Get all available privileges
   */
  async getAllPrivileges(module?: string) {
    const query = this.privilegeRepository
      .createQueryBuilder('p')
      .where('p.is_active = :active', { active: true });

    if (module) {
      query.andWhere('p.module = :module', { module });
    }

    return await query.orderBy('p.module', 'ASC').addOrderBy('p.name_en', 'ASC').getMany();
  }

  /**
   * Get all available privilege packages
   */
  async getAllPrivilegePackages() {
    return await AppDataSource.query(
      `SELECT id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at
       FROM packages
       WHERE is_active = true
       ORDER BY name_en`
    );
  }

  /**
   * Get privileges in a package
   */
  async getPackagePrivileges(packageId: number) {
    return await AppDataSource.query(
      `
      SELECT p.* FROM privileges p
      JOIN privileges_packages pp ON p.id = pp.privilege_id
      WHERE pp.package_id = $1 AND p.is_active = true
      ORDER BY p.module, p.name_en
      `,
      [packageId]
    );
  }

  /**
   * Register a new staff member
   * 
   * Account status rules:
   * - If created by ADMIN (staff_type_id = 1) or EXECUTIVE_MANAGER (staff_type_id = 2): status = 'active'
   * - Otherwise: status = 'pending'
   */
  async registerStaff(staffData: {
    first_name_en: string;
    first_name_ar: string;
    last_name_en: string;
    last_name_ar: string;
    national_id: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    staff_type_id: number;
    employment_start_date: Date;
    employment_end_date?: Date;
    created_by_staff_type_id?: number; // Optional: staff_type_id of who is creating this account
  }) {
    // Check if email already exists
    const existingEmail = await this.accountRepository.findOne({
      where: { email: staffData.email },
    });

    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // Check if national ID already exists
    const existingStaff = await this.staffRepository.findOne({
      where: { national_id: staffData.national_id },
    });

    if (existingStaff) {
      throw new Error('National ID already exists');
    }

    // Verify staff type exists
    const staffType = await this.staffTypeRepository.findOne({
      where: { id: staffData.staff_type_id, is_active: true },
    });

    if (!staffType) {
      throw new Error('Invalid staff type');
    }

    // Hash password (initial password is national ID)
    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    // Determine account status based on who is creating
    // If created by ADMIN (1) or EXECUTIVE_MANAGER (2): active
    // Otherwise: pending
    const accountStatus =
      staffData.created_by_staff_type_id === 1 || staffData.created_by_staff_type_id === 2
        ? 'active'
        : 'pending';

    // Create account
    const account = this.accountRepository.create({
      email: staffData.email,
      password: hashedPassword,
      role: 'staff',
      status: accountStatus,
      is_active: true,
    });

    const savedAccount = await this.accountRepository.save(account);

    // Create staff record with matching status
    const staff = this.staffRepository.create({
      account_id: savedAccount.id,
      staff_type_id: staffData.staff_type_id,
      first_name_en: staffData.first_name_en,
      first_name_ar: staffData.first_name_ar,
      last_name_en: staffData.last_name_en,
      last_name_ar: staffData.last_name_ar,
      national_id: staffData.national_id,
      phone: staffData.phone,
      address: staffData.address,
      employment_start_date: staffData.employment_start_date,
      employment_end_date: staffData.employment_end_date || null,
      status: accountStatus,
      is_active: true,
    });

    const savedStaff = await this.staffRepository.save(staff);

    // Log activity (using console since staff_activity_logs table doesn't exist)
    console.log(`[STAFF_CREATED] ${savedStaff.id}: ${staffData.first_name_en} ${staffData.last_name_en} (${staffType.name_en})`);

    return {
      success: true,
      message: 'Staff member registered successfully',
      staff_id: savedStaff.id,
      account_id: savedAccount.id,
      email: staffData.email,
    };
  }

  /**
   * Assign privilege packages to a staff member
   */
  async assignPackages(staffId: number, packageIds: number[], assignedById: number) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Verify all packages exist using raw SQL (since we don't have PrivilegePackage entity)
    for (const packageId of packageIds) {
      const pkg = await AppDataSource.query(
        `SELECT id FROM packages WHERE id = $1 AND is_active = true`,
        [packageId]
      );
      if (!pkg || pkg.length === 0) {
        throw new Error(`Privilege package ${packageId} not found or inactive`);
      }
    }

    // Clear existing package assignments (but keep overrides)
    await this.staffPackageRepository.delete({ staff_id: staffId });

    // Assign new packages
    for (const packageId of packageIds) {
      await this.staffPackageRepository.insert({
        staff_id: staffId,
        package_id: packageId,
        assigned_by: assignedById,
      });
    }

    // Log activity
    console.log(`[PRIVILEGE_ASSIGNED] Staff ${staffId}: Assigned ${packageIds.length} package(s) by ${assignedById}`);

    return {
      success: true,
      message: `Assigned ${packageIds.length} privilege package(s) successfully`,
    };
  }

  /**
   * Grant an individual privilege to a staff member
   * Used for privileges not part of any assigned package
   */
  async grantPrivilege(
    staffId: number,
    privilegeId: number,
    assignedById: number,
    reason?: string
  ) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    const privilege = await this.privilegeRepository.findOne({
      where: { id: privilegeId, is_active: true },
    });
    if (!privilege) {
      throw new Error('Privilege not found or inactive');
    }

    // Create or update override
    await this.staffPrivilegeOverrideRepository.save({
      staff_id: staffId,
      privilege_id: privilegeId,
      is_granted: true,
      assigned_by: assignedById,
      reason: reason || `Granted ${privilege.code} privilege`,
    });

    // Log activity
    console.log(`[PRIVILEGE_GRANTED] Staff ${staffId}: Granted ${privilege.code} by ${assignedById}`);

    return {
      success: true,
      message: `Granted privilege '${privilege.code}' successfully`,
    };
  }

  /**
   * Revoke a privilege from a staff member
   * Uses override system: adds staff_privileges_override with is_granted=false
   * This works for any privilege source (direct, package, or default)
   * Packages remain assigned - the override simply denies this specific privilege
   */
  async revokePrivilege(
    staffId: number,
    privilegeId: number,
    assignedById: number,
    reason?: string
  ) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    const privilege = await this.privilegeRepository.findOne({
      where: { id: privilegeId },
    });
    if (!privilege) {
      throw new Error('Privilege not found');
    }

    // Get final privileges to verify the privilege is actually granted
    const finalPrivileges = await PrivilegeCalculationService.calculateFinalPrivileges(staffId);
    const privilegeInfo = finalPrivileges.find((p: Record<string, unknown>) => p.id === privilegeId);

    if (!privilegeInfo) {
      throw new Error('Privilege not found in staff member final privileges - cannot revoke');
    }

    // Check if override already exists
    const existingOverride = await this.staffPrivilegeOverrideRepository.findOne({
      where: { staff_id: staffId, privilege_id: privilegeId },
    });

    if (existingOverride && !existingOverride.is_granted) {
      // Already revoked
      return {
        success: false,
        message: `Privilege '${privilege.code}' is already revoked for this staff member`,
      };
    }

    // Create or update override to revoke this privilege
    const source = privilegeInfo.source as string;
    const sourceInfo = source === 'package' 
      ? ` (from package '${privilegeInfo.package_code}')` 
      : source === 'default' 
        ? ' (default privilege)' 
        : '';

    await this.staffPrivilegeOverrideRepository.save({
      staff_id: staffId,
      privilege_id: privilegeId,
      is_granted: false,
      assigned_by: assignedById,
      reason: reason || `Revoked ${privilege.code}${sourceInfo}`,
    });

    console.log(
      `[PRIVILEGE_REVOKED] Staff ${staffId}: Revoked ${privilege.code} (source: ${source}) by user ${assignedById}`
    );

    return {
      success: true,
      message: `Revoked privilege '${privilege.code}' successfully`,
      source,
      note: source === 'package' 
        ? `This privilege was removed from package assignment '${privilegeInfo.package_code}'. The package remains assigned.`
        : source === 'default'
          ? 'This default privilege is now denied for this staff member only.'
          : 'This directly-granted privilege has been revoked.',
    };
  }

  /**
   * Get all effective privileges for a staff member
   * Combines package assignments and individual overrides
   */
  async getStaffPrivileges(staffId: number) {
    const result = await AppDataSource.query(
      `
      SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.description_en, p.description_ar, p.module
      FROM privileges p
      WHERE p.is_active = true AND (
        -- Privileges from complete package assignments
        p.id IN (
          SELECT pp.privilege_id 
          FROM staff_packages sp
          JOIN privileges_packages pp ON sp.package_id = pp.package_id
          WHERE sp.staff_id = $1
        )
        OR
        -- Explicitly granted individual privileges
        (p.id IN (
          SELECT privilege_id 
          FROM staff_privileges_override 
          WHERE staff_id = $1 AND is_granted = true
        ) AND p.id NOT IN (
          -- Exclude revoked privileges
          SELECT privilege_id 
          FROM staff_privileges_override 
          WHERE staff_id = $1 AND is_granted = false
        ))
      )
      ORDER BY p.module, p.code
      `,
      [staffId]
    );

    return result;
  }

  /**
   * Check if a staff member has a specific privilege
   */
  async hasPrivilege(staffId: number, privilegeCode: string): Promise<boolean> {
    const result = await AppDataSource.query(
      `
      SELECT EXISTS (
        -- Check in complete packages
        SELECT 1 FROM staff_packages sp
        JOIN privileges_packages pp ON sp.package_id = pp.package_id
        JOIN privileges p ON pp.privilege_id = p.id
        WHERE sp.staff_id = $1 AND p.code = $2
        
        UNION
        
        -- Check individual grants (but not revoked)
        SELECT 1 FROM staff_privileges_override spo
        JOIN privileges p ON spo.privilege_id = p.id
        WHERE spo.staff_id = $1 AND p.code = $2 AND spo.is_granted = true
        AND p.id NOT IN (
          SELECT privilege_id FROM staff_privileges_override 
          WHERE staff_id = $1 AND is_granted = false
        )
      ) AS has_privilege
      `,
      [staffId, privilegeCode]
    );

    return result[0]?.has_privilege || false;
  }

  /**
   * Get a staff member by ID
   */
  async getStaffById(staffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['staff_type', 'account'],
    });

    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Get privileges
    const privileges = await this.getStaffPrivileges(staffId);

    // Get assigned packages
    const packages = await this.staffPackageRepository.find({
      where: { staff_id: staffId },
      relations: ['package'],
    });

    return {
      id: staff.id,
      first_name_en: staff.first_name_en,
      first_name_ar: staff.first_name_ar,
      last_name_en: staff.last_name_en,
      last_name_ar: staff.last_name_ar,
      national_id: staff.national_id,
      email: staff.account?.email,
      phone: staff.phone,
      address: staff.address,
      staff_type: {
        id: staff.staff_type?.id,
        code: staff.staff_type?.code,
        name_en: staff.staff_type?.name_en,
        name_ar: staff.staff_type?.name_ar,
      },
      status: staff.status,
      is_active: staff.is_active,
      employment_start_date: staff.employment_start_date,
      employment_end_date: staff.employment_end_date,
      assigned_packages: packages.map((p) => ({
        id: p.package?.id,
        code: p.package?.code,
        name_en: p.package?.name_en,
        name_ar: p.package?.name_ar,
      })),
      privileges: privileges.map((p: Privilege) => ({
        id: p.id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        module: p.module,
      })),
    };
  }

  /**
   * Get all staff members
   */
  async getAllStaff(page: number = 1, limit: number = 10) {
    const [staff, total] = await this.staffRepository.findAndCount({
      // Removed is_active filter to show all staff including inactive
      relations: ['staff_type'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC', // Latest staff first
      },
    });

    return {
      data: staff.map((s) => ({
        id: s.id,
        first_name_en: s.first_name_en,
        first_name_ar: s.first_name_ar,
        last_name_en: s.last_name_en,
        last_name_ar: s.last_name_ar,
        phone: s.phone,
        national_id: s.national_id,
        address: s.address,
        staff_type_id: s.staff_type_id,
        staff_type: s.staff_type?.name_ar || s.staff_type?.name_en, // Use Arabic name first
        status: s.status,
        is_active: s.is_active,
        created_at: s.created_at,
        employment_start_date: s.employment_start_date, // Add employment start date
        employment_end_date: s.employment_end_date,     // Add employment end date
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update staff information
   */
  async updateStaff(
    staffId: number,
    updateData: Partial<{
      first_name_en: string;
      first_name_ar: string;
      last_name_en: string;
      last_name_ar: string;
      phone: string;
      address: string;
      staff_type_id: number;
    }>
  ) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    Object.assign(staff, updateData);
    await this.staffRepository.save(staff);

    return {
      success: true,
      message: 'Staff member updated successfully',
    };
  }

  /**
   * Deactivate a staff member
   */
  async deactivateStaff(staffId: number, deactivatedById: number) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    staff.is_active = false;
    staff.status = 'inactive';
    await this.staffRepository.save(staff);

    // Log activity
    console.log(`[STAFF_DEACTIVATED] Staff ${staffId} deactivated by ${deactivatedById}`);

    return {
      success: true,
      message: 'Staff member deactivated successfully',
    };
  }

  /**
   * Get activity logs for a staff member
   * Note: Since staff_activity_logs table doesn't exist, returning empty array
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStaffActivityLogs(_staffId: number, _limit: number = 50) {
    // Return empty array since staff_activity_logs table doesn't exist
    // Activity is logged to console instead
    return [];
  }

  /**
   * Get final computed privileges for a staff member (detailed)
   * 
   * Returns full privilege information including name, description, module
   * Useful for UI display and audit logs
   */
  async getFinalPrivileges(staffId: number) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    return await PrivilegeCalculationService.calculateFinalPrivileges(staffId);
  }

  /**
   * Get final computed privilege codes for a staff member (optimized)
   * 
   * Returns only privilege codes as a Set
   * Ideal for JWT token storage and quick authorization checks
   */
  async getFinalPrivilegeCodes(staffId: number): Promise<Set<string>> {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    return await PrivilegeCalculationService.calculateFinalPrivilegeCodes(staffId);
  }

  /**
   * Check if staff member has a specific privilege
   * 
   * Uses dynamic calculation instead of raw SQL for consistency
   */
  async staffHasPrivilege(staffId: number, privilegeCode: string): Promise<boolean> {
    return await PrivilegeCalculationService.hasPrivilege(staffId, privilegeCode);
  }

  /**
   * Check if staff member has ANY of the specified privileges
   * 
   * @param staffId - Staff member ID
   * @param privilegeCodes - Array of privilege codes
   * @returns Array of privilege codes that the staff member has
   */
  async staffHasAnyPrivilege(staffId: number, privilegeCodes: string[]): Promise<string[]> {
    return await PrivilegeCalculationService.hasAnyPrivilege(staffId, privilegeCodes);
  }

  /**
   * Check if staff member has ALL of the specified privileges
   * 
   * @param staffId - Staff member ID
   * @param privilegeCodes - Array of privilege codes
   * @returns true if staff member has all privileges, false otherwise
   */
  async staffHasAllPrivileges(staffId: number, privilegeCodes: string[]): Promise<boolean> {
    return await PrivilegeCalculationService.hasAllPrivileges(staffId, privilegeCodes);
  }

  /**
   * Get privilege statistics for a staff member
   * 
   * Returns detailed breakdown of privilege sources and counts
   */
  async getPrivilegeStats(
    staffId: number
  ): Promise<{
    total_privileges: number;
    privileges_from_packages: number;
    individually_granted: number;
    individually_revoked: number;
    modules: string[];
  }> {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    return await PrivilegeCalculationService.getPrivilegeStats(staffId);
  }

  /**
   * Get detailed privilege breakdown for a staff member
   * 
   * Returns:
   * - privileges from packages
   * - individually granted privileges
   * - individually revoked privileges
   * - final computed privileges
   */
  async getPrivilegeBreakdown(staffId: number) {
    const staff = await this.staffRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Get package privileges
    const packagePrivileges = await AppDataSource.query(
      `
      SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.module
      FROM privileges p
      JOIN privileges_packages pp ON p.id = pp.privilege_id
      JOIN staff_packages sp ON pp.package_id = sp.package_id
      WHERE sp.staff_id = $1 AND p.is_active = true
      ORDER BY p.module, p.code
      `,
      [staffId]
    );

    // Get assigned packages
    const assignedPackages = await AppDataSource.query(
      `
      SELECT sp.package_id, p.code, p.name_en, p.name_ar, sp.assigned_at, sp.assigned_by
      FROM staff_packages sp
      JOIN packages p ON sp.package_id = p.id
      WHERE sp.staff_id = $1 AND p.is_active = true
      ORDER BY p.name_en
      `,
      [staffId]
    );

    // Get individual grants
    const grantedOverrides = await AppDataSource.query(
      `
      SELECT p.id, p.code, p.name_en, p.name_ar, p.module, spo.assigned_at
      FROM staff_privileges_override spo
      JOIN privileges p ON spo.privilege_id = p.id
      WHERE spo.staff_id = $1 AND spo.is_granted = true AND p.is_active = true
      ORDER BY p.module, p.code
      `,
      [staffId]
    );

    // Get individual revokes
    const revokedOverrides = await AppDataSource.query(
      `
      SELECT p.id, p.code, p.name_en, p.name_ar, p.module, spo.assigned_at
      FROM staff_privileges_override spo
      JOIN privileges p ON spo.privilege_id = p.id
      WHERE spo.staff_id = $1 AND spo.is_granted = false AND p.is_active = true
      ORDER BY p.module, p.code
      `,
      [staffId]
    );

    // Get final computed privileges
    const finalPrivileges = await PrivilegeCalculationService.calculateFinalPrivileges(staffId);

    return {
      staff_id: staffId,
      assigned_packages: assignedPackages.map((p: Record<string, unknown>) => ({
        package_id: p.package_id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        assigned_at: p.assigned_at,
        assigned_by: p.assigned_by,
      })),
      privileges_from_packages: packagePrivileges.map((p: Record<string, unknown>) => ({
        privilege_id: p.id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        module: p.module,
      })),
      individually_granted: grantedOverrides.map((p: Record<string, unknown>) => ({
        privilege_id: p.id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        module: p.module,
        granted_at: p.assigned_at,
      })),
      individually_revoked: revokedOverrides.map((p: Record<string, unknown>) => ({
        privilege_id: p.id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        module: p.module,
        revoked_at: p.assigned_at,
      })),
      final_computed_privileges: finalPrivileges.map((p: Record<string, unknown>) => ({
        privilege_id: p.id,
        code: p.code,
        name_en: p.name_en,
        name_ar: p.name_ar,
        module: p.module,
      })),
      summary: {
        total_final_privileges: finalPrivileges.length,
        from_packages: packagePrivileges.length,
        individually_granted: grantedOverrides.length,
        individually_revoked: revokedOverrides.length,
        assigned_packages: assignedPackages.length,
      },
    };
  }

  /**
   * CREATE: Create a new privilege package
   */
  async createPrivilegePackage(packageData: {
    code: string;
    name_en: string;
    name_ar: string;
    description_en?: string;
    description_ar?: string;
    privilege_ids: number[]; // Privileges to include in package
  }) {
    try {
      // Validate package code is unique
      const existingPackage = await AppDataSource.query(
        `SELECT id FROM packages WHERE code = $1`,
        [packageData.code]
      );

      if (existingPackage.length > 0) {
        throw new Error(`Package code "${packageData.code}" already exists`);
      }

      // Validate all privilege IDs exist
      if (packageData.privilege_ids && packageData.privilege_ids.length > 0) {
        const validPrivileges = await AppDataSource.query(
          `SELECT id FROM privileges WHERE id = ANY($1) AND is_active = true`,
          [packageData.privilege_ids]
        );

        if (validPrivileges.length !== packageData.privilege_ids.length) {
          throw new Error('One or more privilege IDs are invalid or inactive');
        }
      }

      // Insert package
      const result = await AppDataSource.query(
        `INSERT INTO packages (code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         RETURNING id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at`,
        [
          packageData.code,
          packageData.name_en,
          packageData.name_ar,
          packageData.description_en || null,
          packageData.description_ar || null,
        ]
      );

      const packageId = result[0].id;

      // Add privileges to package
      if (packageData.privilege_ids && packageData.privilege_ids.length > 0) {
        for (const privilegeId of packageData.privilege_ids) {
          await AppDataSource.query(
            `INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2)`,
            [packageId, privilegeId]
          );
        }
      }

      return {
        success: true,
        message: 'Privilege package created successfully',
        data: {
          ...result[0],
          privileges_count: packageData.privilege_ids.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to create privilege package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * READ: Get privilege package by ID with full details
   */
  async getPrivilegePackageById(packageId: number) {
    try {
      const packageData = await AppDataSource.query(
        `SELECT id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at
         FROM packages
         WHERE id = $1`,
        [packageId]
      );

      if (packageData.length === 0) {
        throw new Error(`Package with ID ${packageId} not found`);
      }

      const pkg = packageData[0];

      // Get privileges in this package
      const privileges = await AppDataSource.query(
        `SELECT p.id, p.code, p.name_en, p.name_ar, p.module, p.description_en, p.description_ar, p.is_active
         FROM privileges p
         JOIN privileges_packages pp ON p.id = pp.privilege_id
         WHERE pp.package_id = $1
         ORDER BY p.module, p.name_en`,
        [packageId]
      );

      return {
        success: true,
        data: {
          ...pkg,
          privileges,
          privileges_count: privileges.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch privilege package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * UPDATE: Update privilege package
   */
  async updatePrivilegePackage(
    packageId: number,
    updateData: {
      code?: string;
      name_en?: string;
      name_ar?: string;
      description_en?: string;
      description_ar?: string;
      is_active?: boolean;
      privilege_ids?: number[];
    }
  ) {
    try {
      // Check package exists
      const existingPackage = await AppDataSource.query(
        `SELECT id FROM packages WHERE id = $1`,
        [packageId]
      );

      if (existingPackage.length === 0) {
        throw new Error(`Package with ID ${packageId} not found`);
      }

      // If changing code, verify new code is unique
      if (updateData.code) {
        const codeExists = await AppDataSource.query(
          `SELECT id FROM packages WHERE code = $1 AND id != $2`,
          [updateData.code, packageId]
        );

        if (codeExists.length > 0) {
          throw new Error(`Package code "${updateData.code}" already exists`);
        }
      }

      // Validate privilege IDs if provided
      if (updateData.privilege_ids && updateData.privilege_ids.length > 0) {
        const validPrivileges = await AppDataSource.query(
          `SELECT id FROM privileges WHERE id = ANY($1) AND is_active = true`,
          [updateData.privilege_ids]
        );

        if (validPrivileges.length !== updateData.privilege_ids.length) {
          throw new Error('One or more privilege IDs are invalid or inactive');
        }
      }

      // Update package
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (updateData.code !== undefined) {
        updates.push(`code = $${paramCount++}`);
        values.push(updateData.code);
      }
      if (updateData.name_en !== undefined) {
        updates.push(`name_en = $${paramCount++}`);
        values.push(updateData.name_en);
      }
      if (updateData.name_ar !== undefined) {
        updates.push(`name_ar = $${paramCount++}`);
        values.push(updateData.name_ar);
      }
      if (updateData.description_en !== undefined) {
        updates.push(`description_en = $${paramCount++}`);
        values.push(updateData.description_en || null);
      }
      if (updateData.description_ar !== undefined) {
        updates.push(`description_ar = $${paramCount++}`);
        values.push(updateData.description_ar || null);
      }
      if (updateData.is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(updateData.is_active);
      }

      updates.push(`updated_at = NOW()`);
      values.push(packageId);

      const updateQuery = `UPDATE packages SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await AppDataSource.query(updateQuery, values);

      // Update privileges if provided
      if (updateData.privilege_ids !== undefined) {
        // Remove existing privilege associations
        await AppDataSource.query(
          `DELETE FROM privileges_packages WHERE package_id = $1`,
          [packageId]
        );

        // Add new privilege associations
        if (updateData.privilege_ids.length > 0) {
          for (const privilegeId of updateData.privilege_ids) {
            await AppDataSource.query(
              `INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2)`,
              [packageId, privilegeId]
            );
          }
        }
      }

      return {
        success: true,
        message: 'Privilege package updated successfully',
        data: result[0],
      };
    } catch (error) {
      throw new Error(`Failed to update privilege package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * DELETE: Delete privilege package
   */
  async deletePrivilegePackage(packageId: number) {
    try {
      // Check package exists
      const existingPackage = await AppDataSource.query(
        `SELECT id, code FROM packages WHERE id = $1`,
        [packageId]
      );

      if (existingPackage.length === 0) {
        throw new Error(`Package with ID ${packageId} not found`);
      }

      const pkg = existingPackage[0];

      // Check if package is assigned to any staff
      const assignedStaff = await AppDataSource.query(
        `SELECT COUNT(*) as count FROM staff_packages WHERE package_id = $1`,
        [packageId]
      );

      if (assignedStaff[0].count > 0) {
        throw new Error(
          `Cannot delete package "${pkg.code}" because it is assigned to ${assignedStaff[0].count} staff members. Unassign it first or set is_active to false.`
        );
      }

      // Delete privilege associations
      await AppDataSource.query(
        `DELETE FROM privileges_packages WHERE package_id = $1`,
        [packageId]
      );

      // Delete package
      await AppDataSource.query(
        `DELETE FROM packages WHERE id = $1`,
        [packageId]
      );

      return {
        success: true,
        message: `Privilege package "${pkg.code}" deleted successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to delete privilege package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update privileges in a package (add/remove individual privileges)
   */
  async updatePackagePrivileges(
    packageId: number,
    privilegeIds: number[]
  ) {
    try {
      // Check package exists
      const existingPackage = await AppDataSource.query(
        `SELECT id, code FROM packages WHERE id = $1`,
        [packageId]
      );

      if (existingPackage.length === 0) {
        throw new Error(`Package with ID ${packageId} not found`);
      }

      // Validate all privilege IDs exist and are active
      if (privilegeIds.length > 0) {
        const validPrivileges = await AppDataSource.query(
          `SELECT id FROM privileges WHERE id = ANY($1) AND is_active = true`,
          [privilegeIds]
        );

        if (validPrivileges.length !== privilegeIds.length) {
          throw new Error('One or more privilege IDs are invalid or inactive');
        }
      }

      // Remove existing privileges
      await AppDataSource.query(
        `DELETE FROM privileges_packages WHERE package_id = $1`,
        [packageId]
      );

      // Add new privileges
      for (const privilegeId of privilegeIds) {
        await AppDataSource.query(
          `INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2)`,
          [packageId, privilegeId]
        );
      }

      return {
        success: true,
        message: 'Package privileges updated successfully',
        data: {
          package_id: packageId,
          privileges_count: privilegeIds.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to update package privileges: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default StaffService;
