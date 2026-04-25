import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Profession } from '../entities/Profession';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * ProfessionController - Handles profession management
 * 
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 * 
 * Privileges required:
 * - VIEW_PROFESSIONS (code: 67): View professions list and details
 * - CREATE_PROFESSION (code: 68): Create new professions
 * - UPDATE_PROFESSION (code: 69): Edit profession information
 * - DELETE_PROFESSION (code: 70): Delete professions
 * - ASSIGN_PROFESSION_TO_MEMBER (code: 71): Assign profession to members
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
export class ProfessionController {
  private static professionRepo = AppDataSource.getRepository(Profession);

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
        module: 'Professions',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });
    } catch (error) {
      console.error('Failed to create audit log in ProfessionController:', error);
    }
  }

  /**
   * VIEW_PROFESSIONS - Get all professions
   * GET /api/professions
   * 
   * @requires VIEW_PROFESSIONS privilege
   * @returns Array of all professions sorted by most recent
   */
  static async getAllProfessions(req: AuthenticatedRequest, res: Response) {
    try {
      const professions = await ProfessionController.professionRepo.find({
        order: { created_at: 'DESC' },
      });

      return res.json({
        success: true,
        data: professions,
        count: professions.length,
        staff_id: req.user?.staff_id,
      });
    } catch (error: unknown) {
      console.error('Error fetching professions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch professions',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_PROFESSIONS - Get specific profession by ID
   * GET /api/professions/:id
   * 
   * @requires VIEW_PROFESSIONS privilege
   * @param {number} id - Profession ID
   * @returns Profession object with all details
   */
  static async getProfessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const professionId = parseInt(id);
      if (isNaN(professionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profession ID. Must be a number.',
        });
      }

      const profession = await ProfessionController.professionRepo.findOne({
        where: { id: professionId },
      });

      if (!profession) {
        return res.status(404).json({
          success: false,
          message: 'Profession not found',
        });
      }

      return res.json({
        success: true,
        data: profession,
      });
    } catch (error: unknown) {
      console.error('Error fetching profession:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profession',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_PROFESSION - Create a new profession
   * POST /api/professions
   * 
   * @requires CREATE_PROFESSION privilege
   * @body {string} code - Unique profession code (e.g., "DOC", "ENG", "LAW")
   * @body {string} name_en - Profession name in English
   * @body {string} name_ar - Profession name in Arabic
   * @returns Created profession object with ID and timestamps
   */
  static async createProfession(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, name_en, name_ar } = req.body;

      // Validate required fields
      if (!code || !name_en || !name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: code, name_en, name_ar',
        });
      }

      // Validate field lengths
      if (code.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Profession code must not exceed 50 characters',
        });
      }

      if (name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Profession English name must not exceed 100 characters',
        });
      }

      if (name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Profession Arabic name must not exceed 100 characters',
        });
      }

      // Check if code already exists (unique constraint)
      const existingProfession = await ProfessionController.professionRepo.findOne({ where: { code } });
      if (existingProfession) {
        return res.status(409).json({
          success: false,
          message: 'Profession with this code already exists',
        });
      }

      const newProfession = new Profession();
      newProfession.code = code;
      newProfession.name_en = name_en;
      newProfession.name_ar = name_ar;

      const savedProfession = await ProfessionController.professionRepo.save(newProfession);

      await ProfessionController.logAction(req, 'Create', `Created profession: ${savedProfession.name_en} (${savedProfession.code})`, null, savedProfession);

      return res.status(201).json({
        success: true,
        message: 'Profession created successfully',
        data: savedProfession,
      });
    } catch (error: unknown) {
      console.error('Error creating profession:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create profession',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_PROFESSION - Edit profession information
   * PUT /api/professions/:id
   * 
   * @requires UPDATE_PROFESSION privilege
   * @param {number} id - Profession ID to update
   * @body {string} [code] - New profession code (optional)
   * @body {string} [name_en] - New profession name in English (optional)
   * @body {string} [name_ar] - New profession name in Arabic (optional)
   * @returns Updated profession object
   */
  static async updateProfession(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { code, name_en, name_ar } = req.body;

      // Validate ID parameter
      const professionId = parseInt(id);
      if (isNaN(professionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profession ID. Must be a number.',
        });
      }

      // Find existing profession
      const profession = await ProfessionController.professionRepo.findOne({
        where: { id: professionId },
      });

      if (!profession) {
        return res.status(404).json({
          success: false,
          message: 'Profession not found',
        });
      }

      // If updating code, check for conflicts with unique constraint
      if (code && code !== profession.code) {
        const existingProfession = await ProfessionController.professionRepo.findOne({ where: { code } });
        if (existingProfession) {
          return res.status(409).json({
            success: false,
            message: 'Profession with this code already exists',
          });
        }
      }

      // Validate field lengths
      if (code && code.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Profession code must not exceed 50 characters',
        });
      }

      if (name_en && name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Profession English name must not exceed 100 characters',
        });
      }

      if (name_ar && name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Profession Arabic name must not exceed 100 characters',
        });
      }

      // Update fields (only provided fields)
      profession.code = code || profession.code;
      profession.name_en = name_en || profession.name_en;
      profession.name_ar = name_ar || profession.name_ar;

      const oldProfession = { ...profession };
      const updatedProfession = await ProfessionController.professionRepo.save(profession);

      await ProfessionController.logAction(req, 'Update', `Updated profession: ${updatedProfession.name_en}`, oldProfession, updatedProfession);

      return res.json({
        success: true,
        message: 'Profession updated successfully',
        data: updatedProfession,
      });
    } catch (error: unknown) {
      console.error('Error updating profession:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profession',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_PROFESSION - Delete a profession
   * DELETE /api/professions/:id
   * 
   * @requires DELETE_PROFESSION privilege
   * @param {number} id - Profession ID to delete
   * @returns Success message
   * 
   * Note: Deletion may fail if profession has associated employee detail records
   */
  static async deleteProfession(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const professionId = parseInt(id);
      if (isNaN(professionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profession ID. Must be a number.',
        });
      }

      // Find existing profession
      const profession = await ProfessionController.professionRepo.findOne({
        where: { id: professionId },
        relations: ['employee_details'],
      });

      if (!profession) {
        return res.status(404).json({
          success: false,
          message: 'Profession not found',
        });
      }

      // Check if profession has associated employee records
      if (profession.employee_details && profession.employee_details.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete profession. It has ${profession.employee_details.length} associated employee record(s)`,
        });
      }

      await ProfessionController.professionRepo.remove(profession);

      await ProfessionController.logAction(req, 'Delete', `Deleted profession: ${profession.name_en} (${profession.code})`, profession, null);

      return res.json({
        success: true,
        message: 'Profession deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting profession:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete profession',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_PROFESSION_TO_MEMBER - Assign profession to a member
   * POST /api/professions/:professionId/assign-to-member/:memberId
   * 
   * @requires ASSIGN_PROFESSION_TO_MEMBER privilege
   * @param {number} professionId - Profession ID to assign
   * @param {number} memberId - Member ID to assign profession to
   * @returns Success message
   * 
   * This endpoint updates the profession assignment for a member in the EmployeeDetail table.
   * Only applicable for working members (EmployeeDetail records).
   */
  static async assignProfessionToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { professionId, memberId } = req.params;

      // Validate parameters
      const pId = parseInt(professionId);
      const mId = parseInt(memberId);

      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profession ID or member ID. Both must be numbers.',
        });
      }

      // Verify profession exists
      const profession = await ProfessionController.professionRepo.findOne({
        where: { id: pId },
      });

      if (!profession) {
        return res.status(404).json({
          success: false,
          message: 'Profession not found',
        });
      }

      // Verify member and employee detail exists
      const employeeDetail = await AppDataSource.getRepository('EmployeeDetail').findOne({
        where: { member_id: mId },
      });

      if (!employeeDetail) {
        return res.status(404).json({
          success: false,
          message: 'Member or employee detail record not found. Member must be a working member.',
        });
      }

      // Update profession assignment
      employeeDetail.profession_id = pId;
      await AppDataSource.getRepository('EmployeeDetail').save(employeeDetail);

      await ProfessionController.logAction(req, 'Assign Profession', `Assigned profession ${profession.name_en} to member ID: ${mId}`, null, { member_id: mId, profession_id: pId });

      return res.json({
        success: true,
        message: 'Profession assigned to member successfully',
        data: {
          member_id: mId,
          profession_id: pId,
          profession_code: profession.code,
          profession_name: profession.name_en,
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning profession to member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign profession to member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default ProfessionController;
