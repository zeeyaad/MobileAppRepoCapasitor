import { Router, Request, Response, NextFunction } from 'express';
import { TeamMemberController } from '../controllers/TeamMemberController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { AppDataSource } from '../database/data-source';
import { StaffType } from '../entities/StaffType';

const router = Router();
const controller = new TeamMemberController();

// POST /register/details/team-member
router.post(
    '/details/team-member',
    upload.fields([
        { name: 'personal_photo', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'national_id_front', maxCount: 1 },
        { name: 'national_id_back', maxCount: 1 },
        { name: 'proof', maxCount: 1 },
    ]),
    controller.submitDetails
);

// POST /register/team-member/select-teams
router.post('/team-member/select-teams', controller.selectTeams);

// GET /register/team-member/status/:member_id
router.get('/team-member/status/:member_id', controller.getStatus);

// GET /register/team-member/details/:member_id
// Returns full member profile (photo, DOB, address, etc.)
router.get('/team-member/details/:member_id', controller.getDetails);

router.put(
    '/team-member/details/:member_id',
    authenticate,
    upload.fields([
        { name: 'personal_photo', maxCount: 1 },
        { name: 'medical_report', maxCount: 1 },
        { name: 'national_id_front', maxCount: 1 },
        { name: 'national_id_back', maxCount: 1 },
        { name: 'proof', maxCount: 1 },
    ]),
    controller.updateProfile
);

// GET /register/team-member/review-all
// Secured route for Sport Staff
const authorizeSportStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;

        if (!user || !user.staff_type_id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const staffTypeRepo = AppDataSource.getRepository(StaffType);
        const staffType = await staffTypeRepo.findOne({ where: { id: user.staff_type_id as number } });

        if (!staffType || (staffType.code !== 'SPORT_MANAGER' && staffType.code !== 'SPORT_SPECIALIST')) {
            res.status(403).json({ error: 'Access denied. Only Sport Manager or Specialist allowed.' });
            return;
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

router.get('/team-member/review-all', authenticate, authorizeSportStaff, controller.reviewAllTeamMemberData);

export default router;
