import { AppDataSource } from '../database/data-source';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Team } from '../entities/Team';
import { Member } from '../entities/Member';
import { TeamMember } from '../entities/TeamMember';
import { Payment } from '../entities/Payment';
import { randomUUID } from 'crypto';

interface SubscriptionRequest {
    userId: number;
    userType: 'member' | 'team_member';
    teamId: string;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

interface CreateSubscriptionResult {
    subscription: TeamMemberTeam;
    payment: Payment;
    team: Team;
    requiresApproval: boolean;
}

interface ConfirmPaymentResult {
    subscription: TeamMemberTeam;
    payment: Payment;
    requiresAdminApproval: boolean;
    message: string;
}

interface ApproveSubscriptionResult {
    subscription: TeamMemberTeam;
    message: string;
}

interface PendingApproval {
    subscriptionId: number;
    userId: number;
    userType: string;
    userName: string;
    teamId: string;
    teamName: string;
    price: number;
    paymentStatus: string;
    createdAt: Date;
}

export class TeamSubscriptionService {
    private teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);
    private teamRepo = AppDataSource.getRepository(Team);
    private memberRepo = AppDataSource.getRepository(Member);
    private teamMemberRepo = AppDataSource.getRepository(TeamMember);
    private paymentRepo = AppDataSource.getRepository(Payment);

    /**
     * Validate subscription rules before subscribing
     */
    async validateSubscription(request: SubscriptionRequest): Promise<ValidationResult> {
        const errors: string[] = [];
        const { userId, userType, teamId } = request;

        // Check team exists and is active
        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            errors.push(`Team with ID ${teamId} not found`);
            return { valid: false, errors };
        }

        if (team.status !== 'active') {
            errors.push(`Team is not accepting subscriptions (status: ${team.status})`);
        }

        // Check capacity
        const countResult = await AppDataSource.query(
            `SELECT COUNT(*) FROM team_member_teams WHERE team_id = $1 AND status NOT IN ('cancelled', 'declined')`,
            [teamId]
        );
        const currentCount = parseInt(countResult[0].count, 10);
        if (currentCount >= team.max_participants) {
            errors.push(`Team is at maximum capacity (${team.max_participants} members)`);
        }

        // Validate user exists
        if (userType === 'member') {
            const member = await this.memberRepo.findOne({ where: { id: userId } });
            if (!member) {
                errors.push(`Member with ID ${userId} not found`);
            }
        } else {
            const teamMember = await this.teamMemberRepo.findOne({ where: { id: userId } });
            if (!teamMember) {
                errors.push(`Team member with ID ${userId} not found`);
            }
        }

