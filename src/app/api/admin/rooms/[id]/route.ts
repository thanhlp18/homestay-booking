import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  console.log('=== Admin Token Verification ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  // Log all cookies
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies);
  
  const token = request.cookies.get('adminToken')?.value;
  console.log('Admin token found:', !!token);
  console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.log('No admin token found in cookies');
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    console.log('Token decoded successfully:', { 
      id: decoded.id, 
      email: decoded.email, 
      role: decoded.role 
    });

    const admin = await prisma.user.findFirst({
      where: { 
        id: decoded.id,
        email: decoded.email,
        role: 'ADMIN'
      },
    });

    console.log('Admin found in database:', !!admin);
    if (admin) {
      console.log('Admin details:', { id: admin.id, name: admin.name, email: admin.email });
    }
    
    return admin;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Update room
export async function PUT(request: NextRequest, { params }: RouteParams) {
  console.log('=== PUT /api/admin/rooms/[id] ===');
  
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log('Unauthorized: No valid admin token');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authorized admin:', admin.name);

    const { id } = await params;
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
      floor,
      checkIn,
      checkOut,
      branchId,
      images,
      isActive,
    } = body;

    // Validate required fields
    if (!name || !description || !basePrice || !location || !area || !capacity || !branchId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, message: 'Phòng không tồn tại' },
        { status: 404 }
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

    // Generate new slug if name changed
    let slug = existingRoom.slug;
    if (name !== existingRoom.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const slugExists = await prisma.room.findFirst({
        where: { 
          slug,
          id: { not: id }
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Tên phòng đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        amenities: amenities || [],
        features: features || [],
        policies: policies || [],
        images: images || [],
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        location,
        area,
        capacity: parseInt(capacity),
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        floor: floor || null,
        checkIn: checkIn || '14:00',
        checkOut: checkOut || '12:00',
        branchId,
        isActive,
      },
    });

    console.log('Room updated successfully:', updatedRoom.id);

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật phòng thành công',
      data: updatedRoom,
    });

  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi cập nhật phòng' },
      { status: 500 }
    );
  }
}

// Delete room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log('=== DELETE /api/admin/rooms/[id] ===');
  
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log('Unauthorized: No valid admin token');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authorized admin:', admin.name);

    const { id } = await params;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            timeSlots: true,
          },
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, message: 'Phòng không tồn tại' },
        { status: 404 }
      );
    }

    // Check if room has time slots
    if (existingRoom._count.timeSlots > 0) {
      return NextResponse.json(
        { success: false, message: 'Không thể xóa phòng có khung giờ. Vui lòng xóa tất cả khung giờ trước.' },
        { status: 400 }
      );
    }

    // Delete room
    await prisma.room.delete({
      where: { id },
    });

    console.log('Room deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa phòng thành công',
    });

  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi xóa phòng' },
      { status: 500 }
    );
  }
}

// Get single room
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log('=== GET /api/admin/rooms/[id] ===');
  
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log('Unauthorized: No valid admin token');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authorized admin:', admin.name);

    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
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
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Phòng không tồn tại' },
        { status: 404 }
      );
    }

    console.log('Room fetched successfully:', room.id);

    return NextResponse.json({
      success: true,
      data: room,
    });

  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tải thông tin phòng' },
      { status: 500 }
    );
  }
} 