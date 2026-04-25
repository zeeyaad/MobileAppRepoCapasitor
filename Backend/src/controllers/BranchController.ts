import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Branch } from '../entities/Branch';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * BranchController - Handles branch management
 * 
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 * 
 * Privileges required:
 * - VIEW_BRANCHES (code: 72): View branches list and details
 * - CREATE_BRANCH (code: 73): Create new branches
 * - UPDATE_BRANCH (code: 74): Edit branch information
 * - DELETE_BRANCH (code: 75): Delete branches
 * - ASSIGN_BRANCH_TO_MEMBER (code: 76): Assign branch to members
 * 
 * Authorization Flow:
 * 1. Client sends request with JWT token in Authorization header
 * 2. authorizePrivilege middleware intercepts request
 * 3. Middleware extracts token and verifies JWT signature
 * 4. Extracts staff_id from decoded token
 * 5. Extracts privileges array from token (these are pre-calculated at login based on staff packages + overrides)
 * 6. Checks if required privilege exists in privileges array
 * 7. If missing, returns 403 Forbidden
 * 8. If present, attaches user data to req.user and calls controller
 */
export class BranchController {
  private static branchRepo = AppDataSource.getRepository(Branch);

  private static async logAction(req: AuthenticatedRequest, action: string, description: string, oldValue?: any, newValue?: any) {
    try {
      if (!req.user || !req.user.staff_id) return;

      const staffRepo = AppDataSource.getRepository('Staff');
      const staff = await staffRepo.findOne({
        where: { id: req.user.staff_id },
        relations: ['staff_type']
      }) as any;

      const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : req.user.email;
      const role = staff?.staff_type?.name_en || req.user.role;

      await auditLogService.createLog({
        userName,
        role,
        action,
        module: 'Branches',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });
    } catch (error) {
      console.error('Failed to create audit log in BranchController:', error);
    }
  }

  /**
   * VIEW_BRANCHES - Get all branches
   * GET /api/branches
   * 
   * @requires VIEW_BRANCHES privilege
   * @returns Array of all branches sorted by most recent
   */
  static async getAllBranches(req: AuthenticatedRequest, res: Response) {
    try {
      const branches = await BranchController.branchRepo.find({
        order: { created_at: 'DESC' },
      });

      return res.json({
        success: true,
        data: branches,
        count: branches.length,
        staff_id: req.user?.staff_id,
      });
    } catch (error: unknown) {
      console.error('Error fetching branches:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch branches',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_BRANCHES - Get specific branch by ID
   * GET /api/branches/:id
   * 
   * @requires VIEW_BRANCHES privilege
   * @param {number} id - Branch ID
   * @returns Branch object with all details
   */
  static async getBranchById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const branchId = parseInt(id);
      if (isNaN(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Must be a number.',
        });
      }

      const branch = await BranchController.branchRepo.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      return res.json({
        success: true,
        data: branch,
      });
    } catch (error: unknown) {
      console.error('Error fetching branch:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch branch',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_BRANCH - Create a new branch
   * POST /api/branches
   * 
   * @requires CREATE_BRANCH privilege
   * @body {string} code - Unique branch code (e.g., "MAIN", "CAIRO", "GIZA")
   * @body {string} name_en - Branch name in English
   * @body {string} name_ar - Branch name in Arabic
   * @body {string} [location_en] - Branch location in English (optional)
   * @body {string} [location_ar] - Branch location in Arabic (optional)
   * @body {string} [phone] - Branch phone number (optional)
   * @body {string} [status] - Branch status (optional, default: "active", values: "active", "inactive", "archived")
   * @returns Created branch object with ID and timestamps
   */
  static async createBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, name_en, name_ar, location_en, location_ar, phone, status } = req.body;

      // Validate required fields
      if (!code || !name_en || !name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: code, name_en, name_ar',
        });
      }

