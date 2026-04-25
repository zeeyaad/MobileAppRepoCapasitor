import { Request, Response } from 'express';
import { DependentMemberService } from '../services/DependentMemberService';
import { getLanguageFromRequest, createLocalizedResponse, createLocalizedError } from '../utils/i18n';
import { saveToLocalStorage, DocumentType, UserType } from '../utils/localFileStorage';

export class DependentMemberController {
  /**
   * GET /register/dependent/subtypes
   * Return dependent member subtypes (DEPENDENT_ACTIVE, DEPENDENT_VISITOR)
   */
  static async getDependentSubtypes(req: Request, res: Response): Promise<void> {
    try {
      const language = getLanguageFromRequest(req);
      const subtypes = DependentMemberService.getDependentSubtypes();
      res.status(200).json(
        createLocalizedResponse(true, 'DEPENDENT_SUBTYPE_SUCCESS', language, subtypes)
      );
    } catch (error) {
      const language = getLanguageFromRequest(req);
      res.status(500).json(
        createLocalizedError('DEPENDENT_SUBTYPE_ERROR', language, error)
      );
    }
  }

  /**
   * GET /register/dependent/relationship-types
   * Return list of relationship types
   */
  static async getRelationshipTypes(req: Request, res: Response): Promise<void> {
    try {
      const relationshipTypes = DependentMemberService.getRelationshipTypes();
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
   * GET /register/dependent/active-working-members
   * Return list of active working members for dependent selection
   */
  static async getActiveWorkingMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await DependentMemberService.getActiveWorkingMembers();
      res.status(200).json({
        success: true,
        message: 'Active working members retrieved successfully',
        data: members,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving active working members',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/dependent/active-visitor-members
   * Return list of active visitor members for dependent selection
   */
  static async getActiveVisitorMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await DependentMemberService.getActiveVisitorMembers();
      res.status(200).json({
        success: true,
        message: 'Active visitor members retrieved successfully',
        data: members,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving active visitor members',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/dependent/active-members
   * Return combined list of active members (both working and visitor)
   */
  static async getActiveMembers(req: Request, res: Response): Promise<void> {
    try {
      const members = await DependentMemberService.getActiveMembers();
      res.status(200).json({
        success: true,
        message: 'Active members retrieved successfully',
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
   * POST /register/calculate-dependent-membership-price
   * Calculate dependent membership price (40% discount)
   */
  static async calculateMembershipPrice(req: Request, res: Response): Promise<void> {
    try {
      const { related_member_id, dependent_subtype } = req.body;

      if (!related_member_id || !dependent_subtype) {
        res.status(400).json({
          success: false,
          message: 'related_member_id and dependent_subtype are required',
        });
        return;
      }

      if (!['DEPENDENT_ACTIVE', 'DEPENDENT_VISITOR'].includes(dependent_subtype)) {
        res.status(400).json({
          success: false,
          message: 'dependent_subtype must be DEPENDENT_ACTIVE or DEPENDENT_VISITOR',
        });
        return;
      }

      const pricingDetails = await DependentMemberService.calculateDependentMembershipPrice({
        related_member_id,
        dependent_subtype,
      });

      res.status(200).json({
        success: true,
        message: 'Dependent membership price calculated successfully',
        data: pricingDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating dependent membership price',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/dependent-membership
   * Create dependent membership subscription with relationship
   */
  static async createDependentMembership(req: Request, res: Response): Promise<void> {
    try {
      const {
        member_id,
        related_member_id,
        relationship_type,
        dependent_subtype,
        proof_document,
        is_auto_renew,
      } = req.body;

      if (!member_id || !related_member_id || !relationship_type || !dependent_subtype) {
        res.status(400).json({
          success: false,
          message: 'member_id, related_member_id, relationship_type, and dependent_subtype are required',
        });
        return;
      }

      if (!['DEPENDENT_ACTIVE', 'DEPENDENT_VISITOR'].includes(dependent_subtype)) {
        res.status(400).json({
          success: false,
          message: 'dependent_subtype must be DEPENDENT_ACTIVE or DEPENDENT_VISITOR',
        });
        return;
      }

      const result = await DependentMemberService.createDependentMembership({
        member_id,
        related_member_id,
        relationship_type,
        dependent_subtype,
        proof_document: proof_document || null,
        is_auto_renew,
      });

      res.status(201).json({
        success: true,
        message: 'Dependent membership created successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating dependent membership',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /register/dependent-status/:member_id
   * Get complete status and details of dependent member
   */
  static async getDependentMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
        return;
      }

      const status = await DependentMemberService.getDependentMemberStatus(parseInt(member_id));

      res.status(200).json({
        success: true,
        message: 'Dependent member status retrieved successfully',
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving dependent member status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /register/details/dependent
   * Submit dependent member details (photos and documents)
   */
  static async submitDependentDetails(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const { member_id, related_member_id, relationship_type } = req.body;

      console.log('📋 Dependent Details Submission:');
      console.log('  Body:', { member_id, related_member_id, relationship_type });
      console.log('  Files:', files ? Object.keys(files) : 'No files');

      // Validate required fields
      if (!member_id || !related_member_id || !relationship_type) {
        console.error('❌ Missing required fields');
        res.status(400).json({
          success: false,
          message: 'member_id, related_member_id, and relationship_type are required',
        });
        return;
      }

      // Upload files to local storage
      let personal_photo: string | undefined;
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let medical_report: string | undefined;
      let relation_proof: string | undefined;

      try {
        // Helper function to upload file
        const uploadFile = async (fieldname: string, documentType: DocumentType): Promise<string | undefined> => {
          if (!files || !files[fieldname] || files[fieldname].length === 0) {
            return undefined;
          }
          const file = files[fieldname][0];
          return await saveToLocalStorage(file.buffer, file.originalname, documentType, UserType.MEMBER);
        };

        personal_photo = await uploadFile('personal_photo', DocumentType.PERSONAL_PHOTO);
        national_id_front = await uploadFile('national_id_front', DocumentType.NATIONAL_ID);
        national_id_back = await uploadFile('national_id_back', DocumentType.NATIONAL_ID);
        medical_report = await uploadFile('medical_report', DocumentType.MEDICAL_REPORT);
        relation_proof = await uploadFile('relation_proof', DocumentType.PROOF);
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
        });
        return;
      }

      // Submit dependent details with Cloudinary URLs
      const submitData = {
        member_id: parseInt(member_id),
        related_member_id: parseInt(related_member_id),
        relationship_type: String(relationship_type),
        personal_photo,
        national_id_front,
        national_id_back,
        medical_report,
        relation_proof,
      };

      console.log('📤 Submitting to service:', submitData);
      const result = await DependentMemberService.submitDependentDetails(submitData);
      console.log('✅ Service result:', result);

      res.status(201).json({
        success: true,
        message: 'Dependent details submitted successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in submitDependentDetails:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting dependent details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
