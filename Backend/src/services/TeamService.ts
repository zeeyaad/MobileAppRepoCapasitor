import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Team } from '../entities/Team';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
import { MemberTeam } from '../entities/MemberTeam';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Sport } from '../entities/Sport';
import { BranchSportTeam } from '../entities/BranchSportTeam';

interface TrainingInput {
    days_en: string;
    days_ar: string;
    start_time: string;
    end_time: string;
    field_id: string;
    training_fee: number;
}

interface CreateTeamInput {
    sport_id: number;
    branch_id?: number;
    name_en: string;
    name_ar: string;
    max_participants?: number;
    status?: string;
    training?: TrainingInput;
}

interface AvailableSlotsResponse {
    team_id: string;
    team_name_en: string;
    team_name_ar: string;
    max_participants: number;
    current_members: number;
    available_slots: number;
    is_available: boolean;
}

interface MemberInfo {
    id: number;
    name: string;
    email: string;
    status: string;
    joined_at: Date;
}

interface TeamMembersResponse {
    regular_members: MemberInfo[];
    team_members: MemberInfo[];
}

export class TeamService {
    private teamRepo: Repository<Team>;
    private trainingScheduleRepo: Repository<TeamTrainingSchedule>;
    private memberTeamRepo: Repository<MemberTeam>;
    private teamMemberTeamRepo: Repository<TeamMemberTeam>;
    private sportRepo: Repository<Sport>;
    private branchSportTeamRepo: Repository<BranchSportTeam>;

