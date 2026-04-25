import { AppDataSource } from '../database/data-source';
import { MemberTeamSubscription } from '../entities/MemberTeamSubscription';
import { TeamMemberTeamSubscription } from '../entities/TeamMemberTeamSubscription';
import { TeamService } from './TeamService';
import { Repository } from 'typeorm';

/**
 * SubscriptionService
 * 
 * Handles business logic for member and team member subscriptions to teams
 * Manages the complete lifecycle: create, approve, decline, cancel
 */
export class SubscriptionService {
  private memberSubRepo: Repository<MemberTeamSubscription>;
  private teamMemberSubRepo: Repository<TeamMemberTeamSubscription>;
  private teamService: TeamService;

  constructor() {
    this.memberSubRepo = AppDataSource.getRepository(MemberTeamSubscription);
    this.teamMemberSubRepo = AppDataSource.getRepository(TeamMemberTeamSubscription);
    this.teamService = new TeamService();
  }

  // ==================== MEMBER SUBSCRIPTIONS ====================

  /**
   * Create a member subscription to a team
   */
  async createMemberSubscription(data: {
    member_id: number;
    team_id: number;
    announcement_id?: number | null;
    monthly_fee: number;
    registration_fee?: number | null;
    start_date?: Date | null;
    end_date?: Date | null;
  }): Promise<MemberTeamSubscription> {
    // Check if member already has an active or pending subscription for this team
    const existingSub = await this.memberSubRepo.findOne({
      where: [
        { member_id: data.member_id, team_id: data.team_id, status: 'active' },
        { member_id: data.member_id, team_id: data.team_id, status: 'pending' },
        { member_id: data.member_id, team_id: data.team_id, status: 'approved' }
      ]
    });

    if (existingSub) {
      throw new Error('You already have an active or pending subscription for this sport. You can only re-join after your current subscription ends.');
    }

    // Set default start and end dates if not provided
    // Subscriptions last exactly 1 month
    const now = new Date();
    const startDate = data.start_date || new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = data.end_date || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const subscription = this.memberSubRepo.create({
      member_id: data.member_id,
      team_id: data.team_id,
      announcement_id: data.announcement_id || null,
      monthly_fee: data.monthly_fee,
      registration_fee: data.registration_fee || null,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      payment_status: 'unpaid',
      discount_amount: 0,
    });

    subscription.status = 'active';

    if (!subscription.end_date) {
      const startDate = subscription.start_date ? new Date(subscription.start_date) : new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      subscription.end_date = endDate;
    }

    const saved = await this.memberSubRepo.save(subscription);

    // Increment team participants
    await this.teamService.incrementParticipants(data.team_id);

    return saved;
  }

  /**
   * Get member subscription by ID
   */
  async getMemberSubscriptionById(subscriptionId: number): Promise<MemberTeamSubscription | null> {
    return await this.memberSubRepo.findOne({
      where: { id: subscriptionId },
      relations: ['member', 'team', 'approved_by', 'announcement'],
    });
  }

  /**
   * Get all subscriptions for a member
   */
  async getMemberSubscriptions(memberId: number, status?: string): Promise<MemberTeamSubscription[]> {
    let query = this.memberSubRepo.createQueryBuilder('sub')
      .where('sub.member_id = :member_id', { member_id: memberId });

    if (status) {
      query = query.andWhere('sub.status = :status', { status });
    }

    return await query
      .leftJoinAndSelect('sub.team', 'team')
      .leftJoinAndSelect('team.sport', 'sport')
      .leftJoinAndSelect('team.branch', 'branch')
      .leftJoinAndSelect('sub.approved_by', 'approved_by')
      .orderBy('sub.created_at', 'DESC')
      .getMany();
  }

  /**
   * Approve member subscription
   */
  async approveMemberSubscription(
    subscriptionId: number,
    approvedByStaffId: number,
    customPrice?: number | null,
    notes?: string | null
  ): Promise<MemberTeamSubscription | null> {
    const subscription = await this.getMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    await this.memberSubRepo.update(subscriptionId, {
      status: 'approved',
      approved_by_staff_id: approvedByStaffId,
      approved_at: new Date(),
      custom_price: customPrice || null,
      approval_notes: notes || null,
    });

    return await this.getMemberSubscriptionById(subscriptionId);
  }

  /**
   * Decline member subscription
   */
  async declineMemberSubscription(
    subscriptionId: number,
    reason: string,
    approvedByStaffId: number
  ): Promise<MemberTeamSubscription | null> {
    const subscription = await this.getMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    // Decrement team participants since this subscription was declined
    await this.teamService.decrementParticipants(subscription.team_id);

    await this.memberSubRepo.update(subscriptionId, {
      status: 'declined',
      decline_reason: reason,
      approved_by_staff_id: approvedByStaffId,
      declined_at: new Date(),
    });

    return await this.getMemberSubscriptionById(subscriptionId);
  }

