import { Router, type Response, type NextFunction } from 'express';
import { MediaPostController } from '../controllers/MediaPostController';
import { authenticate } from '../middleware/auth';
import { authorizeAnyPrivilege, type AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { upload } from '../middleware/upload';

const router = Router();

// Public route to get all posts for landing page
router.get('/', MediaPostController.getAllPosts);

// Allow dedicated Media role/admin accounts to manage gallery even if privilege package is not yet synced.
const authorizeMediaWrite = (requiredPrivileges: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const role = String(req.user?.role || '').toUpperCase();
        const isAdmin = req.user?.staff_type_id === 1 || role === 'ADMIN';
        const isMediaStaff = role === 'MEDIA' && Boolean(req.user?.staff_id);

        if (isAdmin || isMediaStaff) {
            next();
            return;
        }

        authorizeAnyPrivilege(requiredPrivileges)(req, res, next);
    };
};

// Protected routes for Media Staff / Admins
// Assuming privilege codes for media management
// VIEW_MEDIA_GALLERY: 110, CREATE_MEDIA_POST: 111, UPDATE_MEDIA_POST: 112, DELETE_MEDIA_POST: 113

router.post(
    '/',
    authenticate,
    authorizeMediaWrite(['media.create', 'CREATE_MEDIA_POST']), // New and old codes
    upload.array('images', 10),
    MediaPostController.createPost
);

router.put(
    '/:id',
    authenticate,
    authorizeMediaWrite(['media.edit', 'UPDATE_MEDIA_POST']),
    upload.array('images', 10),
    MediaPostController.updatePost
);

router.delete(
    '/:id',
    authenticate,
    authorizeMediaWrite(['media.delete', 'DELETE_MEDIA_POST']),
    MediaPostController.deletePost
);

export default router;
