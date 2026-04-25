import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkjnugbsd',
  api_key: process.env.CLOUDINARY_API_KEY || '532636498527284',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Document types for organizing uploads
 */
export enum DocumentType {
  PERSONAL_PHOTO = 'personal-photos',
  NATIONAL_ID = 'national-ids',
  MEDICAL_REPORT = 'medical-reports',
  PROOF = 'proofs',
  PASSPORT = 'passports',
  SALARY_SLIP = 'salary-slips',
  STUDENT_PROOF = 'student-proofs',
  MEDIA = 'media',
  ADVERTISEMENT = 'advertisements',
  OTHER = 'other'
}

/**
 * User types for organizing uploads
 */
export enum UserType {
  MEMBER = 'members',
  TEAM_MEMBER = 'team-members',
  STAFF = 'staff',
  PARTICIPANT = 'participants'
}

/**
 * Build Cloudinary folder path based on document type and user type
 * Structure: helwan-club/{document-type}/{user-type}
 * Example: helwan-club/national-ids/members
 * 
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
export const buildCloudinaryPath = (documentType: DocumentType, userType: UserType): string => {
  return `helwan-club/${documentType}/${userType}`;
};

/**
 * Upload a file buffer to Cloudinary with organized folder structure
 * @param fileBuffer - File buffer from multer
 * @param fileName - Original file name (used for public_id)
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with secure_url from Cloudinary
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  documentType: DocumentType = DocumentType.OTHER,
  userType: UserType = UserType.MEMBER
): Promise<string> => {
  try {
    // Build the organized folder path
    const folder = buildCloudinaryPath(documentType, userType);
    
    // Create a unique public ID using filename and timestamp
    const timestamp = Date.now();
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const publicId = `${folder}/${fileNameWithoutExt}-${timestamp}`;

    // Create a readable stream from the buffer
    const stream = Readable.from(fileBuffer);

    // Upload to Cloudinary
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'auto',
          folder: folder,
          overwrite: true,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as Record<string, unknown>);
        }
      );

      stream.pipe(uploadStream);
    });

    console.log(`✅ File uploaded to Cloudinary: ${result.secure_url} [${documentType}/${userType}]`);
    return result.secure_url as string;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use uploadToCloudinary with DocumentType and UserType enums instead
 */
export const uploadToCloudinaryLegacy = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'helwan-club'
): Promise<string> => {
  try {
    // Create a unique public ID using filename and timestamp
    const timestamp = Date.now();
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const publicId = `${folder}/${fileNameWithoutExt}-${timestamp}`;

    // Create a readable stream from the buffer
    const stream = Readable.from(fileBuffer);

    // Upload to Cloudinary
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'auto',
          folder: folder,
          overwrite: true,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as Record<string, unknown>);
        }
      );

      stream.pipe(uploadStream);
    });

    console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url as string;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a file from Cloudinary by public_id
 * @param publicId - Public ID of the file in Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('❌ Cloudinary deletion failed:', error);
    // Don't throw - log and continue as this is not critical
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param cloudinaryUrl - Full Cloudinary URL
 * @returns Public ID of the file
 */
export const extractPublicIdFromUrl = (cloudinaryUrl: string): string => {
  try {
    const urlParts = cloudinaryUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    // Remove file extension
    return fileName.split('.')[0];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};
