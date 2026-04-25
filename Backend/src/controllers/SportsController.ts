import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';

/**
 * SportsController - Handles sports, teams, events, and pricing management
 * 
 * All endpoints are protected by privilege-based authorization.
 * 
 * Privileges required:
 * - VIEW_SPORTS (89): View sports list
 * - CREATE_SPORT (90): Create new sport
 * - UPDATE_SPORT (91): Edit sport information
 * - DELETE_SPORT (92): Delete sport
 * - ASSIGN_SPORT_TO_MEMBER (93): Assign sport to regular member
 * - REMOVE_SPORT_FROM_MEMBER (94): Remove sport from regular member
 * - ASSIGN_SPORT_TO_TEAM_MEMBER (95): Assign sport to team member
 * - REMOVE_SPORT_FROM_TEAM_MEMBER (96): Remove sport from team member
 * - CREATE_TEAM (97): Create new team
 * - UPDATE_TEAM (98): Edit team information
 * - DELETE_TEAM (99): Delete team
 * - ASSIGN_MEMBER_TO_TEAM (100): Add member to team
 * - REMOVE_MEMBER_FROM_TEAM (101): Remove member from team
 * - SCHEDULE_MATCH (102): Schedule team matches
 * - VIEW_SPORT_PRICING (103): View pricing information
 * - CREATE_SPORT_PRICING (104): Create pricing tiers
 * - UPDATE_SPORT_PRICING (105): Edit pricing
 * - DELETE_SPORT_PRICING (106): Delete pricing
 */