  /**
   * Cancel member subscription
   */
  async cancelMemberSubscription(
    subscriptionId: number,
    reason: string,
    approvedByStaffId: number
  ): Promise<MemberTeamSubscription | null> {
    const subscription = await this.getMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    // Only decrement if subscription was approved/active
    if (['approved', 'active'].includes(subscription.status)) {
      await this.teamService.decrementParticipants(subscription.team_id);
    }

    await this.memberSubRepo.update(subscriptionId, {
      status: 'cancelled',
      cancellation_reason: reason,
      approved_by_staff_id: approvedByStaffId,
      cancelled_at: new Date(),
    });

    return await this.getMemberSubscriptionById(subscriptionId);
  }

  /**
   * Get pending member subscriptions for approval
   */
  async getPendingMemberSubscriptions(): Promise<MemberTeamSubscription[]> {
    return await this.memberSubRepo.createQueryBuilder('sub')
      .where('sub.status = :status', { status: 'pending' })
      .leftJoinAndSelect('sub.member', 'member')
      .leftJoinAndSelect('sub.team', 'team')
      .leftJoinAndSelect('team.sport', 'sport')
      .leftJoinAndSelect('team.branch', 'branch')
      .orderBy('sub.created_at', 'ASC')
      .getMany();
  }

  // ==================== TEAM MEMBER SUBSCRIPTIONS ====================

  /**
   * Create a team member subscription to a team
   */
  async createTeamMemberSubscription(data: {
    team_member_id: number;
    team_id: number;
    announcement_id?: number | null;
    monthly_fee: number;
    registration_fee?: number | null;
    start_date?: Date | null;
    end_date?: Date | null;
  }): Promise<TeamMemberTeamSubscription> {
    // Check if team member already has an active or pending subscription for this team
    const existingSub = await this.teamMemberSubRepo.findOne({
      where: [
        { team_member_id: data.team_member_id, team_id: data.team_id, status: 'active' },
        { team_member_id: data.team_member_id, team_id: data.team_id, status: 'pending' },
        { team_member_id: data.team_member_id, team_id: data.team_id, status: 'approved' }
      ]
    });

    if (existingSub) {
      throw new Error('You already have an active or pending subscription for this sport. You can only re-join after your current subscription ends.');
    }

    // Set default start and end dates if not provided
    // Subscriptions last exactly 1 month
    const now = new Date();
    const startDate = data.start_date || new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = data.end_date || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const subscription = this.teamMemberSubRepo.create({
      team_member_id: data.team_member_id,
      team_id: data.team_id,
      announcement_id: data.announcement_id || null,
      monthly_fee: data.monthly_fee,
      registration_fee: data.registration_fee || null,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      payment_status: 'unpaid',
      discount_amount: 0,
      is_captain: false,
    });

    const saved = await this.teamMemberSubRepo.save(subscription);

    // Increment team participants
    await this.teamService.incrementParticipants(data.team_id);

    return saved;
  }

  /**
   * Get team member subscription by ID
   */
  async getTeamMemberSubscriptionById(subscriptionId: number): Promise<TeamMemberTeamSubscription | null> {
    return await this.teamMemberSubRepo.findOne({
      where: { id: subscriptionId },
      relations: ['team_member', 'team', 'approved_by', 'announcement'],
    });
  }

  /**
   * Get all subscriptions for a team member
   */
  async getTeamMemberSubscriptions(
    teamMemberId: number,
    status?: string
  ): Promise<TeamMemberTeamSubscription[]> {
    let query = this.teamMemberSubRepo.createQueryBuilder('sub')
      .where('sub.team_member_id = :team_member_id', { team_member_id: teamMemberId });

    if (status) {
      query = query.andWhere('sub.status = :status', { status });
    }

    return await query
      .leftJoinAndSelect('sub.team', 'team')
      .leftJoinAndSelect('team.sport', 'sport')
      .leftJoinAndSelect('team.branch', 'branch')
      .leftJoinAndSelect('sub.approved_by', 'approved_by')
      .orderBy('sub.created_at', 'DESC')
      .getMany();
  }

