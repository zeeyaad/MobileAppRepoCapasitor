import { Request, Response } from 'express';
import { TeamMemberSubscriptionService } from '../services/TeamMemberSubscriptionService';
import { AppDataSource } from '../database/data-source';
import { TeamMember } from '../entities/TeamMember';
import { Team } from '../entities/Team';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { PaymentMethod } from '../entities/Payment';
import { PaymentService } from '../services/PaymentService';

const teamMemberSubscriptionService = new TeamMemberSubscriptionService();
const paymentService = new PaymentService();

const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export class TeamMemberSubscriptionController {
    /**
     * @route   POST /api/team-members/:teamMemberId/subscriptions/teams/:teamId
     * @desc    Subscribe a team member to a team
     * @access  Staff only
     */
    static async subscribeTeamMemberToTeam(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const teamMemberId = parseInt(req.params.teamMemberId);
            const teamId = req.params.teamId;

            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(teamMemberId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const { start_date, price } = body;

            const result = await teamMemberSubscriptionService.subscribeTeamMemberToTeam(
                teamMemberId,
                teamId,
                {
                    team_member_id: teamMemberId,
                    team_id: teamId,
                    start_date: start_date ? new Date(start_date as string) : undefined,
                    price: price ? parseFloat(price as string) : undefined,
                },
                user.staff_id as number
            );

            res.status(201).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe team member';
            console.error('Error subscribing team member:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   DELETE /api/team-members/:teamMemberId/subscriptions/:subscriptionId
     * @desc    Unsubscribe a team member from a team
     * @access  Staff only
     */
    static async unsubscribeTeamMemberFromTeam(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const teamMemberId = parseInt(req.params.teamMemberId);
            const subscriptionId = parseInt(req.params.subscriptionId);

            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(teamMemberId) || isNaN(subscriptionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID or subscription ID',
                });
                return;
            }

            const result = await teamMemberSubscriptionService.unsubscribeTeamMemberFromTeam(
                teamMemberId,
                subscriptionId,
                user.staff_id as number
            );

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe team member';
            console.error('Error unsubscribing team member:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   PATCH /api/team-members/subscriptions/:subscriptionId/approve
     * @desc    Approve a pending team member subscription
     * @access  Staff only
     */
    static async approveTeamMemberSubscription(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const subscriptionId = parseInt(req.params.subscriptionId);

            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(subscriptionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid subscription ID',
                });
                return;
            }

            const result = await teamMemberSubscriptionService.approveTeamMemberSubscription(
                subscriptionId,
                user.staff_id as number
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to approve subscription';
            console.error('Error approving subscription:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   PATCH /api/team-members/subscriptions/:subscriptionId/reject
     * @desc    Reject a pending team member subscription
     * @access  Staff only
     */
    static async rejectTeamMemberSubscription(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const subscriptionId = parseInt(req.params.subscriptionId);

            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(subscriptionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid subscription ID',
                });
                return;
            }

            const result = await teamMemberSubscriptionService.rejectTeamMemberSubscription(
                subscriptionId,
                user.staff_id as number
            );

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reject subscription';
            console.error('Error rejecting subscription:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/team-members/:teamMemberId/subscriptions
     * @desc    Get all teams a team member is subscribed to
     * @access  Public
     */
    static async getTeamMemberSubscriptions(req: Request, res: Response): Promise<void> {
        try {
            const teamMemberId = parseInt(req.params.teamMemberId);

            if (isNaN(teamMemberId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID',
                });
                return;
            }

            const subscriptions = await teamMemberSubscriptionService.getTeamMemberSubscriptions(teamMemberId);

            res.status(200).json({
                success: true,
                message: 'Team member subscriptions retrieved successfully',
                data: subscriptions,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve subscriptions';
            console.error('Error retrieving subscriptions:', error);
            res.status(404).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/:teamId/members
     * @desc    Get all team members subscribed to a specific team
     * @access  Public
     */
    static async getTeamMembers(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.params.teamId;

            if (!teamId || typeof teamId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team ID',
                });
                return;
            }

            const teamMembers = await teamMemberSubscriptionService.getTeamMembers(teamId);

            res.status(200).json({
                success: true,
                message: 'Team members retrieved successfully',
                data: teamMembers,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve team members';
            console.error('Error retrieving team members:', error);
            res.status(404).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/team-members/:teamMemberId/subscriptions/teams/:teamId/check
     * @desc    Check if team member is subscribed to a team
     * @access  Public
     */
    static async checkTeamMemberSubscription(req: Request, res: Response): Promise<void> {
        try {
            const teamMemberId = parseInt(req.params.teamMemberId);
            const teamId = req.params.teamId;

            if (isNaN(teamMemberId) || !teamId) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID or team ID',
                });
                return;
            }

            const isSubscribed = await teamMemberSubscriptionService.isTeamMemberSubscribed(teamMemberId, teamId);

            res.status(200).json({
                success: true,
                data: {
                    team_member_id: teamMemberId,
                    team_id: teamId,
                    is_subscribed: isSubscribed,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to check subscription';
            console.error('Error checking subscription:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/teams/:teamId/pending-subscriptions
     * @desc    Get all pending subscriptions for a team
     * @access  Staff only
     */
    static async getPendingSubscriptions(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const teamId = req.params.teamId;

            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (!teamId || typeof teamId !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team ID',
                });
                return;
            }

            const pending = await teamMemberSubscriptionService.getPendingSubscriptions(teamId);

            res.status(200).json({
                success: true,
                message: 'Pending subscriptions retrieved successfully',
                data: {
                    team_id: teamId,
                    total_pending: pending.length,
                    subscriptions: pending,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve pending subscriptions';
            console.error('Error retrieving pending subscriptions:', error);
            res.status(404).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/team-members/:teamMemberId/subscription-count
     * @desc    Get number of active teams a team member is subscribed to
     * @access  Public
     */
    static async getTeamMemberSubscriptionCount(req: Request, res: Response): Promise<void> {
        try {
            const teamMemberId = parseInt(req.params.teamMemberId);

            if (isNaN(teamMemberId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID',
                });
                return;
            }

            const count = await teamMemberSubscriptionService.getTeamMemberSubscriptionCount(teamMemberId);

            res.status(200).json({
                success: true,
                data: {
                    team_member_id: teamMemberId,
                    total_teams: count,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get count';
            console.error('Error getting count:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   POST /api/team-member-subscriptions/subscriptions/:subscriptionId/confirm-payment
     * @desc    Confirm payment for a team member subscription
     * @access  Authenticated team members (or staff)
     */
    static async confirmTeamMemberSubscriptionPayment(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const subscriptionId = parseInt(req.params.subscriptionId, 10);
            const body = req.body as Record<string, unknown>;

            if (isNaN(subscriptionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid subscriptionId',
                });
                return;
            }

            const subscriptionRepo = AppDataSource.getRepository(TeamMemberTeam);
            const subscription = await subscriptionRepo.findOne({
                where: { id: subscriptionId },
            });

            if (!subscription) {
                res.status(404).json({
                    success: false,
                    message: 'Subscription not found',
                });
                return;
            }

            const authenticatedTeamMemberId = user?.team_member_id ? Number(user.team_member_id) : undefined;
            const isStaff = !!user?.staff_id;
            if (authenticatedTeamMemberId && !isStaff && authenticatedTeamMemberId !== subscription.team_member_id) {
                res.status(403).json({
                    success: false,
                    message: 'You are not allowed to confirm payment for this subscription',
                });
                return;
            }

            if (subscription.subscription_status !== 'pending_payment') {
                res.status(400).json({
                    success: false,
                    message: `Subscription payment is already processed with status: ${subscription.subscription_status}`,
                    data: subscription,
                });
                return;
            }

            const paymentReferenceFromBody = typeof body.payment_reference === 'string'
                ? body.payment_reference.trim()
                : '';
            const paymentReference = paymentReferenceFromBody || subscription.payment_reference;

            if (!paymentReference) {
                res.status(400).json({
                    success: false,
                    message: 'Missing payment reference for this subscription',
                });
                return;
            }

            const transactionId = typeof body.transaction_id === 'string' && body.transaction_id.trim().length > 0
                ? body.transaction_id.trim()
                : `TM-${subscription.id}-${Date.now()}`;

            const paymentMethod = typeof body.payment_method === 'string' && body.payment_method.trim().length > 0
                ? body.payment_method.trim() as PaymentMethod
                : undefined;

            const gatewayResponse = body.gateway_response == null
                ? undefined
                : typeof body.gateway_response === 'string'
                    ? body.gateway_response
                    : JSON.stringify(body.gateway_response);

            const payment = await paymentService.confirmPayment(paymentReference, {
                transactionId,
                paymentMethod,
                gatewayResponse,
                metadata: {
                    subscription_id: subscription.id,
                    team_id: subscription.team_id,
                    team_member_id: subscription.team_member_id,
                },
            });

            subscription.payment_id = payment.id;
            subscription.payment_reference = payment.payment_reference;
            subscription.payment_completed_at = payment.completed_at || new Date();
            subscription.subscription_status = 'active';
            subscription.status = 'active';
            await subscriptionRepo.save(subscription);

            // Heal legacy rows: if older records for same member/team are still pending_admin_approval
            // after payment completion, activate them to keep dashboard + requests in sync.
            await AppDataSource.query(
                `
                UPDATE team_member_teams
                SET status = 'active',
                    subscription_status = 'active',
                    payment_completed_at = COALESCE(payment_completed_at, $1),
                    updated_at = NOW()
                WHERE team_member_id = $2
                  AND team_id = $3
                  AND status = 'pending'
                  AND COALESCE(subscription_status, 'pending_admin_approval') = 'pending_admin_approval'
                `,
                [subscription.payment_completed_at, subscription.team_member_id, subscription.team_id]
            );

            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully. Subscription is now active.',
                data: subscription,
                payment: {
                    id: payment.id,
                    reference: payment.payment_reference,
                    transaction_id: payment.transaction_id,
                    status: payment.status,
                    amount: payment.amount,
                    currency: payment.currency,
                    completed_at: payment.completed_at,
                },
                requiresAdminApproval: false,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
            console.error('Error confirming team member subscription payment:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   POST /api/team-members/subscribe
     * @desc    Team member can subscribe themselves to a team
     * @access  Authenticated team members
     */
    static async teamMemberSelfSubscribe(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const body = req.body as Record<string, unknown>;
            const { team_id, team_member_id } = body;

            if (!team_id || typeof team_id !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'team_id is required',
                });
                return;
            }

            const requestedTeamMemberId = team_member_id ? parseInt(String(team_member_id), 10) : NaN;
            const authenticatedTeamMemberId = user?.team_member_id ? Number(user.team_member_id) : NaN;
            const teamMemberId = Number.isNaN(requestedTeamMemberId) ? authenticatedTeamMemberId : requestedTeamMemberId;

            if (isNaN(teamMemberId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team_member_id',
                });
                return;
            }

            if (!isNaN(authenticatedTeamMemberId) && authenticatedTeamMemberId !== teamMemberId) {
                res.status(403).json({
                    success: false,
                    message: 'Cannot subscribe for another team member',
                });
                return;
            }

            const teamRepository = AppDataSource.getRepository(Team);
            const subscriptionRepository = AppDataSource.getRepository(TeamMemberTeam);

            // Check if team exists and is active
            const team = await teamRepository.findOne({
                where: { id: team_id },
                relations: ['sport', 'training_schedules'],
            });

            if (!team) {
                res.status(404).json({
                    success: false,
                    message: 'Team not found',
                });
                return;
            }

            if (team.status !== 'active') {
                res.status(400).json({
                    success: false,
                    message: `Cannot subscribe to team with status: ${team.status}`,
                });
                return;
            }

            // Check if team member exists
            const teamMember = await AppDataSource.getRepository(TeamMember).findOne({
                where: { id: teamMemberId },
            });

            if (!teamMember) {
                res.status(404).json({
                    success: false,
                    message: 'Team member not found',
                });
                return;
            }

            if (teamMember.status !== 'active' && teamMember.status !== 'approved') {
                res.status(400).json({
                    success: false,
                    message: `Cannot subscribe with status: ${teamMember.status}`,
                });
                return;
            }

            const activeScheduleFees = (team.training_schedules || [])
                .filter((schedule) => schedule.status === 'active')
                .map((schedule) => toNumber(schedule.training_fee))
                .filter((fee) => fee > 0);

            const minScheduleFee = activeScheduleFees.length > 0 ? Math.min(...activeScheduleFees) : 0;
            const teamPrice = toNumber(team.subscription_price);
            const sportPrice = toNumber(team.sport?.price);
            const subscriptionPrice = teamPrice > 0 ? teamPrice : (minScheduleFee > 0 ? minScheduleFee : sportPrice);

            // Check if already subscribed
            const existingSubscription = await AppDataSource.query(`
                SELECT id, team_member_id, team_id, status, subscription_status, payment_id, payment_reference, price
                FROM team_member_teams 
                WHERE team_member_id = $1 AND team_id = $2 AND status NOT IN ('cancelled', 'declined')
                ORDER BY created_at DESC
                LIMIT 1
            `, [teamMemberId, team_id]);

            if (existingSubscription && existingSubscription.length > 0) {
                const existing = existingSubscription[0] as Record<string, unknown>;
                const existingSubscriptionStatus = String(existing.subscription_status || '').trim().toLowerCase();

                if (existingSubscriptionStatus === 'pending_payment') {
                    let paymentReference = existing.payment_reference ? String(existing.payment_reference) : '';
                    let paymentId = existing.payment_id ? Number(existing.payment_id) : null;
                    const existingPrice = toNumber(existing.price) > 0 ? toNumber(existing.price) : subscriptionPrice;

                    if (!paymentReference) {
                        const payment = await paymentService.createPayment({
                            entityType: 'team_member',
                            entityId: teamMemberId,
                            paymentType: 'team_subscription',
                            relatedEntityType: 'team',
                            relatedEntityId: team.id,
                            amount: existingPrice,
                            description: `Team subscription for ${team.name_en}`,
                            metadata: {
                                subscription_id: existing.id,
                                team_id: team.id,
                                team_member_id: teamMemberId,
                            },
                        });

                        paymentReference = payment.payment_reference;
                        paymentId = payment.id;

                        await AppDataSource.query(`
                            UPDATE team_member_teams
                            SET payment_id = $1, payment_reference = $2, price = COALESCE(NULLIF(price, 0), $3)
                            WHERE id = $4
                        `, [paymentId, paymentReference, existingPrice, Number(existing.id)]);
                    }

                    res.status(200).json({
                        success: true,
                        paymentRequired: true,
                        approvalRequiredAfterPayment: true,
                        message: 'Subscription already exists and is waiting for payment completion.',
                        data: {
                            id: Number(existing.id),
                            team_member_id: teamMemberId,
                            team_id: team_id,
                            status: existing.status || 'pending',
                            subscription_status: 'pending_payment',
                            payment_id: paymentId,
                            payment_reference: paymentReference,
                            price: existingPrice,
                            team: {
                                id: team.id,
                                name_en: team.name_en,
                                name_ar: team.name_ar,
                                sport: team.sport,
                            },
                        },
                        payment: {
                            id: paymentId,
                            reference: paymentReference,
                            amount: existingPrice,
                            currency: 'EGP',
                            status: 'pending',
                        },
                    });
                    return;
                }

                res.status(409).json({
                    success: false,
                    message: `Already have a subscription to this team with status: ${existing.status}`,
                    data: existing,
                });
                return;
            }

            // Check team capacity (ignore unpaid pending_payment records)
            const currentMemberCount = await AppDataSource.query(`
                SELECT COUNT(*) FROM team_member_teams 
                WHERE team_id = $1
                  AND (
                    status IN ('approved', 'active')
                    OR (status = 'pending' AND COALESCE(subscription_status, 'pending_admin_approval') <> 'pending_payment')
                  )
            `, [team_id]);

            if (parseInt(currentMemberCount[0].count, 10) >= team.max_participants) {
                res.status(400).json({
                    success: false,
                    message: `Team is full. Maximum participants: ${team.max_participants}`,
                });
                return;
            }

            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Create new subscription with pending_payment status
            let newSubscription = subscriptionRepository.create({
                team_member_id: teamMemberId,
                team_id: team_id,
                start_date: startDate,
                end_date: endDate,
                status: 'pending',
                subscription_status: 'pending_payment',
                price: subscriptionPrice,
            } as unknown as Partial<TeamMemberTeam>);

            newSubscription = await subscriptionRepository.save(newSubscription);

            const payment = await paymentService.createPayment({
                entityType: 'team_member',
                entityId: teamMemberId,
                paymentType: 'team_subscription',
                relatedEntityType: 'team',
                relatedEntityId: team.id,
                amount: subscriptionPrice,
                description: `Team subscription for ${team.name_en}`,
                metadata: {
                    subscription_id: newSubscription.id,
                    team_id: team.id,
                    team_member_id: teamMemberId,
                },
            });

            newSubscription.payment_id = payment.id;
            newSubscription.payment_reference = payment.payment_reference;
            await subscriptionRepository.save(newSubscription);

            const subscription = await subscriptionRepository.findOne({
                where: { id: newSubscription.id },
                relations: ['team_member', 'payment'],
            });

            res.status(201).json({
                success: true,
                paymentRequired: true,
                approvalRequiredAfterPayment: true,
                message: 'Subscription request created. Please complete payment to continue.',
                data: {
                    ...subscription,
                    team: {
                        id: team.id,
                        name_en: team.name_en,
                        name_ar: team.name_ar,
                        sport: team.sport,
                    },
                },
                payment: {
                    id: payment.id,
                    reference: payment.payment_reference,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
            console.error('Error creating subscription:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }
}

