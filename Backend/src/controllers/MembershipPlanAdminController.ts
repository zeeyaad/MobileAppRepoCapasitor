import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { MembershipPlan } from '../entities/MembershipPlan';
import { MemberType } from '../entities/MemberType';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * Interface for MemberMembership entity (for type safety)
 */
interface IMemberMembership {
  id: number;
  member_id: number;
  plan_id: number;
  start_date: Date;
  end_date: Date;
  status: string;
  payment_method: string;
}

/**
 * MembershipPlanController - Handles membership plan management
 * 
 * All endpoints are protected by privilege-based authorization.
 * 
 * Privileges required:
 * - VIEW_MEMBERSHIP_PLANS: View membership plans
 * - CREATE_MEMBERSHIP_PLAN: Create new membership plans
 * - UPDATE_MEMBERSHIP_PLAN: Edit membership plans
 * - DELETE_MEMBERSHIP_PLAN: Delete membership plans
 * - CHANGE_MEMBERSHIP_PLAN_STATUS: Change plan status
 * - ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER: Assign plan to member
 * - CHANGE_MEMBER_MEMBERSHIP_PLAN: Change member's plan
 */
export class MembershipPlanController {
  private static planRepo = AppDataSource.getRepository(MembershipPlan);
  private static memberTypeRepo = AppDataSource.getRepository(MemberType);

  /**
   * VIEW_MEMBERSHIP_PLANS - Get all membership plans (paginated)
   * GET /api/membership-plans
   */
  static async getAllPlans(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20, member_type_id } = req.query;
      const skip = ((Number(page) - 1) * Number(limit)) || 0;

      const query = MembershipPlanController.planRepo.createQueryBuilder('plan')
        .leftJoinAndSelect('plan.member_type', 'member_type');

      // Filter by member type if provided
      if (member_type_id) {
        query.andWhere('plan.member_type_id = :member_type_id', { member_type_id });
      }

      const [plans, total] = await query
        .skip(skip)
        .take(Number(limit))
        .orderBy('plan.price', 'ASC')
        .getManyAndCount();

      return res.json({
        success: true,
        data: plans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: unknown) {
      console.error('Error fetching membership plans:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch membership plans',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_MEMBERSHIP_PLANS - Get specific membership plan by ID
   * GET /api/membership-plans/:id
   */
  static async getPlanById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const plan = await MembershipPlanController.planRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['member_type'],
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Membership plan not found',
        });
      }

