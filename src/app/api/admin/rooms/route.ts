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

// Create new room
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
      description,
      amenities,
      features,
      policies,
      basePrice,
      discountPrice,
      originalPrice,
      location,
      area,
      capacity,
      bedrooms,
      bathrooms,
      checkIn,
      checkOut,
      branchId,
      images,
      isActive = true,
    } = body;

    // Validate required fields
    if (!name || !description || !basePrice || !location || !area || !capacity || !branchId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, message: 'Chi nhánh không tồn tại' },
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

    // Check if slug already exists in the same branch
    const existingRoom = await prisma.room.findFirst({
      where: { 
        slug,
        branchId
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { success: false, message: 'Tên phòng đã tồn tại trong chi nhánh này' },
        { status: 400 }
      );
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name,
        slug,
        description,
        amenities: amenities || [],
        features: features || [],
        policies: policies || [],
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        location,
        area,
        capacity: parseInt(capacity),
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        checkIn: checkIn || '14:00',
        checkOut: checkOut || '12:00',
        branchId,
        images: images || [],
        isActive,
        rating: 0,
        reviewCount: 0,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã tạo phòng thành công',
      data: room,
    });

  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tạo phòng' },
      { status: 500 }
    );
  }
}

// Get all rooms with branch info
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rooms = await prisma.room.findMany({
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        _count: {
          select: {
            timeSlots: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: rooms,
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tải danh sách phòng' },
      { status: 500 }
    );
  }
} 