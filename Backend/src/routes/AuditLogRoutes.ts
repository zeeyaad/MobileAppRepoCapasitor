import { Router } from 'express';
import { getAuditLogs, getFilterOptions, getAuditStats } from '../controllers/AuditLogController';
// import { authenticate } from '../middleware/authenticate'; // Assuming authentication is needed

const router = Router();

// Assuming you have authentication middleware, uncomment the next line
// router.use(authenticate);

router.get('/', getAuditLogs);
router.get('/filters', getFilterOptions);
router.get('/stats', getAuditStats);

export default router;
