import { Router } from 'express';
import RegistrationController from '../controllers/RegistrationController';
import DetailedRegistrationController from '../controllers/DetailedRegistrationController';
import ForeignerSeasonalController from '../controllers/ForeignerSeasonalController';
import WorkingMemberController from '../controllers/WorkingMemberController';
import { RetiredMemberController } from '../controllers/RetiredMemberController';
import { DependentMemberController } from '../controllers/DependentMemberController';
import { StudentMemberController } from '../controllers/StudentMemberController';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * Registration Routes
 * ==================
 *
 * Step 1: POST /register/basic
 *   - Register basic member info (email, password, name, gender, nationality)
 *   - Returns member_id to continue
 *
 * Step 2: Answer membership determination questions
 *   - GET /register/salary-brackets (for working members)
 *   - GET /register/dependent-tiers (for dependents)
 *
 * Step 3: POST /register/determine-membership
 *   - Submit answers to questions
 *   - System auto-determines membership type
 *
 * Step 4: POST /register/complete
 *   - Create membership subscription
 *   - Complete registration
 */

// ========================================
// COMPLETE MEMBER REGISTRATION ENDPOINTS
// Register in single request: account → member → member_details → membership
// ========================================
router.post('/register-working-member', (req, res) =>
  RegistrationController.registerCompleteWorkingMember(req, res)
);

router.post('/register-retired-member', (req, res) =>
  RegistrationController.registerCompleteRetiredMember(req, res)
);

router.post('/register-student-member',
  upload.fields([
    { name: 'personal_photo', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'student_proof', maxCount: 1 }
  ]),
  (req, res) =>
  RegistrationController.registerCompleteStudentMember(req, res)
);

// Step 0: Choose Role
router.post('/choose-role', (req, res) => RegistrationController.chooseRole(req, res));

// Step 1: Basic Registration
router.post('/basic', (req, res) => RegistrationController.registerBasic(req, res));

// Step 2: Get reference data for questions
router.get('/salary-brackets', (req, res) => RegistrationController.getSalaryBrackets(req, res));
router.get('/dependent-tiers', (req, res) => RegistrationController.getDependentTiers(req, res));

// STEP 2: Detailed Information Collection
// Dropdowns and reference data
router.get('/branches', (req, res) => DetailedRegistrationController.getBranches(req, res));
router.get('/visitor-types', (req, res) =>
  DetailedRegistrationController.getVisitorMembershipTypes(req, res)
);
router.get('/employment-statuses', (req, res) =>
  DetailedRegistrationController.getEmploymentStatusOptions(req, res)
);

// Submit detailed information by membership type
router.post('/details/visitor',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'passport_photo', maxCount: 1 }
  ]),
  (req, res) => DetailedRegistrationController.submitVisitorDetails(req, res)
);

router.post('/details/working',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'salary_slip', maxCount: 1 }
  ]),
  (req, res) => DetailedRegistrationController.submitWorkingDetails(req, res)
);

router.post('/details/retired',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'salary_slip', maxCount: 1 }
  ]),
  (req, res) => DetailedRegistrationController.submitRetiredDetails(req, res)
);

router.post('/details/student',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'student_proof', maxCount: 1 }
  ]),
  (req, res) => DetailedRegistrationController.submitStudentDetails(req, res)
);

// Get member registration status
router.get('/status/:member_id', (req, res) =>
  DetailedRegistrationController.getMemberStatus(req, res)
);

// STEP 2 FOREIGNER/SEASONAL: Detailed Information Collection
// Dropdowns and reference data
router.get('/seasonal/duration-options', (req, res) =>
  ForeignerSeasonalController.getDurationOptions(req, res)
);
router.get('/seasonal/visa-statuses', (req, res) =>
  ForeignerSeasonalController.getVisaStatusOptions(req, res)
);
router.get('/seasonal/payment-options', (req, res) =>
  ForeignerSeasonalController.getPaymentOptions(req, res)
);
router.get('/seasonal/pricing/:duration_months', (req, res) =>
  ForeignerSeasonalController.getPricingDetails(req, res)
);

// Submit detailed information for foreigner/seasonal member
router.post('/details/foreigner-seasonal',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'passport_photo', maxCount: 1 }
  ]),
  (req, res) =>
  ForeignerSeasonalController.submitForeignerSeasonalDetails(req, res)
);

// Submit detailed information for dependent member
router.post('/details/dependent',
  upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'relation_proof', maxCount: 1 }
  ]),
  (req, res) => DependentMemberController.submitDependentDetails(req, res)
);

// Create membership for foreigner/seasonal member
router.post('/seasonal/membership', (req, res) =>
  ForeignerSeasonalController.createSeasonalMembership(req, res)
);

