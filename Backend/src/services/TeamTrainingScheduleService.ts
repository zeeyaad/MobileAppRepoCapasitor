import { AppDataSource } from '../database/data-source';
import { TeamTrainingSchedule } from "../entities/TeamTrainingSchedule";
import { Team } from "../entities/Team";
import { Repository } from "typeorm";

export interface CreateScheduleRequest {
  team_id: string; // UUID
  sport_id: number;
  days_en: string;
  days_ar: string;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  field_id: string | null; // UUID of Field
  training_fee: number;
}

export interface UpdateScheduleRequest {
  days_en?: string;
  days_ar?: string;
  start_time?: string;
  end_time?: string;
  field_id?: string | null; // UUID of Field
  training_fee?: number;
}

export class TeamTrainingScheduleService {
  private scheduleRepository: Repository<TeamTrainingSchedule>;
  private teamRepository: Repository<Team>;

  constructor() {
    this.scheduleRepository = AppDataSource.getRepository(TeamTrainingSchedule);
    this.teamRepository = AppDataSource.getRepository(Team);
  }

  /**
   * Create a new training schedule
   */
  async createSchedule(request: CreateScheduleRequest): Promise<TeamTrainingSchedule> {
    // Validate team exists
    const team = await this.teamRepository.findOne({
      where: { id: request.team_id },
    });
    if (!team) {
      throw new Error(`Team with ID ${request.team_id} not found`);
    }

    // Validate time format
    this.validateTimeFormat(request.start_time);
    this.validateTimeFormat(request.end_time);

    if (request.start_time >= request.end_time) {
      throw new Error("Start time must be before end time");
    }

    const schedule = this.scheduleRepository.create({
      team_id: request.team_id,
      sport_id: request.sport_id,
      days_en: request.days_en,
      days_ar: request.days_ar,
      start_time: request.start_time,
      end_time: request.end_time,
      field_id: request.field_id,
      training_fee: request.training_fee,
      status: 'active',
    });

    return await this.scheduleRepository.save(schedule);
  }

  /**
   * Get all training schedules for a team
   */
  async getTeamSchedules(teamId: string): Promise<TeamTrainingSchedule[]> {
    return await this.scheduleRepository.find({
      where: { team_id: teamId },
      order: { start_time: "ASC" },
    });
  }

  /**
   * Get a specific training schedule
   */
  async getScheduleById(scheduleId: string): Promise<TeamTrainingSchedule | null> {
    return await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ["team", "attendances"],
    });
  }

  /**
   * Update a training schedule
   */
  async updateSchedule(
    scheduleId: string,
    request: UpdateScheduleRequest
  ): Promise<TeamTrainingSchedule> {
    const schedule = await this.getScheduleById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    // If times are being updated, validate them
    if (request.start_time || request.end_time) {
      const startTime = request.start_time || schedule.start_time;
      const endTime = request.end_time || schedule.end_time;

      this.validateTimeFormat(startTime);
      this.validateTimeFormat(endTime);

      if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
      }
    }

    const updateData: UpdateScheduleRequest = { ...request };
    Object.assign(schedule, updateData);
    return await this.scheduleRepository.save(schedule);
  }

  /**
   * Delete a training schedule
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    const result = await this.scheduleRepository.delete(scheduleId);
    if (result.affected === 0) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }
  }

  /**
   * Get schedules for a sport (across all teams in that sport)
   */
  async getSchedulesBySport(sportId: number): Promise<TeamTrainingSchedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder("schedule")
      .innerJoinAndSelect("schedule.team", "team")
      .where("schedule.sport_id = :sportId", { sportId })
      .orderBy("schedule.start_time", "ASC");

    return await query.getMany();
  }

  /**
   * Get schedules for a specific field
   */
  async getSchedulesByField(fieldId: string): Promise<TeamTrainingSchedule[]> {
    return await this.scheduleRepository.find({
      where: { field_id: fieldId },
      relations: ["team"],
      order: { start_time: "ASC" },
    });
  }

  /**
   * Check if a schedule has available capacity
   */
  async checkAvailability(scheduleId: string): Promise<{ team_capacity: number }> {
    const schedule = await this.getScheduleById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    // Get team max participants
    if (!schedule.team) {
      throw new Error(`Team not found for schedule ${scheduleId}`);
    }

    return {
      team_capacity: schedule.team.max_participants,
    };
  }

  /**
   * Private helper: Validate time format (HH:MM:SS)
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      throw new Error(`Invalid time format: ${time}. Expected HH:MM:SS`);
    }
  }
}
