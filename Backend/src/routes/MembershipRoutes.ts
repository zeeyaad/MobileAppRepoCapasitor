import { Router } from 'express';
import { MembershipController } from '../controllers/MembershipController';

const router = Router();

// Get all membership plans
router.get('/', (req, res) => MembershipController.getAllPlans(req, res));

// Get single membership plan
router.get('/:id', (req, res) => MembershipController.getPlan(req, res));

export default router;
