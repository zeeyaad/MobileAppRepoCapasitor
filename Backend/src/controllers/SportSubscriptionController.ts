import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { TeamMember } from '../entities/TeamMember';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';
import { Staff } from '../entities/Staff';

const auditLogService = new AuditLogService();

/**
 * SportSubscriptionController - Handles admin approval/rejection of sport subscriptions
 * Requires: APPROVE_SPORT_SUBSCRIPTION privilege
 */
export class SportSubscriptionController {
  private static teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);
  private static teamMemberRepo = AppDataSource.getRepository(TeamMember);
  private static staffRepo = AppDataSource.getRepository(Staff);

  private static async logAction(
    req: AuthenticatedRequest,
    action: string,
    description: string,
    oldValue?: Record<string, unknown> | null,
    newValue?: Record<string, unknown> | null
  ) {
    try {
      if (!req.user || !req.user.staff_id) return;

      const staff = await SportSubscriptionController.staffRepo.findOne({
        where: { id: req.user.staff_id },
        relations: ['staff_type'],
      });

      const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : req.user.email;
      const role = staff?.staff_type?.name_en || req.user.role;

      await auditLogService.createLog({
        userName,
        role,
        action,
        module: 'Sports Subscriptions',
        description,
        status: 'نجح',
        oldValue,
        newValue,
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0',
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * GET /api/sports/subscriptions/pending
   * Privilege: VIEW_SPORT_REQUESTS
   * Get all pending sport subscription requests
   */
  static async getPendingSubscriptions(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20, team_member_id, status = 'pending' } = req.query;
      const skip = ((Number(page) - 1) * Number(limit)) || 0;

      const query = SportSubscriptionController.teamMemberTeamRepo.createQueryBuilder('tmt')
        .leftJoinAndSelect('tmt.team_member', 'tm')
        .leftJoinAndSelect('tmt.team', 'team')
        .leftJoinAndSelect('team.sport', 'sport')
        .where('tmt.status = :status', { status });

      // Optional: Also filter by subscription_status if you only want admin approval pending
      // Uncomment the line below if you want to filter by subscription_status
      // .andWhere("COALESCE(tmt.subscription_status, 'pending_admin_approval') = :subscriptionStatus", {
      //   subscriptionStatus: 'pending_admin_approval',
      // });

      if (team_member_id) {
        query.andWhere('tmt.team_member_id = :team_member_id', { team_member_id: Number(team_member_id) });
      }

      const [subscriptions, total] = await query
        .skip(skip)
        .take(Number(limit))
        .orderBy('tmt.created_at', 'DESC')
        .getManyAndCount();

      return res.json({
        success: true,
        data: subscriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: unknown) {
      console.error('Error fetching pending subscriptions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending subscriptions',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/sports/subscriptions/:subscriptionId
   * Privilege: VIEW_SPORT_REQUESTS
   * Get specific subscription request details
   */
  static async getSubscriptionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;

      const subscription = await SportSubscriptionController.teamMemberTeamRepo.findOne({
        where: { id: Number(subscriptionId) },
        relations: ['team_member', 'team', 'team.sport'],
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription request not found',
        });
      }

      return res.json({
        success: true,
        data: subscription,
      });
    } catch (error: unknown) {
      console.error('Error fetching subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PATCH /api/sports/subscriptions/:subscriptionId/approve
   * Privilege: APPROVE_SPORT_SUBSCRIPTION
   * Approve a sport subscription request
   */
  static async approveSportSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { notes } = req.body;

      const subscription = await SportSubscriptionController.teamMemberTeamRepo.findOne({
        where: { id: Number(subscriptionId) },
        relations: ['team_member', 'team', 'team.sport'],
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription request not found',
        });
      }

      if (subscription.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot approve subscription with status: ${subscription.status}`,
        });
      }

      if (subscription.subscription_status === 'pending_payment') {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve subscription before payment is completed',
        });
      }

      const oldValue = { ...subscription } as unknown as Record<string, unknown>;

      subscription.status = 'approved';
      subscription.subscription_status = 'active';
      subscription.admin_approved_at = new Date();
      subscription.approved_by_staff_id = req.user?.staff_id || null;

      const now = new Date();
      if (!subscription.start_date) {
        subscription.start_date = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (!subscription.end_date) {
        subscription.end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      await SportSubscriptionController.teamMemberTeamRepo.save(subscription);

      const newValue = { ...subscription } as unknown as Record<string, unknown>;

      await SportSubscriptionController.logAction(
        req,
        'Approve',
        `Approved sport subscription for ${subscription.team_member?.first_name_en} ${subscription.team_member?.last_name_en} to team ${subscription.team?.name_en || subscription.team_id}${notes ? ': ' + notes : ''}`,
        oldValue,
        newValue
      );

      return res.json({
        success: true,
        message: 'Sport subscription approved successfully',
        data: subscription,
      });
    } catch (error: unknown) {
      console.error('Error approving subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve subscription',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PATCH /api/sports/subscriptions/:subscriptionId/decline
   * Privilege: APPROVE_SPORT_SUBSCRIPTION
   * Decline a sport subscription request with optional reason
   */
  static async declineSportSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { reason } = req.body;

      const subscription = await SportSubscriptionController.teamMemberTeamRepo.findOne({
        where: { id: Number(subscriptionId) },
        relations: ['team_member', 'team', 'team.sport'],
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription request not found',
        });
      }

      if (subscription.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot decline subscription with status: ${subscription.status}`,
        });
      }

      const oldValue = { ...subscription } as unknown as Record<string, unknown>;

      subscription.status = 'declined';
      subscription.subscription_status = 'cancelled';
      await SportSubscriptionController.teamMemberTeamRepo.save(subscription);

      const newValue = { ...subscription } as unknown as Record<string, unknown>;

      await SportSubscriptionController.logAction(
        req,
        'Decline',
        `Declined sport subscription for ${subscription.team_member?.first_name_en} ${subscription.team_member?.last_name_en} to team ${subscription.team?.name_en || subscription.team_id}. Reason: ${reason}`,
        oldValue,
        newValue
      );

      return res.json({
        success: true,
        message: 'Sport subscription declined successfully',
        data: subscription,
      });
    } catch (error: unknown) {
      console.error('Error declining subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to decline subscription',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * PATCH /api/sports/subscriptions/:subscriptionId/cancel
   * Privilege: APPROVE_SPORT_SUBSCRIPTION
   * Cancel an already approved subscription
   */
  static async cancelSportSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { reason } = req.body;

      const subscription = await SportSubscriptionController.teamMemberTeamRepo.findOne({
        where: { id: Number(subscriptionId) },
        relations: ['team_member'],
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found',
        });
      }

      if (subscription.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel subscription with status: ${subscription.status}`,
        });
      }

      const oldValue = { ...subscription } as unknown as Record<string, unknown>;

      subscription.status = 'cancelled';
      subscription.subscription_status = 'cancelled';
      await SportSubscriptionController.teamMemberTeamRepo.save(subscription);

      const newValue = { ...subscription } as unknown as Record<string, unknown>;

      await SportSubscriptionController.logAction(
        req,
        'Cancel',
        `Cancelled sport subscription for ${subscription.team_member?.first_name_en} ${subscription.team_member?.last_name_en} to team ${subscription.team?.name_en || subscription.team_id}${reason ? '. Reason: ' + reason : ''}`,
        oldValue,
        newValue
      );

      return res.json({
        success: true,
        message: 'Sport subscription cancelled successfully',
        data: subscription,
      });
    } catch (error: unknown) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/sports/subscriptions/stats/summary
   * Privilege: VIEW_SPORT_REQUESTS
   * Get summary statistics for sport subscriptions
   */
  static async getSubscriptionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = {
        pending: await SportSubscriptionController.teamMemberTeamRepo
          .createQueryBuilder('tmt')
          .where('tmt.status = :status', { status: 'pending' })
          .andWhere("COALESCE(tmt.subscription_status, 'pending_admin_approval') = :subscriptionStatus", {
            subscriptionStatus: 'pending_admin_approval',
          })
          .getCount(),
        approved: await SportSubscriptionController.teamMemberTeamRepo.count({
          where: { status: 'approved' },
        }),
        declined: await SportSubscriptionController.teamMemberTeamRepo.count({
          where: { status: 'declined' },
        }),
        cancelled: await SportSubscriptionController.teamMemberTeamRepo.count({
          where: { status: 'cancelled' },
        }),
      };

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: unknown) {
      console.error('Error fetching subscription stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