    constructor() {
        this.teamRepo = AppDataSource.getRepository(Team);
        this.trainingScheduleRepo = AppDataSource.getRepository(TeamTrainingSchedule);
        this.memberTeamRepo = AppDataSource.getRepository(MemberTeam);
        this.teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);
        this.sportRepo = AppDataSource.getRepository(Sport);
        this.branchSportTeamRepo = AppDataSource.getRepository(BranchSportTeam);
    }

    /**
     * Increment current participants in a branch sport team
     */
    async incrementParticipants(teamId: number): Promise<void> {
        await this.branchSportTeamRepo.increment({ id: teamId }, 'current_participants', 1);
    }

    /**
     * Decrement current participants in a branch sport team
     */
    async decrementParticipants(teamId: number): Promise<void> {
        const team = await this.branchSportTeamRepo.findOne({ where: { id: teamId } });
        if (team && team.current_participants > 0) {
            await this.branchSportTeamRepo.decrement({ id: teamId }, 'current_participants', 1);
        }
    }

    async createTeam(data: CreateTeamInput): Promise<Team> {
        const sport = await this.sportRepo.findOne({ where: { id: data.sport_id } });
        if (!sport) throw new Error('Sport not found');

        const team = this.teamRepo.create({
            sport_id: data.sport_id,
            branch_id: data.branch_id || null,
            name_en: data.name_en,
            name_ar: data.name_ar,
            max_participants: data.max_participants || 20,
            status: (data.status || 'active') as 'active' | 'inactive' | 'suspended' | 'archived',
        });

        const savedTeam = await this.teamRepo.save(team);

        // Create training schedule if training data is provided
        if (data.training) {
            const trainingSchedule = this.trainingScheduleRepo.create({
                team_id: savedTeam.id,
                days_en: data.training.days_en,
                days_ar: data.training.days_ar,
                start_time: data.training.start_time,
                end_time: data.training.end_time,
                field_id: data.training.field_id,
                training_fee: data.training.training_fee,
            });

            await this.trainingScheduleRepo.save(trainingSchedule);

            // Reload team with training schedule
            const teamWithTraining = await this.teamRepo.findOne({
                where: { id: savedTeam.id },
                relations: ['training_schedules'],
            });

            return teamWithTraining || savedTeam;
        }

        return savedTeam;
    }

    async getAllTeams(filters: Record<string, unknown>): Promise<Team[]> {
        const query = this.teamRepo.createQueryBuilder('team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .leftJoinAndSelect('team.training_schedules', 'schedules');

        if (filters.sport_id) query.where('team.sport_id = :sportId', { sportId: filters.sport_id });
        if (filters.status) query.andWhere('team.status = :status', { status: filters.status });
        if (filters.branch_id) query.andWhere('team.branch_id = :branchId', { branchId: filters.branch_id });

        return await query.getMany();
    }

    async getTeamById(teamId: string): Promise<Team | null> {
        return await this.teamRepo.findOne({
            where: { id: teamId },
            relations: ['sport', 'branch', 'training_schedules', 'team_member_teams'],
        });
    }

    async updateTeam(teamId: string, updates: Record<string, unknown>): Promise<Team> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found');

        const allowedUpdates = ['name_en', 'name_ar', 'max_participants', 'status', 'branch_id'];
        allowedUpdates.forEach((key) => {
            if (key in updates) {
                if (key === 'name_en') team.name_en = updates[key] as string;
                else if (key === 'name_ar') team.name_ar = updates[key] as string;
                else if (key === 'max_participants') team.max_participants = updates[key] as number;
                else if (key === 'status') team.status = updates[key] as 'active' | 'inactive' | 'suspended' | 'archived';
                else if (key === 'branch_id') team.branch_id = updates[key] as number | null;
            }
        });

        await this.teamRepo.save(team);

        // Update training schedule if provided
        if (updates.training) {
            const t = updates.training as Record<string, unknown>;
            const existing = await this.trainingScheduleRepo.findOne({ where: { team_id: teamId } });
            if (existing) {
                if (t.days_ar !== undefined) existing.days_ar = t.days_ar as string;
                if (t.days_en !== undefined) existing.days_en = t.days_en as string;
                if (t.start_time !== undefined) existing.start_time = t.start_time as string;
                if (t.end_time !== undefined) existing.end_time = t.end_time as string;
                if (t.field_id !== undefined) existing.field_id = t.field_id as string;
                if (t.training_fee !== undefined) existing.training_fee = t.training_fee as number;
                await this.trainingScheduleRepo.save(existing);
            } else {
                // No schedule yet — create one
                const newSchedule = this.trainingScheduleRepo.create({
                    team_id: teamId,
                    days_ar: t.days_ar as string,
                    days_en: t.days_en as string,
                    start_time: t.start_time as string,
                    end_time: t.end_time as string,
                    field_id: t.field_id as string,
                    training_fee: t.training_fee as number,
                });
                await this.trainingScheduleRepo.save(newSchedule);
            }
        }

        // Return updated team with relations
        return (await this.getTeamById(teamId))!;
    }


    async updateTeamStatus(teamId: string, status: string): Promise<Team> {
        const validStatuses = ['active', 'inactive', 'suspended', 'archived'];
        if (!validStatuses.includes(status)) throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);

        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found');

        team.status = status as 'active' | 'inactive' | 'suspended' | 'archived';
        return await this.teamRepo.save(team);
    }

    async deleteTeam(teamId: string): Promise<void> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found');
        await this.teamRepo.remove(team);
    }

    async getTeamMembers(teamId: string): Promise<TeamMembersResponse> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found');

        const memberTeams = await this.memberTeamRepo.find({
            where: { team_id: parseInt(teamId) as unknown as never },
            relations: ['member']
        });
        // NOTE: TeamMemberTeam uses team_name which was based on old Team.name field
        // This will need database migration to work properly with new bilingual names
        // For now, query by team_name since that's what's in the database
        const teamMemberTeams = await this.teamMemberTeamRepo.find({
            where: { team_name: team.name_en } as unknown as never,
            relations: ['team_member']
        });

        const getMemberName = (obj: unknown): string => {
            if (!obj || typeof obj !== 'object') return '';
            const member = obj as Record<string, unknown>;
            const first = (member.first_name as string) || '';
            const last = (member.last_name as string) || '';
            return `${first} ${last}`.trim();
        };

        const regularMembers: MemberInfo[] = memberTeams.map((mt) => {
            const member = mt.member as unknown as Record<string, unknown>;
            return {
                id: mt.member_id,
                name: getMemberName(member),
                email: (member?.email as string) || '',
                status: mt.status,
                joined_at: mt.start_date || new Date(),
            };
        });

        const teamMembers: MemberInfo[] = teamMemberTeams.map((tmt) => {
            const teamMember = tmt.team_member as unknown as Record<string, unknown>;
            return {
                id: tmt.team_member_id,
                name: getMemberName(teamMember),
                email: (teamMember?.email as string) || '',
                status: tmt.status,
                joined_at: tmt.start_date || new Date(),
            };
        });

        return {
            regular_members: regularMembers,
            team_members: teamMembers,
        };
    }

    async getAvailableSlots(teamId: string): Promise<AvailableSlotsResponse> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found');

        const memberCount = await this.memberTeamRepo.count({
            where: { team_id: parseInt(teamId) as unknown as never, status: 'active' as unknown as never }
        });
        // NOTE: TeamMemberTeam uses team_name which was based on old Team.name field
        // This will need database migration to work properly with new bilingual names
        const teamMemberCount = await this.teamMemberTeamRepo.count({
            where: { team_name: team.name_en, status: 'active' } as unknown as never
        });

        const totalMembers = memberCount + teamMemberCount;
        const availableSlots = Math.max(0, team.max_participants - totalMembers);

        return {
            team_id: team.id,
            team_name_en: team.name_en,
            team_name_ar: team.name_ar,
            max_participants: team.max_participants,
            current_members: totalMembers,
            available_slots: availableSlots,
            is_available: availableSlots > 0,
        };
    }

    async getTeamsBySport(sportId: number): Promise<Team[]> {
        return await this.teamRepo.find({
            where: { sport_id: sportId, status: 'active' },
            relations: ['training_schedules'],
        });
    }

    /**
     * Get all teams for a specific sport with their members
     * Optionally filter to a specific team
     */
    async getTeamsBySportWithMembers(sportId: number, teamId?: string): Promise<Array<{
        team_id: string;
        team_name_en: string;
        team_name_ar: string;
        max_participants: number;
        current_members: number;
        available_slots: number;
        status: string;
        members: Array<{
            id: number;
            name_en: string;
            name_ar: string;
            email: string;
            phone: string;
            national_id: string;
            type: 'regular_member' | 'team_member';
            status: string;
            joined_at: Date;
        }>;
    }>> {
        // Build query for teams
        const whereCondition: {
            sport_id: number;
            status: 'active' | 'inactive' | 'suspended' | 'archived';
            id?: string;
        } = {
            sport_id: sportId,
            status: 'active'
        };
        
        if (teamId) {
            whereCondition.id = teamId;
        }

        const teams = await this.teamRepo.find({
            where: whereCondition,
            relations: ['training_schedules'],
            order: { name_en: 'ASC' }
        });

        // For each team, get members
        const result = await Promise.all(teams.map(async (team) => {
            // Get regular members
            const memberTeams = await this.memberTeamRepo.find({
                where: { team_id: parseInt(team.id) as unknown as never },
                relations: ['member']
            });

            // Get team members
            const teamMemberTeams = await this.teamMemberTeamRepo.find({
                where: { team_name: team.name_en } as unknown as never,
                relations: ['team_member']
            });

            // Process regular members
            const regularMembers = memberTeams.map((mt) => {
                const member = mt.member as unknown as Record<string, unknown>;
                return {
                    id: mt.member_id,
                    name_en: `${(member.first_name_en as string) || ''} ${(member.last_name_en as string) || ''}`.trim(),
                    name_ar: `${(member.first_name_ar as string) || ''} ${(member.last_name_ar as string) || ''}`.trim(),
                    email: (member.email as string) || '',
                    phone: (member.phone as string) || '',
                    national_id: (member.national_id as string) || '',
                    type: 'regular_member' as const,
                    status: mt.status,
                    joined_at: mt.start_date || new Date(),
                };
            });

            // Process team members
            const teamMembers = teamMemberTeams.map((tmt) => {
                const teamMember = tmt.team_member as unknown as Record<string, unknown>;
                return {
                    id: tmt.team_member_id,
                    name_en: `${(teamMember.first_name_en as string) || ''} ${(teamMember.last_name_en as string) || ''}`.trim(),
                    name_ar: `${(teamMember.first_name_ar as string) || ''} ${(teamMember.last_name_ar as string) || ''}`.trim(),
                    email: (teamMember.email as string) || '',
                    phone: (teamMember.phone as string) || '',
                    national_id: (teamMember.national_id as string) || '',
                    type: 'team_member' as const,
                    status: tmt.status,
                    joined_at: tmt.start_date || new Date(),
                };
            });

            const allMembers = [...regularMembers, ...teamMembers];
            const currentMembers = allMembers.filter(m => m.status === 'active').length;
            const availableSlots = Math.max(0, team.max_participants - currentMembers);

            return {
                team_id: team.id,
                team_name_en: team.name_en,
                team_name_ar: team.name_ar,
                max_participants: team.max_participants,
                current_members: currentMembers,
                available_slots: availableSlots,
                status: team.status,
                members: allMembers.sort((a, b) => b.joined_at.getTime() - a.joined_at.getTime())
            };
        }));

        return result;
    }
}
