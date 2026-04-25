import { AppDataSource } from '../database/data-source';
import { TeamMember } from '../entities/TeamMember';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Team } from '../entities/Team';
import { Sport } from '../entities/Sport';
import { AuditLogService } from './AuditLogService';
import { Staff } from '../entities/Staff';

export interface SubscribeTeamMemberToTeamRequest {
    team_member_id: number;
    team_id: string; // UUID
    start_date?: Date;
    price?: number;
}

export interface GetTeamMemberSubscriptionsResponse {
    team_member_id: number;
    team_member_name_en: string;
    team_member_name_ar: string;
    subscriptions: Array<{
        subscription_id: number;
        team_id: string;
        team_name_en: string;
        team_name_ar: string;
        sport_name_en: string;
        sport_name_ar: string;
        start_date: Date;
        end_date: Date | null;
        status: string;
        subscription_status: string;
        payment_id: number | null;
        payment_reference: string | null;
        payment_completed_at: Date | null;
        price: number;
    }>;
}

export interface GetTeamMembersResponse {
    team_id: string;
    team_name_en: string;
    team_name_ar: string;
    sport_name_en: string;
    sport_name_ar: string;
    total_members: number;
    max_capacity: number;
    available_slots: number;
    members: Array<{
        subscription_id: number;
        team_member_id: number;
        team_member_name_en: string;
        team_member_name_ar: string;
        start_date: Date;
        end_date: Date | null;
        status: string;
        price: number;
    }>;
}

export class TeamMemberSubscriptionService {
    private teamMemberRepository = AppDataSource.getRepository(TeamMember);
    private teamMemberTeamRepository = AppDataSource.getRepository(TeamMemberTeam);
    private teamRepository = AppDataSource.getRepository(Team);
    private sportRepository = AppDataSource.getRepository(Sport);
    private auditLogService = new AuditLogService();

