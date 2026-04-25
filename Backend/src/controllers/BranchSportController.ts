import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { BranchSport } from '../entities/BranchSport';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * BranchSportController - Manages branch-sport relationships
 * 
 * This controller handles the many-to-many relationship between branches and sports.
 * It allows filtering sports by branch and branches by sport.
 * 
 * All endpoints are protected by privilege-based authorization.
 */
export class BranchSportController {
  private static branchSportRepo = AppDataSource.getRepository(BranchSport);

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
        module: 'Branch Sports',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });
    } catch (error) {
      console.error('Failed to create audit log in BranchSportController:', error);
    }
  }

  /**
   * GET /api/branches/:branchId/sports
   * Get all sports available in a specific branch
   * @param {number} branchId - Branch ID
   * @returns Array of sports in the branch
   */
  static async getSportsByBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const { branchId } = req.params;

      const branchIdNum = parseInt(branchId);
      if (isNaN(branchIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Must be a number.',
        });
      }

      // Verify branch exists
      const branchRepo = AppDataSource.getRepository('Branch');
      const branch = await branchRepo.findOne({ where: { id: branchIdNum } });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      const branchSports = await BranchSportController.branchSportRepo.find({
        where: { branch_id: branchIdNum, status: 'active' },
        relations: ['sport'],
        order: { created_at: 'DESC' },
      });

      const sports = branchSports.map(bs => ({
        id: bs.sport.id,
        code: (bs.sport as any).code,
        name_en: bs.sport.name_en,
        name_ar: bs.sport.name_ar,
        description_en: bs.sport.description_en,
        description_ar: bs.sport.description_ar,
        price: bs.sport.price,
        status: bs.sport.status,
        branch_sport_id: bs.id,
        branch_sport_status: bs.status,
      }));

      return res.json({
        success: true,
        data: sports,
        count: sports.length,
        branch_id: branchIdNum,
      });
    } catch (error: unknown) {
      console.error('Error fetching sports by branch:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sports',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/sports/:sportId/branches
   * Get all branches where a specific sport is available
   * @param {number} sportId - Sport ID
   * @returns Array of branches with the sport
   */
  static async getBranchesBySport(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId } = req.params;

      const sportIdNum = parseInt(sportId);
      if (isNaN(sportIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID. Must be a number.',
        });
      }

      // Verify sport exists
      const sportRepo = AppDataSource.getRepository('Sport');
      const sport = await sportRepo.findOne({ where: { id: sportIdNum } });

      if (!sport) {
        return res.status(404).json({
          success: false,
          message: 'Sport not found',
        });
      }

      const branchSports = await BranchSportController.branchSportRepo.find({
        where: { sport_id: sportIdNum, status: 'active' },
        relations: ['branch'],
        order: { created_at: 'DESC' },
      });

      const branches = branchSports.map(bs => ({
        id: bs.branch.id,
        code: bs.branch.code,
        name_en: bs.branch.name_en,
        name_ar: bs.branch.name_ar,
        location_en: bs.branch.location_en,
        location_ar: bs.branch.location_ar,
        phone: bs.branch.phone,
        branch_sport_id: bs.id,
        branch_sport_status: bs.status,
      }));

      return res.json({
        success: true,
        data: branches,
        count: branches.length,
        sport_id: sportIdNum,
      });
    } catch (error: unknown) {
      console.error('Error fetching branches by sport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch branches',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * POST /api/branch-sports
   * Associate a sport with a branch
   * @body {number} branch_id - Branch ID
   * @body {number} sport_id - Sport ID
   * @returns Created branch-sport association
   */
  static async createBranchSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { branch_id, sport_id } = req.body;

      // Validate required fields
      if (!branch_id || !sport_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: branch_id, sport_id',
        });
      }

      // Verify branch exists
      const branchRepo = AppDataSource.getRepository('Branch');
      const branch = await branchRepo.findOne({ where: { id: branch_id } });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Verify sport exists
      const sportRepo = AppDataSource.getRepository('Sport');
      const sport = await sportRepo.findOne({ where: { id: sport_id } });

      if (!sport) {
        return res.status(404).json({
          success: false,
          message: 'Sport not found',
        });
      }

      // Check if relationship already exists
      const existingBranchSport = await BranchSportController.branchSportRepo.findOne({
        where: { branch_id, sport_id },
      });

      if (existingBranchSport) {
        // If it exists but is inactive, reactivate it
        if (existingBranchSport.status === 'inactive') {
          existingBranchSport.status = 'active';
          const updated = await BranchSportController.branchSportRepo.save(existingBranchSport);
          await BranchSportController.logAction(req, 'Reactivate', `Reactivated sport ${sport.name_en} for branch ${branch.name_en}`, existingBranchSport, updated);
          return res.status(200).json({
            success: true,
            message: 'Branch-sport association reactivated',
            data: updated,
          });
        }

        return res.status(409).json({
          success: false,
          message: 'This sport is already associated with this branch',
        });
      }

      const newBranchSport = new BranchSport();
      newBranchSport.branch_id = branch_id;
      newBranchSport.sport_id = sport_id;
      newBranchSport.status = 'active';

      const savedBranchSport = await BranchSportController.branchSportRepo.save(newBranchSport);

      await BranchSportController.logAction(req, 'Create', `Associated sport ${sport.name_en} with branch ${branch.name_en}`, null, savedBranchSport);

      return res.status(201).json({
        success: true,
        message: 'Sport associated with branch successfully',
        data: savedBranchSport,
      });
    } catch (error: unknown) {
      console.error('Error creating branch-sport association:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create branch-sport association',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE /api/branch-sports/:id
   * Remove a sport from a branch
   * @param {number} id - Branch-Sport association ID
   * @returns Success message
   */
  static async deleteBranchSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const associationId = parseInt(id);
      if (isNaN(associationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid association ID. Must be a number.',
        });
      }

      const branchSport = await BranchSportController.branchSportRepo.findOne({
        where: { id: associationId },
        relations: ['branch', 'sport'],
      });

      if (!branchSport) {
        return res.status(404).json({
          success: false,
          message: 'Branch-sport association not found',
        });
      }

      await BranchSportController.branchSportRepo.remove(branchSport);

      await BranchSportController.logAction(req, 'Delete', `Removed sport ${branchSport.sport.name_en} from branch ${branchSport.branch.name_en}`, branchSport, null);

      return res.json({
        success: true,
        message: 'Sport removed from branch successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting branch-sport association:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete branch-sport association',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PUT /api/branch-sports/:id
   * Update branch-sport association status
   * @param {number} id - Branch-Sport association ID
   * @body {string} status - New status ('active' or 'inactive')
   * @returns Updated association
   */
  static async updateBranchSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "active" or "inactive"',
        });
      }

      const associationId = parseInt(id);
      if (isNaN(associationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid association ID. Must be a number.',
        });
      }

      const branchSport = await BranchSportController.branchSportRepo.findOne({
        where: { id: associationId },
        relations: ['branch', 'sport'],
      });

      if (!branchSport) {
        return res.status(404).json({
          success: false,
          message: 'Branch-sport association not found',
        });
      }

      const oldStatus = branchSport.status;
      branchSport.status = status;
      const updatedBranchSport = await BranchSportController.branchSportRepo.save(branchSport);

      await BranchSportController.logAction(req, 'Update', `Changed status of ${branchSport.sport.name_en} in ${branchSport.branch.name_en} from ${oldStatus} to ${status}`, { status: oldStatus }, { status });

      return res.json({
        success: true,
        message: 'Branch-sport association updated successfully',
        data: updatedBranchSport,
      });
    } catch (error: unknown) {
      console.error('Error updating branch-sport association:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update branch-sport association',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default BranchSportController;
