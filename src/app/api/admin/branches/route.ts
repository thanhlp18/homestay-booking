import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

// Create new branch
export async function POST(request: NextRequest) {
  console.log('=== POST /api/admin/branches ===');
  
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

    console.log('Branch created successfully:', branch.id);

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
  console.log('=== GET /api/admin/branches ===');
  
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

    console.log('Branches fetched successfully:', branches.length);

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