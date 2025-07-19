import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
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
  } catch {
    return null;
  }
}

// Create new branch
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      location,
      address,
      phone,
      email,
      description,
      amenities,
      images,
      latitude,
      longitude,
      googleMapUrl,
      isActive = true,
    } = body;

    // Validate required fields
    if (!name || !location || !address || !phone || !email || !description) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingBranch = await prisma.branch.findUnique({
      where: { slug },
    });

    if (existingBranch) {
      return NextResponse.json(
        { success: false, message: 'Tên chi nhánh đã tồn tại' },
        { status: 400 }
      );
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name,
        slug,
        location,
        address,
        phone,
        email,
        description,
        amenities: amenities || [],
        images: images || [],
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        googleMapUrl,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã tạo chi nhánh thành công',
      data: branch,
    });

  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tạo chi nhánh' },
      { status: 500 }
    );
  }
}

// Get all branches with room count
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: branches,
    });

  } catch (error) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tải danh sách chi nhánh' },
      { status: 500 }
    );
  }
} 