import { AppDataSource } from '../database/data-source';
import { Attendance } from '../entities/Attendance';
import { MemberTeam } from '../entities/MemberTeam';
import { Member } from '../entities/Member';
import { TeamMember } from '../entities/TeamMember';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Team } from '../entities/Team';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
import { Repository, FindOptionsWhere } from 'typeorm';

export interface RecordAttendanceRequest {
  member_id?: number;
  team_member_id?: number;
  team_id: string;
  training_schedule_id: string;
  attendance_date: Date;
  attended: boolean;
  notes?: string;
}

export interface AbsenceReport {
  entity_id: number;
  entity_type: 'member' | 'team_member';
  name: string;
  team_id: string;
  team_name: string;
  absence_count: number;
  absence_percentage: number;
  last_absence_date: string | null;
}

export class AttendanceService {
  private attendanceRepository: Repository<Attendance>;
  private memberRepository: Repository<Member>;
  private teamMemberRepository: Repository<TeamMember>;
  private teamRepository: Repository<Team>;
  private scheduleRepository: Repository<TeamTrainingSchedule>;
  private memberTeamRepository: Repository<MemberTeam>;
  private teamMemberTeamRepository: Repository<TeamMemberTeam>;

  constructor() {
    this.attendanceRepository = AppDataSource.getRepository(Attendance);
    this.memberRepository = AppDataSource.getRepository(Member);
    this.teamMemberRepository = AppDataSource.getRepository(TeamMember);
    this.teamRepository = AppDataSource.getRepository(Team);
    this.scheduleRepository = AppDataSource.getRepository(TeamTrainingSchedule);
    this.memberTeamRepository = AppDataSource.getRepository(MemberTeam);
    this.teamMemberTeamRepository = AppDataSource.getRepository(TeamMemberTeam);
  }

  /**
   * Record attendance for a member or team member
   */
  async recordAttendance(request: RecordAttendanceRequest): Promise<Attendance> {
    const { member_id, team_member_id, team_id, training_schedule_id, attendance_date, attended, notes } = request;

    if (!member_id && !team_member_id) {
      throw new Error('Either member_id or team_member_id must be provided');
    }

    // Validate team exists
    const team = await this.teamRepository.findOne({ where: { id: team_id } });
    if (!team) throw new Error(`Team with ID ${team_id} not found`);

    // Validate training schedule
    const schedule = await this.scheduleRepository.findOne({ where: { id: training_schedule_id } });
    if (!schedule) throw new Error(`Training schedule with ID ${training_schedule_id} not found`);

    const dateStr = attendance_date.toISOString().split('T')[0];

    // Check if attendance already recorded
    const where: FindOptionsWhere<Attendance> = {
      team_id,
      training_schedule_id,
      attendance_date: dateStr,
    };

    if (member_id) where.member_id = member_id;
    else where.team_member_id = team_member_id;

    let attendance = await this.attendanceRepository.findOne({ where });

    if (attendance) {
      attendance.attended = attended;
      attendance.notes = notes || attendance.notes;
    } else {
      attendance = this.attendanceRepository.create({
        member_id: member_id || null,
        team_member_id: team_member_id || null,
        team_id,
        training_schedule_id,
        attendance_date: dateStr,
        attended,
        notes,
      });
    }

    return await this.attendanceRepository.save(attendance);
  }

  /**
   * Get attendance stats for a member or team member
   */
  async getEntityOverallStats(id: number, type: 'member' | 'team_member'): Promise<{
    total_sessions: number;
    attended_sessions: number;
    missed_sessions: number;
    attendance_rate: number;
  }> {
    const where: FindOptionsWhere<Attendance> = type === 'member' ? { member_id: id } : { team_member_id: id };

    const records = await this.attendanceRepository.find({ where });

    const attended = records.filter(r => r.attended).length;
    const missed = records.filter(r => !r.attended).length;
    const total = records.length;
    const rate = total > 0 ? (attended / total) * 100 : 0;

    return {
      total_sessions: total,
      attended_sessions: attended,
      missed_sessions: missed,
      attendance_rate: Math.round(rate * 100) / 100,
    };
  }

