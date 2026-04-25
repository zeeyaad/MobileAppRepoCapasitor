import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { MembershipPlan } from '../entities/MembershipPlan';

export class MembershipController {
    private static membershipRepo = AppDataSource.getRepository(MembershipPlan);

    static async getAllPlans(req: Request, res: Response) {
        try {
            const plans = await MembershipController.membershipRepo.find({
                order: { price: 'ASC' }
            });
            return res.json(plans);
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPlan(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const plan = await MembershipController.membershipRepo.findOne({
                where: { id: parseInt(id) }
            });

            if (!plan) {
                return res.status(404).json({ message: 'Membership plan not found' });
            }

            return res.json(plan);
        } catch (error) {
            console.error('Error fetching membership plan:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
