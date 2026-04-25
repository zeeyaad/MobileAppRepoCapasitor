import { Request, Response } from 'express';
import { SportService } from '../services/SportService';

const sportService = new SportService();

export class SportController {
    /**
     * @route   POST /api/sports
     * @desc    Create a new sport with teams
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   name_en: string,
     *   name_ar: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   sport_image?: string,
     *   teams: [
     *     {
     *       name: string (required),
     *       branch_id?: number,
     *       max_members?: number
     *     }
     *   ] (required - at least one team)
     * }
     */
    static async createSport(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;

            if (!user || !user.staff_id || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const {
                name_en,
                name_ar,
                description_en,
                description_ar,
                sport_image,
                teams,
            } = body;

            // Validation
            if (!name_en || !name_ar) {
                res.status(400).json({
                    success: false,
                    message: 'Sport name (English and Arabic) is required',
                });
                return;
            }

            // Validate teams
            if (!teams || !Array.isArray(teams) || teams.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'At least one team is required to create a sport',
                });
                return;
            }

            // Validate each team
            for (let i = 0; i < teams.length; i++) {
                const team = teams[i] as Record<string, unknown>;

                // Validate team names (bilingual)
                if (!team.name_en || typeof team.name_en !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: Team name (English) is required and must be a string`,
                    });
                    return;
                }

                if (!team.name_ar || typeof team.name_ar !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: Team name (Arabic) is required and must be a string`,
                    });
                    return;
                }

                // Validate max_participants
                if (typeof team.max_participants !== 'number' || (team.max_participants as number) <= 0) {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: max_participants is required and must be a positive number`,
                    });
                    return;
                }

                // Validate training object
                const training = team.training as Record<string, unknown>;
                if (!training || typeof training !== 'object') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training schedule is required`,
                    });
                    return;
                }

                // Validate training fields
                if (!training.days_en || typeof training.days_en !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.days_en is required and must be a string`,
                    });
                    return;
                }

                if (!training.days_ar || typeof training.days_ar !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.days_ar is required and must be a string`,
                    });
                    return;
                }

                if (!training.start_time || typeof training.start_time !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.start_time is required and must be a string`,
                    });
                    return;
                }

                if (!training.end_time || typeof training.end_time !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.end_time is required and must be a string`,
                    });
                    return;
                }

                if (!training.field_id || typeof training.field_id !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.field_id is required and must be a valid UUID string`,
                    });
                    return;
                }

                if (typeof training.training_fee !== 'number' || (training.training_fee as number) < 0) {
                    res.status(400).json({
                        success: false,
                        message: `Team ${i + 1}: training.training_fee is required and must be a non-negative number`,
                    });
                    return;
                }
            }

            const sport = await sportService.createSportWithTeamsAndTraining(
                {
                    name_en: name_en as string,
                    name_ar: name_ar as string,
                    description_en: description_en as string | undefined,
                    description_ar: description_ar as string | undefined,
                    sport_image: sport_image as string | undefined,
                },
                teams as unknown as Array<{
                    name_en: string;
                    name_ar: string;
                    max_participants: number;
                    training: {
                        days_en: string;
                        days_ar: string;
                        start_time: string;
                        end_time: string;
                        field_id: string;
                        training_fee: number;
                    };
                }>,
                user.staff_id as number,
                user.staff_type_id as number
            );

            res.status(201).json({
                success: true,
                message: sport.sport.status === 'active'
                    ? 'Sport, teams, and training schedules created and activated successfully'
                    : 'Sport, teams, and training schedules created and pending approval',
                data: {
                    sport: sport.sport,
                    teams: sport.teams,
                    trainings: sport.trainings,
                    teamsCount: sport.teams.length,
                    trainingsCount: sport.trainings.length,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create sport';
            console.error('Error creating sport:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/sports
     * @desc    Get all sports with optional filters
     * @access  SportActivityManager, SportActivitySpecialist
     * @query   status?: string, is_active?: boolean
     */
    static async getAllSports(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query as Record<string, unknown>;
            const { status, is_active } = query;

            const filters: Record<string, unknown> = {};
            if (status) filters.status = status;
            if (is_active !== undefined) filters.is_active = is_active === 'true';

            const sports = await sportService.getAllSports(filters);

            res.status(200).json({
                success: true,
                data: sports,
                count: sports.length,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sports';
            console.error('Error fetching sports:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   GET /api/sports/:id
     * @desc    Get sport by ID
     * @access  SportActivityManager, SportActivitySpecialist
     */
    static async getSportById(req: Request, res: Response): Promise<void> {
        try {
            const sportId = parseInt(req.params.id);

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            const sport = await sportService.getSportById(sportId);

            if (!sport) {
                res.status(404).json({
                    success: false,
                    message: 'Sport not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: sport,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sport';
            console.error('Error fetching sport:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   PUT /api/sports/:id
     * @desc    Update sport
     * @access  SportActivityManager, SportActivitySpecialist
     * @body    {
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   price?: number,  // Only managers can update this
     *   sport_image?: string,
     *   max_participants?: number
     * }
     */
    static async updateSport(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const sportId = parseInt(req.params.id);

            if (!user || !user.staff_id || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const {
                name_en,
                name_ar,
                description_en,
                description_ar,
                price,
                sport_image,
                max_participants,
            } = body;

            const updateData: Record<string, unknown> = {};
            if (name_en) updateData.name_en = name_en;
            if (name_ar) updateData.name_ar = name_ar;
            if (description_en !== undefined) updateData.description_en = description_en;
            if (description_ar !== undefined) updateData.description_ar = description_ar;
            if (price !== undefined) updateData.price = parseFloat(price as string);
            if (sport_image) updateData.sport_image = sport_image;
            if (max_participants !== undefined) updateData.max_participants = parseInt(max_participants as string);

            const sport = await sportService.updateSport(
                sportId,
                updateData,
                user.staff_id as number,
                user.staff_type_id as number
            );

            res.status(200).json({
                success: true,
                message: 'Sport updated successfully',
                data: sport,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update sport';
            console.error('Error updating sport:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   PUT /api/sports/:id/comprehensive
     * @desc    Update sport with all related fields (teams and trainings)
     * @access  SportActivityManager, Specialist, or Financial Director
     * @body    {
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   sport_image?: string,
     *   price?: number,
     *   teams?: [{
     *     id?: string,  // UUID - if provided, update existing team
     *     name_en?: string,
     *     name_ar?: string,
     *     max_participants?: number,
     *     training?: {
     *       id?: string,  // UUID - if provided, update existing training
     *       days_en?: string,
     *       days_ar?: string,
     *       start_time?: string,
     *       end_time?: string,
     *       field_id?: string,
     *       training_fee?: number
     *     }
     *   }]
     * }
     */
    static async updateSportComprehensive(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const sportId = parseInt(req.params.id);

            if (!user || !user.staff_id || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const {
                name_en,
                name_ar,
                description_en,
                description_ar,
                sport_image,
                price,
                teams,
            } = body;

            // Validate teams array if provided
            if (teams && Array.isArray(teams)) {
                for (let i = 0; i < teams.length; i++) {
                    const team = teams[i] as Record<string, unknown>;

                    // Validate team fields
                    if (team.name_en && typeof team.name_en !== 'string') {
                        res.status(400).json({
                            success: false,
                            message: `Team ${i + 1}: name_en must be a string if provided`,
                        });
                        return;
                    }

                    if (team.name_ar && typeof team.name_ar !== 'string') {
                        res.status(400).json({
                            success: false,
                            message: `Team ${i + 1}: name_ar must be a string if provided`,
                        });
                        return;
                    }

                    if (team.max_participants !== undefined && typeof team.max_participants !== 'number') {
                        res.status(400).json({
                            success: false,
                            message: `Team ${i + 1}: max_participants must be a number if provided`,
                        });
                        return;
                    }

                    // Validate training if provided
                    const training = team.training as Record<string, unknown> | undefined;
                    if (training) {
                        if (training.days_en && typeof training.days_en !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.days_en must be a string if provided`,
                            });
                            return;
                        }

                        if (training.days_ar && typeof training.days_ar !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.days_ar must be a string if provided`,
                            });
                            return;
                        }

                        if (training.start_time && typeof training.start_time !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.start_time must be a string if provided`,
                            });
                            return;
                        }

                        if (training.end_time && typeof training.end_time !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.end_time must be a string if provided`,
                            });
                            return;
                        }

                        if (training.field_id && typeof training.field_id !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.field_id must be a UUID string if provided`,
                            });
                            return;
                        }

                        if (training.training_fee !== undefined && typeof training.training_fee !== 'number') {
                            res.status(400).json({
                                success: false,
                                message: `Team ${i + 1}: training.training_fee must be a number if provided`,
                            });
                            return;
                        }
                    }
                }
            }

            const updateData: Record<string, unknown> = {};
            if (name_en) updateData.name_en = name_en;
            if (name_ar) updateData.name_ar = name_ar;
            if (description_en !== undefined) updateData.description_en = description_en;
            if (description_ar !== undefined) updateData.description_ar = description_ar;
            if (sport_image !== undefined) updateData.sport_image = sport_image;
            if (price !== undefined) updateData.price = parseFloat(price as string);
            if (teams !== undefined) updateData.teams = teams;

            const result = await sportService.updateSportWithTeamsAndTraining(
                sportId,
                updateData as Parameters<typeof sportService.updateSportWithTeamsAndTraining>[1],
                user.staff_id as number,
                user.staff_type_id as number
            );

            res.status(200).json({
                success: true,
                message: 'Sport with teams and trainings updated successfully',
                data: result,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update sport';
            console.error('Error updating sport:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   POST /api/sports/:id/approve
     * @desc    Approve or reject a pending sport
     * @access  SportActivityManager only
     * @body    {
     *   action: 'approve' | 'reject',
     *   comments?: string
     * }
     */
    static async approveSport(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const sportId = parseInt(req.params.id);

            if (!user || !user.staff_id || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            const body = req.body as Record<string, unknown>;
            const { action, comments } = body;

            if (!action || !['approve', 'reject'].includes(action as string)) {
                res.status(400).json({
                    success: false,
                    message: 'Action must be either "approve" or "reject"',
                });
                return;
            }

            const actionValue = action as 'approve' | 'reject';
            const sport = await sportService.approveSport(
                sportId,
                actionValue,
                user.staff_id as number,
                user.staff_type_id as number,
                comments as string | undefined
            );

            res.status(200).json({
                success: true,
                message: `Sport ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
                data: sport,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to approve/reject sport';
            console.error('Error approving sport:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   DELETE /api/sports/:id
     * @desc    Delete sport
     * @access  SportActivityManager only
     */
    static async deleteSport(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const sportId = parseInt(req.params.id);

            if (!user || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            await sportService.deleteSport(sportId, user.staff_type_id as number, user.staff_id as number);

            res.status(200).json({
                success: true,
                message: 'Sport deleted successfully',
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete sport';
            console.error('Error deleting sport:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    /**
     * @route   PATCH /api/sports/:id/toggle-status
     * @desc    Toggle sport active status
     * @access  SportActivityManager only
     */
    static async toggleSportStatus(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as unknown as { user?: Record<string, unknown> }).user;
            const sportId = parseInt(req.params.id);

            if (!user || !user.staff_type_id) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID',
                });
                return;
            }

            const sport = await sportService.toggleSportStatus(sportId, user.staff_type_id as number, user.staff_id as number);

            res.status(200).json({
                success: true,
                message: `Sport ${sport.is_active ? 'activated' : 'deactivated'} successfully`,
                data: sport,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to toggle sport status';
            console.error('Error toggling sport status:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }

    // --- NEW TEAM MEMBER METHODS ---

    /**
     * @route   GET /api/sports/team-members
     * @desc    Get all team members
     */
    static async getTeamMembers(req: Request, res: Response): Promise<void> {
        try {
            const members = await sportService.getTeamMembers();
            res.status(200).json({ success: true, data: members });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching team members:', error);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * @route   GET /api/sports/team-members/sport/:sportName
     * @desc    Get team members by sport
     */
    static async getTeamMembersBySport(req: Request, res: Response): Promise<void> {
        try {
            const params = req.params as Record<string, string>;
            const { sportName } = params;
            const members = await sportService.getTeamMembersBySport(sportName);
            res.status(200).json({ success: true, data: members });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching team members by sport:', error);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * @route   GET /api/sports/team-members/user/:memberId
     * @desc    Get single team member
     */
    static async getTeamMemberById(req: Request, res: Response): Promise<void> {
        try {
            const params = req.params as Record<string, string>;
            const { memberId } = params;
            const member = await sportService.getTeamMemberById(Number(memberId));
            if (!member) {
                res.status(404).json({ error: 'Member not found' });
                return;
            }
            res.status(200).json({ success: true, data: member });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching team member:', error);
            res.status(500).json({ error: errorMessage });
        }
    }

    /**
     * @route   GET /api/public/sports
     * @desc    Get all active and approved sports (public endpoint - no authentication required)
     * @access  Public
     */
    static async getActiveSports(req: Request, res: Response): Promise<void> {
        try {
            const sports = await sportService.getAllSports({
                status: 'active',
                is_active: true
            });

            // Return all necessary fields for member subscription page (includes training_schedules, teams)
            const publicSports = sports.map(sport => ({
                id: sport.id,
                name_en: sport.name_en,
                name_ar: sport.name_ar,
                description_en: sport.description_en,
                description_ar: sport.description_ar,
                sport_image: sport.sport_image,
                price: sport.price,
                training_schedules: sport.training_schedules?.map(schedule => ({
                    id: schedule.id,
                    team_id: schedule.team_id,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    days_ar: schedule.days_ar,
                    days_en: schedule.days_en,
                    training_fee: schedule.training_fee,
                    field: schedule.field ? {
                        name_ar: schedule.field.name_ar,
                        name_en: schedule.field.name_en
                    } : null
                })) || [],
                teams: sport.teams?.map(team => ({
                    id: team.id,
                    name_ar: team.name_ar,
                    name_en: team.name_en,
                    subscription_price: team.subscription_price,
                    max_participants: team.max_participants
                })) || []
            }));

            res.status(200).json({
                success: true,
                data: publicSports,
                count: publicSports.length,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sports';
            console.error('Error fetching active sports:', error);
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }
}
