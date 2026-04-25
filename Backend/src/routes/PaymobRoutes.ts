import { Router } from 'express';
import { PaymobController } from '../controllers/PaymobController';

const router = Router();
const controller = new PaymobController();

router.post('/start', (req, res) => controller.start(req, res));
router.post('/webhook', (req, res) => controller.webhook(req, res));
router.get('/redirect', (req, res) => controller.redirect(req, res));

export default router;
