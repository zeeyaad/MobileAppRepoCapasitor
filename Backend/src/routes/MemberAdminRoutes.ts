import { Router } from 'express';
import { MemberController } from '../controllers/MemberAdminController';
import { MemberSubscriptionController } from '../controllers/MemberSubscriptionController';
import { MemberTypeController } from '../controllers/MemberTypeController';
import { MembershipPlanController } from '../controllers/MembershipPlanAdminController';
import { authenticate } from '../middleware/auth';
import {
  authorizePrivilege,
  AuthenticatedRequest,
} from '../middleware/authorizePrivilege';

/**
 * Member Management Routes
 * 
 * All routes are protected by privilege-based authorization middleware.
 * The middleware validates JWT tokens and checks for required privileges.
 * 
 * Routes:
 * - Member Management (rows 33-45)
 * - Member Type Management (rows 57-61)
 * - Membership Plan Management (rows 50-56)
 */

const router = Router();

// ============================================================================
// MEMBER MANAGEMENT ROUTES (Privileges: VIEW_MEMBERS, CREATE_MEMBER, etc.)
// ============================================================================

/**
 * GET /api/members
 * Privilege: VIEW_MEMBERS
 * Description: Get all members (paginated)
 * Query params: page=1, limit=20, status?, member_type_id?
 */
