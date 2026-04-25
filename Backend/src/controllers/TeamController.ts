import { Request, Response } from 'express';
import { TeamService } from '../services/TeamService';

export class TeamController {
    /**
     * @route   POST /api/teams
     * @desc    Create a new team (Admin/Staff only)
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   sport_id: number,
     *   branch_id?: number,
     *   name_en: string,
     *   name_ar: string,
     *   max_participants?: number,
     *   status?: string,
     *   training?: {
     *     days_en: string,
     *     days_ar: string,
     *     start_time: string,
     *     end_time: string,
     *     field_id: string,
     *     training_fee: number
     *   }
     * }
     */
    static async createTeam(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const { sport_id, branch_id, name_en, name_ar, max_participants, status, training } = body;

            if (!sport_id || !name_en || !name_ar) {
                res.status(400).json({
                    success: false,
                    message: 'sport_id, name_en, and name_ar are required',
                });
                return;
            }

            const teamData: {
                sport_id: number;
                branch_id?: number;
                name_en: string;
                name_ar: string;
                max_participants?: number;
                status?: string;
                training?: {
                    days_en: string;
                    days_ar: string;
                    start_time: string;
                    end_time: string;
                    field_id: string;
                    training_fee: number;
                };
            } = {
                sport_id: sport_id as number,
                branch_id: branch_id as number | undefined,
                name_en: name_en as string,
                name_ar: name_ar as string,
                max_participants: max_participants as number | undefined,
                status: (status as string) || 'active',
            };

            if (training) {
                const trainingData = training as Record<string, unknown>;
                teamData.training = {
                    days_en: trainingData.days_en as string,
                    days_ar: trainingData.days_ar as string,
                    start_time: trainingData.start_time as string,
                    end_time: trainingData.end_time as string,
                    field_id: trainingData.field_id as string,
                    training_fee: trainingData.training_fee as number,
                };
            }

            const teamService = new TeamService();
            const team = await teamService.createTeam(teamData);

            res.status(201).json({
                success: true,
                message: 'Team created successfully',
                data: team,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
            console.error('Error creating team:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams
     * @desc    Get all teams with optional filters
     * @access  Admin/Staff, Member, TeamMember
     * @query   sport_id?: number, status?: string, branch_id?: number
     */
    static async getAllTeams(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query as Record<string, unknown>;
            const { sport_id, status, branch_id } = query;

            const filters: Record<string, unknown> = {};
            if (sport_id) filters.sport_id = parseInt(sport_id as string);
            if (status) filters.status = status;
            if (branch_id) filters.branch_id = parseInt(branch_id as string);

            const teamService = new TeamService();
            const teams = await teamService.getAllTeams(filters);

            res.status(200).json({
                success: true,
                data: teams,
                count: teams.length,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
            console.error('Error fetching teams:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/:id
     * @desc    Get team by ID with full details
     * @access  Admin/Staff, Member, TeamMember
     */
    static async getTeamById(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;

            const teamService = new TeamService();
            const team = await teamService.getTeamById(teamId);

            if (!team) {
                res.status(404).json({
                    success: false,
                    message: 'Team not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: team,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
            console.error('Error fetching team:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   PUT /api/teams/:id
     * @desc    Update team details
     * @access  Authenticated users
     */
    static async updateTeam(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;
            const body = req.body as Record<string, unknown>;

            const teamService = new TeamService();
            const updatedTeam = await teamService.updateTeam(teamId, body);

            res.status(200).json({
                success: true,
                message: 'Team updated successfully',
                data: updatedTeam,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update team';
            console.error('Error updating team:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   DELETE /api/teams/:id
     * @desc    Delete a team
     * @access  SportActivityManager
     */
    static async deleteTeam(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;
            
            const teamService = new TeamService();
            await teamService.deleteTeam(teamId);

            res.status(200).json({
                success: true,
                message: 'Team deleted successfully',
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
            console.error('Error deleting team:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/:id/members
     * @desc    Get all members in a team
     * @access  Admin/Staff, Team owner
     */
    static async getTeamMembers(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;

            const teamService = new TeamService();
            const members = await teamService.getTeamMembers(teamId);

            res.status(200).json({
                success: true,
                data: members,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members';
            console.error('Error fetching team members:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/:id/available-slots
     * @desc    Get available slots in a team
     * @access  Public (for availability check)
     */
    static async getAvailableSlots(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;

            const teamService = new TeamService();
            const slots = await teamService.getAvailableSlots(teamId);

            res.status(200).json({
                success: true,
                data: slots,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch available slots';
            console.error('Error fetching available slots:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   PATCH /api/teams/:id/status
     * @desc    Update team status
     * @access  SportActivityManager
     */
    static async updateTeamStatus(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.id as string;
            const { status } = req.body as { status: string };

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: 'Status is required',
                });
                return;
            }

            const teamService = new TeamService();
            const updatedTeam = await teamService.updateTeamStatus(teamId, status);

            res.status(200).json({
                success: true,
                message: 'Team status updated successfully',
                data: updatedTeam,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update team status';
            console.error('Error updating team status:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/sport/:sport_id/with-members
     * @desc    Get all teams for a specific sport with their members
     * @access  Admin/Staff with VIEW_TEAMS privilege
     * @query   team_id?: string (optional - filter to specific team)
     */
    static async getTeamsBySportWithMembers(req: Request, res: Response): Promise<void> {
        try {
            const sportId = req.params.sport_id as string;
            const query = req.query as Record<string, unknown>;
            const teamId = query.team_id as string | undefined;

            if (!sportId) {
                res.status(400).json({
                    success: false,
                    message: 'sport_id is required',
                });
                return;
            }

            const teamService = new TeamService();
            const teamsWithMembers = await teamService.getTeamsBySportWithMembers(parseInt(sportId), teamId);

            res.status(200).json({
                success: true,
                data: teamsWithMembers,
                count: teamsWithMembers.length,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams with members';
            console.error('Error fetching teams with members:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
}
