import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Document types for organizing local uploads
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
 * User types for organizing local uploads
 */
export enum UserType {
  MEMBER = 'members',
  TEAM_MEMBER = 'team-members',
  STAFF = 'staff',
  PARTICIPANT = 'participants'
}

/**
 * Build local folder path based on document type and user type
 * Structure: uploads/{document-type}/{user-type}
 * Example: uploads/national-ids/members
 * 
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
export const buildLocalPath = (documentType: DocumentType, userType: UserType): string => {
  return path.join('uploads', documentType, userType);
};

/**
 * Ensure directory exists, create if it doesn't
 * @param dirPath - Directory path to ensure
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
};

/**
 * Save a file buffer to local storage with organized folder structure
 * @param fileBuffer - File buffer to save
 * @param fileName - Original file name
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with local file path
 */
export const saveToLocalStorage = async (
  fileBuffer: Buffer,
  fileName: string,
  documentType: DocumentType = DocumentType.OTHER,
  userType: UserType = UserType.MEMBER
): Promise<string> => {
  try {
    // Build the organized folder path
    const folderPath = buildLocalPath(documentType, userType);
    
    // Ensure the directory exists
    const fullFolderPath = path.join(process.cwd(), folderPath);
    await ensureDirectoryExists(fullFolderPath);
    
    // Create a unique filename using original name and timestamp
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExtension);
    const uniqueFileName = `${fileNameWithoutExt}-${timestamp}${fileExtension}`;
    
    // Full file path
    const filePath = path.join(fullFolderPath, uniqueFileName);
    
    // Write the file
    await writeFile(filePath, fileBuffer);
    
    // Return the relative path (for storing in database)
    const relativePath = path.join(folderPath, uniqueFileName).replace(/\\/g, '/');
    
    console.log(`✅ File saved locally: ${relativePath} [${documentType}/${userType}]`);
    return relativePath;
  } catch (error) {
    console.error('❌ Local file save failed:', error);
    throw new Error(`Failed to save file locally: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a file from local storage
 * @param filePath - Relative file path (e.g., 'uploads/national-ids/members/file-123.jpg')
 */
export const deleteFromLocalStorage = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ File deleted locally: ${filePath}`);
    }
  } catch (error) {
    console.error('❌ Local file deletion failed:', error);
    // Don't throw - log and continue as this is not critical
  }
};

/**
 * Initialize all folder structures (creates empty folders)
 * Run this once during application startup
 */
export const initializeFolderStructure = async (): Promise<void> => {
  console.log('📁 Initializing upload folder structure...');
  
  const documentTypes = Object.values(DocumentType);
  const userTypes = Object.values(UserType);
  
  let createdCount = 0;
  
  for (const docType of documentTypes) {
    for (const userType of userTypes) {
      const folderPath = buildLocalPath(docType as DocumentType, userType as UserType);
      const fullPath = path.join(process.cwd(), folderPath);
      
      try {
        await ensureDirectoryExists(fullPath);
        createdCount++;
      } catch (error) {
        console.error(`Failed to create folder: ${folderPath}`, error);
      }
    }
  }
  
  console.log(`✅ Created/verified ${createdCount} upload folders`);
  console.log(`📂 Structure: uploads/{document-type}/{user-type}`);
};

/**
 * Get public URL for a local file
 * @param relativePath - Relative file path from uploads folder
 * @param baseUrl - Base URL of the server (default: http://localhost:3000)
 * @returns Full URL to access the file
 */
export const getLocalFileUrl = (
  relativePath: string,
  baseUrl: string = process.env.BASE_URL || 'http://localhost:3000'
): string => {
  // Normalize path separators
  const normalizedPath = relativePath.replace(/\\/g, '/');
  return `${baseUrl}/${normalizedPath}`;
};