        // Check for existing active subscription
        if (errors.length === 0) {
            const existing = await AppDataSource.query(
                `SELECT id FROM team_member_teams WHERE team_member_id = $1 AND team_id = $2 AND status NOT IN ('cancelled', 'declined')`,
                [userId, teamId]
            );
            if (existing && existing.length > 0) {
                errors.push('User is already subscribed to this team');
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Create subscription with a pending payment record
     */
    async createSubscription(request: SubscriptionRequest): Promise<CreateSubscriptionResult> {
        const { userId, userType, teamId } = request;

        // Validate first
        const validation = await this.validateSubscription(request);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
        }

        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        const price = team.subscription_price ?? 0;
        const requiresApproval = team.approval_required;

        // Generate payment reference
        const paymentReference = `TEAM-SUB-${randomUUID().slice(0, 8).toUpperCase()}`;

        // Create payment record
        const payment = this.paymentRepo.create({
            payment_reference: paymentReference,
            payment_type: 'team_subscription',
            entity_type: userType,
            entity_id: userId,
            related_entity_type: 'team',
            related_entity_id: teamId,
            amount: price,
            currency: 'EGP',
            status: 'pending',
            description: `Team subscription for team: ${team.name_en}`,
        });
        const savedPayment = await this.paymentRepo.save(payment);

        // Create subscription record
        const subscription = this.teamMemberTeamRepo.create({
            team_member_id: userId,
            team_id: teamId,
            start_date: new Date(),
            status: 'pending',
            subscription_status: 'pending_payment',
            payment_id: savedPayment.id,
            payment_reference: paymentReference,
            price,
        } as unknown as Partial<TeamMemberTeam>);
        const savedSubscription = await this.teamMemberTeamRepo.save(subscription);

        return {
            subscription: savedSubscription,
            payment: savedPayment,
            team,
            requiresApproval,
        };
    }

    /**
     * Confirm payment for a subscription
     */
    async confirmPayment(
        subscriptionId: number,
        userType: 'member' | 'team_member',
        paymentReference: string,
        transactionId?: string,
        gatewayResponse?: Record<string, unknown>
    ): Promise<ConfirmPaymentResult> {
        const subscription = await this.teamMemberTeamRepo.findOne({
            where: { id: subscriptionId },
            relations: ['team'],
        });

        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }

        if (subscription.payment_reference !== paymentReference) {
            throw new Error('Payment reference does not match this subscription');
        }

        // Update payment record
        const payment = await this.paymentRepo.findOne({
            where: { payment_reference: paymentReference },
        });

        if (!payment) {
            throw new Error(`Payment record with reference ${paymentReference} not found`);
        }

        payment.status = 'completed';
        payment.transaction_id = transactionId;
        payment.completed_at = new Date();
        if (gatewayResponse) {
            payment.gateway_response = JSON.stringify(gatewayResponse);
        }
        const updatedPayment = await this.paymentRepo.save(payment);

        // Update subscription based on whether approval is required
        const team = await this.teamRepo.findOne({ where: { id: subscription.team_id } });
        const requiresApproval = team?.approval_required ?? false;

        subscription.payment_completed_at = new Date();

        if (requiresApproval) {
            subscription.subscription_status = 'pending_admin_approval';
            subscription.status = 'pending';
        } else {
            subscription.subscription_status = 'active';
            subscription.status = 'approved';
        }

        const updatedSubscription = await this.teamMemberTeamRepo.save(subscription);

        const message = requiresApproval
            ? 'Payment confirmed. Subscription is pending admin approval.'
            : 'Payment confirmed. Subscription is now active.';

        return {
            subscription: updatedSubscription,
            payment: updatedPayment,
            requiresAdminApproval: requiresApproval,
            message,
        };
    }

    /**
     * Admin approves a subscription
     */
    async approveSubscription(
        subscriptionId: number,
        userType: 'member' | 'team_member',
        staffId: number
    ): Promise<ApproveSubscriptionResult> {
        const subscription = await this.teamMemberTeamRepo.findOne({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            throw new Error(`Subscription with ID ${subscriptionId} not found`);
        }

        if (!['pending', 'pending_admin_approval'].includes(subscription.status) &&
            subscription.subscription_status !== 'pending_admin_approval') {
            throw new Error(`Subscription is not pending approval (current status: ${subscription.status})`);
        }

        subscription.status = 'approved';
        subscription.subscription_status = 'active';
        subscription.admin_approved_at = new Date();
        subscription.approved_by_staff_id = staffId;

        const updatedSubscription = await this.teamMemberTeamRepo.save(subscription);

        return {
            subscription: updatedSubscription,
            message: 'Subscription approved successfully.',
        };
    }

    /**
     * Get all pending approvals (admin view)
     */
    async getPendingApprovals(
        userType?: 'member' | 'team_member'
    ): Promise<PendingApproval[]> {
        const rows = await AppDataSource.query(
            `SELECT
        tmt.id AS "subscriptionId",
        tmt.team_member_id AS "userId",
        'team_member' AS "userType",
        CONCAT(tm.first_name_en, ' ', tm.last_name_en) AS "userName",
        tmt.team_id AS "teamId",
        t.name_en AS "teamName",
        tmt.price,
        p.status AS "paymentStatus",
        tmt.created_at AS "createdAt"
      FROM team_member_teams tmt
      LEFT JOIN team_members tm ON tmt.team_member_id = tm.id
      LEFT JOIN teams t ON tmt.team_id = t.id
      LEFT JOIN payments p ON tmt.payment_reference = p.payment_reference
      WHERE tmt.subscription_status IN ('pending_admin_approval', 'pending_payment')
        AND tmt.status = 'pending'
      ORDER BY tmt.created_at ASC`
        );

        return rows as PendingApproval[];
    }
}
