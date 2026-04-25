import express, { Request, Response } from 'express';
import { initializeDefaultPlans } from '../utils/initializePlans';

const router = express.Router();

router.get('/plans', async (req: Request, res: Response) => {
    try {
        await initializeDefaultPlans();
        res.json({ success: true, message: 'Membership plans seeded successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
