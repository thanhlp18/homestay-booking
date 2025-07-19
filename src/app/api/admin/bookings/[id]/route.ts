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

// Update booking status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  console.log('=== PATCH /api/admin/bookings/[id] ===');
  
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
    const { action, reason } = body;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        bookingSlots: {
          include: {
            room: {
              include: {
                branch: true,
              },
            },
            timeSlot: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Đặt phòng không tồn tại' },
        { status: 404 }
      );
    }

    let updateData: {
      status: 'APPROVED' | 'REJECTED';
      approvedAt?: Date;
      rejectedAt?: Date;
      adminNotes: string;
    } = {
      status: 'APPROVED' as const,
      adminNotes: ''
    };
    let message = '';

    if (action === 'approve') {
      if (booking.status === 'APPROVED') {
        return NextResponse.json(
          { success: false, message: 'Đặt phòng đã được phê duyệt' },
          { status: 400 }
        );
      }

      updateData = {
        status: 'APPROVED',
        approvedAt: new Date(),
        adminNotes: reason || 'Được phê duyệt bởi admin',
      };
      message = 'Đã phê duyệt đặt phòng thành công';
    } else if (action === 'reject') {
      if (booking.status === 'REJECTED') {
        return NextResponse.json(
          { success: false, message: 'Đặt phòng đã bị từ chối' },
          { status: 400 }
        );
      }

      updateData = {
        status: 'REJECTED',
        rejectedAt: new Date(),
        adminNotes: reason || 'Bị từ chối bởi admin',
      };
      message = 'Đã từ chối đặt phòng thành công';
    } else {
      return NextResponse.json(
        { success: false, message: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        bookingSlots: {
          include: {
            room: {
              include: {
                branch: true,
              },
            },
            timeSlot: true,
          },
        },
      },
    });

    console.log('Booking updated successfully:', updatedBooking.id);

    return NextResponse.json({
      success: true,
      message,
      data: updatedBooking,
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi cập nhật đặt phòng' },
      { status: 500 }
    );
  }
}

// Get single booking
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log('=== GET /api/admin/bookings/[id] ===');
  
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        bookingSlots: {
          include: {
            room: {
              include: {
                branch: true,
              },
            },
            timeSlot: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Đặt phòng không tồn tại' },
        { status: 404 }
      );
    }

    console.log('Booking fetched successfully:', booking.id);

    return NextResponse.json({
      success: true,
      data: booking,
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi tải thông tin đặt phòng' },
      { status: 500 }
    );
  }
}

// Cancel booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log('=== DELETE /api/admin/bookings/[id] ===');
  
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

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Đặt phòng không tồn tại' },
        { status: 404 }
      );
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        adminNotes: 'Đã hủy bởi admin',
      },
    });

    console.log('Booking cancelled successfully:', updatedBooking.id);

    return NextResponse.json({
      success: true,
      message: 'Đã hủy đặt phòng thành công',
      data: updatedBooking,
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi khi hủy đặt phòng' },
      { status: 500 }
    );
  }
} 