import { AppDataSource } from '../database/data-source';
import { Member } from '../entities/Member';
import { Sport } from '../entities/Sport';
import { AuditLogService } from './AuditLogService';
import { Staff } from '../entities/Staff';

export interface SubscribeMemberToSportRequest {
    member_id: number;
    sport_id: number;
}

export interface GetMemberSubscriptionsResponse {
    member_id: number;
    member_name_en: string;
    member_name_ar: string;
    subscriptions: Array<{
        sport_id: number;
        sport_name_en: string;
        sport_name_ar: string;
        subscription_date: Date;
        status: 'active' | 'inactive' | 'cancelled';
    }>;
}

export interface GetSportMembersResponse {
    sport_id: number;
    sport_name_en: string;
    sport_name_ar: string;
    total_members: number;
    members: Array<{
        member_id: number;
        member_name_en: string;
        member_name_ar: string;
        member_type: string;
        subscription_date: Date;
        status: 'active' | 'inactive' | 'cancelled';
    }>;
}

export class MemberSubscriptionService {
    private memberRepository = AppDataSource.getRepository(Member);
    private sportRepository = AppDataSource.getRepository(Sport);
    private auditLogService = new AuditLogService();

    /**
     * Subscribe a member to a sport
     * Creates a many-to-many relationship between member and sport
     */
    async subscribeMemberToSport(
        memberId: number,
        sportId: number,
        staffId: number
    ): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> {
        // Validate member exists
        const member = await this.memberRepository.findOne({
            where: { id: memberId },
            relations: ['member_type', 'account'],
        });

        if (!member) {
            throw new Error(`Member with ID ${memberId} not found`);
        }

        // Validate sport exists
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });

        if (!sport) {
            throw new Error(`Sport with ID ${sportId} not found`);
        }

        // Check if member is already subscribed
        const existingSubscription = await AppDataSource.query(`
            SELECT * FROM member_sport_subscriptions 
            WHERE member_id = $1 AND sport_id = $2
        `, [memberId, sportId]);

        if (existingSubscription && existingSubscription.length > 0) {
            throw new Error(`Member is already subscribed to this sport`);
        }

        // Create subscription record
        const result = await AppDataSource.query(`
            INSERT INTO member_sport_subscriptions (member_id, sport_id, status, subscription_date, created_at, updated_at)
            VALUES ($1, $2, 'active', NOW(), NOW(), NOW())
            RETURNING *
        `, [memberId, sportId]);

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
            module: 'Member Sports',
            description: `Member ${member.first_name_en} ${member.last_name_en} subscribed to ${sport.name_en}`,
            status: 'نجح',
            newValue: result[0],
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Member successfully subscribed to ${sport.name_en}`,
            data: result[0],
        };
    }

    /**
     * Unsubscribe a member from a sport
     */
    async unsubscribeMemberFromSport(
        memberId: number,
        sportId: number,
        staffId: number
    ): Promise<{ success: boolean; message: string }> {
        // Validate member exists
        const member = await this.memberRepository.findOne({
            where: { id: memberId },
        });

        if (!member) {
            throw new Error(`Member with ID ${memberId} not found`);
        }

        // Validate sport exists
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });

        if (!sport) {
            throw new Error(`Sport with ID ${sportId} not found`);
        }

        // Check if subscription exists
        const subscription = await AppDataSource.query(`
            SELECT * FROM member_sport_subscriptions 
            WHERE member_id = $1 AND sport_id = $2
        `, [memberId, sportId]);

        if (!subscription || subscription.length === 0) {
            throw new Error(`Member is not subscribed to this sport`);
        }

        // Delete subscription or mark as cancelled
        await AppDataSource.query(`
            UPDATE member_sport_subscriptions 
            SET status = 'cancelled', updated_at = NOW()
            WHERE member_id = $1 AND sport_id = $2
        `, [memberId, sportId]);

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
            action: 'Unsubscribe',
            module: 'Member Sports',
            description: `Member ${member.first_name_en} ${member.last_name_en} unsubscribed from ${sport.name_en}`,
            status: 'نجح',
            dateTime: new Date(),
            ipAddress: '0.0.0.0',
        });

        return {
            success: true,
            message: `Member successfully unsubscribed from ${sport.name_en}`,
        };
    }

    /**
     * Get all subscriptions for a specific member
     */
    async getMemberSubscriptions(memberId: number): Promise<GetMemberSubscriptionsResponse> {
        const member = await this.memberRepository.findOne({
            where: { id: memberId },
        });

        if (!member) {
            throw new Error(`Member with ID ${memberId} not found`);
        }

        const subscriptions = await AppDataSource.query(`
            SELECT 
                s.id,
                s.sport_id,
                sp.name_en as sport_name_en,
                sp.name_ar as sport_name_ar,
                s.subscription_date,
                s.status
            FROM member_sport_subscriptions s
            JOIN sports sp ON s.sport_id = sp.id
            WHERE s.member_id = $1 AND s.status != 'cancelled'
            ORDER BY s.subscription_date DESC
        `, [memberId]);

        return {
            member_id: member.id,
            member_name_en: `${member.first_name_en} ${member.last_name_en}`,
            member_name_ar: `${member.first_name_ar} ${member.last_name_ar}`,
            subscriptions: subscriptions.map((sub: Record<string, unknown>) => ({
                sport_id: sub.sport_id,
                sport_name_en: sub.sport_name_en,
                sport_name_ar: sub.sport_name_ar,
                subscription_date: sub.subscription_date,
                status: sub.status,
            })),
        };
    }

    /**
     * Get all members subscribed to a specific sport
     */
    async getSportMembers(sportId: number): Promise<GetSportMembersResponse> {
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });

        if (!sport) {
            throw new Error(`Sport with ID ${sportId} not found`);
        }

        const members = await AppDataSource.query(`
            SELECT 
                m.id as member_id,
                m.first_name_en,
                m.last_name_en,
                m.first_name_ar,
                m.last_name_ar,
                mt.name_en as member_type,
                s.subscription_date,
                s.status
            FROM member_sport_subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN member_types mt ON m.member_type_id = mt.id
            WHERE s.sport_id = $1 AND s.status != 'cancelled'
            ORDER BY s.subscription_date DESC
        `, [sportId]);

        return {
            sport_id: sport.id,
            sport_name_en: sport.name_en,
            sport_name_ar: sport.name_ar,
            total_members: members.length,
            members: members.map((mem: Record<string, unknown>) => ({
                member_id: mem.member_id,
                member_name_en: `${mem.first_name_en} ${mem.last_name_en}`,
                member_name_ar: `${mem.first_name_ar} ${mem.last_name_ar}`,
                member_type: mem.member_type,
                subscription_date: mem.subscription_date,
                status: mem.status,
            })),
        };
    }

    /**
     * Check if member is subscribed to a sport
     */
    async isMemberSubscribed(memberId: number, sportId: number): Promise<boolean> {
        const result = await AppDataSource.query(`
            SELECT COUNT(*) FROM member_sport_subscriptions 
            WHERE member_id = $1 AND sport_id = $2 AND status = 'active'
        `, [memberId, sportId]);

        return result[0].count > 0;
    }

    /**
     * Get subscription count for a sport
     */
    async getSportSubscriptionCount(sportId: number): Promise<number> {
        const result = await AppDataSource.query(`
            SELECT COUNT(*) FROM member_sport_subscriptions 
            WHERE sport_id = $1 AND status = 'active'
        `, [sportId]);

        return parseInt(result[0].count, 10);
    }
}