  /**
   * Get member sports (teams they are joined in)
   */
  async getJoinedSports(id: number, type: 'member' | 'team_member') {
    if (type === 'member') {
      const joined = await this.memberTeamRepository.find({
        where: { member_id: id },
        relations: ['team', 'team.sport', 'team.training_schedules', 'team.training_schedules.field'],
      });
      return joined.map(j => ({
        id: j.team.id,
        name: j.team.name_en,
        name_ar: j.team.name_ar,
        sport_name: j.team.sport?.name_en,
        sport_name_ar: j.team.sport?.name_ar,
        sport_image: j.team.sport?.sport_image ?? null,
        status: j.status,
        start_date: j.start_date,
        end_date: j.end_date,
        schedules: j.team.training_schedules,
      }));
    } else {
      const joined = await this.teamMemberTeamRepository
        .createQueryBuilder('tmt')
        .leftJoinAndSelect('tmt.team', 'team')
        .leftJoinAndSelect('team.sport', 'sport')
        .leftJoinAndSelect('team.training_schedules', 'schedule')
        .leftJoinAndSelect('schedule.field', 'field')
        .addSelect(['tmt.start_date', 'tmt.end_date'])
        .where('tmt.team_member_id = :teamMemberId', { teamMemberId: id })
        .andWhere('tmt.team_id IS NOT NULL')
        .andWhere("COALESCE(tmt.subscription_status, 'pending_admin_approval') <> :pendingPayment", {
          pendingPayment: 'pending_payment',
        })
        .andWhere('tmt.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['cancelled', 'declined'] })
        .orderBy('tmt.created_at', 'DESC')
        .getMany();

      return joined
        .filter((j) => !!j.team)
        .map((j) => ({
          id: j.team.id,
          name: j.team.name_en,
          name_ar: j.team.name_ar,
          sport_name: j.team.sport?.name_en,
          sport_name_ar: j.team.sport?.name_ar,
          sport_image: j.team.sport?.sport_image ?? null,
          status: j.status,
          start_date: j.start_date,
          end_date: j.end_date,
          schedules: j.team.training_schedules,
        }));
    }
  }

  /**
   * Get complete dashboard summary for a team member
   */
  async getTeamMemberDashboardStats(teamMemberId: number) {
    const overall = await this.getEntityOverallStats(teamMemberId, 'team_member');
    const sports = await this.getJoinedSports(teamMemberId, 'team_member');

    // Get stats per sport
    const sportStats = await Promise.all(sports.map(async (s) => {
      const records = await this.attendanceRepository.find({
        where: { team_member_id: teamMemberId, team_id: s.id }
      });
      const attended = records.filter(r => r.attended).length;
      const absent = records.filter(r => !r.attended).length;
      const total = records.length;

      return {
        ...s,
        stats: {
          attended,
          absent,
          total,
          rate: total > 0 ? Math.round((attended / total) * 100) : 0,
          records: records.map(r => ({
            date: r.attendance_date,
            attended: r.attended
          }))
        }
      };
    }));

    return {
      overall,
      sports: sportStats
    };
  }

  /**
   * Get complete dashboard summary for a member
   */
  async getMemberDashboardStats(memberId: number) {
    const overall = await this.getEntityOverallStats(memberId, 'member');
    const sports = await this.getJoinedSports(memberId, 'member');

    // Get stats per sport
    const sportStats = await Promise.all(sports.map(async (s) => {
      const records = await this.attendanceRepository.find({
        where: { member_id: memberId, team_id: s.id }
      });
      const attended = records.filter(r => r.attended).length;
      const absent = records.filter(r => !r.attended).length;
      const total = records.length;

      return {
        ...s,
        stats: {
          attended,
          absent,
          total,
          rate: total > 0 ? Math.round((attended / total) * 100) : 0,
          records: records.map(r => ({
            date: r.attendance_date,
            attended: r.attended
          }))
        }
      };
    }));

    return {
      overall,
      sports: sportStats
    };
  }
}
