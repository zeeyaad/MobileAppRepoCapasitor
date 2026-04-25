import { AppDataSource } from '../database/data-source';

export class PrivilegeCalculationService {
  /**
   * Calculate final privilege codes for a staff member
   * Combines privileges from packages and individual grants/revokes
   * Now includes source tracking and can_revoke flag
   */
  static async calculateFinalPrivileges(staffId: number): Promise<Record<string, unknown>[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      // Check if staff is Admin
      const staffCheck = await queryRunner.query(
        `SELECT staff_type_id FROM staff WHERE id = $1`,
        [staffId]
      );

      if (staffCheck.length === 0) {
        throw new Error(`Staff member with ID ${staffId} not found`);
      }

      const isAdmin = staffCheck[0].staff_type_id === 1;

      if (isAdmin) {
        // Admin gets ALL active privileges
        const allPrivileges = await queryRunner.query(
          `SELECT id, code, name_en, name_ar, module, is_active FROM privileges WHERE is_active = true ORDER BY module, code`
        );
        return allPrivileges.map((p: Record<string, unknown>) => ({
          ...p,
          source: 'default',
          can_revoke: false,
          reason: 'Admin user - inherent privilege'
        }));
      }

      // Get privileges from staff type defaults (if any) - simplified
      // Note: No explicit staff_type_packages table exists; defaults come through packages
      let typeDefaults: Record<string, unknown>[] = [];
      // typeDefaults remain empty; all privileges come through packages or direct overrides

      // Get privileges from assigned packages
      let packagePrivileges: Record<string, unknown>[] = [];
      try {
        packagePrivileges = await queryRunner.query(
          `
          SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.module, p.is_active, sp.package_id, pkg.code as package_code
          FROM privileges p
          INNER JOIN privileges_packages pp ON p.id = pp.privilege_id
          INNER JOIN staff_packages sp ON pp.package_id = sp.package_id
          INNER JOIN packages pkg ON sp.package_id = pkg.id
          WHERE sp.staff_id = $1 AND p.is_active = true
          `,
          [staffId]
        );
      } catch (error: any) {
        if (error?.code === '42P01' || error?.driverError?.code === '42P01') {
          console.warn('Note: Package tables not found, skipping package privileges');
          packagePrivileges = [];
        } else {
          throw error;
        }
      }

      // Get individually granted privileges
      let grantedPrivileges: Record<string, unknown>[] = [];
      try {
        grantedPrivileges = await queryRunner.query(
          `
          SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.module, p.is_active
          FROM privileges p
          INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
          WHERE spo.staff_id = $1 AND spo.is_granted = true AND p.is_active = true
          `,
          [staffId]
        );
      } catch (error: any) {
        if (error?.code === '42P01' || error?.driverError?.code === '42P01') {
          console.warn('Note: staff_privileges_override table not found, skipping granted privileges');
          grantedPrivileges = [];
        } else {
          throw error;
        }
      }

      // Get individually revoked privileges
      let revokedPrivileges: Record<string, unknown>[] = [];
      try {
        revokedPrivileges = await queryRunner.query(
          `
          SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.module, p.is_active
          FROM privileges p
          INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
          WHERE spo.staff_id = $1 AND spo.is_granted = false AND p.is_active = true
          `,
          [staffId]
        );
      } catch (error: any) {
        if (error?.code === '42P01' || error?.driverError?.code === '42P01') {
          console.warn('Note: staff_privileges_override table not found, skipping revoked privileges');
          revokedPrivileges = [];
        } else {
          throw error;
        }
      }

      // Build a map of privilege source information
      // Override-first approach: apply is_granted overrides to all privileges
      const privilegeMap = new Map<string, Record<string, unknown>>();
      const overriddenPrivileges = new Set<number>(); // Track which were overridden

      // Get ALL overrides (both grant and revoke)
      let allOverrides: Record<string, unknown>[] = [];
      try {
        allOverrides = await queryRunner.query(
          `
          SELECT DISTINCT p.id, p.code, p.name_en, p.name_ar, p.module, spo.is_granted
          FROM privileges p
          INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
          WHERE spo.staff_id = $1 AND p.is_active = true
          `,
          [staffId]
        );
      } catch (error: any) {
        if (!(error?.code === '42P01' || error?.driverError?.code === '42P01')) {
          throw error;
        }
      }

      // First, add package privileges
      packagePrivileges.forEach((p: Record<string, unknown>) => {
        privilegeMap.set(p.code as string, {
          ...p,
          source: 'package',
          package_id: p.package_id,
          package_code: p.package_code,
          can_revoke: true, // CAN revoke via override
          reason: 'Granted via package'
        });
      });

      // Then add directly granted privileges (overrides with is_granted=true)
      grantedPrivileges.forEach((p: Record<string, unknown>) => {
        privilegeMap.set(p.code as string, {
          ...p,
          source: 'direct',
          can_revoke: true,
          reason: 'Individually granted'
        });
        overriddenPrivileges.add(p.id as number);
      });

      // Finally, apply revoke overrides (remove those with is_granted=false)
      revokedPrivileges.forEach((p: Record<string, unknown>) => {
        privilegeMap.delete(p.code as string);
        overriddenPrivileges.add(p.id as number);
      });

      return Array.from(privilegeMap.values());
    } catch (error) {
      console.error(`Error calculating final privileges for staff ${staffId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get final computed privilege codes for a staff member (optimized)
   */
  static async calculateFinalPrivilegeCodes(staffId: number): Promise<Set<string>> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      // 1. Check if staff is Admin (staff_type_id = 1)
      const staffCheck = await queryRunner.query(
        `SELECT staff_type_id FROM staff WHERE id = $1`,
        [staffId]
      );

      if (staffCheck.length > 0 && staffCheck[0].staff_type_id === 1) {
        // Admin gets ALL active privileges
        const allPrivileges = await queryRunner.query(
          `SELECT code FROM privileges WHERE is_active = true`
        );
        const adminSet = new Set<string>();
        allPrivileges.forEach((p: { code: string }) => adminSet.add(p.code));
        return adminSet;
      }

      // 2. Get privileges from assigned packages
      // Fixed table name: staff_package_privileges -> privileges_packages
      const packagePrivileges = await queryRunner.query(
        `
        SELECT DISTINCT p.code
        FROM privileges p
        INNER JOIN privileges_packages pp ON p.id = pp.privilege_id
        INNER JOIN staff_packages sp ON pp.package_id = sp.package_id
        WHERE sp.staff_id = $1 AND p.is_active = true
        `,
        [staffId]
      );

      // 3. Get individually granted privileges
      // Fixed table name: staff_privilege_overrides -> staff_privileges_override
      const grantedPrivileges = await queryRunner.query(
        `
        SELECT DISTINCT p.code
        FROM privileges p
        INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
        WHERE spo.staff_id = $1 AND spo.is_granted = true AND p.is_active = true
        `,
        [staffId]
      );

      // 4. Get individually revoked privileges
      // Fixed table name: staff_privilege_overrides -> staff_privileges_override
      const revokedPrivileges = await queryRunner.query(
        `
        SELECT DISTINCT p.code
        FROM privileges p
        INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
        WHERE spo.staff_id = $1 AND spo.is_granted = false AND p.is_active = true
        `,
        [staffId]
      );

      // Combine: packages + grants - revokes
      const finalSet = new Set<string>();

      packagePrivileges.forEach((p: Record<string, unknown>) => {
        finalSet.add(p.code as string);
      });

      grantedPrivileges.forEach((p: Record<string, unknown>) => {
        finalSet.add(p.code as string);
      });

      revokedPrivileges.forEach((p: Record<string, unknown>) => {
        finalSet.delete(p.code as string);
      });

      return finalSet;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if staff member has a specific privilege
   */
  static async hasPrivilege(staffId: number, privilegeCode: string): Promise<boolean> {
    const privileges = await this.calculateFinalPrivilegeCodes(staffId);
    return privileges.has(privilegeCode);
  }

  /**
   * Check if staff member has ANY of the specified privileges
   */
  static async hasAnyPrivilege(staffId: number, privilegeCodes: string[]): Promise<string[]> {
    const privileges = await this.calculateFinalPrivilegeCodes(staffId);
    return privilegeCodes.filter((code) => privileges.has(code));
  }

  /**
   * Check if staff member has ALL of the specified privileges
   */
  static async hasAllPrivileges(staffId: number, privilegeCodes: string[]): Promise<boolean> {
    const privileges = await this.calculateFinalPrivilegeCodes(staffId);
    return privilegeCodes.every((code) => privileges.has(code));
  }

  /**
   * Get privilege statistics for a staff member
   */
  static async getPrivilegeStats(
    staffId: number
  ): Promise<{
    total_privileges: number;
    privileges_from_packages: number;
    individually_granted: number;
    individually_revoked: number;
    modules: string[];
  }> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      // Get package privileges count
      const packageCount = await queryRunner.query(
        `
        SELECT COUNT(DISTINCT p.id) as count
        FROM privileges p
        INNER JOIN privileges_packages pp ON p.id = pp.privilege_id
        INNER JOIN staff_packages sp ON pp.package_id = sp.package_id
        WHERE sp.staff_id = $1 AND p.is_active = true
        `,
        [staffId]
      );

      // Get granted count
      const grantedCount = await queryRunner.query(
        `
        SELECT COUNT(DISTINCT p.id) as count
        FROM privileges p
        INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
        WHERE spo.staff_id = $1 AND spo.is_granted = true AND p.is_active = true
        `,
        [staffId]
      );

      // Get revoked count
      const revokedCount = await queryRunner.query(
        `
        SELECT COUNT(DISTINCT p.id) as count
        FROM privileges p
        INNER JOIN staff_privileges_override spo ON p.id = spo.privilege_id
        WHERE spo.staff_id = $1 AND spo.is_granted = false AND p.is_active = true
        `,
        [staffId]
      );

      // Get unique modules
      const modules = await queryRunner.query(
        `
        SELECT DISTINCT p.module
        FROM privileges p
        WHERE p.is_active = true AND (
          p.id IN (
            SELECT DISTINCT p2.id
            FROM privileges p2
            INNER JOIN privileges_packages pp ON p2.id = pp.privilege_id
            INNER JOIN staff_packages sp ON pp.package_id = sp.package_id
            WHERE sp.staff_id = $1
          )
          OR p.id IN (
            SELECT DISTINCT p2.id
            FROM privileges p2
            INNER JOIN staff_privileges_override spo ON p2.id = spo.privilege_id
            WHERE spo.staff_id = $1 AND spo.is_granted = true
          )
        )
        AND p.id NOT IN (
          SELECT DISTINCT p2.id
          FROM privileges p2
          INNER JOIN staff_privileges_override spo ON p2.id = spo.privilege_id
          WHERE spo.staff_id = $1 AND spo.is_granted = false
        )
        ORDER BY p.module
        `,
        [staffId]
      );

      const privileges = await this.calculateFinalPrivilegeCodes(staffId);

      return {
        total_privileges: privileges.size,
        privileges_from_packages: (packageCount[0]?.count || 0) as number,
        individually_granted: (grantedCount[0]?.count || 0) as number,
        individually_revoked: (revokedCount[0]?.count || 0) as number,
        modules: modules.map((m: Record<string, unknown>) => m.module as string),
      };
    } finally {
      await queryRunner.release();
    }
  }
}

export default PrivilegeCalculationService;