    /**
     * Subscribe a team member to a team
     */
    async subscribeTeamMemberToTeam(
        teamMemberId: number,
        teamId: string,
        request: Partial<SubscribeTeamMemberToTeamRequest>,
        staffId: number
    ): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> {
        // Validate team member exists
        const teamMember = await this.teamMemberRepository.findOne({
            where: { id: teamMemberId },
            relations: ['account'],
        });

        if (!teamMember) {
            throw new Error(`Team member with ID ${teamMemberId} not found`);
        }

        // Validate team exists
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['sport'],
        });

        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        // Check team capacity
        const currentMemberCount = await AppDataSource.query(`
            SELECT COUNT(*) FROM team_member_teams 
            WHERE team_id = $1 AND status != 'cancelled'
        `, [teamId]);

        if (parseInt(currentMemberCount[0].count, 10) >= team.max_participants) {
            throw new Error(`Team is at maximum capacity (${team.max_participants} members)`);
        }

        // Check if team member is already subscribed
        const existingSubscription = await AppDataSource.query(`
            SELECT * FROM team_member_teams 
            WHERE team_member_id = $1 AND team_id = $2 AND status != 'cancelled'
        `, [teamMemberId, teamId]);

        if (existingSubscription && existingSubscription.length > 0) {
            throw new Error(`Team member is already subscribed to this team`);
        }

        const startDate = request.start_date || new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        // Create subscription
        const newSubscription = this.teamMemberTeamRepository.create({
            team_member_id: teamMemberId,
            team_id: teamId,
            start_date: startDate,
            end_date: endDate,
            status: 'pending',
            subscription_status: 'pending_admin_approval',
            price: request.price || 0,
        } as unknown as Partial<TeamMemberTeam>);

        const savedSubscription = await this.teamMemberTeamRepository.save(newSubscription);

        // Audit Log
        const staff = await AppDataSource.getRepository(Staff).findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });

        const staffName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        const staffRole = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';

        await this.auditLogService.createLog({
            userName: staffName,
            role: staffRole,
            action: 'Subscribe',
            module: 'Team Members',
            description: `Team member ${teamMember.first_name_en} ${teamMember.last_name_en} subscribed to team ${team.name_en}`,
            status: 'نجح',
            newValue: savedSubscription as unknown as Record<string, unknown>,
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Team member successfully subscribed to ${team.name_en}`,
            data: savedSubscription as unknown as Record<string, unknown>,
        };
    }

    /**
     * Unsubscribe a team member from a team
     */
    async unsubscribeTeamMemberFromTeam(
        teamMemberId: number,
        subscriptionId: number,
        staffId: number
    ): Promise<{ success: boolean; message: string }> {
        // Validate subscription exists
        const subscription = await this.teamMemberTeamRepository.findOne({
            where: { id: subscriptionId, team_member_id: teamMemberId },
            relations: ['team_member', 'team'],
        });

        if (!subscription) {
            throw new Error(`Subscription not found`);
        }

        // Update subscription status
        subscription.status = 'cancelled';
        subscription.end_date = new Date();

        await this.teamMemberTeamRepository.save(subscription);

        // Audit Log
        const staff = await AppDataSource.getRepository(Staff).findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });

        const staffName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        const staffRole = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';

        const teamMember = subscription.team_member;
        const teamName = subscription.team?.name_en || 'Unknown Team';

        await this.auditLogService.createLog({
            userName: staffName,
            role: staffRole,
            action: 'Unsubscribe',
            module: 'Team Members',
            description: `Team member ${teamMember.first_name_en} ${teamMember.last_name_en} unsubscribed from team ${teamName}`,
            status: 'نجح',
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Team member successfully unsubscribed from ${teamName}`,
        };
    }

    /**
     * Approve a team member subscription (change status from pending to approved)
     */
    async approveTeamMemberSubscription(
        subscriptionId: number,
        staffId: number
    ): Promise<{ success: boolean; message: string; data: Record<string, unknown> }> {
        const subscription = await this.teamMemberTeamRepository.findOne({
            where: { id: subscriptionId },
            relations: ['team_member', 'team'],
        });

        if (!subscription) {
            throw new Error(`Subscription not found`);
        }

        if (subscription.status !== 'pending') {
            throw new Error(`Only pending subscriptions can be approved`);
        }

        if (subscription.subscription_status === 'pending_payment') {
            throw new Error('Cannot approve subscription before payment is completed');
        }

        subscription.status = 'approved';
        subscription.subscription_status = 'active';
        subscription.admin_approved_at = new Date();
        subscription.approved_by_staff_id = staffId;
        const updatedSubscription = await this.teamMemberTeamRepository.save(subscription);

        // Audit Log
        const staff = await AppDataSource.getRepository(Staff).findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });

        const staffName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        const staffRole = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';

        const teamMember = subscription.team_member;
        const teamName = subscription.team?.name_en || 'Unknown Team';

        await this.auditLogService.createLog({
            userName: staffName,
            role: staffRole,
            action: 'Approve',
            module: 'Team Members',
            description: `Approved subscription of ${teamMember.first_name_en} ${teamMember.last_name_en} to team ${teamName}`,
            status: 'نجح',
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Subscription approved successfully`,
            data: updatedSubscription as unknown as Record<string, unknown>,
        };
    }

    /**
     * Reject a team member subscription
     */
    async rejectTeamMemberSubscription(
        subscriptionId: number,
        staffId: number
    ): Promise<{ success: boolean; message: string }> {
        const subscription = await this.teamMemberTeamRepository.findOne({
            where: { id: subscriptionId },
            relations: ['team_member', 'team'],
        });

        if (!subscription) {
            throw new Error(`Subscription not found`);
        }

        if (subscription.status !== 'pending') {
            throw new Error(`Only pending subscriptions can be rejected`);
        }

        subscription.status = 'declined';
        subscription.subscription_status = 'cancelled';
        await this.teamMemberTeamRepository.save(subscription);

        // Audit Log
        const staff = await AppDataSource.getRepository(Staff).findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });

        const staffName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        const staffRole = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';

        const teamMember = subscription.team_member;
        const teamName = subscription.team?.name_en || 'Unknown Team';

        await this.auditLogService.createLog({
            userName: staffName,
            role: staffRole,
            action: 'Reject',
            module: 'Team Members',
            description: `Rejected subscription of ${teamMember.first_name_en} ${teamMember.last_name_en} to team ${teamName}`,
            status: 'نجح',
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Subscription rejected successfully`,
        };
    }

    /**
     * Get all subscriptions for a specific team member
     */
    async getTeamMemberSubscriptions(teamMemberId: number): Promise<GetTeamMemberSubscriptionsResponse> {
        const teamMember = await this.teamMemberRepository.findOne({
            where: { id: teamMemberId },
        });

        if (!teamMember) {
            throw new Error(`Team member with ID ${teamMemberId} not found`);
        }

        const subscriptions = await AppDataSource.query(`
            SELECT 
                tmt.id,
                tmt.team_id,
                t.name_en as team_name_en,
                t.name_ar as team_name_ar,
                s.name_en as sport_name_en,
                s.name_ar as sport_name_ar,
                tmt.start_date,
                tmt.end_date,
                tmt.status,
                tmt.subscription_status,
                tmt.payment_id,
                tmt.payment_reference,
                tmt.payment_completed_at,
                tmt.price
            FROM team_member_teams tmt
            LEFT JOIN teams t ON tmt.team_id = t.id
            LEFT JOIN sports s ON t.sport_id = s.id
            WHERE tmt.team_member_id = $1 AND tmt.status NOT IN ('declined', 'rejected')
            ORDER BY tmt.start_date DESC
        `, [teamMemberId]);

        return {
            team_member_id: teamMember.id,
            team_member_name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
            team_member_name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
            subscriptions: subscriptions.map((sub: Record<string, unknown>) => ({
                subscription_id: sub.id,
                team_id: sub.team_id,
                team_name_en: sub.team_name_en,
                team_name_ar: sub.team_name_ar,
                sport_name_en: sub.sport_name_en,
                sport_name_ar: sub.sport_name_ar,
                start_date: sub.start_date,
                end_date: sub.end_date,
                status: sub.status,
                subscription_status: sub.subscription_status,
                payment_id: sub.payment_id,
                payment_reference: sub.payment_reference,
                payment_completed_at: sub.payment_completed_at,
                price: sub.price,
            })),
        };
    }

    /**
     * Get all team members subscribed to a specific team
     */
    async getTeamMembers(teamId: string): Promise<GetTeamMembersResponse> {
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['sport'],
        });

        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        const members = await AppDataSource.query(`
            SELECT 
                tmt.id,
                tmt.team_member_id,
                tm.first_name_en,
                tm.last_name_en,
                tm.first_name_ar,
                tm.last_name_ar,
                tmt.start_date,
                tmt.end_date,
                tmt.status,
                tmt.price
            FROM team_member_teams tmt
            JOIN team_members tm ON tmt.team_member_id = tm.id
            WHERE tmt.team_id = $1 AND tmt.status != 'rejected'
            ORDER BY tmt.start_date DESC
        `, [teamId]);

        const activeCount = members.filter((m: Record<string, unknown>) =>
            m.status === 'approved' || m.status === 'active'
        ).length;

        return {
            team_id: team.id,
            team_name_en: team.name_en,
            team_name_ar: team.name_ar,
            sport_name_en: team.sport.name_en,
            sport_name_ar: team.sport.name_ar,
            total_members: members.length,
            max_capacity: team.max_participants,
            available_slots: team.max_participants - activeCount,
            members: members.map((mem: Record<string, unknown>) => ({
                subscription_id: mem.id,
                team_member_id: mem.team_member_id,
                team_member_name_en: `${mem.first_name_en} ${mem.last_name_en}`,
                team_member_name_ar: `${mem.first_name_ar} ${mem.last_name_ar}`,
                start_date: mem.start_date,
                end_date: mem.end_date,
                status: mem.status,
                price: mem.price,
            })),
        };
    }

    /**
     * Check if team member is subscribed to a team
     */
    async isTeamMemberSubscribed(teamMemberId: number, teamId: string): Promise<boolean> {
        const result = await AppDataSource.query(`
            SELECT COUNT(*) FROM team_member_teams 
            WHERE team_member_id = $1 AND team_id = $2 AND status IN ('approved', 'active')
        `, [teamMemberId, teamId]);

        return parseInt(result[0].count, 10) > 0;
    }

    /**
     * Get pending subscriptions for a team
     */
    async getPendingSubscriptions(teamId: string): Promise<Array<Record<string, unknown>>> {
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
        });

        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        return AppDataSource.query(`
            SELECT 
                tmt.id,
                tmt.team_member_id,
                tm.first_name_en,
                tm.last_name_en,
                tm.first_name_ar,
                tm.last_name_ar,
                tm.national_id,
                tmt.start_date,
                tmt.price
            FROM team_member_teams tmt
            JOIN team_members tm ON tmt.team_member_id = tm.id
            WHERE tmt.team_id = $1
              AND tmt.status = 'pending'
              AND COALESCE(tmt.subscription_status, 'pending_admin_approval') = 'pending_admin_approval'
            ORDER BY tmt.created_at ASC
        `, [teamId]);
    }

    /**
     * Get team member subscription count
     */
    async getTeamMemberSubscriptionCount(teamMemberId: number): Promise<number> {
        const result = await AppDataSource.query(`
            SELECT COUNT(*) FROM team_member_teams 
            WHERE team_member_id = $1 AND status IN ('approved', 'active')
        `, [teamMemberId]);

        return parseInt(result[0].count, 10);
    }
}
