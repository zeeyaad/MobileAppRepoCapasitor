import { Request, Response } from 'express';
import { DetailedRegistrationService } from '../services/DetailedRegistrationService';
import { saveToLocalStorage, DocumentType, UserType } from '../utils/localFileStorage';

const detailedService = new DetailedRegistrationService();

// Helper to get file from req.files (now returns file object instead of path)
const getFile = (files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined, fieldname: string): Express.Multer.File | undefined => {
  if (!files) return undefined;
  if (Array.isArray(files)) return undefined;
  
  const filesObj = files as { [fieldname: string]: Express.Multer.File[] };
  if (filesObj[fieldname] && filesObj[fieldname].length > 0) {
    return filesObj[fieldname][0];
  }
  return undefined;
};


export class DetailedRegistrationController {
  /**
   * GET /register/branches
   * Returns list of all branches for visitor-branch selection
   */
  static async getBranches(req: Request, res: Response) {
    try {
      const branches = await detailedService.getAllBranches();

      if (!branches || branches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No branches found',
        });
      }

      return res.status(200).json({
        success: true,
        count: branches.length,
        branches: branches.map((branch: { id: number; code: string; name_en: string; name_ar: string; location_en: string | null; location_ar: string | null; phone: string | null }) => ({
          id: branch.id,
          code: branch.code,
          name_en: branch.name_en,
          name_ar: branch.name_ar,
          location_en: branch.location_en,
          location_ar: branch.location_ar,
          phone: branch.phone,
        })),
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching branches',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/visitor-types
   * Returns list of visitor membership types (excluding VISITOR_STUDENT if exists)
   */
  static async getVisitorMembershipTypes(req: Request, res: Response) {
    try {
      const visitorTypes = detailedService.getVisitorMembershipTypes();

      return res.status(200).json({
        success: true,
        count: visitorTypes.length,
        visitor_types: visitorTypes,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching visitor types',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/employment-status
   * Returns list of employment status options
   */
  static async getEmploymentStatusOptions(req: Request, res: Response) {
    try {
      const statuses = [
        {
          code: 'employed',
          label_en: 'Employed',
          label_ar: 'موظف',
        },
        {
          code: 'self_employed',
          label_en: 'Self-Employed',
          label_ar: 'عامل حر',
        },
        {
          code: 'unemployed',
          label_en: 'Unemployed',
          label_ar: 'بدون عمل',
        },
        {
          code: 'student',
          label_en: 'Student',
          label_ar: 'طالب',
        },
        {
          code: 'retired',
          label_en: 'Retired',
          label_ar: 'متقاعد',
        },
        {
          code: 'other',
          label_en: 'Other',
          label_ar: 'أخرى',
        },
      ];

      return res.status(200).json({
        success: true,
        count: statuses.length,
        employment_statuses: statuses,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error fetching employment statuses',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/details/visitor
   * Submit detailed information for visitor members
   * Body: {
   *   member_id: number,
   *   job_title_en?: string,
   *   job_title_ar?: string,
   *   employment_status?: string,
   *   visitor_type: string (visitor, visitor-honorary, visitor-athletic, visitor-branch),
   *   branch_id?: number (required if visitor_type is visitor-branch),
   *   health_status?: string,
   *   address?: string,
   *   national_id_front?: file,
   *   national_id_back?: file,
   *   personal_photo?: file,
   *   medical_report?: file
   * }
   */
  static async submitVisitorDetails(req: Request, res: Response) {
    try {
      const { member_id, job_title_en, job_title_ar, employment_status, visitor_type, branch_id } =
        req.body;

      // Validate required fields
      if (!member_id || !visitor_type) {
        return res.status(400).json({
          success: false,
          message: 'member_id and visitor_type are required',
        });
      }

      // Validate visitor_type value
      const validVisitorTypes = ['VISITOR', 'VISITOR_HONORARY', 'VISITOR_ATHLETIC', 'VISITOR_BRANCH'];
      if (!validVisitorTypes.includes(visitor_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid visitor_type. Must be one of: VISITOR, VISITOR_HONORARY, VISITOR_ATHLETIC, VISITOR_BRANCH',
        });
      }

      // Validate branch_id for visitor-branch
      if (visitor_type === 'VISITOR_BRANCH' && !branch_id) {
        return res.status(400).json({
          success: false,
          message: 'branch_id is required for visitor-branch membership',
        });
      }

      // Upload files to local storage
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let personal_photo: string | undefined;
      let medical_report: string | undefined;

      try {
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

      const result = await detailedService.submitVisitorDetailedInfo({
        member_id,
        job_title_en,
        job_title_ar,
        employment_status: employment_status || 'employed',
        visitor_type,

        branch_id,
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
        message: 'Error submitting visitor details',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/details/working
   * Submit detailed information for working members
   * Body: {
   *   member_id: number,
   *   profession_id: number,
   *   department_en: string,
   *   department_ar: string,
   *   salary: number,
   *   salary_slip?: file,
   *   employment_start_date: Date,
   *   university_id: number,
   *   national_id_front?: file,
   *   national_id_back?: file,
   *   personal_photo?: file,
   *   medical_report?: file,
   *   address?: string
   * }
   */
  static async submitWorkingDetails(req: Request, res: Response) {
    try {
      const {
        member_id,
        profession_id,
        department_en,
        department_ar,
        salary,
        employment_start_date,
      } = req.body;

      // Validate required fields
      if (!member_id || !profession_id || !department_en || !department_ar || !salary || !employment_start_date) {
        return res.status(400).json({
          success: false,
          message: 'member_id, profession_id, department_en, department_ar, salary, and employment_start_date are required',
        });
      }

      // Upload files to local storage
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let personal_photo: string | undefined;
      let medical_report: string | undefined;
      let salary_slip: string | undefined;

      try {
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

        const salarSlipFile = getFile(req.files, 'salary_slip');
        if (salarSlipFile) {
          salary_slip = await saveToLocalStorage(salarSlipFile.buffer, salarSlipFile.originalname, DocumentType.SALARY_SLIP, UserType.MEMBER);
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
        });
      }

      const result = await detailedService.submitWorkingMemberDetailedInfo({
        member_id,
        profession_id,
        department_en,
        department_ar,
        salary: parseFloat(salary),
        salary_slip,
        employment_start_date: new Date(employment_start_date),
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
        message: 'Error submitting working member details',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/details/retired
   * Submit detailed information for retired members
   * Body: {
   *   member_id: number,
   *   university_id: number,
   *   former_department_en: string,
   *   former_department_ar: string,
   *   retirement_date: Date,
   *   national_id_front?: file,
   *   national_id_back?: file,
   *   personal_photo?: file,
   *   medical_report?: file,
   *   address?: string
   * }
   */
  static async submitRetiredDetails(req: Request, res: Response) {
    try {
      const { member_id, former_department_en, former_department_ar, retirement_date } =
        req.body;

      // Validate required fields
      if (!member_id || !former_department_en || !former_department_ar || !retirement_date) {
        return res.status(400).json({
          success: false,
          message: 'member_id, former_department_en, former_department_ar, and retirement_date are required',
        });
      }

      // Upload files to local storage
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let personal_photo: string | undefined;
      let medical_report: string | undefined;

      try {
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

      const result = await detailedService.submitRetiredMemberDetailedInfo({
        member_id,
        former_department_en,
        former_department_ar,
        retirement_date: new Date(retirement_date),
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
        message: 'Error submitting retired member details',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /register/details/student
   * Submit detailed information for student members
   * Body: {
   *   member_id: number,
   *   university_id: number,
   *   faculty_id: number,
   *   graduation_year: number,
   *   enrollment_date: Date,
   *   national_id_front?: string (file path),
   *   national_id_back?: string (file path),
   *   personal_photo?: string (file path),
   *   medical_report?: string (file path),
   *   address?: string
   * }
   */
  static async submitStudentDetails(req: Request, res: Response) {
    try {
      const { member_id, faculty_id, graduation_year, enrollment_date } = req.body;

      // Validate required fields - all four fields MUST be provided
      const missingFields: string[] = [];
      
      if (!member_id) missingFields.push('member_id');
      if (!faculty_id) missingFields.push('faculty_id');
      if (!graduation_year) missingFields.push('graduation_year');
      if (!enrollment_date) missingFields.push('enrollment_date');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          required_fields: {
            member_id: 'number (required)',
            faculty_id: 'number (required)',
            graduation_year: 'number (required)',
            enrollment_date: 'string - date format YYYY-MM-DD (required)'
          },
          received_fields: {
            member_id: member_id || 'missing',
            faculty_id: faculty_id || 'missing',
            graduation_year: graduation_year || 'missing',
            enrollment_date: enrollment_date || 'missing'
          }
        });
      }

      // Validate field types and values
      if (isNaN(parseInt(member_id))) {
        return res.status(400).json({
          success: false,
          message: 'member_id must be a valid number',
          received: member_id
        });
      }

      if (isNaN(parseInt(faculty_id))) {
        return res.status(400).json({
          success: false,
          message: 'faculty_id must be a valid number',
          received: faculty_id
        });
      }

      if (isNaN(parseInt(graduation_year))) {
        return res.status(400).json({
          success: false,
          message: 'graduation_year must be a valid number',
          received: graduation_year
        });
      }

      const enrollmentDateObj = new Date(enrollment_date);
      if (isNaN(enrollmentDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'enrollment_date must be a valid date (format: YYYY-MM-DD)',
          received: enrollment_date
        });
      }

      // Upload files to local storage
      let national_id_front: string | undefined;
      let national_id_back: string | undefined;
      let personal_photo: string | undefined;
      let medical_report: string | undefined;
      let student_proof: string | undefined;

      try {
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

        const studentProofFile = getFile(req.files, 'student_proof');
        if (studentProofFile) {
          student_proof = await saveToLocalStorage(studentProofFile.buffer, studentProofFile.originalname, DocumentType.STUDENT_PROOF, UserType.MEMBER);
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
        });
      }

      const result = await detailedService.submitStudentMemberDetailedInfo({
        member_id: parseInt(member_id),
        faculty_id: parseInt(faculty_id),
        graduation_year: parseInt(graduation_year),
        enrollment_date: enrollmentDateObj,
        national_id_front,
        national_id_back,
        personal_photo,
        medical_report,
        student_proof,
        address: req.body.address,
      });

      return res.status(201).json(result);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Error submitting student member details',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /register/status/:member_id
   * Get member registration status and what information has been submitted
   */
  static async getMemberStatus(req: Request, res: Response) {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        return res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
      }

      const status = await detailedService.getMemberRegistrationStatus(parseInt(member_id));

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

export default DetailedRegistrationController;
