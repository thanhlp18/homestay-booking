import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3, isValidImageType, isValidFileSize } from '@/lib/aws-s3';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const admin = await prisma.user.findFirst({
      where: { 
        id: decoded.id,
        email: decoded.email,
        role: 'ADMIN'
      },
    });
    
    return admin;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (!isValidFileSize(file.size, 100)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'File size too large. Maximum size is 100MB.' 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const uploadResult = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      folder
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: uploadResult.error || 'Upload failed' 
        },
        { status: 500 }
      );
    }

    // Return the uploaded file URL
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Process multiple files
    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      // Validate file type
      if (!isValidImageType(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      // Validate file size
      if (!isValidFileSize(file.size, 100)) {
        errors.push(`${file.name}: File too large (max 100MB)`);
        continue;
      }

      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const uploadResult = await uploadFileToS3(
          buffer,
          file.name,
          file.type,
          folder
        );

        if (uploadResult.success) {
          uploadResults.push({
            url: uploadResult.url,
            key: uploadResult.key,
            originalName: file.name,
            size: file.size,
            type: file.type,
          });
        } else {
          errors.push(`${file.name}: ${uploadResult.error || 'Upload failed'}`);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Upload error`);
      }
    }

    return NextResponse.json({
      success: uploadResults.length > 0,
      message: `Uploaded ${uploadResults.length} of ${files.length} files`,
      data: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 