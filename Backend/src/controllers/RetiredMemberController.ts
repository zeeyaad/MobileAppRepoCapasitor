import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { RetiredMemberService } from '../services/RetiredMemberService';
import { Member } from '../entities/Member';
import { Account } from '../entities/Account';
import { MemberType } from '../entities/MemberType';

export class RetiredMemberController {
  /**
   * GET /register/retired/professions
   * Return list of retired profession options
   */
  static async getProfessions(req: Request, res: Response) {
    try {
      const professions = RetiredMemberService.getProfessions();
      res.status(200).json({
        success: true,
        message: 'Retired professions retrieved successfully',
        data: professions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving professions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/retired/relationship-types
   * Return list of relationship types for dependents
   */
  static async getRelationshipTypes(req: Request, res: Response) {
    try {
      const relationshipTypes = RetiredMemberService.getRelationshipTypes();
      res.status(200).json({
        success: true,
        message: 'Relationship types retrieved successfully',
        data: relationshipTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving relationship types',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/retired/active-working-members
   * Return list of active working members for dependent relationship selection
   */
  static async getActiveWorkingMembers(req: Request, res: Response) {
    try {
      const members = await RetiredMemberService.getActiveWorkingMembers();
      res.status(200).json({
        success: true,
        message: 'Active working members retrieved successfully',
        data: members,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving active members',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/calculate-retired-membership-price
   * Calculate membership price based on profession and salary
   */
  static async calculateMembershipPrice(req: Request, res: Response): Promise<void> {
    try {
      const { profession_code, last_salary, is_related_to_active_member, related_member_id, member_id } = req.body;

      if (!profession_code || last_salary === undefined) {
        res.status(400).json({
          success: false,
          message: 'profession_code and last_salary are required',
        });
        return;
      }

      const pricingDetails = await RetiredMemberService.calculateMembershipPricing({
        member_id: member_id || 0,
        profession_code,
        last_salary,
        is_related_to_active_member: is_related_to_active_member || false,
        related_member_id,
      });

      res.status(200).json({
        success: true,
        message: 'Membership price calculated successfully',
        data: pricingDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating membership price',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/details/retired-member
   * Submit retired member details (profession, department, retirement date, salary slip)
   */
  static async submitRetiredMemberDetails(req: Request, res: Response): Promise<void> {
    try {
      const {
        member_id,
        profession_code,
        former_department,
        retirement_date,
        last_salary,
        salary_slip,
      } = req.body;

      if (!member_id || !profession_code || !former_department || !retirement_date || last_salary === undefined) {
        res.status(400).json({
          success: false,
          message: 'member_id, profession_code, former_department, retirement_date, and last_salary are required',
        });
        return;
      }

      const retiredDetails = await RetiredMemberService.submitRetiredMemberDetails({
        member_id,
        profession_code,
        former_department,
        retirement_date: new Date(retirement_date),
        last_salary,
        salary_slip: salary_slip || null,
      });

      res.status(201).json({
        success: true,
        message: 'Retired member details submitted successfully',
        data: retiredDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting retired member details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/retired-membership
   * Create membership subscription for retired member
   */
  static async createRetiredMembership(req: Request, res: Response): Promise<void> {
    try {
      const {
        member_id,
        profession_code,
        last_salary,
        is_related_to_active_member,
        related_member_id,
        is_auto_renew,
      } = req.body;

      if (!member_id || !profession_code || last_salary === undefined) {
        res.status(400).json({
          success: false,
          message: 'member_id, profession_code, and last_salary are required',
        });
        return;
      }

      if (is_related_to_active_member && !related_member_id) {
        res.status(400).json({
          success: false,
          message: 'related_member_id is required when is_related_to_active_member is true',
        });
        return;
      }

      const result = await RetiredMemberService.createRetiredMembership({
        member_id,
        profession_code,
        last_salary,
        is_related_to_active_member: is_related_to_active_member || false,
        related_member_id,
        is_auto_renew,
      });

      res.status(201).json({
        success: true,
        message: 'Retired membership created successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating retired membership',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/retired-relationship
   * Create relationship between retired member and active member
   * Also uploads proof document (birth certificate, marriage certificate, etc.)
   */
  static async createRetiredRelationship(req: Request, res: Response): Promise<void> {
    try {
      const {
        retired_member_id,
        active_member_id,
        relationship_type,
        proof_document, // Path to uploaded proof document
      } = req.body;

      if (!retired_member_id || !active_member_id || !relationship_type) {
        res.status(400).json({
          success: false,
          message: 'retired_member_id, active_member_id, and relationship_type are required',
        });
        return;
      }

      const relationship = await RetiredMemberService.createMemberRelationship({
        retired_member_id,
        active_member_id,
        relationship_type,
        proof_document: proof_document || null,
      });

      res.status(201).json({
        success: true,
        message: 'Retired member relationship created successfully',
        data: relationship,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating relationship',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/retired-status/:member_id
   * Get complete status and details of retired member
   */
  static async getRetiredMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
        return;
      }

      const status = await RetiredMemberService.getRetiredMemberStatus(parseInt(member_id));

      res.status(200).json({
        success: true,
        message: 'Retired member status retrieved successfully',
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving retired member status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
