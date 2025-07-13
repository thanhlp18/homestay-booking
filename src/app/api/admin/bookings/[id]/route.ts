import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingApproval, sendBookingRejection } from '@/lib/email';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH endpoint for updating booking status (approve/reject/payment confirmation)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason, status } = body;

    // Handle direct status update (for payment confirmation)
    if (status) {
      if (!['PENDING', 'PAYMENT_CONFIRMED', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Trạng thái không hợp lệ' },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy đơn đặt phòng' },
          { status: 404 }
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: status as 'PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: {
          bookingId: updatedBooking.id,
          status: updatedBooking.status,
          updatedAt: updatedBooking.updatedAt,
        },
      });
    }

    // Handle action-based updates (approve/reject)
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Find the booking
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
        { success: false, message: 'Không tìm thấy đơn đặt phòng' },
        { status: 404 }
      );
    }

    // Check if booking is in a valid state for approval/rejection
    if (!['PENDING', 'PAYMENT_CONFIRMED'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: 'Đơn đặt phòng không thể được cập nhật' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedAt: action === 'approve' ? new Date() : null,
        rejectedAt: action === 'reject' ? new Date() : null,
        adminNotes: action === 'approve' 
          ? 'Đã xác nhận thanh toán và phê duyệt đặt phòng'
          : reason || 'Đặt phòng bị từ chối',
      },
    });

    // Prepare email data
    const emailData = {
      id: booking.id,
      fullName: booking.fullName,
      phone: booking.phone,
      email: booking.email || undefined,
      cccd: booking.cccd,
      guests: booking.guests,
      notes: booking.notes || undefined,
      paymentMethod: booking.paymentMethod,
      room: booking.bookingSlots[0]?.room?.name || 'Unknown',
      location: booking.bookingSlots[0]?.room?.branch?.location || 'Unknown',
      totalPrice: booking.totalPrice,
      basePrice: booking.basePrice,
      discountAmount: booking.discountAmount,
      discountPercentage: booking.discountPercentage,
    };

    // Send email notification to customer
    if (booking.email) {
      if (action === 'approve') {
        await sendBookingApproval(emailData);
      } else {
        await sendBookingRejection(emailData, reason || 'Đặt phòng bị từ chối');
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' 
        ? 'Đã phê duyệt đặt phòng thành công' 
        : 'Đã từ chối đặt phòng thành công',
      data: {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      },
    });

  } catch (error) {
    console.error('Admin booking action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Đã xảy ra lỗi khi xử lý yêu cầu' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for getting booking details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy đơn đặt phòng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi tải thông tin đặt phòng' 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for canceling booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Find the booking
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
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy đơn đặt phòng' },
        { status: 404 }
      );
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        adminNotes: 'Đơn đặt phòng đã bị hủy bởi admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã hủy đặt phòng thành công',
      data: {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi hủy đặt phòng' 
      },
      { status: 500 }
    );
  }
} 