      return res.json({
        success: true,
        data: plan,
      });
    } catch (error: unknown) {
      console.error('Error fetching membership plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch membership plan',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_MEMBERSHIP_PLAN - Create a new membership plan
   * POST /api/membership-plans
   */
  static async createPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        member_type_id,
        plan_code,
        name_en,
        name_ar,
        description_en,
        description_ar,
        price,
        currency,
        duration_months,
        renewal_price,
        is_active,
      } = req.body;

      // Validate required fields
      if (!member_type_id || !plan_code || !name_en || !name_ar || !price || !duration_months) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: member_type_id, plan_code, name_en, name_ar, price, duration_months',
        });
      }

      // Check if member type exists
      const memberType = await MembershipPlanController.memberTypeRepo.findOne({
        where: { id: parseInt(member_type_id) },
      });

      if (!memberType) {
        return res.status(404).json({
          success: false,
          message: 'Member type not found',
        });
      }

      // Check if plan code already exists
      const existingPlan = await MembershipPlanController.planRepo.findOne({ where: { plan_code } });
      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'Membership plan with this code already exists',
        });
      }

      const newPlan = new MembershipPlan();
      newPlan.member_type_id = parseInt(member_type_id);
      newPlan.plan_code = plan_code;
      newPlan.name_en = name_en;
      newPlan.name_ar = name_ar;
      newPlan.description_en = description_en || null;
      newPlan.description_ar = description_ar || null;
      newPlan.price = parseFloat(price);
      newPlan.currency = currency || 'EGP';
      newPlan.duration_months = parseInt(duration_months);
      // renewal_price is nullable in database, so only set if provided
      if (renewal_price) {
        newPlan.renewal_price = parseFloat(renewal_price);
      }
      newPlan.is_active = is_active !== undefined ? Boolean(is_active) : true;

      const savedPlan = await MembershipPlanController.planRepo.save(newPlan);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Create',
        module: 'MembershipPlans',
        description: `Created membership plan: ${savedPlan.name_en} (${savedPlan.plan_code})`,
        status: 'نجح',
        newValue: savedPlan,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json({
        success: true,
        message: 'Membership plan created successfully',
        data: savedPlan,
      });
    } catch (error: unknown) {
      console.error('Error creating membership plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create membership plan',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_MEMBERSHIP_PLAN - Edit membership plan details
   * PUT /api/membership-plans/:id
   */
  static async updatePlan(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        plan_code,
        name_en,
        name_ar,
        description_en,
        description_ar,
        price,
        currency,
        duration_months,
        renewal_price,
        is_active,
      } = req.body;

      const plan = await MembershipPlanController.planRepo.findOne({ where: { id: parseInt(id) } });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Membership plan not found',
        });
      }

      // Check if new plan code conflicts with existing codes
      if (plan_code && plan_code !== plan.plan_code) {
        const existingPlan = await MembershipPlanController.planRepo.findOne({ where: { plan_code } });
        if (existingPlan) {
          return res.status(409).json({
            success: false,
            message: 'Membership plan with this code already exists',
          });
        }
      }

      console.log('Update Plan Request Body:', req.body);

      // Update fields if provided
      if (plan_code) plan.plan_code = plan_code;
      if (name_en) plan.name_en = name_en;
      if (name_ar) plan.name_ar = name_ar;
      if (description_en !== undefined) plan.description_en = description_en;
      if (description_ar !== undefined) plan.description_ar = description_ar;

      if (price !== undefined) {
        console.log('Updating price from', plan.price, 'to', price);
        plan.price = parseFloat(price);
      }

      if (currency) plan.currency = currency;
      if (duration_months !== undefined) plan.duration_months = parseInt(duration_months);
      if (renewal_price !== undefined) {
        if (renewal_price) {
          plan.renewal_price = parseFloat(renewal_price);
        }
      }
      if (is_active !== undefined) plan.is_active = Boolean(is_active);

      const oldPlan = { ...plan };
      const updatedPlan = await MembershipPlanController.planRepo.save(plan);
      console.log('Plan saved:', updatedPlan);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Update',
        module: 'MembershipPlans',
        description: `Updated membership plan: ${updatedPlan.name_en}`,
        status: 'نجح',
        oldValue: oldPlan,
        newValue: updatedPlan,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: 'Membership plan updated successfully',
        data: updatedPlan,
      });
    } catch (error: unknown) {
      console.error('Error updating membership plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update membership plan',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_MEMBERSHIP_PLAN - Delete membership plan
   * DELETE /api/membership-plans/:id
   */
  static async deletePlan(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const plan = await MembershipPlanController.planRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['member_memberships'],
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Membership plan not found',
        });
      }

      // Check if plan has associated memberships
      if (plan.member_memberships && plan.member_memberships.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete membership plan with active memberships',
          associated_memberships: plan.member_memberships.length,
        });
      }

      await MembershipPlanController.planRepo.remove(plan);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Delete',
        module: 'MembershipPlans',
        description: `Deleted membership plan: ${plan.name_en} (${plan.plan_code})`,
        status: 'نجح',
        oldValue: plan,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: 'Membership plan deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting membership plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete membership plan',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CHANGE_MEMBERSHIP_PLAN_STATUS - Activate or deactivate membership plan
   * PATCH /api/membership-plans/:id/status
   */
  static async changePlanStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_active must be a boolean',
        });
      }

      const plan = await MembershipPlanController.planRepo.findOne({ where: { id: parseInt(id) } });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Membership plan not found',
        });
      }

      const oldPlan = { ...plan };
      plan.is_active = is_active;
      const updatedPlan = await MembershipPlanController.planRepo.save(plan);

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Toggle Status',
        module: 'MembershipPlans',
        description: `Changed status of membership plan ${updatedPlan.name_en} to ${is_active ? 'Active' : 'Inactive'}`,
        status: 'نجح',
        oldValue: oldPlan,
        newValue: updatedPlan,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: `Membership plan ${is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedPlan,
      });
    } catch (error: unknown) {
      console.error('Error changing membership plan status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change membership plan status',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER - Assign a membership plan to a member
   * POST /api/members/:member_id/membership-plan
   */
  static async assignPlanToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { member_id } = req.params;
      const { plan_id, start_date, end_date, payment_method } = req.body;

      if (!plan_id) {
        return res.status(400).json({
          success: false,
          message: 'plan_id is required',
        });
      }

      // Import MemberMembership and Member repositories
      const memberMembershipRepo = AppDataSource.getRepository('MemberMembership');
      const memberRepo = AppDataSource.getRepository('Member');

      // Check if member exists
      const member = await memberRepo.findOne({
        where: { id: parseInt(member_id) },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found',
        });
      }

      // Check if plan exists
      const plan = await MembershipPlanController.planRepo.findOne({
        where: { id: parseInt(plan_id) },
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Membership plan not found',
        });
      }

      if (!plan.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive membership plan',
        });
      }

      // Create membership record
      const membershipStartDate = start_date ? new Date(start_date) : new Date();
      const membershipEndDate = end_date
        ? new Date(end_date)
        : new Date(membershipStartDate.getTime() + plan.duration_months * 30 * 24 * 60 * 60 * 1000);

      const newMembership = {
        member_id: parseInt(member_id),
        plan_id: parseInt(plan_id),
        start_date: membershipStartDate,
        end_date: membershipEndDate,
        status: 'active',
        payment_method: payment_method || 'not_specified',
      };

      const savedMembership = await memberMembershipRepo.save(newMembership) as IMemberMembership;

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Assign Plan',
        module: 'MembershipPlans',
        description: `Assigned plan ${plan.name_en} to member: ${(member as any).first_name_en} ${(member as any).last_name_en}`,
        status: 'نجح',
        newValue: savedMembership,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json({
        success: true,
        message: 'Membership plan assigned to member successfully',
        data: {
          membership_id: savedMembership.id,
          member_id: parseInt(member_id),
          plan_id: parseInt(plan_id),
          plan_name: plan.name_en,
          start_date: membershipStartDate,
          end_date: membershipEndDate,
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning membership plan to member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign membership plan to member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CHANGE_MEMBER_MEMBERSHIP_PLAN - Change member's current membership plan
   * PUT /api/members/:member_id/membership-plan
   */
  static async changeMemberPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const { member_id } = req.params;
      const { new_plan_id } = req.body;

      if (!new_plan_id) {
        return res.status(400).json({
          success: false,
          message: 'new_plan_id is required',
        });
      }

      // Import repositories
      const memberMembershipRepo = AppDataSource.getRepository('MemberMembership');

      // Check if new plan exists
      const newPlan = await MembershipPlanController.planRepo.findOne({
        where: { id: parseInt(new_plan_id) },
      });

      if (!newPlan) {
        return res.status(404).json({
          success: false,
          message: 'New membership plan not found',
        });
      }

      if (!newPlan.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive membership plan',
        });
      }

      // Find active membership for this member
      const activeMembership = await memberMembershipRepo
        .createQueryBuilder('membership')
        .where('membership.member_id = :member_id', { member_id: parseInt(member_id) })
        .andWhere('membership.status = :status', { status: 'active' })
        .orderBy('membership.end_date', 'DESC')
        .getOne() as IMemberMembership | null;

      if (!activeMembership) {
        return res.status(404).json({
          success: false,
          message: 'No active membership found for this member',
        });
      }

      // Calculate new end date based on previous end date
      const oldEndDate = new Date(activeMembership.end_date);
      const newEndDate = new Date(oldEndDate.getTime() + newPlan.duration_months * 30 * 24 * 60 * 60 * 1000);

      // Update membership
      activeMembership.plan_id = parseInt(new_plan_id);
      activeMembership.end_date = newEndDate;

      const oldMembership = { ...activeMembership };
      const updatedMembership = await memberMembershipRepo.save(activeMembership) as IMemberMembership;

      // Audit Log
      await auditLogService.createLog({
        userName: (req.user as any)?.email || 'Admin',
        role: (req.user as any)?.role || 'Admin',
        action: 'Change Plan',
        module: 'MembershipPlans',
        description: `Changed membership plan for member ID: ${member_id} to ${newPlan.name_en}`,
        status: 'نجح',
        oldValue: oldMembership,
        newValue: updatedMembership,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.json({
        success: true,
        message: 'Member membership plan changed successfully',
        data: {
          membership_id: updatedMembership.id,
          member_id: parseInt(member_id),
          new_plan_id: parseInt(new_plan_id),
          plan_name: newPlan.name_en,
          new_end_date: newEndDate,
        },
      });
    } catch (error: unknown) {
      console.error('Error changing member membership plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change member membership plan',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
