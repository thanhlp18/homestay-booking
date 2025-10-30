// src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email";

interface BookingSubmissionData {
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

function validateBookingData(
  data: Record<string, unknown>
): BookingSubmissionData {
  if (!data.fullName || typeof data.fullName !== "string") {
    throw new Error("Họ tên là bắt buộc");
  }
  if (!data.phone || typeof data.phone !== "string") {
    throw new Error("Số điện thoại là bắt buộc");
  }
  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email là bắt buộc");
  }
  if (!data.cccd || typeof data.cccd !== "string") {
    throw new Error("Số CCCD là bắt buộc");
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

  return data as unknown as BookingSubmissionData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateBookingData(body);

    // 1. Lấy thông tin gói dịch vụ (TimeSlot) và phòng
    const selectedTimeSlot = await prisma.timeSlot.findUnique({
      where: { id: validatedData.timeSlotId },
    });

    if (!selectedTimeSlot) {
      throw new Error("Gói dịch vụ không hợp lệ.");
    }

    if (!selectedTimeSlot.duration) {
      throw new Error("Gói dịch vụ không có thông tin thời lượng.");
    }

    const checkInDate = new Date(validatedData.checkInDateTime);
    let checkOutDate: Date;

    // Tính toán thời gian check-out (check-in + duration)
    if (selectedTimeSlot.isOvernight) {
      // ✅ Overnight: Check-out là 12:00 ngày hôm sau
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      checkOutDate.setHours(12, 0, 0, 0); // 12:00 ngày hôm sau
    } else {
      // Gói theo giờ: Check-out = Check-in + duration
      if (!selectedTimeSlot.duration) {
        throw new Error("Gói dịch vụ không có thông tin thời lượng.");
      }
      checkOutDate = new Date(
        checkInDate.getTime() + selectedTimeSlot.duration * 60 * 60 * 1000
      );
    }

    // ✅ 2. KIỂM TRA XUNG ĐỘT THỜI GIAN - QUAN TRỌNG
    // Tìm tất cả booking đã được APPROVED hoặc đang PENDING/PAYMENT_CONFIRMED
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

      return NextResponse.json(
        {
          success: false,
          message: `Rất tiếc, khung thời gian bạn chọn đã bị đặt trùng:${conflictDetails}\n\nVui lòng chọn thời gian khác.`,
          conflictingBookings: conflictingBookings.map((b) => ({
            id: b.id,
            checkIn: b.checkInDateTime,
            checkOut: b.checkOutDateTime,
            status: b.status,
          })),
        },
        { status: 409 }
      );
    }

    // Tính giá với weekend surcharge
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

    // Tạo booking
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
      guestSurcharge: booking.guestSurcharge,
      checkIn: booking.checkInDateTime,
      checkOut: booking.checkOutDateTime,
      package: booking.timeSlot.time,
    };

    // 5. Gửi email xác nhận
    await sendBookingConfirmation(emailData);
    await sendAdminNotification(emailData);

    return NextResponse.json({
      success: true,
      message: "Đặt phòng thành công!",
      data: {
        bookingId: booking.id,
        totalPrice: booking.totalPrice,
        status: booking.status,
        checkIn: booking.checkInDateTime,
        checkOut: booking.checkOutDateTime,
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

// GET endpoint đã được cập nhật
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

    // Cập nhật logic lọc theo ngày
    // Tìm các booking có khoảng thời gian giao với khoảng thời gian lọc
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
