import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { roomId, timeSlotId, checkInDateTime } = await request.json();

    // Get time slot info
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot || !timeSlot.duration) {
      return NextResponse.json(
        { available: false, message: "Gói dịch vụ không hợp lệ" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDateTime);
    const checkOut = new Date(
      checkIn.getTime() + timeSlot.duration * 60 * 60 * 1000
    );

    // Check for conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        status: {
          in: ["PENDING", "PAYMENT_CONFIRMED", "APPROVED"],
        },
        AND: [
          { checkInDateTime: { lt: checkOut } },
          { checkOutDateTime: { gt: checkIn } },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json({
        available: false,
        message:
          "Khung thời gian này đã được đặt. Vui lòng chọn thời gian khác.",
        conflicts: conflictingBookings.length,
      });
    }

    return NextResponse.json({
      available: true,
      message: "Khung thời gian này còn trống",
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { available: false, message: "Lỗi khi kiểm tra tính khả dụng" },
      { status: 500 }
    );
  }
}
