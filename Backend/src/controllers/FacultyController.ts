import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Faculty } from '../entities/Faculty';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

/**
 * FacultyController - Handles faculty management
 * 
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 * 
 * Privileges required:
 * - VIEW_FACULTIES (code: 62): View faculties list and details
 * - CREATE_FACULTY (code: 63): Create new faculties
 * - UPDATE_FACULTY (code: 64): Edit faculty information
 * - DELETE_FACULTY (code: 65): Delete faculties
 * - ASSIGN_FACULTY_TO_MEMBER (code: 66): Assign faculty to members
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
export class FacultyController {
  private static facultyRepo = AppDataSource.getRepository(Faculty);

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
        module: 'Faculties',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });
    } catch (error) {
      console.error('Failed to create audit log in FacultyController:', error);
    }
  }

  /**
   * VIEW_FACULTIES - Get all faculties
   * GET /api/faculties
   * 
   * @requires VIEW_FACULTIES privilege
   * @returns Array of all faculties sorted by most recent
   */
  static async getAllFaculties(req: AuthenticatedRequest, res: Response) {
    try {
      const faculties = await FacultyController.facultyRepo.find({
        order: { created_at: 'DESC' },
      });

      return res.json({
        success: true,
        data: faculties,
        count: faculties.length,
        staff_id: req.user?.staff_id,
      });
    } catch (error: unknown) {
      console.error('Error fetching faculties:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch faculties',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_FACULTIES - Get specific faculty by ID
   * GET /api/faculties/:id
   * 
   * @requires VIEW_FACULTIES privilege
   * @param {number} id - Faculty ID
   * @returns Faculty object with all details
   */
  static async getFacultyById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const facultyId = parseInt(id);
      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid faculty ID. Must be a number.',
        });
      }

      const faculty = await FacultyController.facultyRepo.findOne({
        where: { id: facultyId },
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }

      return res.json({
        success: true,
        data: faculty,
      });
    } catch (error: unknown) {
      console.error('Error fetching faculty:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch faculty',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_FACULTY - Create a new faculty
   * POST /api/faculties
   * 
   * @requires CREATE_FACULTY privilege
   * @body {string} code - Unique faculty code (e.g., "ENG", "MED", "LAW")
   * @body {string} name_en - Faculty name in English
   * @body {string} name_ar - Faculty name in Arabic
   * @returns Created faculty object with ID and timestamps
   */
  static async createFaculty(req: AuthenticatedRequest, res: Response) {
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
          message: 'Faculty code must not exceed 50 characters',
        });
      }

      if (name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Faculty English name must not exceed 100 characters',
        });
      }

      if (name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Faculty Arabic name must not exceed 100 characters',
        });
      }

      // Check if code already exists (unique constraint)
      const existingFaculty = await FacultyController.facultyRepo.findOne({ where: { code } });
      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: 'Faculty with this code already exists',
        });
      }

      const newFaculty = new Faculty();
      newFaculty.code = code;
      newFaculty.name_en = name_en;
      newFaculty.name_ar = name_ar;

      const savedFaculty = await FacultyController.facultyRepo.save(newFaculty);

      await FacultyController.logAction(req, 'Create', `Created faculty: ${savedFaculty.name_en} (${savedFaculty.code})`, null, savedFaculty);

      return res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        data: savedFaculty,
      });
    } catch (error: unknown) {
      console.error('Error creating faculty:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create faculty',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_FACULTY - Edit faculty information
   * PUT /api/faculties/:id
   * 
   * @requires UPDATE_FACULTY privilege
   * @param {number} id - Faculty ID to update
   * @body {string} [code] - New faculty code (optional)
   * @body {string} [name_en] - New faculty name in English (optional)
   * @body {string} [name_ar] - New faculty name in Arabic (optional)
   * @returns Updated faculty object
   */
  static async updateFaculty(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { code, name_en, name_ar } = req.body;

      // Validate ID parameter
      const facultyId = parseInt(id);
      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid faculty ID. Must be a number.',
        });
      }

      // Find existing faculty
      const faculty = await FacultyController.facultyRepo.findOne({
        where: { id: facultyId },
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }

      // If updating code, check for conflicts with unique constraint
      if (code && code !== faculty.code) {
        const existingFaculty = await FacultyController.facultyRepo.findOne({ where: { code } });
        if (existingFaculty) {
          return res.status(409).json({
            success: false,
            message: 'Faculty with this code already exists',
          });
        }
      }

      // Validate field lengths
      if (code && code.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Faculty code must not exceed 50 characters',
        });
      }

      if (name_en && name_en.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Faculty English name must not exceed 100 characters',
        });
      }

      if (name_ar && name_ar.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Faculty Arabic name must not exceed 100 characters',
        });
      }

      // Update fields (only provided fields)
      faculty.code = code || faculty.code;
      faculty.name_en = name_en || faculty.name_en;
      faculty.name_ar = name_ar || faculty.name_ar;

      const oldFaculty = { ...faculty };
      const updatedFaculty = await FacultyController.facultyRepo.save(faculty);

      await FacultyController.logAction(req, 'Update', `Updated faculty: ${updatedFaculty.name_en}`, oldFaculty, updatedFaculty);

      return res.json({
        success: true,
        message: 'Faculty updated successfully',
        data: updatedFaculty,
      });
    } catch (error: unknown) {
      console.error('Error updating faculty:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update faculty',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_FACULTY - Delete a faculty
   * DELETE /api/faculties/:id
   * 
   * @requires DELETE_FACULTY privilege
   * @param {number} id - Faculty ID to delete
   * @returns Success message
   * 
   * Note: Deletion may fail if faculty has associated student records
   */
  static async deleteFaculty(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      const facultyId = parseInt(id);
      if (isNaN(facultyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid faculty ID. Must be a number.',
        });
      }

      // Find existing faculty
      const faculty = await FacultyController.facultyRepo.findOne({
        where: { id: facultyId },
        relations: ['university_student_details'],
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }

      // Check if faculty has associated student records
      if (faculty.university_student_details && faculty.university_student_details.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete faculty. It has ${faculty.university_student_details.length} associated student record(s)`,
        });
      }

      await FacultyController.facultyRepo.remove(faculty);

      await FacultyController.logAction(req, 'Delete', `Deleted faculty: ${faculty.name_en} (${faculty.code})`, faculty, null);

      return res.json({
        success: true,
        message: 'Faculty deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting faculty:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete faculty',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_FACULTY_TO_MEMBER - Assign faculty to a member
   * POST /api/faculties/:facultyId/assign-to-member/:memberId
   * 
   * @requires ASSIGN_FACULTY_TO_MEMBER privilege
   * @param {number} facultyId - Faculty ID to assign
   * @param {number} memberId - Member ID to assign faculty to
   * @returns Success message
   * 
   * This endpoint updates the faculty assignment for a member in the UniversityStudentDetail table.
   * Only applicable for student members (UniversityStudentDetail records).
   */
  static async assignFacultyToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { facultyId, memberId } = req.params;

      // Validate parameters
      const fId = parseInt(facultyId);
      const mId = parseInt(memberId);

      if (isNaN(fId) || isNaN(mId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid faculty ID or member ID. Both must be numbers.',
        });
      }

      // Verify faculty exists
      const faculty = await FacultyController.facultyRepo.findOne({
        where: { id: fId },
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }

      // Verify member and university student detail exists
      const universityStudentDetail = await AppDataSource.getRepository('UniversityStudentDetail').findOne({
        where: { member_id: mId },
      });

      if (!universityStudentDetail) {
        return res.status(404).json({
          success: false,
          message: 'Member or university student record not found. Member must be a student member.',
        });
      }

      // Update faculty assignment
      universityStudentDetail.faculty_id = fId;
      await AppDataSource.getRepository('UniversityStudentDetail').save(universityStudentDetail);

      await FacultyController.logAction(req, 'Assign Faculty', `Assigned faculty ${faculty.name_en} to member ID: ${mId}`, null, { member_id: mId, faculty_id: fId });

      return res.json({
        success: true,
        message: 'Faculty assigned to member successfully',
        data: {
          member_id: mId,
          faculty_id: fId,
          faculty_code: faculty.code,
          faculty_name: faculty.name_en,
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning faculty to member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign faculty to member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default FacultyController;
