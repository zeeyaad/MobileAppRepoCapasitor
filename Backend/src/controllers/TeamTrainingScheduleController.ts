import { Request, Response } from 'express';
import { TeamTrainingScheduleService, CreateScheduleRequest, UpdateScheduleRequest } from '../services/TeamTrainingScheduleService';
// DayOfWeek removed as it's not exported.

export class TeamTrainingScheduleController {
  private scheduleService: TeamTrainingScheduleService;

  constructor() {
    this.scheduleService = new TeamTrainingScheduleService();
  }

  /**
   * POST /api/teams/:teamId/schedules
   * Create a new training schedule
   */
  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const request: CreateScheduleRequest = {
        team_id: teamId,
        ...req.body,
      };

      const schedule = await this.scheduleService.createSchedule(request);
      res.status(201).json({
        success: true,
        message: 'Training schedule created successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * GET /api/teams/:teamId/schedules
   * Get all training schedules for a team
   */
  async getTeamSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const schedules = await this.scheduleService.getTeamSchedules(teamId);

      res.status(200).json({
        success: true,
        data: schedules,
        count: schedules.length,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * GET /api/schedules/:scheduleId
   * Get a specific training schedule
   */
  async getScheduleById(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const schedule = await this.scheduleService.getScheduleById(scheduleId);

      if (!schedule) {
        res.status(404).json({
          success: false,
          message: 'Schedule not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * PUT /api/schedules/:scheduleId
   * Update a training schedule
   */
  async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const request: UpdateScheduleRequest = req.body;

      const schedule = await this.scheduleService.updateSchedule(scheduleId, request);

      res.status(200).json({
        success: true,
        message: 'Training schedule updated successfully',
        data: schedule,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * DELETE /api/schedules/:scheduleId
   * Delete a training schedule
   */
  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      await this.scheduleService.deleteSchedule(scheduleId);

      res.status(200).json({
        success: true,
        message: 'Training schedule deleted successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * GET /api/sports/:sportId/schedules
   * Get all training schedules for a sport
   */
  async getSportSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { sportId } = req.params;
      const schedules = await this.scheduleService.getSchedulesBySport(parseInt(sportId));

      res.status(200).json({
        success: true,
        data: schedules,
        count: schedules.length,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  /**
   * GET /api/schedules/:scheduleId/availability
   * Check availability (remaining slots) for a training schedule
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const availability = await this.scheduleService.checkAvailability(scheduleId);

      res.status(200).json({
        success: true,
        data: availability,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}