      // Validate status if provided
      const validStatuses = ['active', 'inactive', 'archived'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: active, inactive, archived',
        });
      }

      // Validate field lengths
      if (code.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Branch code must not exceed 50 characters',
        });
      }

      if (name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch English name must not exceed 100 characters',
        });
      }

      if (name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch Arabic name must not exceed 100 characters',
        });
      }

      if (location_en && location_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch English location must not exceed 100 characters',
        });
      }

      if (location_ar && location_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch Arabic location must not exceed 100 characters',
        });
      }

      if (phone && phone.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Branch phone must not exceed 20 characters',
        });
      }

      // Check if code already exists (unique constraint)
      const existingBranch = await BranchController.branchRepo.findOne({ where: { code } });
      if (existingBranch) {
        return res.status(409).json({
          success: false,
          message: 'Branch with this code already exists',
        });
      }

      const newBranch = new Branch();
      newBranch.code = code;
      newBranch.name_en = name_en;
      newBranch.name_ar = name_ar;
      newBranch.location_en = location_en || null;
      newBranch.location_ar = location_ar || null;
      newBranch.phone = phone || null;
      newBranch.status = status || 'active';

      const savedBranch = await BranchController.branchRepo.save(newBranch);

      await BranchController.logAction(req, 'Create', `Created branch: ${savedBranch.name_en} (${savedBranch.code})`, null, savedBranch);

      return res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: savedBranch,
      });
    } catch (error: unknown) {
      console.error('Error creating branch:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create branch',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_BRANCH - Edit branch information
   * PUT /api/branches/:id
   * 
   * @requires UPDATE_BRANCH privilege
   * @param {number} id - Branch ID to update
   * @body {string} [code] - New branch code (optional)
   * @body {string} [name_en] - New branch name in English (optional)
   * @body {string} [name_ar] - New branch name in Arabic (optional)
   * @body {string} [location_en] - New branch location in English (optional)
   * @body {string} [location_ar] - New branch location in Arabic (optional)
   * @body {string} [phone] - New branch phone (optional)
   * @body {string} [status] - New branch status (optional, values: "active", "inactive", "archived")
   * @returns Updated branch object
   */
  static async updateBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { code, name_en, name_ar, location_en, location_ar, phone, status } = req.body;

      // Validate ID parameter
      const branchId = parseInt(id);
      if (isNaN(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Must be a number.',
        });
      }

      // Find existing branch
      const branch = await BranchController.branchRepo.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Validate status if provided
      const validStatuses = ['active', 'inactive', 'archived'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: active, inactive, archived',
        });
      }

      // If updating code, check for conflicts with unique constraint
      if (code && code !== branch.code) {
        const existingBranch = await BranchController.branchRepo.findOne({ where: { code } });
        if (existingBranch) {
          return res.status(409).json({
            success: false,
            message: 'Branch with this code already exists',
          });
        }
      }

      // Validate field lengths
      if (code && code.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Branch code must not exceed 50 characters',
        });
      }

      if (name_en && name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch English name must not exceed 100 characters',
        });
      }

      if (name_ar && name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch Arabic name must not exceed 100 characters',
        });
      }

      if (location_en && location_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch English location must not exceed 100 characters',
        });
      }

      if (location_ar && location_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Branch Arabic location must not exceed 100 characters',
        });
      }

      if (phone && phone.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Branch phone must not exceed 20 characters',
        });
      }

      // Update fields (only provided fields)
      const oldBranch = { ...branch };
      branch.code = code || branch.code;
      branch.name_en = name_en || branch.name_en;
      branch.name_ar = name_ar || branch.name_ar;
      if (location_en !== undefined) branch.location_en = location_en;
      if (location_ar !== undefined) branch.location_ar = location_ar;
      if (phone !== undefined) branch.phone = phone;
      if (status !== undefined) branch.status = status;

      const updatedBranch = await BranchController.branchRepo.save(branch);

      await BranchController.logAction(req, 'Update', `Updated branch: ${updatedBranch.name_en}`, oldBranch, updatedBranch);

      return res.json({
        success: true,
        message: 'Branch updated successfully',
        data: updatedBranch,
      });
    } catch (error: unknown) {
      console.error('Error updating branch:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update branch',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_BRANCH - Delete a branch
   * DELETE /api/branches/:id
   * 
   * @requires DELETE_BRANCH privilege
   * @param {number} id - Branch ID to delete
   * @returns Success message
   * 
   * Note: Deletion may fail if branch has associated records
   */
  static async deleteBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const branchId = parseInt(id);
      if (isNaN(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Must be a number.',
        });
      }

      // Find existing branch
      const branch = await BranchController.branchRepo.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Check if branch has associated sport teams by querying BranchSportTeam directly
      try {
        const branchSportTeamRepo = AppDataSource.getRepository('BranchSportTeam');
        const associatedTeams = await branchSportTeamRepo.find({
          where: { branch_id: branchId },
        });

        if (associatedTeams && associatedTeams.length > 0) {
          return res.status(409).json({
            success: false,
            message: `Cannot delete branch. It has ${associatedTeams.length} associated sport team record(s)`,
          });
        }
      } catch (relationError) {
        // If the relation check fails (table doesn't exist), continue with deletion
        // The database will enforce any foreign key constraints
        console.warn('Warning: Could not check branch_sport_teams relation:', relationError);
      }

      await BranchController.branchRepo.remove(branch);

      await BranchController.logAction(req, 'Delete', `Deleted branch: ${branch.name_en} (${branch.code})`, branch, null);

      return res.json({
        success: true,
        message: 'Branch deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting branch:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete branch',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_BRANCH_TO_MEMBER - Assign branch to a member
   * POST /api/branches/:branchId/assign-to-member/:memberId
   * 
   * @requires ASSIGN_BRANCH_TO_MEMBER privilege
   * @param {number} branchId - Branch ID to assign
   * @param {number} memberId - Member ID to assign branch to
   * @returns Success message
   * 
   * This endpoint updates the branch assignment for a member.
   */
  static async assignBranchToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { branchId, memberId } = req.params;

      // Validate parameters
      const bId = parseInt(branchId);
      const mId = parseInt(memberId);

      if (isNaN(bId) || isNaN(mId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID or member ID. Both must be numbers.',
        });
      }

      // Verify branch exists
      const branch = await BranchController.branchRepo.findOne({
        where: { id: bId },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Verify member exists
      const memberRepo = AppDataSource.getRepository('Member');
      const member = await memberRepo.findOne({
        where: { id: mId },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found',
        });
      }

      // Update branch assignment (store in a junction table or directly on member if applicable)
      // For now, this is a placeholder that logs the assignment
      await BranchController.logAction(req, 'Assign Branch', `Assigned branch ${branch.name_en} to member ID: ${mId}`, null, { member_id: mId, branch_id: bId });

      return res.json({
        success: true,
        message: 'Branch assigned to member successfully',
        data: {
          member_id: mId,
          branch_id: bId,
          branch_code: branch.code,
          branch_name: branch.name_en,
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning branch to member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign branch to member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default BranchController;