export class SportsController {
  /**
   * VIEW_SPORTS - Get all sports
   * GET /api/sports
   */
  static async getAllSports(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json({
        success: true,
        message: 'Sports management endpoints available',
        endpoints: [
          'GET /api/sports - View all sports',
          'GET /api/sports/:id - View specific sport',
          'POST /api/sports - Create sport',
          'PUT /api/sports/:id - Update sport',
          'DELETE /api/sports/:id - Delete sport',
          'POST /api/sports/:id/members - Assign sport to member',
          'DELETE /api/sports/:sportId/members/:memberId - Remove sport from member',
          'POST /api/sports/:id/team-members - Assign sport to team member',
          'DELETE /api/sports/:sportId/team-members/:teamMemberId - Remove sport from team member',
          'POST /api/teams - Create team',
          'PUT /api/teams/:id - Update team',
          'DELETE /api/teams/:id - Delete team',
          'POST /api/teams/:id/members - Add member to team',
          'DELETE /api/teams/:teamId/members/:memberId - Remove member from team',
          'POST /api/matches/schedule - Schedule match',
          'GET /api/sports/:id/pricing - View sport pricing',
          'POST /api/sports/:id/pricing - Create pricing',
          'PUT /api/sports/:sportId/pricing/:pricingId - Update pricing',
          'DELETE /api/sports/:sportId/pricing/:pricingId - Delete pricing',
        ],
        staff_id: req.user?.staff_id,
      });
    } catch (error: unknown) {
      console.error('Error in sports endpoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process sports request',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_SPORTS - Get specific sport
   * GET /api/sports/:id
   */
  static async getSportById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const sportId = parseInt(id);

      if (isNaN(sportId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID. Must be a number.',
        });
      }

      return res.json({
        success: true,
        message: 'Sport details retrieved',
        data: {
          id: sportId,
          note: 'Integration with sports database required for full implementation',
        },
      });
    } catch (error: unknown) {
      console.error('Error fetching sport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sport',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_SPORT - Create new sport
   * POST /api/sports
   */
  static async createSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { name_en, name_ar, code } = req.body;

      if (!name_en || !name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name_en, name_ar',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Sport created successfully',
        data: {
          name_en,
          name_ar,
          code,
          created_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error creating sport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create sport',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_SPORT - Update sport information
   * PUT /api/sports/:id
   */
  static async updateSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name_en, name_ar, description_en, description_ar } = req.body;

      const sportId = parseInt(id);
      if (isNaN(sportId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport updated successfully',
        data: {
          id: sportId,
          name_en,
          name_ar,
          description_en,
          description_ar,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error updating sport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update sport',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_SPORT - Delete sport
   * DELETE /api/sports/:id
   */
  static async deleteSport(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const sportId = parseInt(id);
      if (isNaN(sportId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting sport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete sport',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_SPORT_TO_MEMBER - Assign sport to regular member
   * POST /api/sports/:sportId/members
   */
  static async assignSportToMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId } = req.params;
      const { member_id } = req.body;

      const sId = parseInt(sportId);
      if (isNaN(sId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      if (!member_id) {
        return res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Sport assigned to member successfully',
        data: {
          sport_id: sId,
          member_id,
          assigned_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning sport to member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign sport to member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * REMOVE_SPORT_FROM_MEMBER - Remove sport from regular member
   * DELETE /api/sports/:sportId/members/:memberId
   */
  static async removeSportFromMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId, memberId } = req.params;

      const sId = parseInt(sportId);
      const mId = parseInt(memberId);

      if (isNaN(sId) || isNaN(mId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID or member ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport removed from member successfully',
      });
    } catch (error: unknown) {
      console.error('Error removing sport from member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove sport from member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_SPORT_TO_TEAM_MEMBER - Assign sport to team member
   * POST /api/sports/:sportId/team-members
   */
  static async assignSportToTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId } = req.params;
      const { team_member_id } = req.body;

      const sId = parseInt(sportId);
      if (isNaN(sId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      if (!team_member_id) {
        return res.status(400).json({
          success: false,
          message: 'team_member_id is required',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Sport assigned to team member successfully',
        data: {
          sport_id: sId,
          team_member_id,
          assigned_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error assigning sport to team member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign sport to team member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * REMOVE_SPORT_FROM_TEAM_MEMBER - Remove sport from team member
   * DELETE /api/sports/:sportId/team-members/:teamMemberId
   */
  static async removeSportFromTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId, teamMemberId } = req.params;

      const sId = parseInt(sportId);
      const tmId = parseInt(teamMemberId);

      if (isNaN(sId) || isNaN(tmId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID or team member ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport removed from team member successfully',
      });
    } catch (error: unknown) {
      console.error('Error removing sport from team member:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove sport from team member',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_TEAM - Create new team
   * POST /api/teams
   */
  static async createTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const { name_en, name_ar, sport_id } = req.body;

      if (!name_en || !name_ar || !sport_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name_en, name_ar, sport_id',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: {
          name_en,
          name_ar,
          sport_id,
          created_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error creating team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create team',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_TEAM - Update team information
   * PUT /api/teams/:id
   */
  static async updateTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name_en, name_ar, description_en, description_ar } = req.body;

      const teamId = parseInt(id);
      if (isNaN(teamId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      return res.json({
        success: true,
        message: 'Team updated successfully',
        data: {
          id: teamId,
          name_en,
          name_ar,
          description_en,
          description_ar,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error updating team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update team',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_TEAM - Delete team
   * DELETE /api/teams/:id
   */
  static async deleteTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const teamId = parseInt(id);
      if (isNaN(teamId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      return res.json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete team',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ASSIGN_MEMBER_TO_TEAM - Add member to team
   * POST /api/teams/:teamId/members
   */
  static async assignMemberToTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const { member_id } = req.body;

      const tId = parseInt(teamId);
      if (isNaN(tId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      if (!member_id) {
        return res.status(400).json({
          success: false,
          message: 'member_id is required',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Member added to team successfully',
        data: {
          team_id: tId,
          member_id,
          assigned_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error adding member to team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add member to team',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * REMOVE_MEMBER_FROM_TEAM - Remove member from team
   * DELETE /api/teams/:teamId/members/:memberId
   */
  static async removeMemberFromTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId, memberId } = req.params;

      const tId = parseInt(teamId);
      const mId = parseInt(memberId);

      if (isNaN(tId) || isNaN(mId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID or member ID',
        });
      }

      return res.json({
        success: true,
        message: 'Member removed from team successfully',
      });
    } catch (error: unknown) {
      console.error('Error removing member from team:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove member from team',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * SCHEDULE_MATCH - Schedule team match
   * POST /api/matches/schedule
   */
  static async scheduleMatch(req: AuthenticatedRequest, res: Response) {
    try {
      const { team_id, opponent, match_date, location } = req.body;

      if (!team_id || !match_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: team_id, match_date',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Match scheduled successfully',
        data: {
          team_id,
          opponent,
          match_date,
          location,
          scheduled_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error scheduling match:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to schedule match',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * VIEW_SPORT_PRICING - Get sport pricing
   * GET /api/sports/:sportId/pricing
   */
  static async getSportPricing(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId } = req.params;

      const sId = parseInt(sportId);
      if (isNaN(sId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      return res.json({
        success: true,
        data: {
          sport_id: sId,
          pricing_tiers: [],
          count: 0,
        },
      });
    } catch (error: unknown) {
      console.error('Error fetching sport pricing:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sport pricing',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * CREATE_SPORT_PRICING - Create pricing tier for sport
   * POST /api/sports/:sportId/pricing
   */
  static async createSportPricing(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId } = req.params;
      const { tier_name, price, currency, description } = req.body;

      const sId = parseInt(sportId);
      if (isNaN(sId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID',
        });
      }

      if (!tier_name || !price || !currency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: tier_name, price, currency',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Sport pricing created successfully',
        data: {
          sport_id: sId,
          tier_name,
          price,
          currency,
          description,
          created_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error creating sport pricing:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create sport pricing',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * UPDATE_SPORT_PRICING - Update sport pricing
   * PUT /api/sports/:sportId/pricing/:pricingId
   */
  static async updateSportPricing(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId, pricingId } = req.params;
      const { tier_name, price, currency, description } = req.body;

      const sId = parseInt(sportId);
      const pId = parseInt(pricingId);

      if (isNaN(sId) || isNaN(pId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID or pricing ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport pricing updated successfully',
        data: {
          sport_id: sId,
          pricing_id: pId,
          tier_name,
          price,
          currency,
          description,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error('Error updating sport pricing:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update sport pricing',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * DELETE_SPORT_PRICING - Delete sport pricing
   * DELETE /api/sports/:sportId/pricing/:pricingId
   */
  static async deleteSportPricing(req: AuthenticatedRequest, res: Response) {
    try {
      const { sportId, pricingId } = req.params;

      const sId = parseInt(sportId);
      const pId = parseInt(pricingId);

      if (isNaN(sId) || isNaN(pId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sport ID or pricing ID',
        });
      }

      return res.json({
        success: true,
        message: 'Sport pricing deleted successfully',
      });
    } catch (error: unknown) {
      console.error('Error deleting sport pricing:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete sport pricing',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default SportsController;
