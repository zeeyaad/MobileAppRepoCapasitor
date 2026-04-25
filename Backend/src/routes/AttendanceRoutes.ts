import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/attendance - Record attendance
router.post('/', authenticate, AttendanceController.recordAttendance);

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', authenticate, AttendanceController.updateAttendance);

// GET /api/members/:member_id/attendance - Get member attendance history
router.get('/members/:member_id/attendance', authenticate, AttendanceController.getMemberAttendance);

// GET /api/members/:member_id/teams/:team_id/absences - Get member team absences
router.get('/members/:member_id/teams/:team_id/absences', authenticate, AttendanceController.getMemberTeamAbsences);

// POST /api/members/:member_id/absence-alert - Send absence alert
router.post('/members/:member_id/absence-alert', authenticate, AttendanceController.sendAbsenceAlert);

// GET /api/teams/:team_id/attendance-report - Get team attendance report
router.get('/teams/:team_id/attendance-report', authenticate, AttendanceController.getTeamAttendanceReport);

// GET /api/attendance/team-member-stats/:teamMemberId - Get dashboard stats for team member
router.get('/team-member-stats/:teamMemberId', authenticate, AttendanceController.getTeamMemberStats);

// GET /api/attendance/member-stats/:memberId - Get dashboard stats for regular member
router.get('/member-stats/:memberId', authenticate, AttendanceController.getMemberStats);

export default router;
