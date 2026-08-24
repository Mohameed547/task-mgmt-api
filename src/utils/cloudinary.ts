import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { env } from '../config/env';
import { ITaskAttachment } from '../types';

// Configure Cloudinary SDK credentials securely from environment variables
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary under the 'task-manager/attachments' folder.
 */
export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<ITaskAttachment> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'task-manager/attachments',
        resource_type: 'auto',
      },
      (error?: Error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }

        resolve({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          mimeType: file.mimetype,
          fileSize: file.size,
        });
      }
    );

    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes an uploaded asset from Cloudinary using its public ID.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
};
