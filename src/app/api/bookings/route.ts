import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';
import { Prisma } from '@prisma/client';

// Interface for booking submission data
interface BookingSubmissionData {
  fullName: string;
  phone: string;
  email?: string;
  cccd: string;
  guests: number;
  notes?: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
  selectedSlots: Array<{
    date: string;
    branchId: string;
    roomId: string;
    timeSlotId: string;
    price: number;
  }>;
  frontIdImageUrl?: string;
  backIdImageUrl?: string;
}

// Validation function
function validateBookingData(data: Record<string, unknown>): BookingSubmissionData {
  if (!data.fullName || typeof data.fullName !== 'string') {
    throw new Error('Họ tên là bắt buộc');
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    throw new Error('Số điện thoại là bắt buộc');
  }
  
  if (!data.cccd || typeof data.cccd !== 'string') {
    throw new Error('Số CCCD là bắt buộc');
  }
  
  if (!data.guests || typeof data.guests !== 'number' || data.guests < 1) {
    throw new Error('Số khách phải lớn hơn 0');
  }
  
  if (!data.paymentMethod || !['CASH', 'TRANSFER', 'CARD'].includes(data.paymentMethod as string)) {
    throw new Error('Phương thức thanh toán không hợp lệ');
  }
  
  if (!data.selectedSlots || !Array.isArray(data.selectedSlots) || data.selectedSlots.length === 0) {
    throw new Error('Vui lòng chọn ít nhất một khung giờ');
  }
  
  // Validate each selected slot
  for (const slot of data.selectedSlots) {
    if (!slot.date || !slot.branchId || !slot.roomId || !slot.timeSlotId || !slot.price) {
      throw new Error('Thông tin khung giờ không hợp lệ');
    }
  }
  
  return data as unknown as BookingSubmissionData;
}

// Calculate pricing with discounts
function calculatePricing(selectedSlots: Array<{price: number}>) {
  const basePrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const slotCount = selectedSlots.length;
  
  let discountPercentage = 0;
  if (slotCount >= 3) {
    discountPercentage = 0.1; // 10% discount for 3+ slots
  } else if (slotCount === 2) {
    discountPercentage = 0.05; // 5% discount for 2 slots
  }
  
  const discountAmount = basePrice * discountPercentage;
  const totalPrice = basePrice - discountAmount;
  
  return {
    basePrice,
    discountAmount: Math.round(discountAmount),
    discountPercentage,
    totalPrice: Math.round(totalPrice)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = validateBookingData(body);
    
    // Calculate pricing
    const pricing = calculatePricing(validatedData.selectedSlots);
    
    // Start database transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the booking
      const booking = await tx.booking.create({
        data: {
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          email: validatedData.email,
          cccd: validatedData.cccd,
          guests: validatedData.guests,
          notes: validatedData.notes,
          paymentMethod: validatedData.paymentMethod,
          basePrice: pricing.basePrice,
          discountAmount: pricing.discountAmount,
          discountPercentage: pricing.discountPercentage,
          totalPrice: pricing.totalPrice,
          status: 'PENDING',
          frontIdImageUrl: validatedData.frontIdImageUrl,
          backIdImageUrl: validatedData.backIdImageUrl,
        },
      });
      
      // Create booking slots
      const bookingSlots = await Promise.all(
        validatedData.selectedSlots.map(slot =>
          tx.bookingSlot.create({
            data: {
              bookingId: booking.id,
              roomId: slot.roomId,
              timeSlotId: slot.timeSlotId,
              bookingDate: new Date(slot.date),
              price: slot.price,
            },
          })
        )
      );
      
      return { booking, bookingSlots };
    });
    
    // Get room and branch information for email
    const firstSlot = validatedData.selectedSlots[0];
    const room = await prisma.room.findUnique({
      where: { id: firstSlot.roomId },
      include: { branch: true }
    });
    
    if (!room) {
      throw new Error('Không tìm thấy thông tin phòng');
    }
    
    // Prepare email data
    const emailData = {
      id: result.booking.id,
      fullName: result.booking.fullName,
      phone: result.booking.phone,
      email: result.booking.email || undefined,
      cccd: result.booking.cccd,
      guests: result.booking.guests,
      notes: result.booking.notes || undefined,
      paymentMethod: result.booking.paymentMethod,
      room: room.name,
      location: room.branch.location,
      totalPrice: result.booking.totalPrice,
      basePrice: result.booking.basePrice,
      discountAmount: result.booking.discountAmount,
      discountPercentage: result.booking.discountPercentage,
    };
    
    // Send confirmation email to customer (if email provided)
    if (validatedData.email) {
      await sendBookingConfirmation(emailData);
    }
    
    // Send notification to admin
    await sendAdminNotification(emailData);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Đặt phòng thành công!',
      data: {
        bookingId: result.booking.id,
        totalPrice: result.booking.totalPrice,
        discountAmount: result.booking.discountAmount,
        discountPercentage: result.booking.discountPercentage,
        status: result.booking.status,
      },
    });
    
  } catch (error) {
    console.error('Booking submission error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Đã xảy ra lỗi khi xử lý đặt phòng. Vui lòng thử lại.' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve bookings (for admin and date range queries)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: { 
      status?: 'PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      bookingSlots?: {
        some: {
          bookingDate?: {
            gte?: Date;
            lte?: Date;
          };
        };
      };
    } = {};
    
    if (status && ['PENDING', 'PAYMENT_CONFIRMED', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      where.status = status as 'PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      where.bookingSlots = {
        some: {
          bookingDate: {}
        }
      };
      
      if (startDate) {
        where.bookingSlots.some.bookingDate!.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.bookingSlots.some.bookingDate!.lte = new Date(endDate);
      }
    }
    
    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi tải danh sách đặt phòng' 
      },
      { status: 500 }
    );
  }
} 