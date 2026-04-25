import { Request, Response } from 'express';
import { Privilege } from '../entities/Privilege';
import StaffService from '../services/StaffService';
import { AuditLogService } from '../services/AuditLogService';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';

const staffService = new StaffService();
const auditLogService = new AuditLogService();

/**
 * Staff Management Controller
 */
export class StaffController {
  private static async logAction(req: Request, action: string, description: string, oldValue?: Record<string, unknown>, newValue?: Record<string, unknown>) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.staff_id) return;

      const staff = await staffService.getStaffById(authReq.user.staff_id);

      const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : authReq.user.email;
      const role = authReq.user.role; // Default to role from token

      await auditLogService.createLog({
        userName,
        role: role || 'Staff',
        action,
        module: 'Staff',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });
    } catch (error) {
      console.error('Failed to create audit log in StaffController:', error);
    }
  }
  /**
   * GET /staff/types
   * Get all available staff types
   */
  static async getStaffTypes(req: Request, res: Response): Promise<void> {
    try {
      const staffTypes = await staffService.getAllStaffTypes();

      res.status(200).json({
        success: true,
        count: staffTypes.length,
        data: staffTypes.map((st) => ({
          id: st.id,
          code: st.code,
          name_en: st.name_en,
          name_ar: st.name_ar,
          description_en: st.description_en,
          description_ar: st.description_ar,
          is_active: st.is_active,
        })),
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching staff types',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/privileges
   * Get all available privileges (Admin and Executive Manager only)
   * Query params: module (optional) - filter by specific module
   * 
   * Response formats:
   * - Without module param: All privileges grouped by module
   * - With module param: Privileges for specific module
   */
  static async getPrivileges(req: Request, res: Response): Promise<void> {
    try {
      const { module } = req.query;
      const requestedModule = module as string | undefined;

      const privileges = await staffService.getAllPrivileges(requestedModule);

      // Group privileges by module if no specific module requested
      let response: Record<string, unknown>;

      if (!requestedModule) {
        // Group by module
        const grouped: Record<string, unknown[]> = {};
        (privileges as Privilege[]).forEach((p) => {
          const mod = p.module || 'Other';
          if (!grouped[mod]) {
            grouped[mod] = [];
          }
          grouped[mod].push({
            id: p.id,
            code: p.code,
            name_en: p.name_en,
            name_ar: p.name_ar,
            description_en: p.description_en,
            description_ar: p.description_ar,
            module: p.module,
            is_active: p.is_active,
          });
        });

        response = {
          success: true,
          data: grouped,
        };
      } else {
        // Specific module requested
        response = {
          success: true,
          module: requestedModule,
          count: privileges.length,
          data: (privileges as Privilege[]).map((p) => ({
            id: p.id,
            code: p.code,
            name_en: p.name_en,
            name_ar: p.name_ar,
            description_en: p.description_en,
            description_ar: p.description_ar,
            module: p.module,
            is_active: p.is_active,
          })),
        };
      }

      res.status(200).json(response);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/packages
   * Get all available privilege packages
   */
  static async getPrivilegePackages(req: Request, res: Response): Promise<void> {
    try {
      const packages = await staffService.getAllPrivilegePackages();

      res.status(200).json({
        success: true,
        count: packages.length,
        data: packages.map((pkg: Record<string, unknown>) => ({
          id: pkg.id,
          code: pkg.code,
          name_en: pkg.name_en,
          name_ar: pkg.name_ar,
          description_en: pkg.description_en,
          description_ar: pkg.description_ar,
          is_active: pkg.is_active,
        })),
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching privilege packages',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/packages
   * Create a new privilege package
   * Body: {
   *   code: string,
   *   name_en: string,
   *   name_ar: string,
   *   description_en?: string,
   *   description_ar?: string,
   *   privilege_ids: number[]
   * }
   */
  static async createPrivilegePackage(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authorization required',
        });
        return;
      }

      const staffTypeId = user.staff_type_id as number;

      // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can create packages
      if (staffTypeId !== 1 && staffTypeId !== 2) {
        res.status(403).json({
          success: false,
          message: 'Only administrators and executive managers can create privilege packages',
        });
        return;
      }

      const { code, name_en, name_ar, description_en, description_ar, privilege_ids } = req.body;

      if (!code || !name_en || !name_ar) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: code, name_en, name_ar',
        });
        return;
      }

      if (!privilege_ids || !Array.isArray(privilege_ids)) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_ids (array)',
        });
        return;
      }

      const result = await staffService.createPrivilegePackage({
        code,
        name_en,
        name_ar,
        description_en,
        description_ar,
        privilege_ids,
      });

      await StaffController.logAction(req, 'Create Package', `Created privilege package: ${code}`, undefined, result.data);

      res.status(201).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error creating privilege package',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/packages/:packageId
   * Get privilege package by ID with full details
   */
  static async getPrivilegePackageById(req: Request, res: Response): Promise<void> {
    try {
      const { packageId } = req.params;

      if (!packageId || isNaN(Number(packageId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID provided',
        });
        return;
      }

      const result = await staffService.getPrivilegePackageById(Number(packageId));

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(404).json({
        success: false,
        message: 'Error fetching privilege package',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /staff/packages/:packageId
   * Update privilege package
   * Body: {
   *   code?: string,
   *   name_en?: string,
   *   name_ar?: string,
   *   description_en?: string,
   *   description_ar?: string,
   *   is_active?: boolean,
   *   privilege_ids?: number[]
   * }
   */
  static async updatePrivilegePackage(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authorization required',
        });
        return;
      }

      const staffTypeId = user.staff_type_id as number;

      // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can update packages
      if (staffTypeId !== 1 && staffTypeId !== 2) {
        res.status(403).json({
          success: false,
          message: 'Only administrators and executive managers can update privilege packages',
        });
        return;
      }

      const { packageId } = req.params;

      if (!packageId || isNaN(Number(packageId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID provided',
        });
        return;
      }

      const updateData = req.body;

      const result = await staffService.updatePrivilegePackage(Number(packageId), updateData);

      await StaffController.logAction(req, 'Update Package', `Updated privilege package ID: ${packageId}`, undefined, updateData);

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error updating privilege package',
        error: errorMessage,
      });
    }
  }

  /**
   * DELETE /staff/packages/:packageId
   * Delete privilege package
   */
  static async deletePrivilegePackage(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authorization required',
        });
        return;
      }

      const staffTypeId = user.staff_type_id as number;

      // Only ADMIN (1) can delete packages
      if (staffTypeId !== 1) {
        res.status(403).json({
          success: false,
          message: 'Only administrators can delete privilege packages',
        });
        return;
      }

      const { packageId } = req.params;

      if (!packageId || isNaN(Number(packageId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID provided',
        });
        return;
      }

      const result = await staffService.deletePrivilegePackage(Number(packageId));

      await StaffController.logAction(req, 'Delete Package', `Deleted privilege package ID: ${packageId}`, undefined, result);

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error deleting privilege package',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /staff/packages/:packageId/privileges
   * Update privileges in a package
   * Body: {
   *   privilege_ids: number[]
   * }
   */
  static async updatePackagePrivileges(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authorization required',
        });
        return;
      }

      const staffTypeId = user.staff_type_id as number;

      // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can update package privileges
      if (staffTypeId !== 1 && staffTypeId !== 2) {
        res.status(403).json({
          success: false,
          message: 'Only administrators and executive managers can update package privileges',
        });
        return;
      }

      const { packageId } = req.params;
      const { privilege_ids } = req.body;

      if (!packageId || isNaN(Number(packageId))) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID provided',
        });
        return;
      }

      if (!privilege_ids || !Array.isArray(privilege_ids)) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_ids (array)',
        });
        return;
      }

      const result = await staffService.updatePackagePrivileges(Number(packageId), privilege_ids);

      await StaffController.logAction(req, 'Update Package Privileges', `Updated privileges for package ID: ${packageId}`, undefined, { privilege_ids });

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error updating package privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/packages/:packageId/privileges
   * Get all privileges in a specific package
   */
  static async getPackagePrivileges(req: Request, res: Response): Promise<void> {
    try {
      const { packageId } = req.params;

      const privileges = await staffService.getPackagePrivileges(Number(packageId));

      res.status(200).json({
        success: true,
        count: privileges.length,
        data: privileges,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching package privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/register
   * Register a new staff member
   * 
   * Authorization Rules:
   * - Only ADMIN (staff_type_id = 1) can register EXECUTIVE_MANAGER (staff_type_id = 2)
   * - ADMIN and EXECUTIVE_MANAGER can register other staff
   * - DEPUTY_EXEC_MANAGER can register staff but action requires approval
   */
  static async registerStaff(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authorization required. Please provide a valid JWT token.',
        });
        return;
      }

      const staffTypeId = user.staff_type_id as number;
      const {
        first_name_en,
        first_name_ar,
        last_name_en,
        last_name_ar,
        national_id,
        phone,
        address,
        staff_type_id,
        employment_start_date,
        employment_end_date,
      } = req.body;

      // Validation - email and password are NOT provided by admin/exec manager
      // They will be set to national_id initially and changed by staff on first login
      if (!first_name_en || !last_name_en || !national_id || !phone || !staff_type_id || !employment_start_date) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: first_name_en, last_name_en, national_id, phone, staff_type_id, employment_start_date',
        });
        return;
      }

      // Authorization check: Only ADMIN can register EXECUTIVE_MANAGER
      // EXEC_MANAGER has staff_type_id = 2
      if (Number(staff_type_id) === 2 && staffTypeId !== 1) {
        res.status(403).json({
          success: false,
          message: 'Only administrators can create Executive Manager accounts',
        });
        return;
      }

      // Only ADMIN (1), EXECUTIVE_MANAGER (2), or DEPUTY_EXEC_MANAGER (3) can register other staff
      if (staffTypeId !== 1 && staffTypeId !== 2 && staffTypeId !== 3) {
        res.status(403).json({
          success: false,
          message: 'Only administrators, executive managers, and deputy managers can register staff',
        });
        return;
      }

      // Use national_id as initial password (StaffService will handle hashing)
      const staffData = {
        first_name_en,
        first_name_ar: first_name_ar || first_name_en,
        last_name_en,
        last_name_ar: last_name_ar || last_name_en,
        national_id,
        email: `staff.${national_id}@helwan-club.local`,
        password: national_id, // Pass cleartext, service will hash it
        phone,
        address: address || '',
        staff_type_id: Number(staff_type_id),
        employment_start_date: new Date(employment_start_date),
        employment_end_date: employment_end_date ? new Date(employment_end_date) : undefined,
        created_by_staff_type_id: staffTypeId,
      };

      const result = await staffService.registerStaff(staffData);

      await StaffController.logAction(req, 'Register', `Registered new staff member: ${first_name_en} ${last_name_en}`, undefined, result);

      res.status(201).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Registration Error:', error);
      res.status(400).json({
        success: false,
        message: errorMessage, // Use actual error message here
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id
   * Get staff member details including assigned packages and privileges
   */
  static async getStaffById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'Invalid staff ID provided',
        });
        return;
      }

      const staff = await staffService.getStaffById(Number(id));

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in getStaffById:', errorMessage);
      res.status(404).json({
        success: false,
        message: 'Staff member not found',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff
   * Get all staff members with pagination
   */
  static async getAllStaff(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await staffService.getAllStaff(page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching staff list',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /staff/:id
   * Update staff member information
   */
  static async updateStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await staffService.updateStaff(Number(id), updateData);

      await StaffController.logAction(req, 'Update', `Updated staff member ID: ${id}`, undefined, updateData);

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error updating staff member',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/packages
   * Assign privilege packages to a staff member
   * Body: {
   *   package_ids: number[],
   *   assigned_by: number (staff ID of who's making the assignment)
   * }
   */
  static async assignPackages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { package_ids } = req.body;

      // Extract user from middleware
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!package_ids || !Array.isArray(package_ids)) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: package_ids (array)',
        });
        return;
      }

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'Authorization required. Invalid user context.',
        });
        return;
      }

      const result = await staffService.assignPackages(Number(id), package_ids, Number(user.staff_id));

      await StaffController.logAction(req, 'Assign Packages', `Assigned privilege packages to staff ID: ${id}`, undefined, { package_ids });

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error assigning privilege packages',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/privileges/grant
   * Grant individual privileges to a staff member
   * Body: {
   *   privilege_id: number,      // Single privilege ID
   *   reason?: string
   * }
   * OR for multiple:
   * Body: {
   *   privilege_ids: number[],   // Array of privilege IDs
   *   reason?: string
   * }
   */
  static async grantPrivilege(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { privilege_id, privilege_ids, reason } = req.body;
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'Authorization required. Invalid user context.',
        });
        return;
      }

      // Accept either single privilege_id or array privilege_ids
      const ids = privilege_id ? [privilege_id] : (privilege_ids || []);

      if (!ids || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_id or privilege_ids',
        });
        return;
      }

      // Grant each privilege individually
      const results: Array<Record<string, unknown>> = [];
      for (const privId of ids) {
        try {
          const result = await staffService.grantPrivilege(
            Number(id),
            Number(privId),
            Number(user.staff_id),
            reason
          );
          results.push(result);
        } catch (err) {
          results.push({
            success: false,
            privilege_id: privId,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      const allSuccessful = results.every((r: Record<string, unknown>) => r.success !== false);

      if (allSuccessful) {
        await StaffController.logAction(req, 'Grant Privilege', `Granted privileges to staff ID: ${id}`, undefined, { ids, reason });
      }

      res.status(allSuccessful ? 200 : 207).json({
        success: allSuccessful,
        count: ids.length,
        results,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error granting privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/revoke-privilege
   * Revoke privileges from a staff member
   * Body: {
   *   privilege_id: number,      // Single privilege ID
   *   reason?: string
   * }
   * OR for multiple:
   * Body: {
   *   privilege_ids: number[],   // Array of privilege IDs
   *   reason?: string
   * }
   */
  static async revokePrivilege(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { privilege_id, privilege_ids, reason } = req.body;
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'Authorization required. Invalid user context.',
        });
        return;
      }

      // Accept either single privilege_id or array privilege_ids
      const ids = privilege_id ? [privilege_id] : (privilege_ids || []);

      if (!ids || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_id or privilege_ids',
        });
        return;
      }

      // Revoke each privilege individually
      const results: Array<Record<string, unknown>> = [];
      const failedAttempts: Array<{ privilege_id: number; error: string }> = [];

      for (const privId of ids) {
        try {
          const result = await staffService.revokePrivilege(
            Number(id),
            Number(privId),
            Number(user.staff_id),
            reason
          );
          results.push({ ...result, privilege_id: privId, success: true });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          results.push({
            success: false,
            privilege_id: privId,
            error: errorMsg,
          });

          // Track all failures for detailed response
          failedAttempts.push({
            privilege_id: privId,
            error: errorMsg,
          });
        }
      }

      const allSuccessful = results.every((r: Record<string, unknown>) => r.success !== false);

      if (allSuccessful) {
        await StaffController.logAction(req, 'Revoke Privilege', `Revoked privileges from staff ID: ${id}`, undefined, { ids, reason });
        res.status(200).json({
          success: true,
          count: ids.length,
          results,
        });
      } else if (failedAttempts.length > 0) {
        // Some failed - return details
        res.status(409).json({
          success: false,
          count: ids.length,
          successful_revokes: results.filter((r: Record<string, unknown>) => r.success).length,
          failed_revokes: failedAttempts.length,
          results,
          failed_attempts: failedAttempts,
          hint: 'Some privileges could not be revoked. See failed_attempts for details.',
        });
      } else {
        res.status(207).json({
          success: false,
          count: ids.length,
          results,
        });
      }
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error revoking privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/privileges
   * Get all effective privileges for a staff member
   */
  static async getStaffPrivileges(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const privileges = await staffService.getStaffPrivileges(Number(id));

      res.status(200).json({
        success: true,
        count: privileges.length,
        data: privileges,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching staff privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/has-privilege/:privilegeCode
   * Check if a staff member has a specific privilege
   */
  static async checkPrivilege(req: Request, res: Response): Promise<void> {
    try {
      const { id, privilegeCode } = req.params;

      const hasPrivilege = await staffService.hasPrivilege(Number(id), privilegeCode);

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        privilege_code: privilegeCode,
        has_privilege: hasPrivilege,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error checking privilege',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/deactivate
   * Deactivate a staff member
   * Body: {
   *   deactivated_by: number (staff ID)
   * }
   */
  static async deactivateStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'Authorization required. Invalid user context.',
        });
        return;
      }

      const result = await staffService.deactivateStaff(Number(id), Number(user.staff_id));

      await StaffController.logAction(req, 'Deactivate', `Deactivated staff member ID: ${id}`, undefined, { status: 'inactive', is_active: false });

      res.status(200).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Error deactivating staff member',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/activity-logs
   * Get activity logs for a staff member
   */
  static async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;

      const logs = await staffService.getStaffActivityLogs(Number(id), limit);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error fetching activity logs',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/final-privileges
   * Get dynamically calculated final privileges for a staff member (detailed view)
   * 
   * Combines:
   * - Privileges from all assigned packages
   * - Individual privilege grants
   * - Individual privilege revokes
   * 
   * Returns full privilege details including name, description, module
   */
  static async getFinalPrivileges(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const staffId = Number(id);

      if (!Number.isFinite(staffId) || staffId <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid staff ID',
          code: 'INVALID_STAFF_ID',
        });
        return;
      }

      const privileges = await staffService.getFinalPrivileges(staffId);

      res.status(200).json({
        success: true,
        staff_id: staffId,
        count: privileges.length,
        privileges,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Staff member not found',
          code: 'STAFF_NOT_FOUND',
          error: errorMessage,
        });
      } else {
        console.error('Error fetching final privileges:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching final privileges',
          code: 'INTERNAL_ERROR',
          error: errorMessage,
        });
      }
    }
  }

  /**
   * GET /staff/:id/privilege-codes
   * Get dynamically calculated final privilege codes for a staff member (optimized)
   * 
   * Returns only privilege codes as an array
   * Ideal for lightweight authorization checks
   */
  static async getFinalPrivilegeCodes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const privilegeCodes = await staffService.getFinalPrivilegeCodes(Number(id));

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        privilege_codes: Array.from(privilegeCodes),
        count: privilegeCodes.size,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(404).json({
        success: false,
        message: 'Error fetching privilege codes',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/check-privilege/:privilegeCode
   * Check if a staff member has a specific privilege
   * 
   * Returns: { has_privilege: true/false }
   */
  static async checkStaffPrivilege(req: Request, res: Response): Promise<void> {
    try {
      const { id, privilegeCode } = req.params;

      const hasPrivilege = await staffService.staffHasPrivilege(Number(id), privilegeCode);

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        privilege_code: privilegeCode,
        has_privilege: hasPrivilege,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error checking privilege',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/check-privileges/any
   * Check if a staff member has ANY of the specified privileges
   * 
   * Body: {
   *   privilege_codes: string[]  // Array of privilege codes to check
   * }
   * 
   * Returns: { found_privileges: string[], matching_count: number }
   */
  static async checkStaffHasAnyPrivilege(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { privilege_codes } = req.body;

      if (!privilege_codes || !Array.isArray(privilege_codes) || privilege_codes.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_codes (non-empty array)',
        });
        return;
      }

      const foundPrivileges = await staffService.staffHasAnyPrivilege(Number(id), privilege_codes);

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        requested_privileges: privilege_codes,
        found_privileges: foundPrivileges,
        matching_count: foundPrivileges.length,
        has_any: foundPrivileges.length > 0,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error checking privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /staff/:id/check-privileges/all
   * Check if a staff member has ALL of the specified privileges
   * 
   * Body: {
   *   privilege_codes: string[]  // Array of privilege codes to check
   * }
   * 
   * Returns: { has_all: true/false }
   */
  static async checkStaffHasAllPrivileges(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { privilege_codes } = req.body;

      if (!privilege_codes || !Array.isArray(privilege_codes) || privilege_codes.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: privilege_codes (non-empty array)',
        });
        return;
      }

      const hasAllPrivileges = await staffService.staffHasAllPrivileges(Number(id), privilege_codes);

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        requested_privileges: privilege_codes,
        has_all: hasAllPrivileges,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error checking privileges',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/privilege-stats
   * Get privilege statistics for a staff member
   * 
   * Returns breakdown of:
   * - Total final privileges
   * - Privileges from packages
   * - Individually granted
   * - Individually revoked
   * - Modules covered
   */
  static async getStaffPrivilegeStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await staffService.getPrivilegeStats(Number(id));

      res.status(200).json({
        success: true,
        staff_id: Number(id),
        stats,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(404).json({
        success: false,
        message: 'Error fetching privilege statistics',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /staff/:id/privilege-breakdown
   * Get detailed privilege breakdown for a staff member
   * 
   * Returns:
   * - Assigned packages with their privileges
   * - Individually granted privileges
   * - Individually revoked privileges
   * - Final computed privilege set
   * - Summary statistics
   */
  static async getStaffPrivilegeBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const breakdown = await staffService.getPrivilegeBreakdown(Number(id));

      res.status(200).json({
        success: true,
        data: breakdown,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(404).json({
        success: false,
        message: 'Error fetching privilege breakdown',
        error: errorMessage,
      });
    }
  }
}

export default StaffController;

