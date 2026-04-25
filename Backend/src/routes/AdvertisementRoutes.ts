import { Router, Request, Response } from 'express';
import AdvertisementController from '../controllers/AdvertisementController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

const router = Router();
const controller = new AdvertisementController();

// Privilege codes for Media Center Management
const PRIVILEGE_MEDIA_CENTER_CREATE = 'MEDIA_CENTER_CREATE';
const PRIVILEGE_MEDIA_CENTER_PUBLISH = 'MEDIA_CENTER_PUBLISH';
const PRIVILEGE_MEDIA_CENTER_APPROVE = 'MEDIA_CENTER_APPROVE';
const PRIVILEGE_MEDIA_CENTER_EDIT = 'MEDIA_CENTER_EDIT';
const PRIVILEGE_MEDIA_CENTER_DELETE = 'MEDIA_CENTER_DELETE';
const PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES = 'MEDIA_CENTER_MANAGE_CATEGORIES';

// ===== ADVERTISEMENT ENDPOINTS =====

/**
 * POST /media-center/advertisements
 * Create new advertisement with photo upload
 * Requires: MEDIA_CENTER_CREATE privilege
 */
router.post(
  '/advertisements',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_CREATE),
  upload.array('photos', 10),
  async (req: Request, res: Response) => {
    await controller.createAdvertisement(req, res);
  }
);

/**
 * GET /media-center/advertisements
 * Get all advertisements with optional filters
 */
router.get('/advertisements', async (req: Request, res: Response) => {
  await controller.getAllAdvertisements(req, res);
});

/**
 * GET /media-center/advertisements/:id
 * Get single advertisement by ID
 */
router.get('/advertisements/:id', async (req: Request, res: Response) => {
  await controller.getAdvertisementById(req, res);
});

/**
 * GET /media-center/advertisements/pending/all
 * Get pending advertisements for manager approval
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.get(
  '/advertisements/pending/all',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_APPROVE),
  async (req: Request, res: Response) => {
    await controller.getPendingAdvertisements(req, res);
  }
);

/**
 * PUT /media-center/advertisements/:id
 * Update advertisement
 * Requires: MEDIA_CENTER_EDIT privilege
 */
router.put(
  '/advertisements/:id',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_EDIT),
  async (req: Request, res: Response) => {
    await controller.updateAdvertisement(req, res);
  }
);

/**
 * POST /media-center/advertisements/:id/approve
 * Approve pending advertisement
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.post(
  '/advertisements/:id/approve',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_APPROVE),
  async (req: Request, res: Response) => {
    await controller.approveAdvertisement(req, res);
  }
);

/**
 * POST /media-center/advertisements/:id/reject
 * Reject pending advertisement
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.post(
  '/advertisements/:id/reject',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_APPROVE),
  async (req: Request, res: Response) => {
    await controller.rejectAdvertisement(req, res);
  }
);

/**
 * POST /media-center/advertisements/:id/publish
 * Publish approved advertisement
 * Requires: MEDIA_CENTER_PUBLISH privilege
 */
router.post(
  '/advertisements/:id/publish',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_PUBLISH),
  async (req: Request, res: Response) => {
    await controller.publishAdvertisement(req, res);
  }
);

/**
 * DELETE /media-center/advertisements/:id
 * Delete advertisement
 * Requires: MEDIA_CENTER_DELETE privilege
 */
router.delete(
  '/advertisements/:id',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_DELETE),
  async (req: Request, res: Response) => {
    await controller.deleteAdvertisement(req, res);
  }
);

/**
 * POST /media-center/advertisements/:id/archive
 * Archive advertisement
 * Requires: MEDIA_CENTER_EDIT or MEDIA_CENTER_DELETE privilege
 */
router.post(
  '/advertisements/:id/archive',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_EDIT),
  async (req: Request, res: Response) => {
    await controller.archiveAdvertisement(req, res);
  }
);

/**
 * POST /media-center/advertisements/:id/view
 * Track advertisement view (public endpoint)
 */
router.post('/advertisements/:id/view', async (req: Request, res: Response) => {
  await controller.trackView(req, res);
});

/**
 * POST /media-center/advertisements/:id/click
 * Track advertisement click (public endpoint)
 */
router.post('/advertisements/:id/click', async (req: Request, res: Response) => {
  await controller.trackClick(req, res);
});

// ===== CATEGORY ENDPOINTS =====

/**
 * GET /media-center/categories
 * Get all advertisement categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  await controller.getCategories(req, res);
});

/**
 * GET /media-center/categories/:id
 * Get category by ID
 */
router.get('/categories/:id', async (req: Request, res: Response) => {
  await controller.getCategoryById(req, res);
});

/**
 * POST /media-center/categories
 * Create advertisement category
 * Requires: MEDIA_CENTER_MANAGE_CATEGORIES privilege
 */
router.post(
  '/categories',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES),
  async (req: Request, res: Response) => {
    await controller.createCategory(req, res);
  }
);

/**
 * PUT /media-center/categories/:id
 * Update advertisement category
 * Requires: MEDIA_CENTER_MANAGE_CATEGORIES privilege
 */
router.put(
  '/categories/:id',
  authenticate,
  authorizePrivilege(PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES),
  async (req: Request, res: Response) => {
    await controller.updateCategory(req, res);
  }
);

export default router;
