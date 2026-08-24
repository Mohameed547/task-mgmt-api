import multer, { MulterError } from 'multer';
import path from 'path';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return callback(
        new ApiError(400, 'Invalid file type. Allowed file types: PDF, PNG, JPG, JPEG, DOC, DOCX')
      );
    }

    callback(null, true);
  },
});

/**
 * Middleware for single task file attachment upload handling.
 * Parses multipart/form-data, validates file size (<= 5MB) and mime type/extension.
 */
export const uploadAttachmentMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single('attachment')(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'File size cannot exceed 5 MB'));
        }
        return next(new ApiError(400, `File upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};
