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

// Update branch
export async function PUT(request: NextRequest, { params }: RouteParams) {
  console.log('=== PUT /api/admin/branches/[id] ===');
  
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
      isActive,
    } = body;

    // Validate required fields
    if (!name || !location || !address || !phone || !email || !description) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if branch exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: 'Chi nhánh không tồn tại' },
        { status: 404 }
      );
    }

    // Generate new slug if name changed
    let slug = existingBranch.slug;
    if (name !== existingBranch.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const slugExists = await prisma.branch.findFirst({
        where: { 
          slug,
          id: { not: id }
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'Tên chi nhánh đã tồn tại' },
          { status: 400 }
        );
      }
    }

    // Update branch
    const updatedBranch = await prisma.branch.update({
      where: { id },
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

    console.log('Branch updated successfully:', updatedBranch.id);

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật chi nhánh thành công',
      data: updatedBranch,
    });

  } catch (error) {
    console.error('Update branch error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi cập nhật chi nhánh' },
      { status: 500 }
    );
  }
}

// Delete branch
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log('=== DELETE /api/admin/branches/[id] ===');
  
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

    // Check if branch exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: 'Chi nhánh không tồn tại' },
        { status: 404 }
      );
    }

    // Check if branch has rooms
    if (existingBranch._count.rooms > 0) {
      return NextResponse.json(
        { success: false, message: 'Không thể xóa chi nhánh có phòng. Vui lòng xóa tất cả phòng trước.' },
        { status: 400 }
      );
    }

    // Delete branch
    await prisma.branch.delete({
      where: { id },
    });

    console.log('Branch deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa chi nhánh thành công',
    });

  } catch (error) {
    console.error('Delete branch error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi xóa chi nhánh' },
      { status: 500 }
    );
  }
}

// Get single branch
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log('=== GET /api/admin/branches/[id] ===');
  
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

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, message: 'Chi nhánh không tồn tại' },
        { status: 404 }
      );
    }

    console.log('Branch fetched successfully:', branch.id);

    return NextResponse.json({
      success: true,
      data: branch,
    });

  } catch (error) {
    console.error('Get branch error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tải thông tin chi nhánh' },
      { status: 500 }
    );
  }
} 