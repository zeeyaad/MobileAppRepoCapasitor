import { Request, Response } from 'express';
import { StudentMemberService } from '../services/StudentMemberService';
import { getLanguageFromRequest, createLocalizedResponse, createLocalizedError } from '../utils/i18n';

export class StudentMemberController {
  /**
   * Get student/graduate status options
   * GET /register/student/statuses
   */
  static async getStudentStatusOptions(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const statuses = StudentMemberService.getStudentStatusOptions();
      res.status(200).json(
        createLocalizedResponse(true, 'STUDENT_STATUS_OPTIONS_SUCCESS', language, {
          statuses,
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('STUDENT_STATUS_OPTIONS_ERROR', language, error)
      );
    }
  }

  /**
   * Get relationship types for dependents
   * GET /register/student/relationship-types
   */
  static async getRelationshipTypes(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const relationshipTypes = StudentMemberService.getRelationshipTypes();
      res.status(200).json(
        createLocalizedResponse(true, 'RELATIONSHIP_TYPES_SUCCESS', language, {
          relationship_types: relationshipTypes,
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('RELATIONSHIP_TYPES_ERROR', language, error)
      );
    }
  }

  /**
   * Get active members for dependent selection
   * GET /register/student/active-members
   */
  static async getActiveMembers(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const members = await StudentMemberService.getActiveMembers();
      res.status(200).json(
        createLocalizedResponse(true, 'ACTIVE_MEMBERS_SUCCESS', language, {
          active_members: members,
          total_count: members.length,
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('ACTIVE_MEMBERS_ERROR', language, error)
      );
    }
  }

  /**
   * Submit student member details (name, email, password, phone, etc.)
   * POST /register/student-details
   * Body: {
   *   member_id: number,
   *   university_id: number,
   *   graduation_year: number,
   *   status_proof: string (path to certificate/ID)
   * }
   */
  static async submitStudentMemberDetails(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { member_id, university_id, graduation_year, status_proof } = req.body;

      // Validation
      if (!member_id || !university_id || !graduation_year || !status_proof) {
        res.status(400).json(
          createLocalizedError(
            'MISSING_REQUIRED_FIELDS',
            language,
            'member_id, university_id, graduation_year, status_proof'
          )
        );
        return;
      }

      if (typeof graduation_year !== 'number' || graduation_year < 1900 || graduation_year > new Date().getFullYear() + 10) {
        res.status(400).json(
          createLocalizedError('INVALID_GRADUATION_YEAR', language)
        );
        return;
      }

      const result = await StudentMemberService.submitStudentMemberDetails({
        member_id,
        university_id,
        graduation_year,
        status_proof,
      });

      res.status(201).json(
        createLocalizedResponse(true, 'STUDENT_DETAILS_SUCCESS', language, result)
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('STUDENT_DETAILS_ERROR', language, error)
      );
    }
  }

  /**
   * Calculate student/graduate membership price
   * POST /register/calculate-student-membership-price
   * Body: {
   *   student_status: 'STUDENT' | 'GRADUATE'
   * }
   */
  static async calculateMembershipPrice(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { student_status } = req.body;

      // Validation
      if (!student_status || !['STUDENT', 'GRADUATE'].includes(student_status)) {
        res.status(400).json(
          createLocalizedError('INVALID_STUDENT_STATUS', language)
        );
        return;
      }

      const pricingDetails = StudentMemberService.calculateMembershipPrice(student_status);

      res.status(200).json(
        createLocalizedResponse(true, 'PRICE_CALCULATED_SUCCESS', language, {
          student_status,
          price: pricingDetails.price,
          currency: 'EGP',
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('PRICE_CALCULATED_ERROR', language, error)
      );
    }
  }

  /**
   * Create student/graduate membership
   * POST /register/student-membership
   * Body: {
   *   member_id: number,
   *   student_status: 'STUDENT' | 'GRADUATE'
   * }
   */
  static async createStudentMembership(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { member_id, student_status } = req.body;

      // Validation
      if (!member_id || !student_status) {
        res.status(400).json(
          createLocalizedError(
            'MISSING_REQUIRED_FIELDS',
            language,
            'member_id, student_status'
          )
        );
        return;
      }

      if (!['STUDENT', 'GRADUATE'].includes(student_status)) {
        res.status(400).json(
          createLocalizedError('INVALID_STUDENT_STATUS', language)
        );
        return;
      }

      const result = await StudentMemberService.createStudentMembership({
        member_id,
        student_status,
      });

      res.status(201).json(
        createLocalizedResponse(true, 'MEMBERSHIP_CREATED_SUCCESS', language, {
          membership: {
            id: result.membership.id,
            member_id: result.membership.member_id,
            status: result.membership.status,
            start_date: result.membership.start_date,
            end_date: result.membership.end_date,
          },
          pricing: result.pricing,
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('MEMBERSHIP_CREATED_ERROR', language, error)
      );
    }
  }

  /**
   * Calculate dependent membership price (40% discount)
   * POST /register/calculate-student-dependent-price
   * Body: {
   *   related_member_id: number
   * }
   */
  static async calculateDependentMembershipPrice(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { related_member_id } = req.body;

      // Validation
      if (!related_member_id) {
        res.status(400).json(
          createLocalizedError(
            'MISSING_REQUIRED_FIELDS',
            language,
            'related_member_id'
          )
        );
        return;
      }

      const pricingDetails = await StudentMemberService.calculateDependentMembershipPrice({
        related_member_id,
      });

      res.status(200).json(
        createLocalizedResponse(true, 'DEPENDENT_PRICE_CALCULATED_SUCCESS', language, {
          related_member_id,
          pricing: {
            related_member_price: pricingDetails.related_member_price,
            discount_percentage: pricingDetails.discount_percentage,
            discount_amount: pricingDetails.discount_amount,
            final_price: pricingDetails.final_price,
            currency: 'EGP',
          },
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('DEPENDENT_PRICE_CALCULATED_ERROR', language, error)
      );
    }
  }

  /**
   * Create student/graduate dependent membership
   * POST /register/student-dependent-membership
   * Body: {
   *   member_id: number,
   *   related_member_id: number,
   *   relationship_type: string,
   *   proof_document: string
   * }
   */
  static async createStudentDependentMembership(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { member_id, related_member_id, relationship_type, proof_document } = req.body;

      // Validation
      if (!member_id || !related_member_id || !relationship_type || !proof_document) {
        res.status(400).json(
          createLocalizedError(
            'MISSING_REQUIRED_FIELDS',
            language,
            'member_id, related_member_id, relationship_type, proof_document'
          )
        );
        return;
      }

      const validRelationships = ['spouse', 'child', 'parent', 'orphan'];
      if (!validRelationships.includes(relationship_type)) {
        res.status(400).json(
          createLocalizedError('INVALID_RELATIONSHIP_TYPE', language)
        );
        return;
      }

      const result = await StudentMemberService.createStudentDependentMembership({
        member_id,
        related_member_id,
        relationship_type,
        proof_document,
      });

      res.status(201).json(
        createLocalizedResponse(true, 'DEPENDENT_MEMBERSHIP_CREATED_SUCCESS', language, {
          membership: {
            id: result.membership.id,
            member_id: result.membership.member_id,
            status: result.membership.status,
            start_date: result.membership.start_date,
            end_date: result.membership.end_date,
          },
          relationship: {
            id: result.relationship.id,
            relationship_type: result.relationship.relationship_type,
            is_dependent: result.relationship.is_dependent,
          },
          pricing: result.pricing,
        })
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('DEPENDENT_MEMBERSHIP_CREATED_ERROR', language, error)
      );
    }
  }

  /**
   * Get student member complete status and details
   * GET /register/student-status/:member_id
   */
  static async getStudentMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const { member_id } = req.params;

      // Validation
      if (!member_id || isNaN(Number(member_id))) {
        res.status(400).json(
          createLocalizedError('INVALID_MEMBER_ID', language)
        );
        return;
      }

      const memberStatus = await StudentMemberService.getStudentMemberStatus(Number(member_id));

      res.status(200).json(
        createLocalizedResponse(true, 'STUDENT_STATUS_RETRIEVED_SUCCESS', language, memberStatus)
      );
    } catch (error: Error | unknown) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('STUDENT_STATUS_RETRIEVED_ERROR', language, error)
      );
    }
  }
}
