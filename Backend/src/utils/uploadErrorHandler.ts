import { Request, Response, NextFunction } from 'express';

// Interface for error responses
interface IErrorResponse {
    message: string;
    field?: string;
}

/**
 * Wrapper to handle Multer errors in async route handlers
 * Usage: router.post('/endpoint', upload.fields(...), asyncUploadHandler(async (req, res) => { ... }))
 */
export const asyncUploadHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Extract error details from Multer error
 */
export const getMulterErrorMessage = (err: Error): IErrorResponse => {
  const multerErr = err as unknown as { code?: string; field?: string; message?: string };
  
  if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      message: `Unexpected field: "${multerErr.field}". Please check field names match the API specification.`,
      field: multerErr.field
    };
  }
  
  if (multerErr.code === 'LIMIT_FILE_SIZE') {
    return { message: 'File is too large. Maximum file size is 5MB.' };
  }

  if (multerErr.code === 'LIMIT_FILE_COUNT') {
    return { message: 'Too many files uploaded.' };
  }

  if (err.message && err.message.includes('Only images and PDFs are allowed')) {
    return { message: err.message };
  }

  return { message: err.message || 'File upload error occurred' };
};
