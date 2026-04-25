import { Request, Response } from 'express';
import { ForeignerSeasonalService } from '../services/ForeignerSeasonalService';
import { saveToLocalStorage, DocumentType, UserType } from '../utils/localFileStorage';

const foreignerService = new ForeignerSeasonalService();

const getFile = (files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined, fieldname: string): Express.Multer.File | undefined => {
  if (!files) return undefined;
  const filesObj = files as { [fieldname: string]: Express.Multer.File[] };
  return filesObj[fieldname]?.[0];
};

export class ForeignerSeasonalController {
  /**
   * GET /register/seasonal/duration-options
   * Returns duration options (1, 6, 12 months) with pricing
   */
  static async getDurationOptions(req: Request, res: Response) {
    try {
      const options = await foreignerService.getSeasonalDurationOptions();

      return res.status(200).json({
        success: true,
        count: options.length,
        duration_options: options,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching duration options',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/seasonal/visa-statuses
   * Returns visa status options for foreigner members
   */
  static async getVisaStatusOptions(req: Request, res: Response) {
    try {
      const statuses = foreignerService.getVisaStatusOptions();

      return res.status(200).json({
        success: true,
        count: statuses.length,
        visa_statuses: statuses,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching visa status options',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/seasonal/payment-options
   * Returns payment options (full payment or installments)
   */
  static async getPaymentOptions(req: Request, res: Response) {
    try {
      const options = foreignerService.getPaymentOptions();

      return res.status(200).json({
        success: true,
        count: options.length,
        payment_options: options,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching payment options',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/seasonal/pricing/:duration_months
   * Returns detailed pricing and installment options for a specific duration
   */
  static async getPricingDetails(req: Request, res: Response) {
    try {
      const { duration_months } = req.params;

      if (!duration_months) {
        return res.status(400).json({
          success: false,
          message: 'duration_months parameter is required',
        });
      }

      const pricing = await foreignerService.getMembershipPricingDetails(
        parseInt(duration_months)
      );

      return res.status(200).json({
        success: true,
        pricing,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/details/foreigner-seasonal
   * Submit detailed information for foreigner/seasonal visitor member
   * Body: {
   *   member_id: number,
   *   seasonal_type: string (seasonal-egy or seasonal-foreigner),
   *   duration_months: number (1, 6, or 12),
   *   payment_type: string (full or installments),
   *   passport_number?: string,
   *   passport_photo?: string (file path),
   *   country?: string (required if seasonal-foreigner),
   *   visa_status?: string (valid, expired, pending),
   *   national_id_front?: string (file path),
   *   national_id_back?: string (file path),
   *   personal_photo?: string (file path),
   *   medical_report?: string (file path),
   *   address?: string
   * }
   */
  static async submitForeignerSeasonalDetails(req: Request, res: Response) {
    try {
      const {
        member_id,
        seasonal_type,
        duration_months,
        payment_type,
        passport_number,
        country,
        visa_status,
      } = req.body;

      // DEBUG: Log what files we received
      console.log('🔍 submitForeignerSeasonalDetails received files:', {
        filesKeys: req.files ? Object.keys(req.files) : 'no files',
        filesCount: req.files ? Object.keys(req.files).length : 0,
      });

      // Validate required fields
      if (!member_id || !seasonal_type || !duration_months || !payment_type) {
        return res.status(400).json({
          success: false,
          message: 'member_id, seasonal_type, duration_months, and payment_type are required',
        });
      }

      // Validate seasonal_type value
      const validSeasonalTypes = ['seasonal-egy', 'seasonal-foreigner'];
      if (!validSeasonalTypes.includes(seasonal_type)) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid seasonal_type. Must be seasonal-egy or seasonal-foreigner',
        });
      }

      // Validate duration
      const validDurations = [1, 6, 12];
      if (!validDurations.includes(parseInt(duration_months))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid duration_months. Must be 1, 6, or 12 months',
        });
      }

      // Validate payment type
      const validPaymentTypes = ['full', 'installments'];
      if (!validPaymentTypes.includes(payment_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment_type. Must be full or installments',
        });
      }

      // Validate country for seasonal-foreigner
      if (seasonal_type === 'seasonal-foreigner' && !country) {
        return res.status(400).json({
          success: false,
          message: 'country is required for seasonal-foreigner members',
        });
      }

      // Upload files to local storage
      let passport_photo: string | undefined;
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let personal_photo: string | undefined;
      let medical_report: string | undefined;

      try {
        const passportPhotoFile = getFile(req.files, 'passport_photo');
        if (passportPhotoFile) {
          passport_photo = await saveToLocalStorage(passportPhotoFile.buffer, passportPhotoFile.originalname, DocumentType.PASSPORT, UserType.MEMBER);
        }

        const nationalIdFrontFile = getFile(req.files, 'national_id_front');
        if (nationalIdFrontFile) {
          national_id_front = await saveToLocalStorage(nationalIdFrontFile.buffer, nationalIdFrontFile.originalname, DocumentType.NATIONAL_ID, UserType.MEMBER);
        }

        const nationalIdBackFile = getFile(req.files, 'national_id_back');
        if (nationalIdBackFile) {
          national_id_back = await saveToLocalStorage(nationalIdBackFile.buffer, nationalIdBackFile.originalname, DocumentType.NATIONAL_ID, UserType.MEMBER);
        }

        const personalPhotoFile = getFile(req.files, 'personal_photo');
        if (personalPhotoFile) {
          personal_photo = await saveToLocalStorage(personalPhotoFile.buffer, personalPhotoFile.originalname, DocumentType.PERSONAL_PHOTO, UserType.MEMBER);
        }

        const medicalReportFile = getFile(req.files, 'medical_report');
        if (medicalReportFile) {
          medical_report = await saveToLocalStorage(medicalReportFile.buffer, medicalReportFile.originalname, DocumentType.MEDICAL_REPORT, UserType.MEMBER);
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
        });
      }

      const result = await foreignerService.submitForeignerSeasonalDetailedInfo({
        member_id: parseInt(member_id),
        seasonal_type,
        duration_months: parseInt(duration_months),
        payment_type,
        passport_number,
        passport_photo,
        country,
        visa_status,
        national_id_front,
        national_id_back,
        personal_photo,
        medical_report,
        address: req.body.address,
      });

      return res.status(201).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error submitting foreigner/seasonal details',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/seasonal/membership
   * Create membership subscription for foreigner/seasonal member
   * Body: {
   *   member_id: number,
   *   duration_months: number (1, 6, or 12),
   *   payment_type: string (full or installments)
   * }
   */
  static async createSeasonalMembership(req: Request, res: Response) {
    try {
      const { member_id, duration_months, payment_type } = req.body;

      if (!member_id || !duration_months || !payment_type) {
        return res.status(400).json({
          success: false,
          message: 'member_id, duration_months, and payment_type are required',
        });
      }

      const result = await foreignerService.createSeasonalMembership({
        member_id: parseInt(member_id),
        duration_months: parseInt(duration_months),
        payment_type,
      });

      return res.status(201).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error creating seasonal membership',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/seasonal/status/:member_id
   * Get foreigner/seasonal member registration status
   */
  static async getForeignerStatus(req: Request, res: Response) {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        return res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
      }

      const status = await foreignerService.getForeignerMemberStatus(parseInt(member_id));

      return res.status(200).json({
        success: true,
        status,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}

export default ForeignerSeasonalController;
