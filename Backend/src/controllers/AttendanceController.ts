import { Request, Response } from 'express';
import { AttendanceService } from '../services/AttendanceService';

const attendanceService = new AttendanceService();

export class AttendanceController {
    /**
     * Get team member dashboard stats
     * @route GET /api/attendance/team-member-stats/:teamMemberId
     */
    static async getTeamMemberStats(req: Request, res: Response): Promise<void> {
        try {
            const teamMemberId = parseInt(req.params.teamMemberId);
            if (!teamMemberId) {
                res.status(400).json({ success: false, message: 'Invalid team member ID' });
                return;
            }

            const stats = await attendanceService.getTeamMemberDashboardStats(teamMemberId);
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            console.error('Error fetching team member stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get member dashboard stats
     * @route GET /api/attendance/member-stats/:memberId
     */
    static async getMemberStats(req: Request, res: Response): Promise<void> {
        try {
            const memberId = parseInt(req.params.memberId);
            if (!memberId) {
                res.status(400).json({ success: false, message: 'Invalid member ID' });
                return;
            }

            const stats = await attendanceService.getMemberDashboardStats(memberId);
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            console.error('Error fetching member stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get basic attendance record (for history, etc.)
     */
    static async recordAttendance(req: Request, res: Response): Promise<void> {
        try {
            const result = await attendanceService.recordAttendance({
                ...req.body,
                attendance_date: new Date(req.body.attendance_date)
            });
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Update attendance record (Stub)
     */
    static async updateAttendance(req: Request, res: Response): Promise<void> {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }

    /**
     * Get member attendance history (Stub)
     */
    static async getMemberAttendance(req: Request, res: Response): Promise<void> {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }

    /**
     * Get member team absences (Stub)
     */
    static async getMemberTeamAbsences(req: Request, res: Response): Promise<void> {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }

    /**
     * Get team attendance report (Stub)
     */
    static async getTeamAttendanceReport(req: Request, res: Response): Promise<void> {
        res.status(501).json({ success: false, message: 'Not yet implemented' });
    }

    /**
     * Send absence alert (Stub)
     */
    static async sendAbsenceAlert(req: Request, res: Response): Promise<void> {
        try {
            res.status(501).json({ success: false, message: 'Not yet implemented' });
        } catch (error: unknown) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
