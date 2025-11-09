// src/app/api/bookings/unavailable-times/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const roomId = searchParams.get("roomId");
    const timeSlotId = searchParams.get("timeSlotId");

    if (!date || !roomId || !timeSlotId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    // ✅ Parse date in local timezone (Vietnam = GMT+7)
    const startOfDay = new Date(date + "T00:00:00");
    const endOfDay = new Date(date + "T23:59:59.999");

  

    // ✅ Find bookings that OVERLAP with this date
    // A booking overlaps if: checkIn < endOfDay AND checkOut > startOfDay
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        // timeSlotId: timeSlotId,
        status: {
          in: ["PENDING", "PAYMENT_CONFIRMED", "APPROVED"],
        },
        // ✅ Overlap logic: booking starts before end of day AND ends after start of day
        AND: [
          {
            checkInDateTime: {
              lt: endOfDay,
            },
          },
          {
            checkOutDateTime: {
              gt: startOfDay,
            },
          },
        ],
      },
      select: {
        id: true,
        checkInDateTime: true,
        checkOutDateTime: true,
      },
      orderBy: {
        checkInDateTime: "asc",
      },
    });

    const unavailableSlots = bookings.map((booking) => ({
      checkIn: booking.checkInDateTime!.toISOString(),
      checkOut: booking.checkOutDateTime!.toISOString(),
      bookingId: booking.id,
    }));

    return NextResponse.json({
      success: true,
      unavailableSlots,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching unavailable times:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching unavailable times" },
      { status: 500 }
    );
  }
}
