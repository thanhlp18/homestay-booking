import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file buffer to S3
 */
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    if (!S3_BUCKET) {
      throw new Error('AWS S3 bucket not configured');
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<boolean> {
  try {
    if (!S3_BUCKET || !key) {
      return false;
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

/**
 * Generate a presigned URL for uploading
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ url: string; key: string } | null> {
  try {
    if (!S3_BUCKET) {
      throw new Error('AWS S3 bucket not configured');
    }

    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return {
      url: signedUrl,
      key,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

/**
 * Extract S3 key from URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts.slice(1).join('/'); // Remove the leading slash
  } catch {
    return null;
  }
}

/**
 * Validate image file type
 */
export function isValidImageType(contentType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(contentType.toLowerCase());
}

/**
 * Validate file size (default: 5MB)
 */
export function isValidFileSize(fileSize: number, maxSizeInMB: number = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
} 