router.get(
  '/members',
  authorizePrivilege('VIEW_MEMBERS'),
  (req, res) => MemberController.getAllMembers(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/all-with-teams
 * Privilege: VIEW_MEMBERS
 * Description: Get all members and team members combined (paginated)
 * Query params: page=1, limit=20, status?, member_type_id?
 */
router.get(
  '/members/all-with-teams',
  authorizePrivilege('VIEW_MEMBERS'),
  (req, res) => MemberController.getAllMembersWithTeamMembers(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/:id
 * Privilege: VIEW_MEMBERS
 * Description: Get specific member details
 */
router.get(
  '/members/:id',
  authorizePrivilege('VIEW_MEMBERS'),
  (req, res) => MemberController.getMemberById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members
 * Privilege: CREATE_MEMBER
 * Description: Create a new member account
 */
router.post(
  '/members',
  authorizePrivilege('CREATE_MEMBER'),
  (req, res) => MemberController.createMember(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/members/:id
 * Privilege: UPDATE_MEMBER
 * Description: Edit member information
 */
router.put(
  '/members/:id',
  authorizePrivilege('UPDATE_MEMBER'),
  (req, res) => MemberController.updateMember(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/:id/review
 * Privilege: REVIEW_MEMBER
 * Description: Review member information for approval
 */
router.get(
  '/members/:id/review',
  authorizePrivilege('REVIEW_MEMBER'),
  (req, res) => MemberController.reviewMember(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/members/:id/status
 * Privilege: CHANGE_MEMBER_STATUS
 * Description: Change member account status (active, suspended, banned, expired, cancelled)
 */
router.patch(
  '/members/:id/status',
  authorizePrivilege('CHANGE_MEMBER_STATUS'),
  (req, res) => MemberController.changeMemberStatus(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/members/:id/block
 * Privilege: MANAGE_MEMBER_BLOCK
 * Description: Block or unblock member account
 */
router.patch(
  '/members/:id/block',
  authorizePrivilege('MANAGE_MEMBER_BLOCK'),
  (req, res) => MemberController.manageMemberBlock(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:id/reset-password
 * Privilege: RESET_MEMBER_PASSWORD
 * Description: Reset member password
 */
router.post(
  '/members/:id/reset-password',
  authorizePrivilege('RESET_MEMBER_PASSWORD'),
  (req, res) => MemberController.resetMemberPassword(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/:id/history
 * Privilege: VIEW_MEMBER_HISTORY
 * Description: View member activity history
 */
router.get(
  '/members/:id/history',
  authorizePrivilege('VIEW_MEMBER_HISTORY'),
  (req, res) => MemberController.getMemberHistory(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:id/membership-request
 * Privilege: MANAGE_MEMBERSHIP_REQUEST
 * Description: Manage membership requests (approve or reject)
 */
router.post(
  '/members/:id/membership-request',
  authorizePrivilege('MANAGE_MEMBERSHIP_REQUEST'),
  (req, res) => MemberController.manageMembershipRequest(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:id/documents
 * Privilege: UPLOAD_MEMBER_DOCUMENT
 * Description: Upload member documents
 */
router.post(
  '/members/:id/documents',
  authorizePrivilege('UPLOAD_MEMBER_DOCUMENT'),
  (req, res) => MemberController.uploadMemberDocument(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/members/:id/documents/:document_type
 * Privilege: DELETE_MEMBER_DOCUMENT
 * Description: Delete member documents
 */
router.delete(
  '/members/:id/documents/:document_type',
  authorizePrivilege('DELETE_MEMBER_DOCUMENT'),
  (req, res) => MemberController.deleteMemberDocument(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/:id/documents/:document_type/print
 * Privilege: PRINT_MEMBER_DOCUMENT
 * Description: Print member documents
 */
router.get(
  '/members/:id/documents/:document_type/print',
  authorizePrivilege('PRINT_MEMBER_DOCUMENT'),
  (req, res) => MemberController.printMemberDocument(req as AuthenticatedRequest, res)
);

/**
 * GET /api/members/:id/card
 * Privilege: PRINT_MEMBER_CARD
 * Description: Print member identification card
 */
router.get(
  '/members/:id/card',
  authorizePrivilege('PRINT_MEMBER_CARD'),
  (req, res) => MemberController.printMemberCard(req as AuthenticatedRequest, res)
);

// ============================================================================
// MEMBERSHIP PLAN ROUTES (Privileges: VIEW_MEMBERSHIP_PLANS, CREATE_MEMBERSHIP_PLAN, etc.)
// ============================================================================

/**
 * GET /api/membership-plans
 * Privilege: VIEW_MEMBERSHIP_PLANS
 * Description: Get all membership plans (paginated)
 * Query params: page=1, limit=20, member_type_id?
 */
router.get(
  '/membership-plans',
  authorizePrivilege('VIEW_MEMBERSHIP_PLANS'),
  (req, res) => MembershipPlanController.getAllPlans(req as AuthenticatedRequest, res)
);

/**
 * GET /api/membership-plans/:id
 * Privilege: VIEW_MEMBERSHIP_PLANS
 * Description: Get specific membership plan details
 */
router.get(
  '/membership-plans/:id',
  authorizePrivilege('VIEW_MEMBERSHIP_PLANS'),
  (req, res) => MembershipPlanController.getPlanById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/membership-plans
 * Privilege: CREATE_MEMBERSHIP_PLAN
 * Description: Create a new membership plan
 */
router.post(
  '/membership-plans',
  authorizePrivilege('CREATE_MEMBERSHIP_PLAN'),
  (req, res) => MembershipPlanController.createPlan(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/membership-plans/:id
 * Privilege: UPDATE_MEMBERSHIP_PLAN
 * Description: Edit membership plan details
 */
router.put(
  '/membership-plans/:id',
  authorizePrivilege('UPDATE_MEMBERSHIP_PLAN'),
  (req, res) => MembershipPlanController.updatePlan(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/membership-plans/:id
 * Privilege: DELETE_MEMBERSHIP_PLAN
 * Description: Delete membership plan
 */
router.delete(
  '/membership-plans/:id',
  authorizePrivilege('DELETE_MEMBERSHIP_PLAN'),
  (req, res) => MembershipPlanController.deletePlan(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/membership-plans/:id/status
 * Privilege: CHANGE_MEMBERSHIP_PLAN_STATUS
 * Description: Change membership plan status (activate or deactivate)
 */
router.patch(
  '/membership-plans/:id/status',
  authorizePrivilege('CHANGE_MEMBERSHIP_PLAN_STATUS'),
  (req, res) => MembershipPlanController.changePlanStatus(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:member_id/membership-plan
 * Privilege: ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER
 * Description: Assign a membership plan to a member
 */
router.post(
  '/members/:member_id/membership-plan',
  authorizePrivilege('ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER'),
  (req, res) => MembershipPlanController.assignPlanToMember(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/members/:member_id/membership-plan
 * Privilege: CHANGE_MEMBER_MEMBERSHIP_PLAN
 * Description: Change member's current membership plan
 */
router.put(
  '/members/:member_id/membership-plan',
  authorizePrivilege('CHANGE_MEMBER_MEMBERSHIP_PLAN'),
  (req, res) => MembershipPlanController.changeMemberPlan(req as AuthenticatedRequest, res)
);

// ============================================================================
// MEMBER TYPE ROUTES (Privileges: VIEW_MEMBER_TYPES, CREATE_MEMBER_TYPE, etc.)
// ============================================================================

/**
 * GET /api/member-types
 * Privilege: VIEW_MEMBER_TYPES
 * Description: Get all member types
 */
router.get(
  '/member-types',
  authorizePrivilege('VIEW_MEMBER_TYPES'),
  (req, res) => MemberTypeController.getAllMemberTypes(req as AuthenticatedRequest, res)
);

/**
 * GET /api/member-types/:id
 * Privilege: VIEW_MEMBER_TYPES
 * Description: Get specific member type details
 */
router.get(
  '/member-types/:id',
  authorizePrivilege('VIEW_MEMBER_TYPES'),
  (req, res) => MemberTypeController.getMemberTypeById(req as AuthenticatedRequest, res)
);

/**
 * POST /api/member-types
 * Privilege: CREATE_MEMBER_TYPE
 * Description: Create a new member type
 */
router.post(
  '/member-types',
  authorizePrivilege('CREATE_MEMBER_TYPE'),
  (req, res) => MemberTypeController.createMemberType(req as AuthenticatedRequest, res)
);

/**
 * PUT /api/member-types/:id
 * Privilege: UPDATE_MEMBER_TYPE
 * Description: Edit member type details
 */
router.put(
  '/member-types/:id',
  authorizePrivilege('UPDATE_MEMBER_TYPE'),
  (req, res) => MemberTypeController.updateMemberType(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/member-types/:id
 * Privilege: DELETE_MEMBER_TYPE
 * Description: Delete member type
 */
router.delete(
  '/member-types/:id',
  authorizePrivilege('DELETE_MEMBER_TYPE'),
  (req, res) => MemberTypeController.deleteMemberType(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:member_id/member-type
 * Privilege: ASSIGN_MEMBER_TYPE_TO_MEMBER
 * Description: Assign member type to a member
 */
router.post(
  '/members/:member_id/member-type',
  authorizePrivilege('ASSIGN_MEMBER_TYPE_TO_MEMBER'),
  (req, res) => MemberTypeController.assignMemberTypeToMember(req as AuthenticatedRequest, res)
);

/**
 * POST /api/members/:id/sports
 * Privilege: VIEW_MEMBERS
 * Description: Assign sports to a member
 * Body: { sportIds: number[] }
 */
router.post(
  '/members/:id/sports',
  authorizePrivilege('VIEW_MEMBERS'),
  (req, res) => MemberController.assignSportsToMember(req as AuthenticatedRequest, res)
);

export default router;