// Get foreigner/seasonal member status
router.get('/seasonal/status/:member_id', (req, res) =>
  ForeignerSeasonalController.getForeignerStatus(req, res)
);

// STEP 2 WORKING MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/professions', (req, res) => WorkingMemberController.getProfessions(req, res));
router.get('/relationship-types', (req, res) =>
  WorkingMemberController.getRelationshipTypes(req, res)
);
router.get('/active-working-members', (req, res) =>
  WorkingMemberController.getActiveWorkingMembers(req, res)
);

// Pricing calculation
router.post('/calculate-working-membership-price', (req, res) =>
  WorkingMemberController.calculateMembershipPrice(req, res)
);

// Submit working member details
router.post('/details/working-member', (req, res) =>
  WorkingMemberController.submitWorkingMemberDetails(req, res)
);

// Create working membership
router.post('/working-membership', (req, res) =>
  WorkingMemberController.createWorkingMembership(req, res)
);

// Get working member status
router.get('/working-status/:member_id', (req, res) =>
  WorkingMemberController.getWorkingMemberStatus(req, res)
);

// STEP 2 RETIRED MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/retired/professions', (req, res) => RetiredMemberController.getProfessions(req, res));
router.get('/retired/relationship-types', (req, res) =>
  RetiredMemberController.getRelationshipTypes(req, res)
);
router.get('/retired/active-working-members', (req, res) =>
  RetiredMemberController.getActiveWorkingMembers(req, res)
);

// Pricing calculation
router.post('/calculate-retired-membership-price', (req, res) =>
  RetiredMemberController.calculateMembershipPrice(req, res)
);

// Submit retired member details
router.post('/details/retired-member', (req, res) =>
  RetiredMemberController.submitRetiredMemberDetails(req, res)
);

// Create retired membership
router.post('/retired-membership', (req, res) =>
  RetiredMemberController.createRetiredMembership(req, res)
);

// Create relationship between retired and active member
router.post('/retired-relationship', (req, res) =>
  RetiredMemberController.createRetiredRelationship(req, res)
);

// Get retired member status
router.get('/retired-status/:member_id', (req, res) =>
  RetiredMemberController.getRetiredMemberStatus(req, res)
);

// STEP 2 DEPENDENT MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/dependent/subtypes', (req, res) =>
  DependentMemberController.getDependentSubtypes(req, res)
);

router.get('/dependent/relationship-types', (req, res) =>
  DependentMemberController.getRelationshipTypes(req, res)
);

router.get('/dependent/active-working-members', (req, res) =>
  DependentMemberController.getActiveWorkingMembers(req, res)
);

router.get('/dependent/active-visitor-members', (req, res) =>
  DependentMemberController.getActiveVisitorMembers(req, res)
);

router.get('/dependent/active-members', (req, res) =>
  DependentMemberController.getActiveMembers(req, res)
);

// Pricing calculation
router.post('/calculate-dependent-membership-price', (req, res) =>
  DependentMemberController.calculateMembershipPrice(req, res)
);

// Create dependent membership
router.post('/dependent-membership', (req, res) =>
  DependentMemberController.createDependentMembership(req, res)
);

// Get dependent member status
router.get('/dependent-status/:member_id', (req, res) =>
  DependentMemberController.getDependentMemberStatus(req, res)
);

// STEP 2 STUDENT MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/student/statuses', (req, res) =>
  StudentMemberController.getStudentStatusOptions(req, res)
);

router.get('/student/relationship-types', (req, res) =>
  StudentMemberController.getRelationshipTypes(req, res)
);

router.get('/student/active-members', (req, res) =>
  StudentMemberController.getActiveMembers(req, res)
);

// Submit student details
router.post('/student-details', (req, res) =>
  StudentMemberController.submitStudentMemberDetails(req, res)
);

// Pricing calculation
router.post('/calculate-student-membership-price', (req, res) =>
  StudentMemberController.calculateMembershipPrice(req, res)
);

// Create student membership
router.post('/student-membership', (req, res) =>
  StudentMemberController.createStudentMembership(req, res)
);

// Calculate dependent membership price
router.post('/calculate-student-dependent-price', (req, res) =>
  StudentMemberController.calculateDependentMembershipPrice(req, res)
);

// Create student dependent membership
router.post('/student-dependent-membership', (req, res) =>
  StudentMemberController.createStudentDependentMembership(req, res)
);

// Get student member status
router.get('/student-status/:member_id', (req, res) =>
  StudentMemberController.getStudentMemberStatus(req, res)
);

// Step 3: Determine membership type based on answers
router.post('/determine-membership', (req, res) =>
  RegistrationController.determineMembership(req, res)
);

// Step 4: Complete registration with membership
router.post('/complete', (req, res) => RegistrationController.completeRegistration(req, res));

export default router;
