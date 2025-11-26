// src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email";

interface SingleBookingData {
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: number;
  notes?: string;
  paymentMethod: "CASH" | "TRANSFER" | "CARD";
  roomId: string;
  timeSlotId: string;
  checkInDateTime: string;
  frontIdImageUrl?: string;
  backIdImageUrl?: string;
}

// ✅ Support array of bookings
type BookingSubmissionData = SingleBookingData | SingleBookingData[];

function validateSingleBooking(
  data: Record<string, unknown>
): SingleBookingData {
  if (!data.fullName || typeof data.fullName !== "string") {
    throw new Error("Họ tên là bắt buộc");
  }
  if (!data.phone || typeof data.phone !== "string") {
    throw new Error("Số điện thoại là bắt buộc");
  }
  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email là bắt buộc");
  }
  if (!data.guests || typeof data.guests !== "number" || data.guests < 1) {
    throw new Error("Số khách phải lớn hơn 0");
  }
  if (
    !data.paymentMethod ||
    !["CASH", "TRANSFER", "CARD"].includes(data.paymentMethod as string)
  ) {
    throw new Error("Phương thức thanh toán không hợp lệ");
  }
  if (!data.roomId || typeof data.roomId !== "string") {
    throw new Error("Thiếu thông tin phòng");
  }
  if (!data.timeSlotId || typeof data.timeSlotId !== "string") {
    throw new Error("Vui lòng chọn một gói dịch vụ");
  }
  if (
    !data.checkInDateTime ||
    typeof data.checkInDateTime !== "string" ||
    isNaN(Date.parse(data.checkInDateTime))
  ) {
    throw new Error("Vui lòng chọn thời gian nhận phòng hợp lệ");
  }

  return data as unknown as SingleBookingData;
}

