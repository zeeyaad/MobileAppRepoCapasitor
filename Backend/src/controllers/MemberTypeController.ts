import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { MemberType } from '../entities/MemberType';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';

import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * MemberTypeController - Handles member type management
 * 
 * All endpoints are protected by privilege-based authorization.
 * 
 * Privileges required:
 * - VIEW_MEMBER_TYPES: View member types
 * - CREATE_MEMBER_TYPE: Create new member types
 * - UPDATE_MEMBER_TYPE: Edit member types
 * - DELETE_MEMBER_TYPE: Delete member types
 */
export class MemberTypeController {
  private static memberTypeRepo = AppDataSource.getRepository(MemberType);

  /**
   * VIEW_MEMBER_TYPES - Get all member types
   * GET /api/member-types
   */
  static async getAllMemberTypes(req: AuthenticatedRequest, res: Response) {
    try {
      const memberTypes = await MemberTypeController.memberTypeRepo.find({
        order: { created_at: 'DESC' },
      });

      return res.json({
        success: true,
        data: memberTypes,
        count: memberTypes.length,
      });
    } catch (error: unknown) {
      console.error('Error fetching member types:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch member types',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_MEMBER_TYPES - Get specific member type by ID
   * GET /api/member-types/:id
   */
  static async getMemberTypeById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const memberType = await MemberTypeController.memberTypeRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['membership_plans'],
      });

      if (!memberType) {
        return res.status(404).json({
          success: false,
          message: 'Member type not found',
        });
      }

      return res.json({
        success: true,
        data: memberType,
      });
    } catch (error: unknown) {
      console.error('Error fetching member type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch member type',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_MEMBER_TYPE - Create a new member type
   * POST /api/member-types
   */
  static async createMemberType(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, name_en, name_ar, description_en, description_ar } = req.body;

      // Validate required fields
      if (!code || !name_en || !name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: code, name_en, name_ar',
        });
      }

      // Check if code already exists
      const existingType = await MemberTypeController.memberTypeRepo.findOne({ where: { code } });
      if (existingType) {
        return res.status(409).json({
          success: false,
          message: 'Member type with this code already exists',
        });
      }

      const newMemberType = new MemberType();
      newMemberType.code = code;
      newMemberType.name_en = name_en;
      newMemberType.name_ar = name_ar;
      newMemberType.description_en = description_en || null;
      newMemberType.description_ar = description_ar || null;

      const savedMemberType = await MemberTypeController.memberTypeRepo.save(newMemberType);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Create',
        module: 'MemberTypes',
        description: `Created member type: ${savedMemberType.name_en} (${savedMemberType.code})`,
        status: 'نجح',
        newValue: savedMemberType,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json({
        success: true,
        message: 'Member type created successfully',
        data: savedMemberType,
      });
    } catch (error: unknown) {
      console.error('Error creating member type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create member type',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_MEMBER_TYPE - Edit member type details
   * PUT /api/member-types/:id
   */
  static async updateMemberType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { code, name_en, name_ar, description_en, description_ar } = req.body;

      const memberType = await MemberTypeController.memberTypeRepo.findOne({
        where: { id: parseInt(id) },
      });

      if (!memberType) {
        return res.status(404).json({
          success: false,
          message: 'Member type not found',
        });
      }

      // Check if new code conflicts with existing codes
      if (code && code !== memberType.code) {
        const existingType = await MemberTypeController.memberTypeRepo.findOne({ where: { code } });
        if (existingType) {
          return res.status(409).json({
            success: false,
            message: 'Member type with this code already exists',
          });
        }
      }

      // Update fields if provided
      if (code) memberType.code = code;
      if (name_en) memberType.name_en = name_en;
      if (name_ar) memberType.name_ar = name_ar;
      if (description_en !== undefined) memberType.description_en = description_en;
      if (description_ar !== undefined) memberType.description_ar = description_ar;

      const oldMemberType = { ...memberType };
      const updatedMemberType = await MemberTypeController.memberTypeRepo.save(memberType);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Update',
        module: 'MemberTypes',
        description: `Updated member type: ${updatedMemberType.name_en}`,
        status: 'نجح',
        oldValue: oldMemberType,
        newValue: updatedMemberType,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: 'Member type updated successfully',
        data: updatedMemberType,
      });
    } catch (error: unknown) {
      console.error('Error updating member type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update member type',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_MEMBER_TYPE - Delete member type
   * DELETE /api/member-types/:id
   */
  static async deleteMemberType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const memberType = await MemberTypeController.memberTypeRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['membership_plans'],
      });

      if (!memberType) {
        return res.status(404).json({
          success: false,
          message: 'Member type not found',
        });
      }

      // Check if member type has associated membership plans
      if (memberType.membership_plans && memberType.membership_plans.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete member type with associated membership plans',
          associated_plans: memberType.membership_plans.length,
        });
      }

      await MemberTypeController.memberTypeRepo.remove(memberType);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Delete',
        module: 'MemberTypes',
        description: `Deleted member type: ${memberType.name_en} (${memberType.code})`,
        status: 'نجح',
        oldValue: memberType,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: 'Member type deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting member type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete member type',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_MEMBER_TYPE_TO_MEMBER - Assign member type to a member
   * POST /api/members/:member_id/member-type
   */
  static async assignMemberTypeToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { member_id } = req.params;
      const { member_type_id } = req.body;

      if (!member_type_id) {
        return res.status(400).json({
          success: false,
          message: 'member_type_id is required',
        });
      }

      // Import Member here to avoid circular dependencies
      const memberRepo = AppDataSource.getRepository('Member');
      const member = await memberRepo.findOne({
        where: { id: parseInt(member_id) },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found',
        });
      }

      // Check if member type exists
      const memberType = await MemberTypeController.memberTypeRepo.findOne({
        where: { id: parseInt(member_type_id) },
      });

      if (!memberType) {
        return res.status(404).json({
          success: false,
          message: 'Member type not found',
        });
      }

      // Update member's member type
      member.member_type_id = parseInt(member_type_id);
      await memberRepo.save(member);

      return res.json({
        success: true,
        message: 'Member type assigned successfully',
        data: {
          member_id: member.id,
          member_type_id: memberType.id,
          member_type_name: memberType.name_en,
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning member type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign member type',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
