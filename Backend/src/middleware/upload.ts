import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Interface for Multer error details
interface IMulterError extends Error {
    code?: string;
    field?: string;
    limit?: string;
    expected?: number;
    received?: number;
}

// Use memory storage instead of disk storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter - whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/heic',
    'image/heif',
    'application/pdf',
]);

const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|webp|gif|bmp|heic|heif|pdf)$/i;

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const extname = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
    const mimetype = ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('image/');

    if (extname || mimetype) {
        cb(null, true);
    } else {
        console.warn(`Rejected file: ${file.originalname} (MIME: ${file.mimetype})`);
        cb(new Error('Only images and PDFs are allowed!'));
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter,
});

// Multer error handler middleware
export const multerErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // Handle Multer errors
    if (err instanceof multer.MulterError) {
        const multerErr = err as IMulterError;

        if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({
                success: false,
                message: `Unexpected field: "${multerErr.field}". Please check field names match the API specification.`,
                error: multerErr.code,
                received_field: multerErr.field
            });
            return;
        }

        if (multerErr.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                success: false,
                message: 'File is too large. Maximum file size is 10MB.',
                error: multerErr.code
            });
            return;
        }

        if (multerErr.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({
                success: false,
                message: 'Too many files uploaded.',
                error: multerErr.code
            });
            return;
        }

        res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
            error: multerErr.code
        });
        return;
    }

    // Handle custom file type errors
    if (err instanceof Error && err.message.includes('Only images and PDFs are allowed')) {
        res.status(400).json({
            success: false,
            message: err.message,
            allowed_types: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'pdf']
        });
        return;
    }

    // Pass other errors to next middleware
    next(err);
};
