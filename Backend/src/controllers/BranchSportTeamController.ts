import { Request, Response } from 'express';
import { TeamService } from '../services/TeamService';

interface AuthenticatedRequest extends Request {
  user?: {
    staff_id?: number;
    id?: number;
    email?: string;
    [key: string]: unknown;
  };
}

/**
 * BranchSportTeamController
 * 
 * Handles admin operations for managing teams:
 * - Create, read, update, delete teams
 * - Filter teams by branch and sport
 * - Approve/decline teams
 * - Manage team availability
 */
export class BranchSportTeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  /**
   * CREATE - Add a new team
   * POST /api/teams
   * Admin only
   */
  createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const {
        branch_id,
        sport_id,
        name_en,
        name_ar,
        max_participants,
      } = req.body;

      // Validation
      if (!branch_id || !sport_id || !name_en || !name_ar) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: branch_id, sport_id, name_en, name_ar',
        });
        return;
      }

      const team = await this.teamService.createTeam({
        sport_id: Number(sport_id),
        branch_id: Number(branch_id),
        name_en: name_en,
        name_ar: name_ar,
        max_participants: max_participants ? Number(max_participants) : 20,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create team',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get a team by ID
   * GET /api/teams/:teamId
   */
  getTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      const team = await this.teamService.getTeamById(teamId);

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get all teams with optional filters
   * GET /api/teams?branch_id=1&sport_id=2&status=active
   */
  getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const { branch_id, sport_id, status, is_active } = req.query;

      const filters = {
        branch_id: branch_id ? Number(branch_id) : undefined,
        sport_id: sport_id ? Number(sport_id) : undefined,
        status: status ? String(status) : undefined,
        is_active: is_active ? is_active === 'true' : undefined,
      };

      const teams = await this.teamService.getAllTeams(filters);

      res.json({
        success: true,
        count: teams.length,
        data: teams,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching teams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teams',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get teams for a branch and sport
   * GET /api/teams/branch/:branchId/sport/:sportId
   */
  getTeamsByBranchAndSport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { branchId, sportId } = req.params;

      if (!branchId || !sportId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID and Sport ID are required',
        });
        return;
      }

      const filters = {
        branch_id: Number(branchId),
        sport_id: Number(sportId),
        status: 'active',
      };

      const teams = await this.teamService.getAllTeams(filters);

      res.json({
        success: true,
        count: teams.length,
        data: teams,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching teams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teams',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get available teams for a branch
   * GET /api/teams/available/branch/:branchId?sport_id=2
   */
  getAvailableTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const { branchId } = req.params;
      const { sport_id } = req.query;

      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required',
        });
        return;
      }

      const filters = {
        branch_id: Number(branchId),
        status: 'active',
        ...(sport_id && { sport_id: Number(sport_id) }),
      };

      const teams = await this.teamService.getAllTeams(filters);

      res.json({
        success: true,
        count: teams.length,
        data: teams,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching available teams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available teams',
        error: errorMessage,
      });
    }
  };

  /**
   * UPDATE - Update a team
   * PUT /api/teams/:teamId
   * Admin only
   */
  updateTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      const team = await this.teamService.updateTeam(teamId, req.body);

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update team',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Approve a team (change status to active)
   * PATCH /api/teams/:teamId/approve
   * Admin only
   */
  approveTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const user = req.user;

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      const team = await this.teamService.updateTeamStatus(teamId, 'active');

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Team approved successfully',
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error approving team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve team',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Decline a team (change status to inactive)
   * PATCH /api/teams/:teamId/decline
   * Admin only
   */
  declineTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const user = req.user;

      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      const team = await this.teamService.updateTeamStatus(teamId, 'inactive');

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Team declined successfully',
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error declining team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to decline team',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Archive a team (change status to archived)
   * PATCH /api/teams/:teamId/archive
   * Admin only
   */
  archiveTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      const team = await this.teamService.updateTeamStatus(teamId, 'archived');

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Team archived successfully',
        data: team,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error archiving team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive team',
        error: errorMessage,
      });
    }
  };

  /**
   * DELETE - Delete a team
   * DELETE /api/teams/:teamId
   * Admin only
   */
  deleteTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
        return;
      }

      await this.teamService.deleteTeam(teamId);

      res.json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete team',
        error: errorMessage,
      });
    }
  };
}