// ✅ Process single booking
async function processSingleBooking(validatedData: SingleBookingData) {
  // Lấy thông tin TimeSlot
  const selectedTimeSlot = await prisma.timeSlot.findUnique({
    where: { id: validatedData.timeSlotId },
  });

  if (!selectedTimeSlot) {
    throw new Error("Gói dịch vụ không hợp lệ.");
  }

  const checkInDate = new Date(validatedData.checkInDateTime);
  let checkOutDate: Date;

  // Tính check-out time
  if (selectedTimeSlot.isOvernight) {
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    checkOutDate.setHours(12, 0, 0, 0);
  } else {
    if (!selectedTimeSlot.duration) {
      throw new Error("Gói dịch vụ không có thông tin thời lượng.");
    }
    checkOutDate = new Date(
      checkInDate.getTime() + selectedTimeSlot.duration * 60 * 60 * 1000
    );
  }

  // ✅ Check conflicts
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId: validatedData.roomId,
      status: {
        in: ["PENDING", "PAYMENT_CONFIRMED", "APPROVED"],
      },
      AND: [
        {
          checkInDateTime: {
            lt: checkOutDate,
          },
        },
        {
          checkOutDateTime: {
            gt: checkInDate,
          },
        },
      ],
    },
    include: {
      room: true,
      timeSlot: true,
    },
  });

  if (conflictingBookings.length > 0) {
    const conflictDetails = conflictingBookings
      .map((booking) => {
        const checkIn = new Date(booking.checkInDateTime!).toLocaleString(
          "vi-VN"
        );
        const checkOut = new Date(booking.checkOutDateTime!).toLocaleString(
          "vi-VN"
        );
        return `\n- Booking ${booking.id.substring(
          0,
          8
        )}: ${checkIn} → ${checkOut} (${booking.status})`;
      })
      .join("");

    throw new Error(
      `Khung thời gian đã bị đặt trùng:${conflictDetails}\n\nVui lòng chọn thời gian khác.`
    );
  }

  // Calculate prices
  let basePrice = selectedTimeSlot.price;
  let weekendSurcharge = 0;

  const dayOfWeek = checkInDate.getDay();
  if (
    (dayOfWeek === 6 || dayOfWeek === 0) &&
    selectedTimeSlot.weekendSurcharge > 0
  ) {
    weekendSurcharge = selectedTimeSlot.weekendSurcharge;
  }

  const guestSurcharge =
    validatedData.guests > 2 ? 50000 * (validatedData.guests - 2) : 0;
  const totalPrice = basePrice + weekendSurcharge + guestSurcharge;

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      fullName: validatedData.fullName,
      phone: validatedData.phone,
      email: validatedData.email,
      cccd: validatedData.cccd,
      guests: validatedData.guests,
      notes: validatedData.notes,
      paymentMethod: validatedData.paymentMethod,
      basePrice: basePrice,
      weekendSurchargeApplied: weekendSurcharge,
      guestSurcharge: guestSurcharge,
      totalPrice: totalPrice,
      status: "PENDING",
      checkInDateTime: checkInDate,
      checkOutDateTime: checkOutDate,
      roomId: validatedData.roomId,
      timeSlotId: validatedData.timeSlotId,
      frontIdImageUrl: validatedData.frontIdImageUrl,
      backIdImageUrl: validatedData.backIdImageUrl,
    },
    include: {
      room: {
        include: {
          branch: true,
        },
      },
      timeSlot: true,
    },
  });

  return booking;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ Check if array or single object
    const isArray = Array.isArray(body);
    const bookingRequests = isArray ? body : [body];

    // Validate all bookings
    const validatedBookings = bookingRequests.map((req) =>
      validateSingleBooking(req)
    );

    // ✅ Process all bookings in transaction
    const createdBookings = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const validatedData of validatedBookings) {
        const booking = await processSingleBooking(validatedData);
        results.push(booking);
      }

      return results;
    });

    // ✅ Send emails for all bookings
    for (const booking of createdBookings) {
      const emailData = {
        id: booking.id,
        fullName: booking.fullName,
        phone: booking.phone,
        email: booking.email!,
        cccd: booking.cccd,
        guests: booking.guests,
        notes: booking.notes || undefined,
        paymentMethod: booking.paymentMethod,
        room: booking.room.name,
        location: booking.room.branch.location,
        totalPrice: booking.totalPrice,
        basePrice: booking.basePrice,
        discountAmount: booking.discountAmount,
        discountPercentage: booking.discountPercentage,
        checkInDateTime: booking.checkInDateTime!,
        checkOutDateTime: booking.checkOutDateTime!,
        checkInTime: booking.room.checkIn,
        checkOutTime: booking.room.checkOut,
        branchAddress: booking.room.branch.address,
        googleMapUrl: booking.room.branch.googleMapUrl || undefined,
      };

      await sendBookingConfirmation(emailData);
      await sendAdminNotification(emailData);
    }

    // ✅ Calculate grand total
    const grandTotal = createdBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    return NextResponse.json({
      success: true,
      message: `Đặt phòng thành công! Đã tạo ${createdBookings.length} booking(s).`,
      data: {
        bookings: createdBookings.map((b) => ({
          bookingId: b.id,
          totalPrice: b.totalPrice,
          status: b.status,
          checkIn: b.checkInDateTime,
          checkOut: b.checkOutDateTime,
          room: b.room.name,
          package: b.timeSlot.time,
        })),
        grandTotal,
        count: createdBookings.length,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo booking:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Đã xảy ra lỗi khi xử lý đặt phòng.";
    const status =
      error instanceof Error && message.includes("không") ? 400 : 500;

    return NextResponse.json({ success: false, message }, { status });
  }
}

// GET endpoint - Không đổi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (
      status &&
      [
        "PENDING",
        "PAYMENT_CONFIRMED",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ].includes(status)
    ) {
      where.status = status;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      where.checkInDateTime = { lt: end };
      where.checkOutDateTime = { gt: start };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          room: {
            include: {
              branch: true,
            },
          },
          timeSlot: true,
        },
        orderBy: {
          createdAt: "desc",
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
    console.error("Lỗi khi tải danh sách booking:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải danh sách đặt phòng" },
      { status: 500 }
    );
  }
}