  /**
   * Approve team member subscription
   */
  async approveTeamMemberSubscription(
    subscriptionId: number,
    approvedByStaffId: number,
    customPrice?: number | null,
    isCaptain?: boolean,
    notes?: string | null
  ): Promise<TeamMemberTeamSubscription | null> {
    const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    await this.teamMemberSubRepo.update(subscriptionId, {
      status: 'approved',
      approved_by_staff_id: approvedByStaffId,
      approved_at: new Date(),
      custom_price: customPrice || null,
      is_captain: isCaptain || false,
      approval_notes: notes || null,
    });

    return await this.getTeamMemberSubscriptionById(subscriptionId);
  }

  /**
   * Decline team member subscription
   */
  async declineTeamMemberSubscription(
    subscriptionId: number,
    reason: string,
    approvedByStaffId: number
  ): Promise<TeamMemberTeamSubscription | null> {
    const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    // Decrement team participants
    await this.teamService.decrementParticipants(subscription.team_id);

    await this.teamMemberSubRepo.update(subscriptionId, {
      status: 'declined',
      decline_reason: reason,
      approved_by_staff_id: approvedByStaffId,
      declined_at: new Date(),
    });

    return await this.getTeamMemberSubscriptionById(subscriptionId);
  }

  /**
   * Cancel team member subscription
   */
  async cancelTeamMemberSubscription(
    subscriptionId: number,
    reason: string,
    approvedByStaffId: number
  ): Promise<TeamMemberTeamSubscription | null> {
    const subscription = await this.getTeamMemberSubscriptionById(subscriptionId);
    if (!subscription) return null;

    // Only decrement if subscription was approved/active
    if (['approved', 'active'].includes(subscription.status)) {
      await this.teamService.decrementParticipants(subscription.team_id);
    }

    await this.teamMemberSubRepo.update(subscriptionId, {
      status: 'cancelled',
      cancellation_reason: reason,
      approved_by_staff_id: approvedByStaffId,
      cancelled_at: new Date(),
    });

    return await this.getTeamMemberSubscriptionById(subscriptionId);
  }

  /**
   * Get pending team member subscriptions for approval
   */
  async getPendingTeamMemberSubscriptions(): Promise<TeamMemberTeamSubscription[]> {
    return await this.teamMemberSubRepo.createQueryBuilder('sub')
      .where('sub.status = :status', { status: 'pending' })
      .leftJoinAndSelect('sub.team_member', 'team_member')
      .leftJoinAndSelect('sub.team', 'team')
      .leftJoinAndSelect('team.sport', 'sport')
      .leftJoinAndSelect('team.branch', 'branch')
      .orderBy('sub.created_at', 'ASC')
      .getMany();
  }

  /**
   * Set team member as captain
   */
  async setTeamMemberAsCaptain(subscriptionId: number): Promise<TeamMemberTeamSubscription | null> {
    await this.teamMemberSubRepo.update(subscriptionId, { is_captain: true });
    return await this.getTeamMemberSubscriptionById(subscriptionId);
  }

  /**
   * Unset team member as captain
   */
  async unsetTeamMemberAsCaptain(subscriptionId: number): Promise<TeamMemberTeamSubscription | null> {
    await this.teamMemberSubRepo.update(subscriptionId, { is_captain: false });
    return await this.getTeamMemberSubscriptionById(subscriptionId);
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<{
    members: { pending: number; approved: number; active: number; declined: number; cancelled: number };
    teamMembers: { pending: number; approved: number; active: number; declined: number; cancelled: number };
  }> {
    const memberStats = await this.memberSubRepo
      .createQueryBuilder('sub')
      .select('sub.status', 'status')
      .addSelect('COUNT(sub.id)', 'count')
      .groupBy('sub.status')
      .getRawMany();

    const teamMemberStats = await this.teamMemberSubRepo
      .createQueryBuilder('sub')
      .select('sub.status', 'status')
      .addSelect('COUNT(sub.id)', 'count')
      .groupBy('sub.status')
      .getRawMany();

    // Convert to object format
    const memberCounts = {
      pending: 0,
      approved: 0,
      active: 0,
      declined: 0,
      cancelled: 0,
    };

    const teamMemberCounts = {
      pending: 0,
      approved: 0,
      active: 0,
      declined: 0,
      cancelled: 0,
    };

    memberStats.forEach((stat: Record<string, string | number>) => {
      if (stat.status in memberCounts) {
        memberCounts[stat.status as keyof typeof memberCounts] = parseInt(String(stat.count)) || 0;
      }
    });

    teamMemberStats.forEach((stat: Record<string, string | number>) => {
      if (stat.status in teamMemberCounts) {
        teamMemberCounts[stat.status as keyof typeof teamMemberCounts] = parseInt(String(stat.count)) || 0;
      }
    });

    return {
      members: memberCounts,
      teamMembers: teamMemberCounts,
    };
  }
}
