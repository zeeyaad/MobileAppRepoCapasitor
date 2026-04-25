import { Request, Response } from 'express';
import { WorkingMemberService } from '../services/WorkingMemberService';

const workingService = new WorkingMemberService();

export class WorkingMemberController {
  /**
   * GET /register/professions
   * Returns list of professions for working members
   */
  static async getProfessions(req: Request, res: Response) {
    try {
      const professions = await workingService.getProfessions();

      return res.status(200).json({
        success: true,
        count: professions.length,
        professions,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching professions',
        error: error.message,
      });
    }
  }

  /**
   * GET /register/relationship-types
   * Returns list of relationship types for dependents
   */
  static async getRelationshipTypes(req: Request, res: Response) {
    try {
      const types = workingService.getRelationshipTypes();

      return res.status(200).json({
        success: true,
        count: types.length,
        relationship_types: types,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching relationship types',
        error: error.message,
      });
    }
  }

  /**
   * GET /register/active-working-members
   * Returns list of active working members for dependent selection
   */
  static async getActiveWorkingMembers(req: Request, res: Response) {
    try {
      const members = await workingService.getActiveWorkingMembers();

      return res.status(200).json({
        success: true,
        count: members.length,
        active_working_members: members,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching active working members',
        error: error.message,
      });
    }
  }

  /**
   * POST /register/calculate-working-membership-price
   * Calculate membership price based on profession and salary
   */
  static async calculateMembershipPrice(req: Request, res: Response) {
    try {
      const {
        profession_id,
        salary,
        is_related_to_active_member,
        related_member_id,
      } = req.body;

      if (!profession_id || salary === undefined) {
        return res.status(400).json({
          success: false,
          message: 'profession_id and salary are required',
        });
      }

      const pricing = await workingService.calculateMembershipPricing({
        profession_id: parseInt(profession_id),
        salary: parseFloat(salary),
        is_related_to_active_member: is_related_to_active_member || false,
        related_member_id: related_member_id ? parseInt(related_member_id) : undefined,
      });

      return res.status(200).json({
        success: true,
        pricing,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  }

  /**
   * POST /register/details/working-member
   * Submit detailed information for working member
   */
  static async submitWorkingMemberDetails(req: Request, res: Response) {
    try {
      const {
        member_id,
        profession_id,
        department_en,
        department_ar,
        salary,
        employment_start_date,
        is_related_to_active_member,
        related_member_id,
        relationship_type,
      } = req.body;

      // Validate required fields
      if (!member_id || !profession_id || !department_en || !department_ar || salary === undefined || !employment_start_date) {
        return res.status(400).json({
          success: false,
          message:
            'member_id, profession_id, department_en, department_ar, salary, and employment_start_date are required',
        });
      }

      // Validate is_related_to_active_member
      if (is_related_to_active_member === true && !related_member_id) {
        return res.status(400).json({
          success: false,
          message: 'related_member_id is required when is_related_to_active_member is true',
        });
      }

      const result = await workingService.submitWorkingMemberDetails({
        member_id: parseInt(member_id),
        profession_id: parseInt(profession_id),
        department_en,
        department_ar,
        salary: parseFloat(salary),
        salary_slip: req.body.salary_slip,
        employment_start_date: new Date(employment_start_date),
        is_related_to_active_member: is_related_to_active_member || false,
        related_member_id: related_member_id ? parseInt(related_member_id) : undefined,
        relationship_type,
        relationship_proof: req.body.relationship_proof,
        national_id_front: req.body.national_id_front,
        national_id_back: req.body.national_id_back,
        personal_photo: req.body.personal_photo,
        medical_report: req.body.medical_report,
        address: req.body.address,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error submitting working member details',
        error: error.message,
      });
    }
  }

  /**
   * POST /register/working-membership
   * Create membership subscription for working member
   */
  static async createWorkingMembership(req: Request, res: Response) {
    try {
      const {
        member_id,
        profession_id,
        salary,
        is_related_to_active_member,
        related_member_id,
      } = req.body;

      if (!member_id || !profession_id || salary === undefined) {
        return res.status(400).json({
          success: false,
          message: 'member_id, profession_id, and salary are required',
        });
      }

      const result = await workingService.createWorkingMembership({
        member_id: parseInt(member_id),
        profession_id: parseInt(profession_id),
        salary: parseFloat(salary),
        is_related_to_active_member: is_related_to_active_member || false,
        related_member_id: related_member_id ? parseInt(related_member_id) : undefined,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error creating working membership',
        error: error.message,
      });
    }
  }

  /**
   * GET /register/working-status/:member_id
   * Get working member registration status
   */
  static async getWorkingMemberStatus(req: Request, res: Response) {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        return res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
      }

      const status = await workingService.getWorkingMemberStatus(parseInt(member_id));

      return res.status(200).json({
        success: true,
        status,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default WorkingMemberController;
